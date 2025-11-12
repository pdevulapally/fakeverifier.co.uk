import { NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

export async function GET(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 501 });
    const { searchParams } = new URL(req.url);
    const uid = (searchParams.get('uid') || '').toString();
    // Reject anonymous users - no memories for anonymous/free users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }
    const snap = await db.collection('users').doc(uid).collection('memories').orderBy('createdAt', 'desc').limit(100).get();
    const memories = snap.docs.map(d => ({ id: d.id, ...d.data() }));
    return new Response(JSON.stringify({ memories }), { status: 200, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' } });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 501 });
    const body = await req.json().catch(() => ({}));
    const uid = (body?.uid || '').toString();
    const content = (body?.content || '').toString().trim();
    const type = (body?.type || 'general').toString();
    const tags = Array.isArray(body?.tags) ? body.tags : [];
    // Reject anonymous users - no memories for anonymous/free users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }
    if (!content) return new Response(JSON.stringify({ error: 'Missing content' }), { status: 400 });
    const ref = db.collection('users').doc(uid).collection('memories').doc();
    const now = new Date();
    await ref.set({ content, type, tags, isActive: true, createdAt: now, updatedAt: now });
    return new Response(JSON.stringify({ id: ref.id }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 501 });
    const body = await req.json().catch(() => ({}));
    const uid = (body?.uid || '').toString();
    const id = (body?.id || '').toString();
    // Reject anonymous users - no memories for anonymous/free users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
    const content = (body?.content || '').toString().trim();
    const type = (body?.type || 'general').toString();
    const tags = Array.isArray(body?.tags) ? body.tags : [];
    const ref = db.collection('users').doc(uid).collection('memories').doc(id);
    await ref.update({ content, type, tags, updatedAt: new Date() });
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'DB not configured' }), { status: 501 });
    const { searchParams } = new URL(req.url);
    const uid = (searchParams.get('uid') || '').toString();
    const id = (searchParams.get('id') || '').toString();
    // Reject anonymous users - no memories for anonymous/free users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }
    if (!id) return new Response(JSON.stringify({ error: 'Missing id' }), { status: 400 });
    const ref = db.collection('users').doc(uid).collection('memories').doc(id);
    await ref.delete();
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}
 
