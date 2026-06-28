// Phase 8.10: Speech Redaction Service — Sensitive content detection and AI context safety
const REDACTED_PLACEHOLDER = "[已脱敏]";

// Phone: Chinese mobile 1[3-9]xxxxxxxxx
const PHONE_REGEX = /1[3-9]\d{9}/g;

// Email
const EMAIL_REGEX = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g;

// ID: 18-digit Chinese ID (last digit can be X/x)
const ID_REGEX = /\d{17}[\dXx]/g;

// Salary numbers: patterns like "20K", "20万", "年薪20", "月薪15K", "package 50万"
const SALARY_REGEX = /((?:年薪|月薪|package|总包|工资|薪资|收入)\s*[：:]*\s*)(\d+[\d,.]*\s*[万Kk]?)/gi;

// API keys / tokens: common patterns
const API_KEY_REGEX = /(?:api[_-]?key|apikey|secret|token|access[_-]?key)\s*[=:]\s*['"]?[a-zA-Z0-9_-]{20,}['"]?/gi;

// Generic sensitive key patterns (sk-..., ak-..., etc.)
const SENSITIVE_KEY_REGEX = /\b(sk-[a-zA-Z0-9]{20,})\b/g;

export function redactSensitiveContent(text: string): { redacted: string; hasRedactions: boolean } {
  let redacted = text;
  let hasRedactions = false;

  // Phone numbers
  if (PHONE_REGEX.test(redacted)) {
    redacted = redacted.replace(PHONE_REGEX, REDACTED_PLACEHOLDER);
    hasRedactions = true;
  }

  // Email addresses
  if (EMAIL_REGEX.test(redacted)) {
    redacted = redacted.replace(EMAIL_REGEX, REDACTED_PLACEHOLDER);
    hasRedactions = true;
  }

  // ID numbers
  if (ID_REGEX.test(redacted)) {
    redacted = redacted.replace(ID_REGEX, REDACTED_PLACEHOLDER);
    hasRedactions = true;
  }

  // Salary numbers — keep context word, redact the number
  if (SALARY_REGEX.test(redacted)) {
    redacted = redacted.replace(SALARY_REGEX, (_match, prefix, _number) => {
      hasRedactions = true;
      return `${prefix}${REDACTED_PLACEHOLDER}`;
    });
  }

  // API keys
  if (API_KEY_REGEX.test(redacted)) {
    redacted = redacted.replace(API_KEY_REGEX, REDACTED_PLACEHOLDER);
    hasRedactions = true;
  }

  // Sensitive keys (sk-...)
  if (SENSITIVE_KEY_REGEX.test(redacted)) {
    redacted = redacted.replace(SENSITIVE_KEY_REGEX, REDACTED_PLACEHOLDER);
    hasRedactions = true;
  }

  return { redacted, hasRedactions };
}

export function isSafeForAiContext(reviewStatus: string, redactionStatus: string): boolean {
  return reviewStatus === "accepted" && redactionStatus === "redacted";
}
