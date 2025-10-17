import { NextRequest, NextResponse } from 'next/server';
import { callLLM } from '@/lib/llm';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    const text = typeof transcript === 'string' ? transcript.slice(0, 6000) : '';

    const sys = 'You generate concise, context-aware feedback reason buttons for an AI chat product.';
    const user = `Chat transcript (most recent last):\n${text}\n\nReturn 4-6 short button labels (2-4 words) describing why the last assistant reply was unhelpful, focusing on tone, clarity, factuality, relevance, hallucination, missing steps, or formatting. Avoid code-specific labels unless the chat discusses code.`;

    const res: any = await callLLM({
      system: sys,
      user,
      schema: {
        type: 'object',
        properties: {
          reasons: {
            type: 'array',
            minItems: 4,
            maxItems: 6,
            items: { type: 'string' },
          },
        },
        required: ['reasons'],
      },
      tier: 'free',
    });

    const reasons: string[] = Array.isArray(res?.reasons) ? res.reasons.filter((r: any) => typeof r === 'string' && r.trim()).slice(0, 6) : [];
    return NextResponse.json({ reasons });
  } catch (e) {
    return NextResponse.json({ reasons: ['Not clear enough', 'Missing context', 'Not factual', 'Too verbose'] });
  }
}


