import { NextRequest } from 'next/server';
import { callFakeVerifierModel, callLlamaChat, aggregateEvidence } from '@/lib/aiClient';
import { fetchWithRetry, logNetworkError } from '@/lib/network-utils';
import { db } from '@/lib/firebaseAdmin';
import { ensureQuota } from '@/lib/quota';

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

type EvidenceItem = { title?: string; link?: string; snippet?: string; image?: string };

function buildProMessages(user: string, evidence: EvidenceItem[], history: any[] = [], preferenceHint = '') {
  const pref = preferenceHint ? `${preferenceHint}\n\n` : '';
  const sys = `${pref}You are FakeVerifier, a helpful, multilingual assistant.
For general chat: be conversational and concise.
For fact-checking: Use the provided Evidence to inform your response. Reference the evidence naturally in your answer, but DO NOT include a Sources section or list URLs directly - sources will be added automatically.`;
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

function needsRealTimeInfo(text: string, history: any[] = []): boolean {
  const originalText = (text || '').trim();
  const t = originalText.toLowerCase();
  
  // Skip very short messages (likely greetings or acknowledgments)
  if (originalText.length < 10) return false;
  
  // Skip simple greetings and personal pleasantries
  const greetingPattern = /^(hi|hello|hey|thanks|thank you|bye|goodbye|ok|okay|yes|no|sure|alright)\s*[!?.]*$/i;
  if (greetingPattern.test(originalText)) return false;
  
  // Always search for URLs
  if (/https?:\/\//.test(originalText)) return true;
  
  // Dynamic analysis based on query characteristics
  
  // 1. Check if query contains proper nouns/capitalized entities (likely factual claims)
  const properNounCount = (originalText.match(/\b[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*\b/g) || []).length;
  if (properNounCount >= 2) return true; // Multiple entities suggest factual query
  
  // 2. Check for numbers (years, dates, statistics) - likely need verification
  const hasNumbers = /\d/.test(originalText);
  const hasRecentYear = /\b(20[0-3][0-9])\b/.test(originalText);
  if (hasRecentYear || (hasNumbers && originalText.length > 20)) return true;
  
  // 3. Check if it's a question (questions often need current info)
  const isQuestion = originalText.trim().endsWith('?');
  if (isQuestion && originalText.length > 15) return true;
  
  // 4. Check for factual claim patterns (statements about events, results, news)
  // Look for verb patterns that suggest events: won, happened, announced, etc.
  const eventVerbs = /\b(won|happened|happening|announced|released|published|declared|confirmed|reported|said|stated)\b/i;
  if (eventVerbs.test(originalText) && originalText.length > 20) return true;
  
  // 5. Check conversation context - follow-ups in ongoing conversations need verification
  if (history.length > 0) {
    // If there's history and this is a follow-up (short response, correction, or continuation)
    const isFollowUp = originalText.length < 50 || 
                      /^(yes|no|correct|wrong|actually|i mean|i meant|but|however|also|and|or|well|so)\b/i.test(originalText) ||
                      /^(that|this|it|they|we|you)\b/i.test(originalText);
    if (isFollowUp) return true;
    
    // If previous messages had evidence, this follow-up likely needs it too
    const lastUserMsg = history.filter((m: any) => m.role === 'user').pop();
    const lastAssistantMsg = history.filter((m: any) => m.role === 'assistant').pop();
    if (lastAssistantMsg && lastAssistantMsg.content && 
        (lastAssistantMsg.content.includes('Source') || lastAssistantMsg.content.includes('http'))) {
      return true;
    }
  }
  
  // 6. Check for substantive content (not personal statements)
  // Personal statements usually start with "I", "My", "I'm" and are about feelings/opinions
  const isPersonalStatement = /^(i |my |i'm |i've |i'll |i'd |me |myself )/i.test(originalText);
  const isOpinion = /\b(i think|i feel|i believe|i like|i prefer|i want|i need|my opinion|in my view)\b/i.test(originalText);
  
  // If it's substantive (long enough) and not clearly personal, search
  if (originalText.length > 25 && !isPersonalStatement && !isOpinion) return true;
  
  // 7. Check for factual content indicators (organizations, places, people, events)
  // Multiple capitalized words or specific patterns suggest factual claims
  if (originalText.length > 30) {
    const wordCount = originalText.split(/\s+/).length;
    const capitalizedWords = (originalText.match(/\b[A-Z][a-z]+\b/g) || []).length;
    // If more than 20% of words are capitalized, likely factual
    if (capitalizedWords > 0 && (capitalizedWords / wordCount) > 0.15) return true;
  }
  
  return false;
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

function getShortLinkName(item: EvidenceItem): string {
  // Try to get a short, readable name from title
  if (item.title) {
    // Clean up title - remove extra whitespace, truncate if too long
    let name = item.title.trim();
    // Remove common prefixes/suffixes
    name = name.replace(/^[-|•]\s*/, '').replace(/\s*[-|•]$/, '');
    // If title is reasonable length, use it
    if (name.length > 0 && name.length <= 60) {
      return name;
    }
    // If too long, truncate intelligently
    if (name.length > 60) {
      // Try to truncate at word boundary
      const truncated = name.substring(0, 57);
      const lastSpace = truncated.lastIndexOf(' ');
      return lastSpace > 30 ? truncated.substring(0, lastSpace) + '...' : truncated + '...';
    }
  }
  
  // Fallback to domain name from URL
  if (item.link) {
    try {
      const url = new URL(item.link);
      let hostname = url.hostname.replace(/^www\./, '');
      // Remove TLD for shorter display (e.g., "example.com" -> "example")
      const parts = hostname.split('.');
      if (parts.length > 2) {
        hostname = parts.slice(-2).join('.');
      }
      return hostname;
    } catch {
      // If URL parsing fails, use a short version of the link
      return item.link.length > 40 ? item.link.substring(0, 37) + '...' : item.link;
    }
  }
  
  return 'Source';
}

function sanitizeReplyWithEvidence(text: string, evidence: EvidenceItem[]) {
  let sanitized = String(text || '');
  
  // Remove any existing sources sections in various formats
  // This handles patterns like:
  // "Sources:\nhttps://..." 
  // "**Sources:**\n..."
  // "[1] Title — https://..."
  const sourcesPatterns = [
    /\n\s*Sources:\s*\n(?:(?:https?:\/\/[^\n]+)\n?)+/gi,          // "Sources:\nhttp://...\nhttp://..."
    /\n\s*\*\*Sources:\*\*\s*\n[\s\S]*?(?=\n\n|\n$|$)/gi,        // "**Sources:**\n..."
    /\n\s*\[Sources\]\s*\n[\s\S]*?(?=\n\n|\n$|$)/gi,            // "[Sources]\n..."
    /\n\s*\[?\d+\]?\s*[^\n]*https?:\/\/[^\n]+/gi,                // "[1] Title — http://..."
  ];
  
  sourcesPatterns.forEach(pattern => {
    sanitized = sanitized.replace(pattern, '');
  });
  
  // Remove raw URLs that appear on their own lines (standalone URLs)
  sanitized = sanitized.split('\n').filter(line => {
    const trimmed = line.trim();
    // Remove lines that are just URLs
    if (/^https?:\/\/[^\s]+$/.test(trimmed)) {
      return false;
    }
    return true;
  }).join('\n');
  
  // Remove inline standalone URLs (but keep markdown links [text](url))
  const urlRe = /https?:\/\/[^\s)]+/g;
  sanitized = sanitized.replace(urlRe, (url, offset) => {
    // Check if this URL is part of a markdown link
    const before = sanitized.substring(Math.max(0, offset - 100), offset);
    const after = sanitized.substring(offset, Math.min(sanitized.length, offset + url.length + 50));
    
    // If it's inside [text](url) format, keep it
    if (before.match(/\[.*?\]\s*\($/) && after.startsWith(')')) {
      return url;
    }
    // Otherwise remove it
    return '';
  });
  
  // Clean up multiple newlines
  sanitized = sanitized.replace(/\n{3,}/g, '\n\n');
  
  // Build sources block with clickable markdown links
  if (evidence && evidence.length) {
    const sources = `\n\n**Sources:**\n${evidence.map((e, i) => {
      const shortName = getShortLinkName(e);
      const url = e.link || '';
      return `${i + 1}. [${shortName}](${url})`;
    }).join('\n')}`;
    // Add sources at the end
    sanitized += sources;
  }
  return sanitized.trim();
}

async function getUserMemories(uid: string, conversationContext?: string): Promise<string[]> {
  try {
    // Don't fetch memories for anonymous users
    if (!db || !uid || uid === 'demo' || uid === '') return [];
    
    // Use context-aware retrieval if context is provided
    if (conversationContext) {
      return await getRelevantMemories(uid, conversationContext, 10);
    }
    
    // Fallback to simple retrieval - get all and sort in memory (Firebase doesn't support multiple orderBy)
    const snap = await db
      .collection('users')
      .doc(uid)
      .collection('memories')
      .where('isActive', '==', true)
      .limit(50)
      .get();
    
    const memories = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    }));
    
    // Sort by importance score and recency
    memories.sort((a, b) => {
      const scoreA = (Number(a.importanceScore || 0.5) * 0.6) + 
                    (Number(a.usageCount || 0) / 10 * 0.4);
      const scoreB = (Number(b.importanceScore || 0.5) * 0.6) + 
                    (Number(b.usageCount || 0) / 10 * 0.4);
      return scoreB - scoreA;
    });
    
    return memories
      .slice(0, 10)
      .map(m => String(m.content || ''))
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Context-aware memory retrieval with relevance scoring
async function getRelevantMemories(
  uid: string,
  conversationContext: string,
  limit: number = 10
): Promise<string[]> {
  try {
    if (!db || !uid || uid === 'demo' || uid === '') return [];
    
    // Get all active memories
    const snap = await db
      .collection('users')
      .doc(uid)
      .collection('memories')
      .where('isActive', '==', true)
      .limit(100) // Get more to score and filter
      .get();
    
    const memories = snap.docs.map(d => ({
      id: d.id,
      ...(d.data() as any)
    }));
    
    if (memories.length === 0) return [];
    
    // Extract keywords from conversation context
    const contextKeywords = extractKeywords(conversationContext);
    
    // Score each memory based on relevance
    const scoredMemories = memories.map(mem => {
      const relevanceScore = calculateRelevanceScore(mem, contextKeywords, conversationContext);
      return { ...mem, relevanceScore };
    });
    
    // Sort by relevance score (descending)
    scoredMemories.sort((a, b) => b.relevanceScore - a.relevanceScore);
    
    // Return top N memories
    return scoredMemories
      .slice(0, limit)
      .map(m => {
        // Track usage
        trackMemoryUsage(uid, m.id).catch(() => {}); // Fire and forget
        return String(m.content || '');
      })
      .filter(Boolean);
  } catch {
    return [];
  }
}

// Extract keywords from text
function extractKeywords(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .split(/\s+/)
    .filter(w => w.length > 3) // Filter out short words
    .filter(w => !['the', 'and', 'for', 'are', 'but', 'not', 'you', 'all', 'can', 'her', 'was', 'one', 'our', 'out', 'day', 'get', 'has', 'him', 'his', 'how', 'its', 'may', 'new', 'now', 'old', 'see', 'two', 'way', 'who', 'boy', 'did', 'its', 'let', 'put', 'say', 'she', 'too', 'use'].includes(w));
  
  return new Set(words);
}

// Calculate relevance score for a memory
function calculateRelevanceScore(
  memory: any,
  contextKeywords: Set<string>,
  conversationContext: string
): number {
  let score = 0;
  
  // Base importance score (40%)
  const importanceScore = Number(memory.importanceScore || 0.5);
  score += importanceScore * 0.4;
  
  // Recency score (30%)
  const createdAt = memory.createdAt?.toDate ? memory.createdAt.toDate() : new Date(memory.createdAt || Date.now());
  const daysSinceCreation = (Date.now() - createdAt.getTime()) / (1000 * 60 * 60 * 24);
  const recencyScore = Math.max(0, 1 - (daysSinceCreation / 90)); // Decay over 90 days
  score += recencyScore * 0.3;
  
  // Usage score (30%)
  const usageCount = Number(memory.usageCount || 0);
  const usageScore = Math.min(1, usageCount / 10); // Normalize to 0-1 (10 uses = max)
  score += usageScore * 0.3;
  
  // Semantic similarity bonus (up to +0.2)
  const memoryText = String(memory.content || '').toLowerCase();
  const memoryKeywords = extractKeywords(memoryText);
  
  // Calculate keyword overlap
  let overlap = 0;
  let totalKeywords = 0;
  for (const keyword of contextKeywords) {
    totalKeywords++;
    if (memoryKeywords.has(keyword) || memoryText.includes(keyword)) {
      overlap++;
    }
  }
  
  const similarityBonus = totalKeywords > 0 ? (overlap / totalKeywords) * 0.2 : 0;
  score += similarityBonus;
  
  // Topic/tag matching bonus
  const memoryTopics = Array.isArray(memory.topics) ? memory.topics : [];
  const memoryTags = Array.isArray(memory.tags) ? memory.tags : [];
  const allMemoryTerms = [...memoryTopics, ...memoryTags].map(t => t.toLowerCase());
  
  for (const keyword of contextKeywords) {
    if (allMemoryTerms.some(term => term.includes(keyword) || keyword.includes(term))) {
      score += 0.05; // Small bonus for topic/tag matches
      break;
    }
  }
  
  return Math.min(1, score); // Cap at 1.0
}

// Track memory usage (fire and forget)
async function trackMemoryUsage(uid: string, memoryId: string): Promise<void> {
  try {
    if (!db || !uid || !memoryId) return;
    const ref = db.collection('users').doc(uid).collection('memories').doc(memoryId);
    const mem = await ref.get();
    if (mem.exists) {
      const data = mem.data();
      const usageCount = Number(data?.usageCount || 0) + 1;
      await ref.update({
        usageCount,
        lastUsedAt: new Date(),
      });
    }
  } catch {
    // Silent fail for usage tracking
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
    // Check if it's a Llama/chat model (includes all chat models: llama, gpt-oss-20b)
    const isLlamaModel = modelId.includes('llama') || modelId.includes('gpt-oss');
    
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
      // Free plan users can use Llama 3.3 70B (OpenRouter models)
      if (modelId.includes('llama') || modelId.includes('gpt-oss')) {
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
      // Attach a Sources block with clickable markdown links
      result += `\n\nSources:\n${evidence.map((e: any, i: number) => {
        const shortName = getShortLinkName(e);
        const url = e.link || '';
        return `${i + 1}. [${shortName}](${url})`;
      }).join('\n')}`;
    }
      // fire-and-forget auto-memories
      saveAutoMemories((userId || '').toString(), text, result);
      return new Response(JSON.stringify({ result, evidence }), {
        status: 200,
        headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
      });
    }

    // Pro / Enterprise path (including anonymous Llama access)
    // For chat models, always check if real-time information is needed
    const needsEvidence = needsRealTimeInfo(text, Array.isArray(history) ? history : []);
    const evidence = needsEvidence ? await aggregateEvidence(text) : [];
    const pref = await getUserPreferenceHint((userId || '').toString());
    // Use context-aware memory retrieval
    const conversationContext = `${text} ${Array.isArray(history) ? history.slice(-3).map((h: any) => h.content || '').join(' ') : ''}`;
    const userMems = await getUserMemories((userId || '').toString(), conversationContext);
    const memText = userMems.length ? `\n\nKnown user profile and preferences:\n${userMems.map(m => `- ${m}`).join('\n')}` : '';
    const msgs = buildProMessages(text + memText, evidence, Array.isArray(history) ? history : [], pref);
    // Pass the model ID to route to correct provider (modelId already declared above)
    const llamaResult = await withRetry(() => callLlamaChat(msgs, modelId));
    let reply = llamaResult.content;
    if (needsEvidence && evidence.length > 0) reply = sanitizeReplyWithEvidence(reply, evidence);
    
    // Deduct credits for logged-in users based on actual API cost
    // Convert cost to credits: 1 credit = $0.01 (or use tokens directly: 1 credit per 1000 tokens)
    if (!isAnonymous && userId) {
      let creditsToDeduct = 1; // Default fallback
      
      if (llamaResult.cost !== undefined && llamaResult.cost > 0) {
        // Convert cost in USD to credits (1 credit = $0.01)
        creditsToDeduct = Math.ceil(llamaResult.cost * 100);
      } else if (llamaResult.usage?.total_tokens) {
        // Fallback: use tokens (1 credit per 1000 tokens, minimum 1)
        creditsToDeduct = Math.max(1, Math.ceil(llamaResult.usage.total_tokens / 1000));
      }
      
      try {
        await ensureQuota(userId, creditsToDeduct);
      } catch (q: any) {
        // Fetch remaining counters for UI hints
        let remaining = { daily: 0, monthly: 0, plan: 'free' as string };
        try {
          if (userId && db) {
            const snap = await db.collection('tokenUsage').doc(userId).get();
            const u = snap.data() as any;
            const plan = (u?.plan || 'free') as 'free' | 'pro' | 'enterprise';
            const planTotals = {
              free: { daily: 20, monthly: 100 },
              pro: { daily: 200, monthly: 2000 },
              enterprise: { daily: 500, monthly: 5000 }
            };
            const totals = planTotals[plan] || planTotals.free;
            const dailyUsed = u?.dailyUsed ?? 0;
            const monthlyUsed = u?.used ?? 0;
            remaining = { 
              daily: Math.max(0, totals.daily - dailyUsed), 
              monthly: Math.max(0, totals.monthly - monthlyUsed), 
              plan: plan 
            };
          }
        } catch {}
        return new Response(
          JSON.stringify({ error: 'quota', message: 'Token quota exceeded', remaining }),
          { status: 402, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }
    
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


