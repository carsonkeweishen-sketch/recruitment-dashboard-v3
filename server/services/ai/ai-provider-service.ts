// Phase 8.6: AI Provider Service
// Checks OPENAI_API_KEY, returns status. No fake/mock responses.

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

export interface ProviderStatus {
  status: "configured" | "not_configured";
  provider?: string;
  model?: string;
  message?: string;
}

export function getProviderStatus(): ProviderStatus {
  if (OPENAI_API_KEY) {
    return { status: "configured", provider: "openai", model: "gpt-4o-mini" };
  }
  return { status: "not_configured", message: "AI Provider 未配置，暂不能生成 AI 辅助建议。系统规则提醒仍可使用。" };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function generateCompletion(systemPrompt: string, userPrompt: string): Promise<any> {
  if (!OPENAI_API_KEY) {
    throw new Error("AI Provider not configured");
  }
  // Real OpenAI API call — no fake responses
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      temperature: 0.3,
      max_tokens: 1000,
    }),
  });
  if (!response.ok) {
    const err = await response.text();
    throw new Error(`OpenAI API error: ${response.status} ${err}`);
  }
  const data = await response.json();
  return data.choices?.[0]?.message?.content || "";
}
