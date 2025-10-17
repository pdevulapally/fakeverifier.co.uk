import { callLLM } from '@/lib/llm';
import { runCredibleCheckAgent } from '@/lib/agents/credibleCheckAgent';

export async function judge({ cross, imageBase64Array, originalInput, model, tier }: { cross: any; imageBase64Array?: string[]; originalInput: string; model?: string; tier?: string }) {
  // Use the exact prompt format requested
  const systemPrompt = `You are an AI assistant specialized in news verification. For each analysis, you must provide:
          1. A clear verdict (Likely Real/Likely Fake)
          2. A confidence percentage (always include a number between 0-100)
          3. Detailed explanation
          4. Sources checked`;

  // We pass the primary textual claim as the user message, per request
  let userPrompt = `Verify this news: ${originalInput}`;

  // Optionally hint that cross-checked sources exist without changing the required message shape
  // (The model should still ground on sources in retrieval/cross phases.)
  if (Array.isArray(cross?.results) && cross.results.length > 0) {
    // Light touch: append a note with count of sources analyzed to reduce hallucinations
    const totalFindings = cross.results.reduce((n: number, r: any) => n + (Array.isArray(r.findings) ? r.findings.length : 0), 0);
    userPrompt += `\n\n(Background: prior retrieval analyzed ~${totalFindings} source findings.)`;
  }

  // If images supplied, append a short note; we still keep the exact user line intact first
  if (imageBase64Array && imageBase64Array.length > 0) {
    userPrompt += `\n\n[IMAGE ANALYSIS REQUESTED] ${imageBase64Array.length} image${imageBase64Array.length > 1 ? 's' : ''} provided.`;
  }

  // Route Pro and Enterprise to ChatGPT Agent Builder (CredibleCheck)
  const selectedTier = (tier || 'free') as 'free' | 'pro' | 'enterprise';
  if (selectedTier === 'pro' || selectedTier === 'enterprise') {
    try {
      const { parsed, rawText } = await runCredibleCheckAgent(userPrompt);
      return {
        verdict: parsed.verdict || 'Unverified',
        confidence: typeof parsed.confidence === 'number' ? parsed.confidence : 0,
        explanation: parsed.explanation || rawText || 'See sources and explanation above.',
        sourcesChecked: Array.isArray(parsed.sourcesChecked) ? parsed.sourcesChecked : [],
        modelUsed: { vendor: 'openai-agent-builder', name: 'fakeverifier-agent' },
        cost: {},
      } as any;
    } catch (e: any) {
      // Fallback to existing LLM path if agent fails
      // Enterprise fallback to Claude-3.5 Sonnet
      if (selectedTier === 'enterprise') {
        return await callLLM({
          system: systemPrompt,
          user: userPrompt,
          schema: {
            type: 'object',
            properties: {
              verdict: { enum: ['Likely Real', 'Likely Fake'] },
              confidence: { type: 'number', minimum: 0, maximum: 100 },
              explanation: { type: 'string' },
              sourcesChecked: { type: 'array', items: { type: 'string' } },
              modelUsed: { type: 'object' },
              cost: { type: 'object' },
            },
            required: ['verdict', 'confidence', 'explanation'],
          },
          tier: 'enterprise' as any,
          model: 'claude-3-5-sonnet-latest',
        });
      }
    }
  }

  return await callLLM({
    system: systemPrompt,
    user: userPrompt,
    schema: {
      type: 'object',
      properties: {
        verdict: { enum: ['Likely Real', 'Likely Fake'] },
        confidence: { type: 'number', minimum: 0, maximum: 100 },
        explanation: { type: 'string' },
        sourcesChecked: { type: 'array', items: { type: 'string' } },
        modelUsed: { type: 'object' },
        cost: { type: 'object' },
      },
      required: ['verdict', 'confidence', 'explanation'],
    },
    tier: tier as any,
    model: model,
  });
}


