import { callLLM } from '@/lib/llm';

export async function ingest(input: { raw: string; type: string }) {
  if (input.type === 'url') {
    const html = await fetch(input.raw).then((r) => r.text()).catch(() => null);
    const text = html ? stripHtml(html).slice(0, 15000) : input.raw;
    const res = await callLLM({
      system: 'Extract the top 3 factual claims from the text as short sentences.',
      user: text,
      schema: { type: 'object', properties: { claims: { type: 'array', items: { type: 'string' }, maxItems: 3 } }, required: ['claims'] },
    });
    return (res as any).claims || [];
  }
  const res = await callLLM({
    system: 'Extract the top 3 factual claims.',
    user: input.raw,
    schema: { type: 'object', properties: { claims: { type: 'array', items: { type: 'string' }, maxItems: 3 } }, required: ['claims'] },
  });
  return (res as any).claims || [];
}

function stripHtml(html: string) {
  return html.replace(/<[^>]*>/g, ' ');
}


