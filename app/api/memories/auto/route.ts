import { NextRequest } from 'next/server';
import { db } from '@/lib/firebaseAdmin';

type MemoryItem = {
  content: string;
  kind?: 'profile' | 'preference' | 'fact';
  source?: string;
  score?: number;
};

function normalizeItems(payload: any): MemoryItem[] {
  const raw = Array.isArray(payload?.items) ? payload.items : Array.isArray(payload?.memories) ? payload.memories : [];
  return raw
    .map((m: any) => ({
      content: (m?.content || '').toString().trim(),
      kind: (m?.kind || 'fact') as any,
      source: (m?.source || 'chat').toString(),
      score: Number.isFinite(m?.score) ? Number(m.score) : 0.7,
    }))
    .filter((m: MemoryItem) => m.content && m.content.length >= 8)
    .slice(0, 10);
}

function getCookie(name: string, cookieHeader: string | null): string {
  if (!cookieHeader) return '';
  const parts = cookieHeader.split(/;\s*/);
  for (const p of parts) {
    const [k, v] = p.split('=');
    if (k === name) return decodeURIComponent(v || '');
  }
  return '';
}

export async function POST(req: NextRequest) {
  try {
    if (!db) return new Response(JSON.stringify({ error: 'Memories store not configured' }), { status: 501 });
    const body = await req.json().catch(() => ({}));
    const headerUid = (req.headers.get('x-uid') || '').toString();
    const cookieUid = getCookie('uid', req.headers.get('cookie'));
    const uid = (body?.uid || headerUid || cookieUid || '').toString();
    // Reject anonymous users - no memories for anonymous/free users
    if (!uid || uid === 'demo' || uid === '') {
      return new Response(JSON.stringify({ error: 'Memories are not available for anonymous users' }), { status: 403 });
    }

    // Mode A: direct memories payload (uid + items/memories)
    const items = normalizeItems(body);
    if (items.length) {
      const userRef = db.collection('users').doc(uid);
      const memsRef = userRef.collection('memories');
      // Load existing contents to dedupe
      const existingSnap = await memsRef.orderBy('createdAt', 'desc').limit(200).get();
      const existing = new Set(existingSnap.docs.map(d => String((d.data() as any)?.content || '').trim().toLowerCase()).filter(Boolean));
      const now = new Date();
      const batch = db.batch();
      let saved = 0;
      for (const m of items) {
        const norm = String(m.content || '').trim().toLowerCase();
        if (!norm || existing.has(norm)) continue;
        const docRef = memsRef.doc();
        batch.set(docRef, {
          content: m.content,
          type: m.kind || 'fact',
          tags: [],
          source: m.source || 'chat',
          score: Math.max(0, Math.min(1, m.score || 0.7)),
          isActive: true,
          createdAt: now,
          updatedAt: now,
        });
        saved += 1;
        existing.add(norm);
      }
      if (saved > 0) await batch.commit();
      return new Response(JSON.stringify({ ok: true, saved }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Mode B: analysis payload (uid + conversation + userMessage + aiResponse)
    const conversation = (body?.conversation || '').toString();
    const userMessage = (body?.userMessage || '').toString();
    const aiResponse = (body?.aiResponse || '').toString();
    if (conversation && userMessage && aiResponse) {
      const analysis = analyzeForMemories(userMessage, aiResponse, conversation);
      const createdMemories: any[] = [];
      const userRef = db.collection('users').doc(uid);
      const memsRef = userRef.collection('memories');
      const now = new Date();
      // Dedupe against existing
      const existingSnap = await memsRef.orderBy('createdAt', 'desc').limit(200).get();
      const existing = new Set(existingSnap.docs.map(d => String((d.data() as any)?.content || '').trim().toLowerCase()).filter(Boolean));
      for (const m of analysis) {
        const norm = String(m.content || '').trim().toLowerCase();
        if (!norm || existing.has(norm)) continue;
        const ref = memsRef.doc();
        const doc = {
          content: m.content,
          type: m.type || 'general',
          tags: m.tags || [],
          isActive: true,
          source: 'auto-generated',
          score: m.confidence || 0.8,
          createdAt: now,
          updatedAt: now,
        };
        await ref.set(doc);
        createdMemories.push({ id: ref.id, ...doc, action: 'created' });
        existing.add(norm);
      }
      return new Response(JSON.stringify({ success: true, createdMemories, updatedMemories: [], totalProcessed: analysis.length }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    return new Response(JSON.stringify({ error: 'No valid memories' }), { status: 400 });
  } catch (e: any) {
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}

function analyzeForMemories(userMessage: string, aiResponse: string, conversation: string) {
  const out: Array<{ action: 'create'; content: string; type: string; tags?: string[]; confidence?: number }> = [];
  const push = (content: string, type = 'general', tags: string[] = [], confidence = 0.9) => {
    const c = (content || '').trim();
    if (c.length >= 8) out.push({ action: 'create', content: c, type, tags, confidence });
  };
  const q = (userMessage || '').trim().toLowerCase();
  // Do not store memories for questions or recall-only prompts
  if (/[?]/.test(q) || /^(who|what|when|where|why|how)\b/.test(q)) return out;
  // Only store explicit user-declared facts or preferences
  const name = userMessage.match(/(?:my name is|call me)\s+([a-zA-Z\s]+)/i);
  if (name) push(`User's name is ${name[1].trim()}`, 'personal', ['name']);
  const city = userMessage.match(/(?:i live in|i'm from|located in|my location is)\s+([a-zA-Z\s,]+)/i);
  if (city) push(`User lives in ${city[1].trim()}`, 'personal', ['location']);
  const birthday = userMessage.match(/(?:my birthday is)\s*[:\-]?\s*([a-zA-Z]+\s*\d{1,2})/i);
  if (birthday) push(`User birthday is ${birthday[1].trim()}`, 'personal', ['birthday']);
  const pref = userMessage.match(/(?:i prefer|i like|from now on)\s+(.{4,})/i);
  if (pref) push(`Preference: ${pref[1].trim()}`, 'preference', ['preference']);
  // Never store assistant reply lines
  return out;
}

 
