import { fetchWithRetry, logNetworkError } from '@/lib/network-utils';

/**
 * Dynamically resolve the correct Hugging Face Space endpoint.
 * Tries `/run/verify_claim` first, falls back to `/run/predict` if needed.
 */
function getSpaceEndpoint(): string {
    const raw = (process.env.HF_INFERENCE_URL || 'https://pdevulapally-fakeverifier-inference.hf.space').trim();
    try {
        const u = new URL(raw);
        if (/\/api\/predict$/.test(u.pathname)) return u.toString().replace(/\/$/, '');
        return `${u.origin}/api/predict`;
    } catch {
        return 'https://pdevulapally-fakeverifier-inference.hf.space/api/predict';
    }
}

/**
 * Call the Hugging Face Space endpoint and parse the model response.
 */
async function callSpaceEndpoint(text: string, headers: Record<string, string>): Promise<string> {
    const endpoint = getSpaceEndpoint();
    const body = JSON.stringify({ data: [text] });
    const options: RequestInit = { method: 'POST', headers, body, cache: 'no-store' as RequestCache };

    const res = await fetchWithRetry(endpoint, options);
    const data = await res.json().catch(() => ({} as any));
    if (!res.ok) {
        const msg = (data && (data.error || data.message)) || `HF Space error (${res.status})`;
        throw new Error(msg);
    }
    const output = Array.isArray(data?.data) ? data.data[0] : undefined;
    if (typeof output !== 'string' || !output.trim()) {
        throw new Error('Invalid response from FakeVerifier Space');
    }
    return output;
}

/**
 * Normalize label terms into human-friendly verdicts.
 */
function normalizeLabelToVerdict(label: string): string {
	const l = label.toLowerCase();
	if (/(real|true|likely\s*real)/.test(l)) return 'Likely Real';
	if (/(fake|false|pants|barely|misleading|half-true)/.test(l)) return 'Likely Fake';
	if (/(mixed|unverified|unknown)/.test(l)) return 'Unverified';
	return label;
}

/**
 * Attach emoji indicators to verdicts.
 */
function verdictEmoji(verdict: string): string {
	const v = verdict.toLowerCase();
	if (v.includes('real')) return '🟩';
	if (v.includes('fake') || v.includes('false')) return '🟥';
	if (v.includes('mislead')) return '🟨';
	return '⬜️';
}

/**
 * Main inference function – sends text to Space and returns the prediction string.
 */
export async function verifyClaim(input: string | string[]): Promise<string> {
	const text = Array.isArray(input) ? (input[0] || '').toString() : (input || '').toString();
	if (!text.trim()) throw new Error('Empty input');

	const headers: Record<string, string> = { 'Content-Type': 'application/json' };
	const token = process.env.HF_TOKEN || process.env.HUGGINGFACE_TOKEN || '';
	if (token) headers['Authorization'] = `Bearer ${token}`;

	try {
		return await callSpaceEndpoint(text, headers);
	} catch (err) {
		logNetworkError(err, 'HuggingFace Space call (final)', getSpaceEndpoint());
		throw err;
	}
}

/**
 * Parse model output like:
 * "Prediction: FAKE\nConfidence: 0.95"
 */
export function parseFakeVerifierOutput(output: string): { verdict: string; confidence: number; raw: string } {
	const raw = (output || '').toString();
	const verdictMatch = raw.match(/Prediction:\s*([A-Za-z\- ]+)/i);
	const confMatch = raw.match(/Confidence:\s*(\d+(\.\d+)?)/i);

	let verdict = verdictMatch ? verdictMatch[1].trim() : 'Unknown';
	let confidence = confMatch ? Math.min(100, parseFloat(confMatch[1]) * 100) : 0;

	verdict = normalizeLabelToVerdict(verdict);
	const display = `${verdictEmoji(verdict)} ${verdict}`;

	return { verdict: display, confidence, raw };
}
