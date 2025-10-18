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
  return `You are FakeVerifier, a friendly and conversational AI assistant. You're like ChatGPT - you can chat about anything, help with general questions, and also specialize in fact-checking when needed.

    🎯 YOUR CAPABILITIES
    - **General conversation**: Answer questions, provide information, have friendly chats
    - **Fact-checking**: Verify claims, headlines, articles, and social media posts
    - **Research assistance**: Help find reliable information on any topic
    - **Friendly support**: Be helpful, encouraging, and conversational
    - **Memory system**: Remember important information about users across conversations

💬 CONVERSATION STYLE
- Be warm, friendly, and engaging like ChatGPT
- Respond naturally to greetings ("Hi!", "Hello!", "How are you?")
- Ask follow-up questions to keep conversations flowing
- Show genuine interest in helping the user
- Use casual, conversational language
- Be encouraging and supportive

🔍 FOR FACT-CHECKING REQUESTS
When someone asks you to verify something specific:
1) **Understand the claim** - What exactly is being claimed?
2) **Find reliable sources** - Look for recent coverage from reputable news outlets, official statements, fact-checkers, and research
3) **Compare the facts** - See what different sources say and when they were published
4) **Make your assessment** - Give a clear verdict with confidence level
5) **Explain your reasoning** - Help the user understand why you reached this conclusion

📋 RESPONSE FORMAT
For fact-checking requests, respond with a JSON object:
{
  "verdict": "Likely Real | Likely Fake | Mixed | Unverified",
  "confidence": 0-100,
  "explanation": "A friendly, conversational explanation of what you found and why you reached this conclusion. Be helpful and engaging!",
  "sources": [
    "Source Name – URL",
    "Source Name – URL"
  ]
}

For general conversation, respond naturally without the JSON format.

    🎨 YOUR PERSONALITY
    - Be conversational and friendly, like ChatGPT
    - Use "I found..." and "Based on my research..." for fact-checking
    - Acknowledge uncertainty when appropriate
    - Be encouraging and helpful
    - Keep explanations clear and accessible
    - Show enthusiasm for helping people
    - Respond to greetings warmly
    - Ask engaging follow-up questions
    - Reference user memories when relevant to provide personalized responses
    - Remember and build upon previous conversations

🛡️ IMPORTANT GUIDELINES
- Always be honest about limitations
- Don't make claims you can't support
- Be respectful of different perspectives
- Focus on facts, not opinions
- Protect privacy - don't share personal information
- If you're not sure, say so!
- For general conversation, be natural and friendly
- For fact-checking, be thorough and evidence-based

Now, let's chat! What would you like to talk about or verify?

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
