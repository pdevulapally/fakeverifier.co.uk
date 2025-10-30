import { NextRequest } from 'next/server';
import { verifyClaim, parseFakeVerifierOutput } from '@/lib/fakeVerifierClient';

type TimelineEvent = {
  id: string;
  stage: 'search' | 'reading' | 'analyzing' | 'verdict';
  message: string;
  timestamp: number;
};

function sseFormat(obj: any) {
  return `data: ${JSON.stringify(obj)}\n\n`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = (searchParams.get('q') || '').toString();
  const uid = (searchParams.get('uid') || '').toString();
  if (!q.trim()) {
    return new Response('Missing q', { status: 400 });
  }

  const stream = new ReadableStream({
    start(controller) {
      const encoder = new TextEncoder();
      const send = (e: TimelineEvent) => controller.enqueue(encoder.encode(sseFormat(e)));

      // Emit staged timeline while backend runs
      const now = () => Date.now();
      send({ id: 'search', stage: 'search', message: 'Searching…', timestamp: now() });

      const t1 = setTimeout(() => {
        send({ id: 'reading', stage: 'reading', message: 'Reading sources…', timestamp: now() });
      }, 500);
      const t2 = setTimeout(() => {
        send({ id: 'analyzing', stage: 'analyzing', message: 'Analyzing credibility…', timestamp: now() });
      }, 1200);

      (async () => {
        try {
          const output = await verifyClaim(q);
          const parsed = parseFakeVerifierOutput(output);
          const verdictMsg = parsed?.verdict ? `Verdict: ${parsed.verdict}` : 'Verdict ready!';
          send({ id: 'verdict', stage: 'verdict', message: verdictMsg, timestamp: now() });
        } catch (e: any) {
          send({ id: 'verdict', stage: 'verdict', message: `Error: ${e?.message || 'failed'}`, timestamp: Date.now() });
        } finally {
          clearTimeout(t1);
          clearTimeout(t2);
          controller.close();
        }
      })();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-store',
      Connection: 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}


