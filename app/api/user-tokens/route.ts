import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const uid = searchParams.get('uid');
    if (!uid) return NextResponse.json({ error: 'uid required' }, { status: 400 });
    if (!db) return NextResponse.json({ error: 'db' }, { status: 500 });
    const snap = await db.collection('tokenUsage').doc(uid).get();
    const u = (snap.data() as any) || {};
    
    // Calculate remaining tokens based on your field structure
    const total = u.total || 0;
    const used = u.used || 0;
    const dailyUsed = u.dailyUsed || 0;
    const plan = u.plan || 'free';
    
    // For free plan: 10 daily, 50 monthly
    // Prefer explicit limits persisted on tokenUsage; fallback to computed table
    const limitsDaily = typeof u.limitsDaily === 'number' ? u.limitsDaily : undefined;
    const limitsMonthly = typeof u.limitsMonthly === 'number' ? u.limitsMonthly : undefined;
    const planTotals = {
      free: { daily: 10, monthly: 50 },
      pro: { daily: 50, monthly: 500 },
      enterprise: { daily: 500, monthly: 5000 }
    } as const;
    const fallbackTotals = planTotals[plan as keyof typeof planTotals] || planTotals.free;
    const totals = {
      daily: limitsDaily ?? fallbackTotals.daily,
      monthly: limitsMonthly ?? fallbackTotals.monthly,
    };
    
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


