// Phase 8.10: Redaction Service — Sensitive content redaction for AI safety

/**
 * Redact sensitive content from transcript text.
 * Handles: phone numbers, emails, ID numbers, salary figures, API keys.
 */
export function redactSensitiveContent(text: string): { redacted: string; hasRedactions: boolean } {
  let result = text;
  let hasRedactions = false;

  // Chinese phone numbers: 1[3-9] followed by 9 digits
  const phoneRegex = /1[3-9]\d{9}/g;
  if (phoneRegex.test(result)) {
    result = result.replace(phoneRegex, "[电话号码已脱敏]");
    hasRedactions = true;
  }

  // Email addresses
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;
  if (emailRegex.test(result)) {
    result = result.replace(emailRegex, "[邮箱已脱敏]");
    hasRedactions = true;
  }

  // Chinese ID numbers: 17 digits + digit/X/x
  const idRegex = /\d{17}[\dXx]/g;
  if (idRegex.test(result)) {
    result = result.replace(idRegex, "[身份证号已脱敏]");
    hasRedactions = true;
  }

  // Salary/compensation numbers: explicit patterns like "年薪XX万" or "月薪XXk"
  const salaryRegex = /(?:年薪|月薪|工资|薪资|年包)\s*\d{1,3}(?:,\d{3})*(?:万|k|K|千|元)/g;
  if (salaryRegex.test(result)) {
    result = result.replace(salaryRegex, "[薪酬信息已脱敏]");
    hasRedactions = true;
  }

  // API keys: sk-... patterns
  const apiKeyRegex = /sk-[a-zA-Z0-9]{20,}/g;
  if (apiKeyRegex.test(result)) {
    result = result.replace(apiKeyRegex, "[API密钥已脱敏]");
    hasRedactions = true;
  }

  return { redacted: result, hasRedactions };
}

/**
 * Check if a transcript is safe for AI context consumption.
 * Must be reviewed/approved AND redacted.
 */
export function isSafeForAiContext(transcript: {
  reviewStatus: string;
  redactionStatus: string;
}): boolean {
  return transcript.reviewStatus === "approved" && transcript.redactionStatus === "redacted";
}
