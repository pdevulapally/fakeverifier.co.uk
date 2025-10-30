import { Readability } from '@mozilla/readability';
import * as jsdom from 'jsdom';
import { fetchWithRetry, logNetworkError, getErrorMessage } from '@/lib/network-utils';

export async function retrieve({ claims, input, userPlan = 'free' }: { claims: string[]; input: any; userPlan?: string }) {
  const q = claims.slice(0, 3).join(' ');
  
  // For free users: Use TAVILY_API_KEY with SerpAPI fallback
  if (userPlan === 'free') {
    try {
      // Try TAVILY first
      const tav = await fetchWithRetry('https://api.tavily.com/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.TAVILY_API_KEY}` },
        body: JSON.stringify({ query: q, search_depth: 'basic', include_domains: [], max_results: 4 }),
      });
      
      if (tav.ok) {
        const tjson = await tav.json();
        const urls: string[] = Array.from(
          new Set<string>(
            ((tjson.results ?? []) as Array<{ url?: string }>).map((r) => r.url ?? '')
          )
        )
          .filter(Boolean)
          .slice(0, 4);
        return await processUrls(urls);
      }
    } catch (error) {
      logNetworkError(error, "Tavily API search", "https://api.tavily.com/search");
    }
    
    // Fallback to SerpAPI for free users
    try {
      const serpUrl = `https://serpapi.com/search?api_key=${process.env.SERPAPI_KEY}&q=${encodeURIComponent(q)}&num=4`;
      const serp = await fetchWithRetry(serpUrl);
      
      if (serp.ok) {
        const serpData = await serp.json();
        const urls: string[] = (serpData.organic_results || []).map((r: any) => r.link as string).slice(0, 4);
        return await processUrls(urls);
      }
    } catch (error) {
      logNetworkError(error, "SerpAPI search", "https://serpapi.com/search");
    }
    
    return { sources: [] };
  }
  
  // For Pro/Enterprise: Skip external search — agent handles web search internally
  return { sources: [] };
}

// Helper function to process URLs and extract content
async function processUrls(urls: string[]) {
  const sources: any[] = [];
  await Promise.all(
    urls.map(async (url: string) => {
      try {
        const res = await fetchWithRetry(url, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (compatible; FakeVerifier/1.0)',
          },
        });
        const html = await res.text();
        const dom = new jsdom.JSDOM(html, { url });
        const reader = new Readability(dom.window.document);
        const article = reader.parse();
        if (article?.textContent)
          sources.push({ url, title: article.title, text: article.textContent, publisher: new URL(url).hostname, publishedTime: guessTime(html) });
      } catch (error) {
        logNetworkError(error, "URL processing", url);
      }
    })
  );

  return { sources };
}

function guessTime(html: string) {
  const m = html.match(/(datePublished|datetime)\"?[:=]\"?([^\"'>]+)/i);
  return m?.[2] || null;
}


