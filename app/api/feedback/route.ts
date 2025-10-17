import { NextRequest, NextResponse } from 'next/server';
import { db, admin } from '@/lib/firebaseAdmin';

// A simple in-memory preference hint the LLM can read (best-effort; resets on redeploy)
export let globalPreferenceHint = '' as string;

export async function POST(req: NextRequest) {
  try {
    const { uid, conversationId, messageId, type, reason, note } = await req.json();
    if (!uid || !conversationId || !messageId || !type) {
      return NextResponse.json({ error: 'uid, conversationId, messageId and type are required' }, { status: 400 });
    }
    if (!db) {
      return NextResponse.json({ error: 'Database not initialized' }, { status: 500 });
    }
    const doc = {
      uid,
      conversationId,
      messageId,
      type, // 'up' | 'down'
      reason: typeof reason === 'string' ? reason : undefined,
      note: typeof note === 'string' ? note : undefined,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    };
    await db.collection('feedback').add(doc);

    // Update in-memory hint to bias future generations (very small nudge)
    let prefix = '';
    if (type === 'up') {
      prefix = 'User liked the previous style and structure.';
    } else {
      const r = (reason || '').toLowerCase();
      if (r.includes('code')) prefix = 'Code issues reported. Provide correct, runnable code and verify accuracy.';
      else if (r.includes('memory')) prefix = 'Avoid using prior memory unless explicitly allowed; respond self-contained.';
      else if (r.includes('personality')) prefix = 'Tone/personal style disliked. Keep neutral, concise, professional tone.';
      else if (r.includes('style')) prefix = 'Style disliked. Optimize for clarity, skimmability, and structure.';
      else if (r.includes('factual')) prefix = 'Factual errors reported. Cite sources and ensure correctness.';
      else prefix = 'User disliked the previous style; improve clarity, citations and reasoning.';
    }
    globalPreferenceHint = prefix;
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: 'Failed to record feedback' }, { status: 500 });
  }
}


