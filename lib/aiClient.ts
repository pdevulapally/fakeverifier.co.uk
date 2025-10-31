import { fetchWithRetry, logNetworkError } from '@/lib/network-utils';

export type VerdictResponse = { verdict: string; confidence: number };

// Free tier – classification model on HF Inference API
export async function callFakeVerifierModel(text: string): Promise<VerdictResponse> {
  const model = process.env.HF_FAKEVERIFIER_MODEL || 'pdevulapally/fakeverifier-liar';
  const url = `https://api-inference.huggingface.co/models/${model}`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || ''}`,
  };
  try {
    const r = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ inputs: text }),
      cache: 'no-store',
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error || `HF inference error (${r.status})`);
    // Expect array like [{label:"REAL", score:0.93}, ...]
    const arr = Array.isArray(data) ? data : Array.isArray(data?.outputs) ? data.outputs : [];
    const top = arr.sort((a: any, b: any) => (b?.score ?? 0) - (a?.score ?? 0))[0] || {};
    const label = String(top?.label || '').toLowerCase();
    const score = Number(top?.score || 0);
    const verdict = label.includes('real') ? 'Likely Real' : label.includes('fake') ? 'Likely Fake' : 'Unverified';
    const confidence = Math.round(Math.max(0, Math.min(1, score)) * 100);
    return { verdict, confidence };
  } catch (e) {
    logNetworkError(e, 'HF Inference (FakeVerifier)', url);
    throw e;
  }
}

// Pro/Enterprise – Llama chat via HF Router (OpenAI-compatible)
export async function callLlamaChat(messages: any[]): Promise<string> {
  const baseURL = 'https://router.huggingface.co/v1';
  const model = process.env.LLAMA_MODEL_ID || 'meta-llama/Llama-3.1-8B-Instruct:sambanova';
  const url = `${baseURL}/chat/completions`;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || ''}`,
  };
  try {
    const r = await fetchWithRetry(url, {
      method: 'POST',
      headers,
      body: JSON.stringify({ model, messages, temperature: 0.3, stream: false }),
      cache: 'no-store',
    });
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data?.error?.message || `HF Router error (${r.status})`);
    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error('Empty response from Llama');
    return String(content);
  } catch (e) {
    logNetworkError(e, 'HF Router (Llama Chat)', url);
    throw e;
  }
}

export async function fetchSerperEvidence(query: string): Promise<{ title?: string; link?: string; snippet?: string }[]> {
  if (!process.env.SERPER_API_KEY) return [];
  try {
    const r = await fetchWithRetry('https://google.serper.dev/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-KEY': process.env.SERPER_API_KEY as string,
      },
      body: JSON.stringify({ q: query, num: 5, gl: 'us', hl: 'en' }),
      cache: 'no-store',
    });
    const j = await r.json().catch(() => ({}));
    const items = Array.isArray(j?.organic) ? j.organic : [];
    return items.slice(0, 5).map((x: any) => ({ title: x?.title, link: x?.link, snippet: x?.snippet }));
  } catch (e) {
    logNetworkError(e, 'Serper evidence fetch', 'https://google.serper.dev/search');
    return [];
  }
}

export async function fetchSerpApiEvidence(query: string): Promise<{ title?: string; link?: string; snippet?: string }[]> {
  if (!process.env.SERPAPI_KEY) return [];
  try {
    const url = `https://serpapi.com/search.json?engine=google&q=${encodeURIComponent(query)}&num=5&api_key=${process.env.SERPAPI_KEY}`;
    const r = await fetchWithRetry(url, { method: 'GET', cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    const items = Array.isArray(j?.organic_results) ? j.organic_results : [];
    return items.slice(0, 5).map((x: any) => ({ title: x?.title, link: x?.link, snippet: x?.snippet || x?.snippet_highlighted_words?.join(' ') }));
  } catch (e) {
    logNetworkError(e, 'SerpAPI evidence fetch', 'https://serpapi.com');
    return [];
  }
}

export async function fetchNewsApiEvidence(query: string): Promise<{ title?: string; link?: string; snippet?: string }[]> {
  if (!process.env.NEWS_API_KEY) return [];
  try {
    const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&pageSize=5&sortBy=publishedAt`;
    const r = await fetchWithRetry(url, { method: 'GET', headers: { 'X-Api-Key': process.env.NEWS_API_KEY as string }, cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    const items = Array.isArray(j?.articles) ? j.articles : [];
    return items.slice(0, 5).map((a: any) => ({ title: a?.title, link: a?.url, snippet: a?.description }));
  } catch (e) {
    logNetworkError(e, 'NewsAPI evidence fetch', 'https://newsapi.org');
    return [];
  }
}

export async function fetchTavilyEvidence(query: string): Promise<{ title?: string; link?: string; snippet?: string }[]> {
  if (!process.env.TAVILY_API_KEY) return [];
  try {
    const r = await fetchWithRetry('https://api.tavily.com/search', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
      body: JSON.stringify({ query, max_results: 5 }),
      cache: 'no-store',
    });
    const j = await r.json().catch(() => ({}));
    const items = Array.isArray(j?.results) ? j.results : [];
    return items.slice(0, 5).map((x: any) => ({ title: x?.title, link: x?.url, snippet: x?.content || x?.snippet }));
  } catch (e) {
    logNetworkError(e, 'Tavily evidence fetch', 'https://api.tavily.com/search');
    return [];
  }
}

export async function fetchYouTubeEvidence(query: string): Promise<{ title?: string; link?: string; snippet?: string }[]> {
  if (!process.env.YOUTUBE_API_KEY) return [];
  try {
    const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=5&q=${encodeURIComponent(query)}&key=${process.env.YOUTUBE_API_KEY}`;
    const r = await fetchWithRetry(url, { method: 'GET', cache: 'no-store' });
    const j = await r.json().catch(() => ({}));
    const items = Array.isArray(j?.items) ? j.items : [];
    return items.slice(0, 5).map((v: any) => ({ title: v?.snippet?.title, link: `https://www.youtube.com/watch?v=${v?.id?.videoId}`, snippet: v?.snippet?.description }));
  } catch (e) {
    logNetworkError(e, 'YouTube evidence fetch', 'https://www.googleapis.com/youtube/v3/search');
    return [];
  }
}

export async function aggregateEvidence(query: string) {
  const [a, b, c, d, e] = await Promise.all([
    fetchSerperEvidence(query),
    fetchSerpApiEvidence(query),
    fetchNewsApiEvidence(query),
    fetchTavilyEvidence(query),
    fetchYouTubeEvidence(query),
  ]);
  // Deduplicate by link
  const map = new Map<string, { title?: string; link?: string; snippet?: string }>();
  for (const arr of [a, b, c, d, e]) {
    for (const item of arr) {
      const key = (item.link || item.title || '').trim();
      if (key && !map.has(key)) map.set(key, item);
    }
  }
  return Array.from(map.values()).slice(0, 10);
}


