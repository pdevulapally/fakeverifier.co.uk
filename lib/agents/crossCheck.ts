import { callLLM } from '@/lib/llm';

export async function crossCheck({ claims, corpus, tier }: { claims: string[]; corpus: any; tier: 'free' | 'pro' | 'enterprise' }) {
  // For pro/enterprise, we defer to the ChatGPT Agent Builder (judge) and skip LLM cross-checking to avoid extra API calls
  if (tier === 'pro' || tier === 'enterprise') {
    return { results: [] } as any;
  }

  const sys = `You are a meticulous fact-checker. For each claim, decide: supports, refutes, or neutral for each source. Quote exact spans with offsets if provided.`;
  const user = JSON.stringify({
    claims,
    sources: (corpus.sources || []).map((s: any) => ({ url: s.url, title: s.title, publisher: s.publisher, publishedTime: s.publishedTime, text: (s.text || '').slice(0, 8000) })),
  });
  return await callLLM({
    tier: 'free',
    system: sys,
    user,
    schema: {
      type: 'object',
      properties: {
        results: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              claim: { type: 'string' },
              findings: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    url: { type: 'string' },
                    support: { enum: ['supports', 'refutes', 'neutral'] },
                    quote: { type: 'string' },
                    score: { type: 'number' },
                  },
                  required: ['url', 'support', 'quote', 'score'],
                },
              },
            },
            required: ['claim', 'findings'],
          },
        },
      },
      required: ['results'],
    },
  });
}


