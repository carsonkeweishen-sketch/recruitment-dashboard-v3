// Phase 8.6A: DeepSeek Provider Adapter
// Server-side only. No API Key exposure to client.
// Uses OpenAI-compatible chat completions API.

export interface ProviderConfig {
  apiKey: string;
  baseURL: string;
  model: string;
  timeout: number;
}

export interface ProviderResponse {
  answer: string;
  suggestedAction: string;
  evidence: string[];
  confidence: number;
  provider: string;
  model: string;
  promptVersion: string;
  latencyMs: number;
  tokenUsageInput: number;
  tokenUsageOutput: number;
}

export interface ProviderStatus {
  status: "configured" | "not_configured" | "error";
  provider: string;
  model: string;
  errorMessage?: string;
}

function getConfig(): ProviderConfig {
  const apiKey = process.env.DEEPSEEK_API_KEY || "";
  const baseURL = process.env.AI_PROVIDER_BASE_URL || "https://api.deepseek.com";
  const model = process.env.AI_PROVIDER_MODEL || "deepseek-v4-flash";
  return { apiKey, baseURL, model, timeout: 30000 };
}

export function getProviderStatus(): ProviderStatus {
  const config = getConfig();
  if (!config.apiKey) {
    return { status: "not_configured", provider: "deepseek", model: config.model, errorMessage: "DEEPSEEK_API_KEY not set" };
  }
  return { status: "configured", provider: "deepseek", model: config.model };
}

export async function generateCompletion(
  systemPrompt: string,
  userPrompt: string,
  promptVersion: string
): Promise<ProviderResponse> {
  const config = getConfig();
  if (!config.apiKey) {
    throw new Error("DeepSeek API Key not configured");
  }

  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.timeout);

  try {
    const response = await fetch(`${config.baseURL}/v1/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${config.apiKey}`,
      },
      body: JSON.stringify({
        model: config.model,
        messages: [
          { role: "system", content: systemPrompt + "\n\nYou must respond with valid JSON." },
          { role: "user", content: userPrompt },
        ],
        temperature: 0.3,
        max_tokens: 2000,
        response_format: { type: "json_object" },
      }),
      signal: controller.signal,
    });

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (!response.ok) {
      const errorText = await response.text().catch(() => "Unknown error");
      console.error("DeepSeek API error:", response.status, errorText.substring(0, 500));
      throw new Error(`DeepSeek API error: ${response.status} - ${errorText.substring(0, 200)}`);
    }

    const result = await response.json();
    const content = result.choices?.[0]?.message?.content || "";
    const tokenUsageInput = result.usage?.prompt_tokens || 0;
    const tokenUsageOutput = result.usage?.completion_tokens || 0;

    // Parse JSON response
    let parsed: Record<string, unknown> = {};
    try {
      parsed = JSON.parse(content);
    } catch {
      // If not valid JSON, wrap as answer
      parsed = { answer: content, suggestedAction: "", evidence: [] };
    }

    return {
      answer: String(parsed.answer || parsed.analysis || parsed.summary || content.substring(0, 500)),
      suggestedAction: String(parsed.suggestedAction || parsed.suggested_action || parsed.nextStep || ""),
      evidence: Array.isArray(parsed.evidence) ? parsed.evidence.map(String) : Array.isArray(parsed.risks) ? parsed.risks.map(String) : (parsed.evidence ? [String(parsed.evidence)] : []),
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0.8,
      provider: "deepseek",
      model: config.model,
      promptVersion,
      latencyMs,
      tokenUsageInput,
      tokenUsageOutput,
    };
  } catch (e) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    if ((e as Error).name === "AbortError") {
      throw new Error(`DeepSeek API timeout after ${config.timeout}ms`);
    }
    throw e;
  }
}
