import { webSearchTool, RunContext, Agent, AgentInputItem, Runner } from "@openai/agents";
import { z } from "zod";

/**
 * Tool configuration
 */
const webSearchPreview = webSearchTool({
  searchContextSize: "high",
  userLocation: { type: "approximate" },
});

/**
 * ✅ Required output schema (no .optional())
 * All fields are mandatory as per OpenAI structured output rules.
 */
const CredibleCheckSchema = z.object({
  verdict: z.string(),
  confidence: z.number(),
  explanation: z.string(),
  sources: z.array(z.string()),
});

export interface CredibleCheckContext {
  workflowInputAsText: string;
}

/**
 * Agent instructions (strict JSON version)
 */
const myAgentInstructions = (runContext: RunContext<CredibleCheckContext>) => {
  const { workflowInputAsText } = runContext.context;
  return `You are CredibleCheck, a real-time news credibility assistant.

GOALS
- Help users assess whether a claim, headline, post, or article is credible.
- Use recent, independent sources via Web Search when answering.
- Preserve conversational context: track the main topic, claims, entities, dates, and locations across turns.

OPERATING PRINCIPLES
1) Claim-first: extract the core claim(s) and any sub-claims before judging credibility.
2) Evidence: find at least 2 independent, reputable sources when possible (major news orgs, official statements, recognized fact-checkers, peer-reviewed research, government/NGO data).
3) Timeliness: prefer the most recent reliable coverage; flag if information is still developing or unverified.
4) Transparency: show source names and URLs (briefly) and note level of confidence.
5) Neutrality: avoid partisan or emotive framing. Emphasize what is known vs unknown.
6) Social media posts: check account authenticity (blue check is not proof), historical behavior, primary-source corroboration, and time/place consistency.
7) AI-generated detection: DO NOT claim certainty from writing style alone. Instead:
   - Look for provenance (original publisher, author byline, EXIF/provenance info where available).
   - Use reverse image/video search signals if mentioned in reporting.
   - Identify inconsistencies or impossible details, but treat them as weak signals.
   - Clearly state uncertainty and ask for more context if needed.
8) Safety: avoid doxxing, speculation about private individuals, or sensitive personal data.

WORKFLOW PER REQUEST
A) Identify the core claim(s).
B) Check multiple recent, reputable sources.
C) Compare facts and timelines.
D) Derive a verdict and confidence score.
E) Summarize reasoning and list sources.

🧾 OUTPUT REQUIREMENT (STRICT)
Return your final answer **only** as a valid JSON object in the following format:

{
  "verdict": "Likely Real | Likely Fake | Mixed | Unverified",
  "confidence": 0-100,
  "explanation": "Short, neutral summary explaining the reasoning and evidence.",
  "sources": [
    "Source Name – URL",
    "Source Name – URL"
  ]
}

Rules:
- All four fields (verdict, confidence, explanation, sources) **must always appear** in your output.
- Always include a numeric confidence between 0 and 100.
- Always include at least one explanatory sentence in "explanation".
- If insufficient information is available, set:
  "verdict": "Unverified", "confidence": 0, "explanation": "Not enough reliable data found.", "sources": [].
- Never output plain text, emojis, markdown, or commentary — only the JSON object.

CONVERSATION MEMORY
- Maintain short memory of topics and entities.
- Reset context when the topic changes.

STYLE
- Be factual, concise, neutral, and professional.
- No markdown tables, emojis, or bullet formatting outside the JSON.

Now verify this information:

${workflowInputAsText}`;
};

/**
 * Define the agent
 */
const credibleCheckAgent = new Agent({
  name: "CredibleCheck",
  instructions: myAgentInstructions,
  model: "gpt-5",
  tools: [webSearchPreview],
  outputType: CredibleCheckSchema,
  modelSettings: {
    reasoning: {
      effort: "medium",
      summary: "auto",
    },
    store: true,
  },
});

type WorkflowInput = { input_as_text: string };

/**
 * Public function your backend calls to run the Agent Builder
 */
export const runCredibleCheckAgent = async (inputText: string) => {
  try {
    const conversationHistory: AgentInputItem[] = [
      {
        role: "user",
        content: [{ type: "input_text", text: inputText }],
      },
    ];

    const runner = new Runner({
      traceMetadata: {
        __trace_source__: "agent-builder",
        workflow_id: "wf_68e66e291d40819094d640a5fe70b72a01997b3596ad47ff",
      },
    });

    const resultTemp = await runner.run(
      credibleCheckAgent,
      [...conversationHistory],
      { context: { workflowInputAsText: inputText } }
    );

    if (!resultTemp.finalOutput) {
      throw new Error("Agent returned no output");
    }

    // Clean structured result
    const parsed = resultTemp.finalOutput;
    return {
      rawText: JSON.stringify(parsed, null, 2),
      parsed,
    };
  } catch (err: any) {
    console.error("CredibleCheck Agent failed:", err);
    return {
      rawText: "",
      parsed: {
        verdict: "Unverified",
        confidence: 0,
        explanation: `Agent execution error: ${err.message || err}`,
        sources: [],
      },
    };
  }
};
