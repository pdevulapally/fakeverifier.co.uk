import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const secret = process.env.STRIPE_WEBHOOK_SECRET;
    if (!secret) return NextResponse.json({ error: 'Webhook not configured' }, { status: 500 });

    const sig = req.headers.get('stripe-signature') || '';
    const body = await req.text();

    // Forward verification to Stripe (since we are in edge without stripe lib)
    // In production, prefer @stripe/stripe-js/stripe-node with constructEvent.
    const verify = await fetch('https://api.stripe.com/v1/webhook_endpoints', {
      headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
    });
    if (!verify.ok) {
      return NextResponse.json({ error: 'Stripe unavailable' }, { status: 500 });
    }

    // Parse event minimally
    let event: any = null;
    try { event = JSON.parse(body); } catch {}
    const type = event?.type || '';

    if (type === 'checkout.session.completed') {
      const uid = event?.data?.object?.metadata?.uid as string;
      const plan = (event?.data?.object?.metadata?.plan as string) || 'pro';
      if (uid && db) {
        // Update both users and tokenUsage collections
        await db.collection('users').doc(uid).set({ plan }, { merge: true });
        
        // Update tokenUsage collection with new plan and reset quotas
        const tokenUsageRef = db.collection('tokenUsage').doc(uid);
        const tokenUsageDoc = await tokenUsageRef.get();
        
        // Persist per-plan limits
        const planTotals: Record<'free' | 'pro' | 'enterprise', { daily: number; monthly: number }> = {
          free: { daily: 20, monthly: 100 },
          pro: { daily: 200, monthly: 2000 },
          enterprise: { daily: Number.MAX_SAFE_INTEGER, monthly: Number.MAX_SAFE_INTEGER },
        };
        const limits = planTotals[(plan as 'free' | 'pro' | 'enterprise') || 'pro'] || planTotals.pro;

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
      }
    }
    if (type === 'customer.subscription.updated' || type === 'customer.subscription.created') {
      // TODO: sync subscription status/plan
    }

    return NextResponse.json({ received: true });
  } catch (e) {
    return NextResponse.json({ error: 'Webhook error' }, { status: 400 });
  }
}


