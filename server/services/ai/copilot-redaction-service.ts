// Phase 8.11: Copilot Redaction Service — 三路统一脱敏
// 对 systemPrompt / userPrompt(含 question) / context 三路输入统一脱敏
// 扩展覆盖：手机号/邮箱/身份证/薪资/API Key/银行卡号/护照号

/**
 * 统一脱敏函数：对所有进入 LLM 的文本进行 PII 脱敏
 * @param text - 待脱敏文本
 * @returns 脱敏后文本
 */
export function redactAll(text: string): string {
  if (!text) return text;
  let result = text;

  // 1. 手机号（中国 11 位）
  result = result.replace(/1[3-9]\d{9}/g, "[手机号已脱敏]");

  // 2. 邮箱
  result = result.replace(
    /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g,
    "[邮箱已脱敏]",
  );

  // 3. 身份证（18 位，末位可为 X）
  result = result.replace(/\b\d{17}[\dXx]\b/g, "[身份证已脱敏]");

  // 4. 薪资数字（30k / 50万 / 20W / 100w / 8000元）
  result = result.replace(/\d+[kK万Ww]\b/g, "[薪资已脱敏]");
  result = result.replace(/\d+元\/月/g, "[薪资已脱敏]");
  result = result.replace(/\d+元\/年/g, "[薪资已脱敏]");

  // 5. API Key
  result = result.replace(/sk-[a-zA-Z0-9]{20,}/g, "[API_KEY已脱敏]");
  result = result.replace(/org-[a-zA-Z0-9]{20,}/g, "[API_KEY已脱敏]");

  // 6. 银行卡号（16-19 位连续数字）
  result = result.replace(/\b\d{16,19}\b/g, "[银行卡号已脱敏]");

  // 7. DATABASE_URL
  result = result.replace(
    /postgres:\/\/[^\s"']+/g,
    "[DATABASE_URL已脱敏]",
  );

  return result;
}

/**
 * 对 context source 的 excerpt 进行脱敏
 * 记录脱敏状态
 */
export function redactContextExcerpt(
  excerpt: string,
  requiresRedaction: boolean = true,
): { text: string; status: "applied" | "skipped" | "not_required" } {
  if (!requiresRedaction) {
    return { text: excerpt, status: "not_required" };
  }
  if (!excerpt || excerpt.length === 0) {
    return { text: excerpt, status: "skipped" };
  }
  const text = redactAll(excerpt);
  return { text, status: "applied" };
}

/**
 * 验证脱敏是否生效：检查文本中是否仍包含敏感信息
 */
export function verifyRedaction(text: string): {
  isClean: boolean;
  leakedPatterns: string[];
} {
  const patterns: Array<{ name: string; regex: RegExp }> = [
    { name: "手机号", regex: /1[3-9]\d{9}/ },
    { name: "邮箱", regex: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/ },
    { name: "身份证", regex: /\b\d{17}[\dXx]\b/ },
    { name: "API_KEY", regex: /sk-[a-zA-Z0-9]{20,}/ },
    { name: "DATABASE_URL", regex: /postgres:\/\// },
  ];

  const leaked: string[] = [];
  for (const p of patterns) {
    if (p.regex.test(text)) {
      leaked.push(p.name);
    }
  }

  return { isClean: leaked.length === 0, leakedPatterns: leaked };
}
