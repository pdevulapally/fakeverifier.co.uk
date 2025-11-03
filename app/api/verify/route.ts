import { NextRequest } from 'next/server';
// Replaced complex OpenAI-based pipeline with HF FakeVerifier client
import { ensureQuota } from '@/lib/quota';
import { db } from '@/lib/firebaseAdmin';
import { fetchWithRetry, logNetworkError, getErrorMessage } from '@/lib/network-utils';
import { verifyClaim, parseFakeVerifierOutput } from '@/lib/fakeVerifierClient';
import { runWorkflow } from '@/lib/openaiAgent';

// 🔹 Helper to extract <title> from HTML for dynamic source naming
async function fetchTitle(url: string): Promise<string | null> {
  try {
    const res = await fetchWithRetry(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; FakeVerifier/1.0)',
      },
    });
    if (!res.ok) return null;
    const html = await res.text();
    const match = html.match(/<title>(.*?)<\/title>/i);
    if (match) {
      return match[1].replace(/\s+/g, ' ').trim();
    }
    return null;
  } catch (error) {
    logNetworkError(error, "Title extraction", url);
    return null;
  }
}

// 🔹 Fetch live news from Serper.dev
async function fetchLiveNews(query: string): Promise<{ url: string; title?: string; text?: string; publisher?: string; publishedTime?: string }[]> {
  if (!query?.trim()) return [];
  if (!process.env.SERPER_API_KEY) return [];
  try {
    const res = await fetchWithRetry('https://google.serper.dev/news', {
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
  } catch (error) {
    logNetworkError(error, "Serper news fetch", "https://google.serper.dev/news");
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
    const res = await fetchWithRetry(url.toString(), {
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
  } catch (error) {
    logNetworkError(error, "NewsAPI fetch", "https://newsapi.org/v2/everything");
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

// 🔹 Follow-ups: keep default fallbacks, skip LLM generation in HF mode
async function generateFollowUps(_: string, __: string): Promise<string[]> { return []; }

// 🔹 Convert confidence score to qualitative text
function confidenceLabel(score: number): string {
  if (score >= 80) return 'High';
  if (score >= 50) return 'Moderate';
  return 'Low';
}

// 🔹 Remove markdown formatting from text (especially **bold**, *italic*, etc.)
function stripMarkdown(text: string): string {
  if (!text) return text;
  let cleaned = text;
  
  // Remove code blocks first (they may contain markdown-like syntax)
  cleaned = cleaned.replace(/```[\s\S]*?```/g, '');
  
  // Remove inline code `code` -> code
  cleaned = cleaned.replace(/`([^`]+)`/g, '$1');
  
  // Remove links but keep text [text](url) -> text
  cleaned = cleaned.replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1');
  
  // Remove bold markdown __text__ (do underscores first)
  cleaned = cleaned.replace(/__([^_]+)__/g, '$1');
  
  // Remove bold markdown **text**
  // Run multiple times to handle nested or adjacent cases
  let prev = '';
  while (cleaned !== prev) {
    prev = cleaned;
    cleaned = cleaned.replace(/\*\*([^*]+)\*\*/g, '$1');
  }
  
  // Remove italic markdown *text* (but only if not part of **)
  cleaned = cleaned.replace(/\*([^*]+)\*/g, '$1');
  
  // Remove italic markdown _text_ (but only if not part of __)
  cleaned = cleaned.replace(/_([^_]+)_/g, '$1');
  
  // Remove headers # Header -> Header
  cleaned = cleaned.replace(/^#{1,6}\s+(.+)$/gm, '$1');
  
  // Remove strikethrough ~~text~~
  cleaned = cleaned.replace(/~~([^~]+)~~/g, '$1');
  
  // Remove list markers - * or - or 1. at start of line
  cleaned = cleaned.replace(/^[\s]*[-*•]\s+/gm, '');
  cleaned = cleaned.replace(/^\d+\.\s+/gm, '');
  
  // Clean up extra whitespace
  cleaned = cleaned.replace(/\n{3,}/g, '\n\n').trim();
  
  return cleaned;
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
    return explanation || '';
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

    // Get user plan for image limits
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

    // HF path: directly call hosted FakeVerifier model with the primary input
    const primaryClaim = (input?.raw || '').toString().slice(0, 300);

  // 3.5️⃣ Safety: avoid definitive verdicts on sensitive private attributes about individuals
  // Rationale: For private attributes (sexual orientation, religion, health, disability, caste/ethnicity, etc.),
  // unless there is explicit, first-person self-identification from the subject, we should not return
  // a factual verdict. We instead respond with Unverified and a short explanation.
  const fullText = `${(input?.raw || '').toString()}\n${primaryClaim}`.toLowerCase();

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

  if (targetsIndividual && matchedCategory) {
    const markdown = formatFactCheckMarkdown({
      verdict: 'Unverified',
      confidence: 0,
      explanation: `We do not issue factual verdicts on sensitive private attributes (e.g., ${matchedCategory.label}) about individuals without explicit, direct self-identification. The appropriate status is Unverified.`,
      sources: [],
      evidenceSnippets: [],
      followUps: [
        'Is there a first-person, verifiable statement from the individual?',
        'What is the public relevance of this information?'
      ],
    });
    return new Response(JSON.stringify({
      verdict: 'Unverified',
      confidence: 0,
      explanation: 'Sensitive private attribute about an individual',
      sources: [],
      evidenceSnippets: [],
      followUps: [],
      messageMarkdown: markdown,
    }), { status: 200, headers: { 'Content-Type': 'application/json' } });
  }

    // Route based on selected model - OpenAI Agent Builder is default for all plans
    const selectedModel = (model || 'openai-agent-builder').toString().toLowerCase();
    
    // OpenAI AgentBuilder is default for all plans (free, pro, enterprise)
    // If OpenAI API key is missing, log warning but still attempt (it will fail gracefully and fallback)
    if (!process.env.OPENAI_API_KEY) {
      console.warn('OPENAI_API_KEY not configured - OpenAI Agent Builder will not be available');
    }
    
    const useOpenAI = (selectedModel === 'openai-agent-builder' || !model) && !!process.env.OPENAI_API_KEY;
    let openAISucceeded = false;
    
    // Debug logging
    console.log('Model routing:', { 
      providedModel: model, 
      selectedModel, 
      useOpenAI, 
      hasOpenAIKey: !!process.env.OPENAI_API_KEY 
    });

    if (useOpenAI) {
      // Declare timeoutId outside try block for cleanup in catch
      let timeoutId: NodeJS.Timeout | undefined;
      try {
        // Add timeout wrapper for the OpenAI agent call
        // Set to 55s to give buffer before Vercel's 60s limit
        // OpenAI Agent Builder with web search can take time, so we give it enough time to complete
        const timeoutDuration = 55000; // 55 seconds (buffer before Vercel's 60s limit)
        const timeoutPromise = new Promise<never>((_, reject) => {
          timeoutId = setTimeout(() => {
            reject(new Error(`OpenAI Agent Builder request timed out after ${timeoutDuration / 1000} seconds`));
          }, timeoutDuration);
        });
        
        // Build conversation context from previous messages if available
        const conversationContext = context ? `Previous conversation:\n${context}` : '';
        
        const agentResponse = await Promise.race([
          runWorkflow({ 
            input_as_text: input.raw,
            conversation_history: conversationContext
          }),
          timeoutPromise
        ]) as any;
        
        // Clear timeout if workflow completed successfully
        if (timeoutId) clearTimeout(timeoutId);
        
        // Check if agentResponse exists
        if (!agentResponse || (!agentResponse.output_parsed && !agentResponse.output_text)) {
          throw new Error('OpenAI Agent Builder returned empty response');
        }
        
        // Parse the agent output
        let parsedOutput: any = {};
        try {
          if (typeof agentResponse.output_parsed === 'string') {
            parsedOutput = JSON.parse(agentResponse.output_parsed);
          } else if (typeof agentResponse.output_parsed === 'object') {
            parsedOutput = agentResponse.output_parsed;
          } else if (agentResponse.output_text) {
            parsedOutput = JSON.parse(agentResponse.output_text);
          }
        } catch (parseError) {
          // If parsing fails, use the raw text as explanation
          const rawText = agentResponse.output_text || agentResponse.output_parsed || '';
          parsedOutput = {
            explanation: typeof rawText === 'string' ? rawText : JSON.stringify(rawText),
            verdict: 'Unverified',
            confidence: 50
          };
        }

        // Check if the response is in fact-checking JSON format
        if (parsedOutput.verdict || parsedOutput.confidence !== undefined || parsedOutput.sources) {
          // Fact-checking mode response
          const verdict = parsedOutput.verdict || 'Unverified';
          const confidence = typeof parsedOutput.confidence === 'number' 
            ? parsedOutput.confidence 
            : parseInt(String(parsedOutput.confidence || '50'), 10);
          
          // Parse sources from the response
          let sources: any[] = [];
          if (Array.isArray(parsedOutput.sources)) {
            sources = parsedOutput.sources.map((s: string) => {
              try {
                // Parse "Source Name – URL" format
                const match = s.match(/^(.+?)\s*[–-]\s*(.+)$/);
                if (match) {
                  return { title: match[1].trim(), url: match[2].trim() };
                }
                // If it's just a URL
                if (s.startsWith('http')) {
                  try {
                    const urlObj = new URL(s);
                    return { title: urlObj.hostname.replace(/^www\./, ''), url: s };
                  } catch {
                    return { title: s, url: s };
                  }
                }
                return { title: s, url: s };
              } catch {
                return { title: s, url: s };
              }
            });
          }

          // Remove markdown formatting from OpenAI's explanation
          const rawExplanation = parsedOutput.explanation || 'No explanation provided.';
          const explanation = stripMarkdown(rawExplanation);

          // Build markdown response (formatFactCheckMarkdown will add its own formatting)
          const markdown = formatFactCheckMarkdown({
            verdict,
            confidence,
            explanation,
            sources: sources.map(s => ({ title: s.title, url: s.url })),
            evidenceSnippets: [],
            followUps: [
              'What additional evidence could strengthen this conclusion?',
              'Are there any sources that contradict these findings?',
              'How recent is this information?',
              'Could the claim be interpreted differently in another context?',
            ],
          });

          const result = {
            verdict,
            confidence,
            explanation, // Clean explanation without markdown
            sources: sources.map(s => ({ title: s.title || s.url, link: s.url })),
            evidenceSnippets: [],
            followUps: [
              'What additional evidence could strengthen this conclusion?',
              'Are there any sources that contradict these findings?',
              'How recent is this information?',
              'Could the claim be interpreted differently in another context?',
            ],
            messageMarkdown: markdown,
          modelUsed: { vendor: 'openai', name: 'agent-builder' },
          cost: {},
        };

          openAISucceeded = true;
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          });
        } else {
          // Conversational/general response
          const rawExplanation = parsedOutput.explanation || parsedOutput.output_text || 
            (typeof agentResponse.output_parsed === 'string' ? agentResponse.output_parsed : JSON.stringify(agentResponse.output_parsed));
          
          // Remove markdown formatting from conversational responses
          const explanation = stripMarkdown(rawExplanation);
          
          const result = {
            verdict: 'Conversational',
            confidence: 100,
            explanation: explanation, // Clean explanation without markdown
            messageMarkdown: explanation,
            sources: [],
            evidenceSnippets: [],
            followUps: [],
            modelUsed: { vendor: 'openai', name: 'agent-builder' },
            cost: {},
          };

          openAISucceeded = true;
          return new Response(JSON.stringify(result), {
            status: 200,
            headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
          });
        }
      } catch (error: any) {
        // Clear timeout if it's still active
        if (typeof timeoutId !== 'undefined') clearTimeout(timeoutId);
        
        // Log error for debugging with more details
        logNetworkError(error, 'OpenAI Agent Builder', 'runWorkflow');
        console.error('OpenAI Agent error:', {
          message: error?.message,
          name: error?.name,
          stack: error?.stack,
          selectedModel,
          hasOpenAIKey: !!process.env.OPENAI_API_KEY
        });
        openAISucceeded = false;
        // Always fallback to HuggingFace instead of returning error
        // This ensures free plan users and users with network issues get a response
      }
    }

    // Use Hugging Face FakeVerifier model if selected, or as fallback if OpenAI fails
    if (selectedModel === 'fakeverifier-hf' || !useOpenAI || !openAISucceeded) {
      try {
        const hfOutput = await verifyClaim(primaryClaim);
        const parsed = parseFakeVerifierOutput(hfOutput);

        // Build minimal response preserving frontend expectations
        const defaultFollowUps = [
          'What additional evidence could strengthen this conclusion?',
          'Are there any sources that contradict these findings?',
          'How recent is this information?',
          'Could the claim be interpreted differently in another context?',
        ];

        const result = {
          verdict: parsed.verdict || 'Unknown',
          confidence: parsed.confidence || 0,
          explanation: parsed.raw,
          sources: [],
          evidenceSnippets: [],
          followUps: await generateFollowUps(primaryClaim, input?.context || '') || defaultFollowUps,
          messageMarkdown: parsed.raw,
          modelUsed: { vendor: 'huggingface', name: 'fakeverifier-app' },
          cost: {},
        };

        return new Response(JSON.stringify(result), {
          status: 200,
          headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' },
        });
      } catch (hfError: any) {
        // If HuggingFace also fails, return a user-friendly error instead of hanging
        logNetworkError(hfError, 'HuggingFace Fallback', 'verifyClaim');
        return new Response(
          JSON.stringify({ 
            error: 'Service temporarily unavailable',
            message: 'We encountered an issue processing your request. Please try again in a moment.',
            modelUsed: { vendor: 'error', name: 'fallback-failed' }
          }),
          { status: 503, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    // Safety fallback: if we somehow reach here without returning, return error
    // This should never happen, but ensures we always return a response
    return new Response(
      JSON.stringify({ 
        error: 'Internal routing error',
        message: 'Unable to determine which model to use. Please try again.'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    return new Response(
      JSON.stringify({ error: e?.message || 'Internal server error' }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
