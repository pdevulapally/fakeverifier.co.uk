import { NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 501 });
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const uid = (body?.uid || '').toString();
    
    // Reject anonymous users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }
    
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
    
    const ref = db.collection('users').doc(uid).collection('memories').doc(id);
    const mem = await ref.get();
    
    if (!mem.exists) {
      return new Response(JSON.stringify({ error: 'Memory not found' }), { status: 404 });
    }
    
    const data = mem.data();
    const usageCount = Number(data?.usageCount || 0) + 1;
    
    await ref.update({
      usageCount,
      lastUsedAt: new Date(),
    });
    
    return new Response(JSON.stringify({ ok: true, usageCount }), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
    });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

