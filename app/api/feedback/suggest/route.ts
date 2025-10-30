import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { transcript } = await req.json();
    const text = typeof transcript === 'string' ? transcript.slice(0, 6000) : '';

    // Simple heuristic button suggestions without LLM
    const lower = text.toLowerCase();
    const reasons: string[] = [];
    if (lower.includes('not true') || lower.includes('incorrect') || lower.includes('fake')) reasons.push('Not factual');
    if (lower.includes('confusing') || lower.includes('unclear')) reasons.push('Unclear');
    if (lower.includes('too long') || lower.length > 1200) reasons.push('Too verbose');
    if (lower.includes('off topic') || lower.includes('irrelevant')) reasons.push('Irrelevant');
    if (lower.includes('missing') || lower.includes('steps')) reasons.push('Missing steps');
    if (reasons.length < 4) {
      ['Not factual', 'Unclear', 'Too verbose', 'Irrelevant', 'Missing steps', 'Hallucinated'].forEach((r) => {
        if (reasons.length < 6 && !reasons.includes(r)) reasons.push(r);
      });
    }
    return NextResponse.json({ reasons });
  } catch (e) {
    return NextResponse.json({ reasons: ['Not clear enough', 'Missing context', 'Not factual', 'Too verbose'] });
  }
}


