import { NextRequest } from 'next/server';
import { ingest } from '@/lib/ingest';
import { retrieve } from '@/lib/retrieve';
import { crossCheck } from '@/lib/agents/crossCheck';
import { judge } from '@/lib/agents/judge';
import { pack } from '@/lib/pack';
import { ensureQuota } from '@/lib/quota';
import { db } from '@/lib/firebaseAdmin';
import { callLLM } from '@/lib/llm';

// 🔹 Helper to extract <title> from HTML for dynamic source naming
async function fetchTitle(url: string): Promise<string | null> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 4000); // 4s timeout
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<title>(.*?)<\/title>/i);
    if (match) {
      return match[1].replace(/\s+/g, ' ').trim();
    }
    return null;
  } catch {
    return null;
  }
}

// 🔹 Fetch live news from Serper.dev
async function fetchLiveNews(query: string): Promise<{ url: string; title?: string; text?: string; publisher?: string; publishedTime?: string }[]> {
  if (!query?.trim()) return [];
  if (!process.env.SERPER_API_KEY) return [];
  try {
    const res = await fetch('https://google.serper.dev/news', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.SERPER_API_KEY as string,
      },
      // Avoid any caching
      cache: 'no-store',
      body: JSON.stringify({ q: query, num: 5 }),
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.news) ? data.news : Array.isArray(data?.results) ? data.results : [];
    return items.slice(0, 5).map((n: any) => ({
      url: n.link || n.url,
      title: n.title,
      text: n.snippet,
      publisher: n.source,
      publishedTime: n.date || n.publishedDate,
    })).filter((n: any) => n.url);
  } catch {
    return [];
  }
}

// 🔹 Fetch live news from NewsAPI.org
async function fetchNewsApi(query: string): Promise<{ url: string; title?: string; text?: string; publisher?: string; publishedTime?: string }[]> {
  if (!query?.trim()) return [];
  if (!process.env.NEWS_API_KEY) return [];
  try {
    const url = new URL('https://newsapi.org/v2/everything');
    url.searchParams.set('q', query);
    url.searchParams.set('pageSize', '5');
    url.searchParams.set('sortBy', 'publishedAt');
    const res = await fetch(url.toString(), {
      headers: { 'X-Api-Key': process.env.NEWS_API_KEY as string },
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    const items = Array.isArray(data?.articles) ? data.articles : [];
    return items.slice(0, 5).map((a: any) => ({
      url: a.url,
      title: a.title,
      text: a.description,
      publisher: a?.source?.name,
      publishedTime: a.publishedAt,
    })).filter((a: any) => a.url);
  } catch {
    return [];
  }
}

function normalizeUrl(u: string): string {
  try {
    const obj = new URL(u);
    return `${obj.origin}${obj.pathname}`.replace(/\/$/, '');
  } catch {
    return (u || '').replace(/\/$/, '');
  }
}

// 🔹 Generate AI follow-up questions via OpenAI (gpt-4o-mini)
async function generateFollowUps(claim: string, context: string): Promise<string[]> {
  try {
    const sys = 'You generate concise, intelligent follow-up questions to verify or deepen a claim.';
    const prompt = `Claim: ${claim}\nContext: ${context || ''}\n\nGenerate 3–5 intelligent, human-sounding follow-up questions related to verifying or expanding this claim.`;
    const res: any = await callLLM({
      system: sys,
      user: prompt,
      schema: {
        type: 'object',
        properties: {
          questions: {
            type: 'array',
            minItems: 3,
            maxItems: 5,
            items: { type: 'string' },
          },
        },
        required: ['questions'],
      },
      tier: 'pro', // ensure OpenAI path with gpt-4o-mini per project config
    });
    const qs = Array.isArray(res?.questions) ? res.questions : [];
    return qs.filter((q: any) => typeof q === 'string' && q.trim()).slice(0, 5);
  } catch {
    return [];
  }
}

// 🔹 Convert confidence score to qualitative text
function confidenceLabel(score: number): string {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Moderate';
  return 'Low';
}

// 🔹 Build markdown output for frontend
function formatFactCheckMarkdown({
  verdict,
  confidence,
  explanation,
  sources,
  evidenceSnippets,
  followUps,
}: any): string {
  // Handle conversational responses - return just the explanation without any formatting
  if (verdict === 'Conversational') {
    return explanation || 'Hello! I\'m FakeVerifier, your friendly AI assistant. I can help with general questions and also specialize in fact-checking when you need to verify claims or articles. What would you like to chat about?';
  }

  // Handle fact-checking responses
  const confLabel = confidenceLabel(confidence ?? 0);
  const verdictEmoji =
    verdict?.toLowerCase() === 'true' || verdict?.toLowerCase() === 'real' || verdict?.toLowerCase() === 'likely real'
      ? '🟩'
      : verdict?.toLowerCase() === 'false' || verdict?.toLowerCase() === 'likely fake'
      ? '🟥'
      : verdict?.toLowerCase() === 'misleading'
      ? '🟨'
      : '⬜️';

  const evidenceSection =
    evidenceSnippets?.length
      ? ` 🔍 Key Evidence I Found\n${evidenceSnippets
          .map(
            (e: any) =>
              `- **${e.title || 'Source'}:** "${e.quote}"  \n  [Read more](${e.url})`
          )
          .join('\n')}\n`
      : '';

  const sourcesSection =
    sources?.length
      ? ` 📚 Sources I Checked\n${sources
          .map(
            (s: any, i: number) =>
              `${i + 1}. [${s.title || new URL(s.url).hostname.replace(/^www\./, '')}](${s.url})`
          )
          .join('\n')}\n`
      : ' 📚 Sources I Checked\n_I wasn\'t able to find reliable sources to verify this information._\n';

  const followupSection =
    followUps?.length
      ? ` 💭 You might also want to ask\n${followUps.map((q: string) => `- ${q}`).join('\n')}\n`
      : '';

  return `${verdictEmoji} **My Assessment:** ${verdict || 'Unknown'}  
**Confidence Level:** ${confLabel} (${confidence ?? '—'}%)

 💬 What I Found
${explanation || 'I wasn\'t able to find enough information to provide a clear assessment.'}

${evidenceSection}${sourcesSection}${followupSection}`.trim();
}

// 🔹 Main verify route
export async function POST(req: NextRequest) {
  try {
    const { uid, input, context, model, imageBase64Array } = await req.json();
    // Quota: charge 1 token per verification
    try {
      if (uid) await ensureQuota(uid, 1);
    } catch (q: any) {
      // Fetch remaining counters for UI hints
      let remaining = { daily: 0, monthly: 0, plan: 'free' as string };
      try {
        if (uid && db) {
          const snap = await db.collection('tokenUsage').doc(uid).get();
          const u = snap.data() as any;
          const plan = (u?.plan || 'free') as 'free' | 'pro' | 'enterprise';
          const planTotals = {
            free: { daily: 10, monthly: 50 },
            pro: { daily: 50, monthly: 500 },
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

    if (!input?.raw) {
      return new Response(JSON.stringify({ error: 'Missing input text' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check if this is a general conversation vs fact-checking request
    const isGeneralConversation = (text: string) => {
      const greetings = ['hi', 'hello', 'hey', 'good morning', 'good afternoon', 'good evening', 'how are you', 'what\'s up', 'how\'s it going'];
      const generalQuestions = ['what can you do', 'help me', 'tell me about', 'explain', 'how does', 'what is', 'who is', 'when is', 'where is', 'why is'];
      
      const lowerText = text.toLowerCase().trim();
      
      // Check for greetings
      if (greetings.some(greeting => lowerText.includes(greeting))) {
        return true;
      }
      
      // Check for general questions (not fact-checking specific)
      if (generalQuestions.some(question => lowerText.includes(question)) && 
          !lowerText.includes('verify') && 
          !lowerText.includes('check') && 
          !lowerText.includes('fact') && 
          !lowerText.includes('true') && 
          !lowerText.includes('false') &&
          !lowerText.includes('real') &&
          !lowerText.includes('fake')) {
        return true;
      }
      
      return false;
    };

    const isConversational = isGeneralConversation(input.raw);

    // Get user plan first
    let plan: 'free' | 'pro' | 'enterprise' = 'free';
    try {
      if (uid && db) {
        const snap = await db.collection('tokenUsage').doc(uid).get();
        const u = snap.data() as any;
        plan = (u?.plan || 'free') as 'free' | 'pro' | 'enterprise';
      }
    } catch (error) {
      console.error('Error fetching user plan:', error);
      plan = 'free';
    }

    // Handle conversational responses
    if (isConversational) {
      // For conversational requests, use a simpler approach
      const conversationalResponse = await callLLM({
        system: `You are FakeVerifier, a friendly and conversational AI assistant. You're like ChatGPT - you can chat about anything, help with general questions, and also specialize in fact-checking when needed.

Be warm, friendly, and engaging. Respond naturally to greetings and general questions. If someone asks about fact-checking capabilities, explain that you can help verify claims, headlines, articles, and social media posts.

Keep responses conversational and helpful. Don't use formal fact-checking format unless specifically asked to verify something.`,
        user: input.raw,
        schema: null,
        tier: plan,
        model: model || 'gpt-4o'
      });

      const conversationalText = conversationalResponse.explanation || conversationalResponse.rawText || 'Hello! I\'m FakeVerifier, your friendly AI assistant. I can help with general questions and also specialize in fact-checking when you need to verify claims or articles. What would you like to chat about?';
      
      return new Response(
        JSON.stringify({
          verdict: 'Conversational',
          confidence: 100,
          explanation: conversationalText,
          messageMarkdown: conversationalText, // This will be used by the frontend instead of the verdict format
          sources: [],
          evidenceSnippets: [],
          followUps: [], // Empty follow-ups for conversational responses to avoid duplication
          modelUsed: conversationalResponse.modelUsed,
          cost: conversationalResponse.cost || {}
        }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Enforce per-plan image attachment limits

    const maxImagesByPlan: Record<'free' | 'pro' | 'enterprise', number> = {
      free: 1,
      pro: 3,
      enterprise: 10,
    };
    const providedImages = Array.isArray(imageBase64Array) ? imageBase64Array.length : 0;
    const maxImages = maxImagesByPlan[plan] ?? 1;
    if (providedImages > maxImages) {
      return new Response(
        JSON.stringify({
          error: 'image_limit',
          message: `Your ${plan} plan allows up to ${maxImages} image${maxImages === 1 ? '' : 's'} per verification`,
          allowed: maxImages,
          received: providedImages,
          plan,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Build context-aware input
    const contextualInput = { ...input, previousContext: context || '' };

    // 1️⃣ Extract claims
    const claims = await ingest(contextualInput);

    // 2️⃣ Retrieve relevant sources
    const corpus = await retrieve({ claims, input: contextualInput, userPlan: plan });

    // 🔹 Live news before verification
    const primaryClaim = (claims?.[0] || input?.raw || '').toString().slice(0, 300);
    const [liveNewsSerper, liveNewsNewsApi] = await Promise.all([
      fetchLiveNews(primaryClaim),
      fetchNewsApi(primaryClaim),
    ]);

    // 🔹 Merge and deduplicate sources by URL
    const existing = Array.isArray((corpus as any)?.sources) ? (corpus as any).sources : [];
    const mergedByUrl = new Map<string, any>();
    for (const s of [...existing, ...liveNewsSerper, ...liveNewsNewsApi]) {
      if (!s || !s.url) continue;
      const key = normalizeUrl(s.url);
      if (!mergedByUrl.has(key)) {
        mergedByUrl.set(key, s);
      }
    }
    (corpus as any).sources = Array.from(mergedByUrl.values());

    // 3️⃣ Cross-check
    const cross = await crossCheck({ claims, corpus, tier: plan });

  // 3.5️⃣ Safety: avoid definitive verdicts on sensitive private attributes about individuals
  // Rationale: For private attributes (sexual orientation, religion, health, disability, caste/ethnicity, etc.),
  // unless there is explicit, first-person self-identification from the subject, we should not return
  // a factual verdict. We instead respond with Unverified and a short explanation.
  const fullText = `${(input?.raw || '').toString()}\n${(claims || []).join(' ')}`.toLowerCase();

  // Minimal heuristic for detecting an individual mention; product teams should replace with NER
  const targetsIndividual = /(\bmr\.?\b|\bms\.?\b|\bdr\.?\b|\bprime\s+minister\b|\bpresident\b|\bminister\b|\bchief\s+minister\b|\bcm\b|\bpresident\b|\bceo\b|\bchairman\b|\bmodi\b|\bnarendra\s+modi\b)/i.test(input?.raw || '');

  // Configurable sensitive categories and indicative phrases
  const SENSITIVE_CATEGORIES: { label: string; phrases: string[] }[] = [
    { label: 'sexual orientation', phrases: ['is gay','is lesbian','is bisexual','is straight','is homosexual','is heterosexual','sexual orientation','is trans','is transgender','is queer','is lgbt','is lgbtq'] },
    { label: 'religion', phrases: ['is hindu','is muslim','is christian','is sikh','is buddhist','is jain','is jewish','religion is','religious belief'] },
    { label: 'health', phrases: ['has cancer','has hiv','has aids','has covid','mental illness','diagnosed with','medical condition','is infertile','is pregnant','pregnancy status'] },
    { label: 'disability', phrases: ['is disabled','has disability','autistic','down syndrome','paraplegic','blind','deaf','wheelchair bound'] },
    { label: 'caste/ethnicity', phrases: ['is dalit','is brahmin','is obc','is sc','is st','caste is','belongs to caste','ethnicity is'] },
    { label: 'other private', phrases: ['sexual life','private life','intimate relationship','affair with','cheating on','orientation of'] },
  ];

  const matchedCategory = SENSITIVE_CATEGORIES.find(cat => cat.phrases.some(p => fullText.includes(p)));

  let decision;
  if (targetsIndividual && matchedCategory) {
    decision = {
      verdict: 'Unverified',
      confidence: 0,
      explanation:
        `We do not issue factual verdicts on sensitive private attributes (e.g., ${matchedCategory.label}) about individuals without explicit, direct self-identification. The appropriate status is Unverified.`,
    } as any;
  } else {
    // 4️⃣ Judge verdict (with image analysis if provided)
    decision = await judge({ cross, imageBase64Array, originalInput: input?.raw?.toString() || primaryClaim, model, tier: plan });
  }

    // 5️⃣ Pack structured evidence
    const evidence = await pack({ cross, decision });

    // 🔹 Build dynamic sources list from both corpus and judge
    let sources = [];
    
    // Add sources from corpus (retrieved sources)
    const corpusSources = (corpus?.sources || [])
      .filter((s: any) => s.url)
      .slice(0, 5)
      .map((s: any) => ({ url: s.url, title: s.title, text: s.text }));
    
    // Add sources from judge (sourcesChecked)
    const judgeSources = (decision?.sourcesChecked || [])
      .filter((s: string) => s && s.startsWith('http'))
      .slice(0, 5)
      .map((s: string) => ({ url: s, title: '', text: '' }));
    
    // Combine and deduplicate by URL
    const allSources = [...corpusSources, ...judgeSources];
    const uniqueSources = new Map();
    allSources.forEach(s => {
      if (s.url && !uniqueSources.has(s.url)) {
        uniqueSources.set(s.url, s);
      }
    });
    
    sources = Array.from(uniqueSources.values()).slice(0, 10);

    // 🔹 Dynamically fetch page titles for unnamed sources
    const fetchPromises = sources.map(async (s) => {
      if (!s.title && s.url.startsWith('http')) {
        const t = await fetchTitle(s.url);
        if (t) s.title = t;
      }
      return s;
    });
    sources = await Promise.all(fetchPromises);

    // 🔹 Extract evidence snippets
    const claim = (claims?.[0] || '').toString();
    const keywords: string[] = Array.from(
      new Set<string>(
        claim
          .toLowerCase()
          .split(/[^a-z0-9]+/)
          .filter((w: string) => w.length > 3)
      )
    ).slice(0, 8);

    const evidenceSnippets: { quote: string; url: string; title?: string }[] = [];
    for (const s of sources) {
      if (!s.text) continue;
      const sentences = s.text.split(/(?<=[.!?])\s+/).slice(0, 80);
      const hit = sentences.find((sent: string) =>
        keywords.some((k) => sent.toLowerCase().includes(k))
      );
      if (hit)
        evidenceSnippets.push({
          quote: hit.trim().slice(0, 300),
          url: s.url,
          title: s.title,
        });
      if (evidenceSnippets.length >= 6) break;
    }

    // 🔹 AI follow-up questions
    const generatedFollowUps = await generateFollowUps(primaryClaim, input?.context || '');
    const followUps = generatedFollowUps.length
      ? generatedFollowUps
      : [
          'What additional evidence could strengthen this conclusion?',
          'Are there any sources that contradict these findings?',
          'How recent is this information?',
          'Could the claim be interpreted differently in another context?',
        ];

    const explanation =
      decision?.explanation ||
      decision?.reason ||
      decision?.reasoning ||
      'The claim was analyzed across multiple sources and verified using recent, credible reports.';

    const markdown = formatFactCheckMarkdown({
      verdict: decision?.verdict || 'Unknown',
      confidence: decision?.confidence ?? 0,
      explanation,
      sources,
      evidenceSnippets,
      followUps,
    });

    const result = {
      verdict: decision?.verdict || 'Unknown',
      confidence: decision?.confidence ?? 0,
      explanation,
      sources,
      evidenceSnippets,
      followUps,
      messageMarkdown: markdown,
    };

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
    });
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
