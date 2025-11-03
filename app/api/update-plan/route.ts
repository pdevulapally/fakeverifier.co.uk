import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export async function POST(req: NextRequest) {
  try {
    const { uid, plan } = await req.json();
    
    if (!uid || !plan) {
      return NextResponse.json({ error: 'User ID and plan are required' }, { status: 400 });
    }

    if (!['free', 'pro', 'enterprise'].includes(plan)) {
      return NextResponse.json({ error: 'Invalid plan. Must be free, pro, or enterprise' }, { status: 400 });
    }

    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }

    // Update both users and tokenUsage collections
    await db.collection('users').doc(uid).set({ plan }, { merge: true });
    
    // Update tokenUsage collection with new plan
    const tokenUsageRef = db.collection('tokenUsage').doc(uid);
    const tokenUsageDoc = await tokenUsageRef.get();
    
    // Compute explicit per-plan limits to persist for clients
    const planTotals: Record<'free' | 'pro' | 'enterprise', { daily: number; monthly: number }> = {
      free: { daily: 20, monthly: 100 },
      pro: { daily: 200, monthly: 2000 },
      enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER },
    };
    const limits = planTotals[plan as 'free' | 'pro' | 'enterprise'] || planTotals.free;

    if (tokenUsageDoc.exists) {
      // Update existing tokenUsage document with new plan
      await tokenUsageRef.update({
        plan: plan,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        // Reset daily usage on plan change
        dailyUsed: 0,
        // Keep monthly usage but reset if it's a new month
        used: admin.firestore.FieldValue.increment(0),
        limitsDaily: limits.daily,
        limitsMonthly: limits.monthly,
      });
    } else {
      // Create new tokenUsage document for the user
      await tokenUsageRef.set({
        uid: uid,
        plan: plan,
        dailyUsed: 0,
        used: 0,
        total: 0,
        lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
        limitsDaily: limits.daily,
        limitsMonthly: limits.monthly,
      });
    }

    return NextResponse.json({ 
      success: true, 
      message: `Plan updated to ${plan} successfully`,
      plan: plan 
    }, { headers: { 'Cache-Control': 'no-store' } });

  } catch (error) {
    
    return NextResponse.json({ error: 'Failed to update plan' }, { status: 500 });
  }
}
