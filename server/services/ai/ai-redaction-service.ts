// Phase 8.6: AI Redaction Service
// Filters sensitive data before sending to LLM.

export function redact(text: string): string {
  if (!text) return text;
  let result = text;
  // Phone numbers (Chinese mobile)
  result = result.replace(/1[3-9]\d{9}/g, "[手机号已脱敏]");
  // Email
  result = result.replace(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g, "[邮箱已脱敏]");
  // ID card (18 digits)
  result = result.replace(/\b\d{17}[\dXx]\b/g, "[身份证已脱敏]");
  // Salary numbers (e.g., 30k, 50万, 20W, 100w)
  result = result.replace(/\d+[kK万Ww]\b/g, "[薪资已脱敏]");
  // API keys
  result = result.replace(/sk-[a-zA-Z0-9]{20,}/g, "[API_KEY已脱敏]");
  result = result.replace(/org-[a-zA-Z0-9]{20,}/g, "[API_KEY已脱敏]");
  return result;
}
