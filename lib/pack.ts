import { callLLM } from '@/lib/llm';

export async function pack({ cross, decision }: { cross: any; decision: any }) {
  const sys = 'Produce a clean evidence list with {url, title, publisher, publishedTime, support, quote, score}. Remove duplicates; sort by score desc.';
  const user = JSON.stringify({ cross, decision });
  const res = await callLLM({
    system: sys,
    user,
    schema: {
      type: 'object',
      properties: {
        evidence: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              url: { type: 'string' },
              title: { type: 'string' },
              publisher: { type: 'string' },
              publishedTime: { type: 'string' },
              support: { enum: ['supports', 'refutes', 'neutral'] },
              quote: { type: 'string' },
              score: { type: 'number' },
            },
            required: ['url', 'support', 'quote', 'score'],
          },
        },
      },
      required: ['evidence'],
    },
  });
  return (res as any).evidence || [];
}


