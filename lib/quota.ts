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

export async function ensureQuota(uid: string, cost: number) {
  const tokenRef = db.collection('tokenUsage').doc(uid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(tokenRef);
    if (!snap.exists) throw new Error('no-user');
    const u = snap.data() as any;
    
    const plan = u?.plan || 'free';
    const planTotals = {
      free: { daily: 20, monthly: 100 },
      pro: { daily: 200, monthly: 2000 },
      enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER }
    } as const;
    const totals = planTotals[plan as keyof typeof planTotals] || planTotals.free;
    
    // Reset windows if we've crossed local boundaries (Europe/London)
    const TZ: string = (typeof u?.timezone === 'string' && u.timezone) ? u.timezone : 'UTC';
    const now = admin.firestore.Timestamp.now().toDate();
    const last: Date | null = u?.lastUpdated?.toDate ? u.lastUpdated.toDate() : null;
    const n = getTZParts(now, TZ);
    const l = last ? getTZParts(last, TZ) : null;
    const crossedDay = !l || l.year !== n.year || l.month !== n.month || l.day !== n.day;
    const crossedMonth = !l || l.year !== n.year || l.month !== n.month;

    const dailyUsed = crossedDay ? 0 : (u?.dailyUsed ?? 0);
    const monthlyUsed = crossedMonth ? 0 : (u?.used ?? 0);
    
    // Check if user has remaining daily and monthly quota
    if (dailyUsed + cost > totals.daily || monthlyUsed + cost > totals.monthly) {
      throw new Error('quota');
    }
    
    const update: Record<string, any> = {
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    };
    if (crossedDay) update.dailyUsed = cost; else update.dailyUsed = admin.firestore.FieldValue.increment(cost);
    if (crossedMonth) update.used = cost; else update.used = admin.firestore.FieldValue.increment(cost);
    tx.update(tokenRef, update);
  });
}


