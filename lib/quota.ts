import { db, admin } from '@/lib/firebaseAdmin';

export async function ensureQuota(uid: string, cost: number) {
  const tokenRef = db.collection('tokenUsage').doc(uid);
  await db.runTransaction(async (tx) => {
    const snap = await tx.get(tokenRef);
    if (!snap.exists) throw new Error('no-user');
    const u = snap.data() as any;
    
    const plan = u?.plan || 'free';
    const planTotals = {
      free: { daily: 10, monthly: 50 },
      pro: { daily: 50, monthly: 500 },
      enterprise: { daily: 500, monthly: 5000 }
    };
    const totals = planTotals[plan as keyof typeof planTotals] || planTotals.free;
    
    const dailyUsed = u?.dailyUsed ?? 0;
    const monthlyUsed = u?.used ?? 0;
    
    // Check if user has remaining daily and monthly quota
    if (dailyUsed >= totals.daily || monthlyUsed >= totals.monthly) {
      throw new Error('quota');
    }
    
    tx.update(tokenRef, {
      dailyUsed: admin.firestore.FieldValue.increment(cost),
      used: admin.firestore.FieldValue.increment(cost),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
    });
  });
}


