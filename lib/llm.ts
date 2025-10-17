import { runCredibleCheckAgent } from "@/lib/agents/credibleCheckAgent";

type Tier = "free" | "pro" | "enterprise";

let preferenceFromFeedback = "";
try {
  const mod = require("@/app/api/feedback/route");
  preferenceFromFeedback = (mod?.globalPreferenceHint as string) || "";
} catch {}

/**
 * Main unified LLM caller
 * Routes requests to OpenAI, Anthropic (Claude), or the Agent Builder based on user plan + model
 */
export async function callLLM({
  system,
  user,
  schema,
  tier,
  model,
}: {
  system: string;
  user: string;
  schema: any;
  tier?: Tier;
  model?: string;
}) {
  const preference = (preferenceFromFeedback || "").trim();
  const systemWithPreference = preference ? `${preference}\n\n${system}` : system;
  const selected: Tier = tier || "free";

  let selectedModel = model || "gpt-4o";
  let maxTokens = selected === "free" ? 2000 : 4000;

  // ✅ Model selection logic unified with frontend
  if (selected === "pro" || selected === "enterprise") {
    selectedModel = model || "fakeverifier-agent";
  } else {
    selectedModel = model || "gpt-4o";
  }

  // ✅ Route to Agent Builder
  if (selectedModel === "fakeverifier-agent") {
    const res = await runCredibleCheckAgent(user);
    return {
      ...res.parsed,
      rawText: res.rawText,
      modelUsed: { vendor: "openai", name: "gpt-5-agent-builder" },
      cost: {},
    };
  }

  // ✅ Route to Claude (Anthropic)
  if (selectedModel === "claude-3-5-sonnet-latest") {
    return await callAnthropicClaude({
      system: systemWithPreference,
      user,
      schema,
      model: "claude-3-5-sonnet-latest",
      maxTokens,
    });
  }

  // ✅ Default: OpenAI API (GPT models)
  return await callOpenAI({
    system: systemWithPreference,
    user,
    schema,
    model: selectedModel,
    maxTokens,
  });
}

/**
 * Call OpenAI API (ChatGPT models)
 */
async function callOpenAI({
  system,
  user,
  schema,
  model,
  maxTokens,
}: {
  system: string;
  user: string;
  schema: any;
  model: string;
  maxTokens: number;
}) {
    const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const r = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
        body: JSON.stringify({
        model,
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
        response_format: {
          type: "json_schema",
          json_schema: { name: "schema", schema },
        },
        max_tokens: maxTokens,
        }),
        signal: controller.signal,
      });
      
      clearTimeout(timeout);
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || `OpenAI API error (${r.status})`);

    const content = data?.choices?.[0]?.message?.content;
    if (!content) throw new Error("Empty response from OpenAI");
    const parsed = JSON.parse(content);

    return { ...parsed, modelUsed: { vendor: "openai", name: model }, cost: {} };
    } catch (e: any) {
    console.error("OpenAI API failed:", e);
    return {
      verdict: "Unverified",
      confidence: 0,
      explanation: `OpenAI error: ${e.message}`,
      sourcesChecked: [],
      modelUsed: { vendor: "openai", name: model },
      cost: {},
    };
  }
}

/**
 * Call Anthropic Claude (Claude 3.5 Sonnet)
 */
async function callAnthropicClaude({
  system,
  user,
  schema,
  model,
  maxTokens,
}: {
  system: string;
  user: string;
  schema: any;
  model: string;
  maxTokens: number;
}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "x-api-key": process.env.ANTHROPIC_API_KEY || "",
        "Content-Type": "application/json",
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model,
        max_tokens: maxTokens,
        system,
        messages: [{ role: "user", content: user }],
      }),
      signal: controller.signal,
    });
    
    clearTimeout(timeout);
    const data = await r.json();
    if (!r.ok) throw new Error(data?.error?.message || `Claude API error (${r.status})`);

    const text = data?.content?.[0]?.text || "";
    const parsed = JSON.parse(text || "{}");

    return { ...parsed, modelUsed: { vendor: "anthropic", name: model }, cost: {} };
  } catch (e: any) {
    console.error("Claude API failed:", e);
    return {
      verdict: "Unverified",
      confidence: 0,
      explanation: `Claude error: ${e.message}`,
      sourcesChecked: [],
      modelUsed: { vendor: "anthropic", name: model },
      cost: {},
    };
  }
}
