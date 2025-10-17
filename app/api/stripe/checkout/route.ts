import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { plan, uid, success_url, cancel_url } = await req.json();
    if (!process.env.STRIPE_SECRET_KEY) return NextResponse.json({ error: 'Stripe not configured' }, { status: 500 });

    // Basic client token check (UUID v4 format); acts as a lightweight anti-automation token
    const clientToken = req.headers.get('x-client-token') || '';
    const uuidV4 = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidV4.test(clientToken)) {
      return NextResponse.json({ error: 'Invalid client token' }, { status: 400 });
    }

    // Try to dynamically find a recurring price by product name ("Pro" or "Enterprise")
    let priceId = '';
    try {
      const list = await fetch('https://api.stripe.com/v1/prices?active=true&limit=100&expand[]=data.product', {
        headers: { Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}` },
      });
      const j = await list.json();
      if (j?.data?.length) {
        const desiredName = plan === 'enterprise' ? 'Enterprise' : 'Pro';
        const candidates = (j.data as any[]).filter((p: any) => p.recurring && (p.product?.name === desiredName || p.nickname?.toLowerCase().includes(desiredName.toLowerCase())));
        if (candidates.length) priceId = candidates[0].id;
      }
    } catch {}

    // Fallback to inline price_data if no price found
    const useInlinePrice = !priceId;

    const body = new URLSearchParams({
      mode: 'subscription',
      success_url: success_url || `${new URL(req.url).origin}/pricing?status=success`,
      cancel_url: cancel_url || `${new URL(req.url).origin}/pricing?status=cancel`,
      'metadata[uid]': uid || 'anonymous',
      'metadata[plan]': plan || 'pro',
      'metadata[clientToken]': clientToken,
    });
    if (useInlinePrice) {
      const unitCents = plan === 'enterprise' ? 4999 : 999; // USD cents
      body.append('line_items[0][price_data][currency]', 'usd');
      body.append('line_items[0][price_data][recurring][interval]', 'month');
      body.append('line_items[0][price_data][product_data][name]', plan === 'enterprise' ? 'Enterprise Plan' : 'Pro Plan');
      body.append('line_items[0][price_data][unit_amount]', String(unitCents));
      body.append('line_items[0][quantity]', '1');
    } else {
      body.append('line_items[0][price]', priceId);
      body.append('line_items[0][quantity]', '1');
    }

    const r = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body,
    });
    const j = await r.json();
    if (!r.ok) return NextResponse.json({ error: j?.error?.message || 'Stripe error' }, { status: 500 });
    return NextResponse.json({ id: j.id, url: j.url });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to create checkout' }, { status: 500 });
  }
}


