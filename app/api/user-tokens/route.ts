import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

function getTZParts(date: Date, timeZone: string) {
  const parts = new Intl.DateTimeFormat('en-GB', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).formatToParts(date);
  const get = (type: string) => Number(parts.find(p => p.type === type)?.value || '0');
  return { year: get('year'), month: get('month'), day: get('day') };
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    const tzParam = searchParams.get('tz') || '';
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    if (!db) return NextResponse.json({ error: 'db' }, { status: 500 });
    const snap = await db.collection('tokenUsage').doc(uid).get();
    const u = (snap.data() as any) || {};
    // Resolve timezone: request param > stored doc > UTC
    const isValidTZ = (tz: string) => {
      try { new Intl.DateTimeFormat('en-GB', { timeZone: tz || 'UTC' }); return !!tz; } catch { return false; }
    };
    const tzFromParam = isValidTZ(tzParam) ? tzParam : '';
    const timeZone: string = tzFromParam || (typeof u.timezone === 'string' && isValidTZ(u.timezone) ? u.timezone : 'UTC');
    // Persist latest timezone best-effort for server-side quota
    try { if (tzFromParam) await db.collection('tokenUsage').doc(uid).set({ timezone: timeZone }, { merge: true }); } catch {}
    
    // Calculate remaining tokens based on your field structure
    const total = u.total || 0;
    const rawUsed = u.used || 0;
    const rawDailyUsed = u.dailyUsed || 0;
    const plan = u.plan || 'free';
    
    // Plan limits
    // Prefer explicit limits persisted on tokenUsage; fallback to computed table
    const limitsDaily = typeof u.limitsDaily === 'number' ? u.limitsDaily : undefined;
    const limitsMonthly = typeof u.limitsMonthly === 'number' ? u.limitsMonthly : undefined;
    const planTotals = {
      free: { daily: 20, monthly: 100 },
      pro: { daily: 200, monthly: 2000 },
      enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER }
    } as const;
    const fallbackTotals = planTotals[plan as keyof typeof planTotals] || planTotals.free;
    const totals = {
      daily: limitsDaily ?? fallbackTotals.daily,
      monthly: limitsMonthly ?? fallbackTotals.monthly,
    };

    // Respect daily/monthly boundary resets at local midnight (Europe/London) on read
    const TZ = timeZone;
    const now = admin.firestore.Timestamp.now().toDate();
    const last: Date | null = u?.lastUpdated?.toDate ? u.lastUpdated.toDate() : null;
    const n = getTZParts(now, TZ);
    const l = last ? getTZParts(last, TZ) : null;
    const crossedDay = !l || l.year !== n.year || l.month !== n.month || l.day !== n.day;
    const crossedMonth = !l || l.year !== n.year || l.month !== n.month;
    const dailyUsed = crossedDay ? 0 : rawDailyUsed;
    const used = crossedMonth ? 0 : rawUsed;

    if (crossedDay || crossedMonth) {
      // Best-effort normalize the document so UI stays consistent after boundary
      try {
        await db.collection('tokenUsage').doc(uid).update({
          dailyUsed: dailyUsed,
          used: used,
          lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        });
      } catch {}
    }
    
    return NextResponse.json({
      tokensDaily: Math.max(0, totals.daily - dailyUsed),
      tokensMonthly: Math.max(0, totals.monthly - used),
      plan: plan,
      limitsDaily: totals.daily,
      limitsMonthly: totals.monthly,
      raw: { used, dailyUsed }
    }, { headers: { 'Cache-Control': 'no-store' } });
  } catch (e) {
    return NextResponse.json({ error: 'failed' }, { status: 500 });
  }
}


