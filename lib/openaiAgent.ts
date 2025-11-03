import {
  webSearchTool,
  RunContext,
  Agent,
  AgentInputItem,
  Runner,
  withTrace
} from "@openai/agents";

// === TOOL CONFIG (optimised for speed) ===
const webSearchPreview = webSearchTool({
  searchContextSize: "low", // ⚡ smallest payload for faster queries
  userLocation: { type: "approximate" }
});

interface MyAgentContext {
  workflowInputAsText: string;
}

// === MAIN VERIFIER AGENT ===
const myAgentInstructions = (runContext: RunContext<MyAgentContext>, _agent: Agent<MyAgentContext>) => {
  const { workflowInputAsText } = runContext.context;
  return `
You are **FakeVerifier**, an AI agent specialised in verifying online news claims.

You have access to a web search tool — **you MUST always call it** at least once before giving your final verdict.
Never skip searching, even if you think you know the answer.

If you haven’t called the web search tool within 10 seconds, do so immediately before any reasoning.

### Your task:
For each claim, produce an analysis with this structure (valid JSON only):
{
  "verdict": "Likely Real" | "Likely Fake" | "Unverified",
  "confidence": number (0–100),
  "explanation": "Short neutral reasoning (2–3 sentences)",
  "sources": [
     "Source Name – https://...",
     "Source Name – https://..."
  ]
}

### Rules:
- ALWAYS use the web search tool to check multiple credible sources.
- SEARCH FIRST: perform web search before reasoning.
- STOP EARLY: once two independent credible sources with valid URLs are found, stop searching and proceed to verdict.
- NO REDUNDANCY: do not run additional queries after two sources unless they conflict.
- PRIORITISE high-signal domains (e.g., .gov, .nhs, .who.int, major outlets) and skip low-quality sites.
- You must include at least two reliable sources with valid URLs.
- If no relevant results are found, respond with "Unverified", confidence 0, and explain that no valid web data was found.
- Be neutral and concise.
- Limit your reasoning to 3–5 sentences total before output. Do not overanalyze or exceed 200 tokens.

Now verify the following claim:
"${workflowInputAsText}"
`;
};

const myAgent = new Agent({
  name: "FakeVerifier Agent",
  instructions: myAgentInstructions,
  model: "gpt-4.1-mini",
  tools: [webSearchPreview],
  outputType: "text",
  modelSettings: {
    store: true
  }
});

// === CLASSIFIER FALLBACK (no search, fast) ===
const classifierAgentInstructions = (runContext: RunContext<MyAgentContext>, _agent: Agent<MyAgentContext>) => {
  const { workflowInputAsText } = runContext.context;
  return `
You are a lightweight classifier.

Return ONLY valid JSON:
{
  "verdict": "Likely Real" | "Likely Fake" | "Unverified",
  "confidence": number 0-100,
  "explanation": "Brief neutral reasoning",
  "sources": []
}

Do not use web search or cite sources — rely on general knowledge.
If uncertain, output Unverified with confidence 0.

Classify this claim:
"${workflowInputAsText}"
`;
};

const classifierAgent = new Agent({
  name: "Classifier Agent",
  instructions: classifierAgentInstructions,
  model: "gpt-4.1-mini",
  tools: [],
  outputType: "text",
  modelSettings: {
    store: false
  }
});

// === MAIN WORKFLOW ===
type WorkflowInput = {
  input_as_text: string;
  conversation_items?: AgentInputItem[];
  regenerate?: boolean;
};

export const runWorkflow = async (workflow: WorkflowInput) => {
  return await withTrace("FakeVerifier", async () => {
    const REQUEST_BUDGET_MS = 55000; // total allowed on edge
    const startTs = Date.now();
    const timeLeft = () => Math.max(0, REQUEST_BUDGET_MS - (Date.now() - startTs));
    const safeSlice = (ms: number, reserveMs: number) =>
      Math.max(0, Math.min(ms, Math.max(0, timeLeft() - reserveMs)));

    // Give main agent up to ~52s, keeping 2s for fallback
    const AGENT_TIMEOUT_MS = safeSlice(52000, 2000);

    // Heartbeat for debugging runtime behaviour
    const runWithTimeout = async <T>(promise: Promise<T>, timeoutMs: number): Promise<T> => {
      let elapsed = 0;
      const heartbeat = setInterval(() => {
        elapsed += 10;
        console.log(`⏱️ Agent still running... ${elapsed}s elapsed`);
      }, 10000);

      try {
        return await Promise.race<T>([
          promise,
          new Promise<T>((_, reject) =>
            setTimeout(() => reject(new Error("AGENT_TIMEOUT")), timeoutMs)
          )
        ]);
      } finally {
        clearInterval(heartbeat);
      }
    };

    const runner = new Runner({
      traceMetadata: { __trace_source__: "agent-builder" }
    });

    const conversationHistory: any[] = Array.isArray(workflow.conversation_items)
      ? [...workflow.conversation_items]
      : [
          {
            role: "user",
            content: [{ type: "input_text", text: workflow.input_as_text }]
          }
        ];

    const normalizeOutput = (out: any) => {
      try {
        if (out && Array.isArray(out.sources)) {
          out.sources = out.sources.map((s: any) => {
            if (!s) return s;
            if (typeof s === "string") return s;
            if (typeof s === "object") {
              const name = s.name || s.title || s.source || "Source";
              const url = s.url || s.link || s.href || "";
              return url ? `${name} – ${url}` : `${name}`;
            }
            return String(s);
          });
        }
      } catch {}
      return out;
    };

    let result;
    try {
      result = await runWithTimeout(
        runner.run(
          myAgent,
          conversationHistory,
          { context: { workflowInputAsText: workflow.input_as_text } }
        ),
        AGENT_TIMEOUT_MS
      );
    } catch (err) {
      console.warn("⚠️ Main agent failed, falling back:", err);
      const classifierResult = await runWithTimeout(
        runner.run(
          classifierAgent,
          conversationHistory,
          { context: { workflowInputAsText: workflow.input_as_text } }
        ),
        8000
      );
      const normalized = normalizeOutput(classifierResult.finalOutput);
      return {
        output_text: JSON.stringify(normalized),
        output_parsed: normalized,
        conversation_history: [
          ...conversationHistory,
          ...classifierResult.newItems.map((i: any) => i.rawItem)
        ]
      };
    }

    // === fallback safety ===
    if (!result?.finalOutput) {
      const classifierResult = await runWithTimeout(
        runner.run(
          classifierAgent,
          conversationHistory,
          { context: { workflowInputAsText: workflow.input_as_text } }
        ),
        8000
      );
      const normalized = normalizeOutput(classifierResult.finalOutput);
      return {
        output_text: JSON.stringify(normalized),
        output_parsed: normalized,
        conversation_history: [
          ...conversationHistory,
          ...classifierResult.newItems.map((i: any) => i.rawItem)
        ]
      };
    }

    // ✅ SUCCESS PATH
    const normalized = normalizeOutput(result.finalOutput);
    return {
      output_text: JSON.stringify(normalized),
      output_parsed: normalized,
      conversation_history: [
        ...conversationHistory,
        ...result.newItems.map((i: any) => i.rawItem)
      ]
    };
  });
};
