import { NextRequest } from 'next/server';
import { callFakeVerifierModel, callLlamaChat, aggregateEvidence } from '@/lib/aiClient';
import { fetchWithRetry, logNetworkError } from '@/lib/network-utils';
import { db } from '@/lib/firebaseAdmin';

async function getUserPlan(uid: string): Promise<'free' | 'pro' | 'enterprise'> {
  try {
    const r = await fetchWithRetry(`${process.env.NEXT_PUBLIC_BASE_URL || ''}/api/user-tokens?uid=${encodeURIComponent(uid)}&t=${Date.now()}`, { cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    const plan = (j?.plan || 'free').toString();
    if (plan === 'pro' || plan === 'enterprise') return plan;
    return 'free';
  } catch {
    return 'free';
  }
}

async function getUserPreferenceHint(uid: string): Promise<string> {
  try {
    // Don't fetch preferences for anonymous users
    if (!uid || uid === 'demo' || uid === '' || !db) return '';
    const ref = db.collection('preferences').doc(uid);
    const snap = await ref.get();
    const data = (snap.exists ? (snap.data() as any) : {}) || {};
    return (data.preferenceHint || data.hint || '').toString().trim();
  } catch {
    return '';
  }
}

type EvidenceItem = { title?: string; link?: string; snippet?: string };

function buildProMessages(user: string, evidence: EvidenceItem[], history: any[] = [], preferenceHint = '') {
  const pref = preferenceHint ? `${preferenceHint}\n\n` : '';
  const sys = `${pref}You are FakeVerifier, a helpful, multilingual assistant.
For general chat: be conversational and concise.
For fact-checking: ONLY cite links from the provided Evidence. Never invent URLs. Prefer short citations like [1], [2] and include a Sources list at the end matching those indices.`;
  const strictness = `\nAnswer ONLY what is asked. If the user asks for a single specific detail (e.g., "When is my birthday?"), reply with just that detail in one short sentence. Do not restate profile details unless explicitly requested.`;
  const evText = evidence.length ? `\n\nEvidence:\n${evidence.map((e, i) => `- [${i+1}] ${e.title || e.link || 'Source'}: ${e.link || ''} — ${e.snippet || ''}`).join('\n')}` : '';
  const msgs = [
    { role: 'system', content: sys + strictness },
    ...history,
    { role: 'user', content: `${user}${evText}` },
  ];
  return msgs;
}

async function withRetry<T>(fn: () => Promise<T>, attempts = 2): Promise<T> {
  let last: any;
  for (let i = 0; i < attempts; i++) {
    try { return await fn(); } catch (e) { last = e; }
  }
  throw last;
}

function isFactCheckIntent(text: string): boolean {
  const t = (text || '').toLowerCase();
  if (/https?:\/\//.test(t)) return true;
  const keys = ['verify','fact','fact-check','fact check','true or false','is this true','fake','misinformation','disinformation','headline','news','rumor','hoax','credible','source'];
  return keys.some(k => t.includes(k));
}

function getBaseUrl() {
  const explicit = (process.env.NEXT_PUBLIC_BASE_URL || '').trim();
  if (explicit) return explicit.replace(/\/$/, '');
  const vercel = (process.env.VERCEL_URL || '').trim();
  if (vercel) return `https://${vercel.replace(/\/$/, '')}`;
  return 'http://localhost:3000';
}

async function saveAutoMemories(uid: string, userMessage: string, assistantReply: string) {
  // Don't save memories for anonymous users
  if (!uid || uid === 'demo' || uid === '') return;
  try {
    const base = getBaseUrl();
    const items = extractMemories(userMessage, assistantReply).slice(0, 5);
    if (!items.length) return;
    // Send a single canonical shape to avoid 400/200 double logs
    await fetchWithRetry(`${base}/api/memories/auto`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ uid, memories: items, source: 'chat' }),
      cache: 'no-store',
    });
  } catch (e) {
    logNetworkError(e, 'Auto-memories save', '/api/memories/auto');
  }
}

function extractMemories(userMessage: string, assistantReply: string) {
  const memories: Array<{ content: string; kind: 'profile' | 'preference' | 'fact'; source: 'chat'; score: number }>
    = [];
  const push = (c: string, kind: 'profile' | 'preference' | 'fact', score = 0.7) => {
    const content = c.trim().slice(0, 300);
    if (content.length >= 8) memories.push({ content, kind, source: 'chat', score });
  };
  // Skip if the user message is a recall/question, not new info
  const qm = userMessage.trim().toLowerCase();
  if (/[?]/.test(qm) || /^(who|what|when|where|why|how)\b/.test(qm)) {
    return memories;
  }
  // Simple heuristics for new facts/preferences only
  if (/\b(i am|i'm|my name is|call me)\b/i.test(userMessage)) push(userMessage, 'profile', 0.9);
  if (/\b(i like|i prefer|my preference|i use|i love)\b/i.test(userMessage)) push(userMessage, 'preference', 0.85);
  return memories;
}

function sanitizeReplyWithEvidence(text: string, evidence: EvidenceItem[]) {
  const allowed = new Set((evidence || []).map(e => (e.link || '').trim()).filter(Boolean));
  const urlRe = /https?:\/\/[^\s)]+/g;
  let sanitized = String(text || '');
  sanitized = sanitized.replace(urlRe, (u) => (allowed.has(u) ? u : ''));
  // Build sources block from evidence to avoid hallucinated links
  if (evidence && evidence.length) {
    const sources = `\n\nSources:\n${evidence.map((e, i) => `[${i+1}] ${e.title || e.link} — ${e.link}`).join('\n')}`;
    // Ensure sources are present once
    if (!/\nSources:\n/i.test(sanitized)) sanitized += sources;
  }
  return sanitized.trim();
}

async function getUserMemories(uid: string): Promise<string[]> {
  try {
    // Don't fetch memories for anonymous users
    if (!db || !uid || uid === 'demo' || uid === '') return [];
    const snap = await db
      .collection('users')
      .doc(uid)
      .collection('memories')
      .orderBy('createdAt', 'desc')
      .limit(10)
      .get();
    return snap.docs.map(d => String((d.data() as any)?.content || '')).filter(Boolean);
  } catch {
    return [];
  }
}

function getAnonymousChatCount(req: NextRequest): number {
  try {
    const cookieHeader = (req.headers.get('cookie') || '').toString();
    const match = cookieHeader.match(/(?:^|;\s*)anonymous_chat_count=(\d+)/);
    return match ? parseInt(match[1], 10) : 0;
  } catch {
    return 0;
  }
}

export async function POST(req: NextRequest) {
  try {
    const { message, userId: bodyUserId, history, model } = await req.json();
    const text = (message || '').toString();
    if (!text.trim()) return new Response(JSON.stringify({ error: 'Empty message' }), { status: 400 });
    const headerUid = (req.headers.get('x-uid') || '').toString();
    const cookieHeader = (req.headers.get('cookie') || '').toString();
    const cookieUid = (() => {
      const m = cookieHeader.match(/(?:^|;\s*)uid=([^;]+)/);
      return m ? decodeURIComponent(m[1]) : '';
    })();
    const userId = (bodyUserId || headerUid || cookieUid || '').toString();

    let plan = await getUserPlan((userId || '').toString());
    const isAnonymous = !userId || userId === 'demo' || userId === '';
    const modelId = (model || '').toString();
    // Check if it's a Llama/chat model (includes all chat models: llama-hf, llama-4-maverick, gpt-oss-20b)
    const isLlamaModel = modelId.includes('llama') || modelId.includes('gpt-oss') || modelId.includes('maverick');
    
    // Track anonymous chat usage for chat models (OpenRouter models)
    let anonymousChatCount = 0;
    let newAnonymousCount = 0;
    if (isAnonymous && isLlamaModel) {
      anonymousChatCount = getAnonymousChatCount(req);
      const ANONYMOUS_LIMIT = 10; // Allow 10 free chats without login
      
      if (anonymousChatCount >= ANONYMOUS_LIMIT) {
        return new Response(JSON.stringify({ 
          error: 'limit_reached',
          message: 'You\'ve reached the free chat limit. Please sign in to continue using chat models.',
          remaining: 0
        }), { 
          status: 429,
          headers: { 
            'Content-Type': 'application/json',
            'Set-Cookie': `anonymous_chat_count=${anonymousChatCount}; Path=/; Max-Age=86400; SameSite=Lax`
          }
        });
      }
      
      // Increment anonymous chat count
      newAnonymousCount = anonymousChatCount + 1;
      
      // Allow anonymous users to use Llama (treat as 'pro' for model access)
      plan = 'pro';
    } else if (isLlamaModel && !isAnonymous) {
      // Logged-in users: honor Llama model selection regardless of plan
      // Free plan users can use Llama 4 Maverick (OpenRouter models)
      if (modelId.includes('maverick') || modelId.includes('gpt-oss')) {
        plan = 'pro'; // Allow OpenRouter models for all logged-in users
      } else {
        plan = 'pro'; // HF models require pro/enterprise
      }
    }

    if (plan === 'free' && !isLlamaModel) {
    const res = await withRetry(() => callFakeVerifierModel(text));
      const emoji = res.verdict.includes('Real') ? '🟩' : res.verdict.includes('Fake') ? '🟥' : '🟨';
    let result = `${emoji} ${res.verdict}\nConfidence: ${res.confidence}%`;
      // Fetch light evidence for context links (non-blocking if it fails)
      let evidence = [] as any[];
      try { evidence = await aggregateEvidence(text); } catch {}
    if (evidence.length) {
      // Attach a Sources block instead of inline URLs to avoid hallucinations
      result += `\n\nSources:\n${evidence.map((e: any, i: number) => `[${i+1}] ${e.title || e.link} — ${e.link}`).join('\n')}`;
    }
      // fire-and-forget auto-memories
      saveAutoMemories((userId || '').toString(), text, result);
      return new Response(JSON.stringify({ result, evidence }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Pro / Enterprise path (including anonymous Llama access)
    const needsEvidence = isFactCheckIntent(text);
    const evidence = needsEvidence ? await aggregateEvidence(text) : [];
    const pref = await getUserPreferenceHint((userId || '').toString());
    const userMems = await getUserMemories((userId || '').toString());
    const memText = userMems.length ? `\n\nKnown user profile and preferences:\n${userMems.map(m => `- ${m}`).join('\n')}` : '';
    const msgs = buildProMessages(text + memText, evidence, Array.isArray(history) ? history : [], pref);
    // Pass the model ID to route to correct provider (modelId already declared above)
    let reply = await withRetry(() => callLlamaChat(msgs, modelId));
    if (needsEvidence) reply = sanitizeReplyWithEvidence(reply, evidence);
    // fire-and-forget auto-memories
    saveAutoMemories((userId || '').toString(), text, reply);
    
    // Build response with anonymous chat info if applicable
    const responseData: any = { result: reply, evidence };
    if (isAnonymous && isLlamaModel) {
      const ANONYMOUS_LIMIT = 10;
      responseData.anonymousChatCount = newAnonymousCount;
      responseData.anonymousChatLimit = ANONYMOUS_LIMIT;
      responseData.remaining = Math.max(0, ANONYMOUS_LIMIT - newAnonymousCount);
      responseData.showWarning = newAnonymousCount >= 5; // Show warning after 5 chats
    }
    
    const responseHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    };
    
    // Set cookie for anonymous users
    if (isAnonymous && isLlamaModel) {
      responseHeaders['Set-Cookie'] = `anonymous_chat_count=${newAnonymousCount}; Path=/; Max-Age=86400; SameSite=Lax`;
    }
    
    return new Response(JSON.stringify(responseData), {
      status: 200,
      headers: responseHeaders,
    });
  } catch (e: any) {
    logNetworkError(e, '/api/chat', 'router');
    return new Response(JSON.stringify({ error: e?.message || 'Internal error' }), { status: 500 });
  }
}


