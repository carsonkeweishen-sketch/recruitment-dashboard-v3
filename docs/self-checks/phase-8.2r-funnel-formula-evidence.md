# Phase 8.2R Recruitment Funnel — Formula Evidence

**项目**: Recruitment Dashboard v3  
**阶段**: Phase 8.2R  
**日期**: 2026-06-28  
**公式来源**: `server/services/analytics/funnel-metric-dictionary.ts`  
**验证方式**: 代码逻辑验证 + 样例数值代入  

---

## 1. safeRate — 安全比率计算

### 代码

```typescript
// funnel-metric-dictionary.ts:5-9
export function safeRate(numerator: number, denominator: number): number | null {
  if (!Number.isFinite(numerator) || !Number.isFinite(denominator)) return null;
  if (denominator <= 0) return null;
  return Number((numerator / denominator).toFixed(4));
}
```

### 边界条件验证

| 用例 | numerator | denominator | 预期结果 | 计算过程 | 判决 |
|------|-----------|-------------|----------|----------|------|
| 正常比率 | 96 | 128 | 0.75 | 96/128 = 0.75, toFixed(4) = "0.7500", Number = 0.75 | PASS |
| 精确比率 | 3 | 10 | 0.3 | 3/10 = 0.3, toFixed(4) = "0.3000", Number = 0.3 | PASS |
| 除不尽 | 1 | 3 | 0.3333 | 1/3 ≈ 0.33333..., toFixed(4) = "0.3333", Number = 0.3333 | PASS |
| 分母为 0 | 5 | 0 | null | `denominator <= 0` → return null | PASS |
| 分母为负 | 5 | -1 | null | `denominator <= 0` → return null | PASS |
| numerator NaN | NaN | 10 | null | `!Number.isFinite(NaN)` → return null | PASS |
| denominator Infinity | 5 | Infinity | null | `!Number.isFinite(Infinity)` → return null | PASS |
| 分子为 0 | 0 | 128 | 0 | 0/128 = 0, toFixed(4) = "0.0000", Number = 0 | PASS |
| 分子分母均为 0 | 0 | 0 | null | `denominator <= 0` → return null | PASS |

---

## 2. safeAvg — 安全平均值计算

### 代码

```typescript
// funnel-metric-dictionary.ts:16-19
export function safeAvg(total: number, count: number): number | null {
  if (!Number.isFinite(total) || !Number.isFinite(count) || count <= 0) return null;
  return Number((total / count).toFixed(1));
}
```

### 边界条件验证

| 用例 | total | count | 预期结果 | 计算过程 | 判决 |
|------|-------|-------|----------|----------|------|
| 正常平均 | 150 | 30 | 5.0 | 150/30 = 5, toFixed(1) = "5.0", Number = 5.0 | PASS |
| 非整数结果 | 100 | 30 | 3.3 | 100/30 ≈ 3.333, toFixed(1) = "3.3", Number = 3.3 | PASS |
| count 为 0 | 50 | 0 | null | `count <= 0` → return null | PASS |
| total NaN | NaN | 5 | null | `!Number.isFinite(NaN)` → return null | PASS |
| total Infinity | Infinity | 5 | null | `!Number.isFinite(Infinity)` → return null | PASS |
| total 为 0 | 0 | 10 | 0 | 0/10 = 0, toFixed(1) = "0.0", Number = 0 | PASS |

---

## 3. formatRateForUi — 比率 UI 格式化

### 代码

```typescript
// funnel-metric-dictionary.ts:11-14
export function formatRateForUi(rate: number | null): string {
  if (rate === null) return '---';
  return `${Math.round(rate * 100)}%`;
}
```

### 验证

| 用例 | rate | 预期结果 | 计算过程 | 判决 |
|------|------|----------|----------|------|
| null → --- | null | "---" | `rate === null` → "---" | PASS |
| 0.7353 → 74% | 0.7353 | "74%" | Math.round(0.7353 * 100) = Math.round(73.53) = 74 | PASS |
| 0.5 → 50% | 0.5 | "50%" | Math.round(50) = 50 | PASS |
| 0.0 → 0% | 0 | "0%" | Math.round(0) = 0 | PASS |
| 0.005 → 1% | 0.005 | "1%" | Math.round(0.5) = 1 (注意: 0.5 向上舍入) | PASS |
| 1.0 → 100% | 1.0 | "100%" | Math.round(100) = 100 | PASS |

---

## 4. 前端 fmtRate — 等效实现验证

### 代码

```typescript
// app/analytics/recruitment-funnel/page.tsx:102-105
function fmtRate(r: number | null): string {
  if (r === null || r === undefined) return "---";
  return `${Math.round(r * 100)}%`;
}
```

### 验证

| 用例 | 输入 | 预期 | 实际逻辑 | 判决 |
|------|------|------|----------|------|
| null | null | "---" | `r === null` → "---" | PASS |
| undefined | undefined | "---" | `r === undefined` → "---" | PASS |
| 正常值 | 0.75 | "75%" | Math.round(75) = 75 | PASS |
| 0 | 0 | "0%" | Math.round(0) = 0 | PASS |

---

## 5. 阶段计数计算 (computeStageCounts)

### 代码

```typescript
// recruitment-funnel-service.ts:53-72
function computeStageCounts(applications: any[]) {
  const counts: Record<string, number> = {};
  for (const stage of FUNNEL_STAGES) { counts[stage.key] = 0; }
  for (const app of applications) {
    const currentStage = funnelStageOf(app);
    const currentIdx = stageIndex(currentStage);
    for (const stageConfig of FUNNEL_STAGES) {
      const si = stageIndex(stageConfig.key);
      if (si <= currentIdx) { counts[stageConfig.key]++; }
    }
  }
  return counts;
}
```

### 样例验证

假设有 3 个 applications：
- App A: stage = "sourced" → funnelStage = "sourced", idx = 0
- App B: stage = "hr_screen" → funnelStage = "resume_reviewed", idx = 2
- App C: stage = "business_screen" → funnelStage = "screen_passed", idx = 3

| Stage | App A (idx 0) | App B (idx 2) | App C (idx 3) | Total Count | 逻辑 |
|-------|---------------|---------------|---------------|-------------|------|
| sourced (idx 0) | 0 ≤ 0 ✓ | 0 ≤ 2 ✓ | 0 ≤ 3 ✓ | **3** | 所有 app 都到达 |
| applied (idx 1) | 1 ≤ 0 ✗ | 1 ≤ 2 ✓ | 1 ≤ 3 ✓ | **2** | B, C 到达 |
| resume_reviewed (idx 2) | 2 ≤ 0 ✗ | 2 ≤ 2 ✓ | 2 ≤ 3 ✓ | **2** | B, C 到达 |
| screen_passed (idx 3) | 3 ≤ 0 ✗ | 3 ≤ 2 ✗ | 3 ≤ 3 ✓ | **1** | 仅 C 到达 |
| interview_scheduled+ (idx 4+) | ✗ | ✗ | ✗ | **0** | 无 app 到达 |

**验证**: 累积计数逻辑正确 — 每个 app 计入其所在阶段及之前所有阶段。✅

---

## 6. 掉落率计算 (dropoffRate)

### 代码

```typescript
// recruitment-funnel-service.ts:95-97
const dropoffRate = prevCount !== null && prevCount > 0
  ? safeRate(prevCount - count, prevCount)
  : null;
```

### 样例验证

| 上一阶段 count | 当前阶段 count | 掉落人数 | 预期 dropoffRate | 计算 | 判决 |
|----------------|----------------|----------|------------------|------|------|
| 128 | 96 | 32 | 0.25 | safeRate(32, 128) = 0.25 | PASS |
| 96 | 96 | 0 | 0 | safeRate(0, 96) = 0 | PASS |
| 50 | 30 | 20 | 0.4 | safeRate(20, 50) = 0.4 | PASS |
| 0 | 0 | 0 | null | `prevCount <= 0` → null | PASS |
| sourced (第一个) | — | — | null | `prevCount === null` → null | PASS |

---

## 7. 分母为零 → "---" 证明

### 完整链路

1. **数据层**: application 数据缺少导致 `prevCount = 0`
2. **safeRate**: `safeRate(count, 0)` → `denominator <= 0` → `return null`
3. **API 响应**: `dropoffRate: null` 或 `conversionRate: null`
4. **前端 fmtRate**: `fmtRate(null)` → `"---"`

### 代码链路

```
recruitment-funnel-service.ts:95-97
  → safeRate(prevCount - count, prevCount)
    → funnel-metric-dictionary.ts:7
      → if (denominator <= 0) return null

recruitment-funnel-service.ts:116-123
  → stages.push({ ..., conversionRate: null, dropoffRate: null, ... })

app/analytics/recruitment-funnel/page.tsx:103
  → if (r === null || r === undefined) return "---"
```

**验证**: 当分母为零时，整个链路从后端到前端一致返回 null → "---"。✅

---

## 8. No NaN 证明

### 所有可能产生 NaN 的路径和防护

| 操作 | 可能的 NaN | 防护措施 | 代码位置 |
|------|-----------|----------|----------|
| `numerator / denominator` | 0/0 = NaN | `denominator <= 0 → null` | `funnel-metric-dictionary.ts:7` |
| `total / count` | 0/0 = NaN | `count <= 0 → null` | `funnel-metric-dictionary.ts:17` |
| `Math.round(null * 100)` | NaN | `r === null → "---"` | `page.tsx:103` |
| `Number("invalid")` | NaN | `Number.isFinite()` 检查 | `funnel-metric-dictionary.ts:6` |
| `prevCount - count` | 仅数字运算 | prevCount 和 count 都是整数 | `recruitment-funnel-service.ts:96` |

### 证明

1. **safeRate**: 任何可能导致 NaN 的输入 (NaN 分子/分母、分母 ≤ 0) 都会在返回前被 null 替代。
2. **safeAvg**: 同理，非有限数或 count ≤ 0 返回 null。
3. **前端**: 所有格式化函数对 null/undefined 返回 "---"。
4. **commands.log**: grep 结果仅含 TS 类型注解中的 `as ... | undefined`，无运行时 NaN。

**结论**: 从后端计算到前端展示，NaN 不可能出现。✅

---

## 9. 简历通过率计算示例

### 代码

```typescript
// recruitment-funnel-service.ts:134-150
const totalApplications = stages.find(s => s.stageKey === "applied")?.count || 0;
const screenPassed = stages.find(s => s.stageKey === "screen_passed")?.count || 0;
const resumePassRate = safeRate(screenPassed, totalApplications);
```

### 样例

假设 applied = 128, screen_passed = 96：

| 步骤 | 值 |
|------|-----|
| totalApplications | 128 |
| screenPassed | 96 |
| safeRate(96, 128) | Number((96/128).toFixed(4)) = Number("0.7500") = 0.75 |
| fmtRate(0.75) | "75%" |

**验证**: 简历通过率 = 96/128 = 75%。✅

---

## 10. 面试通过率计算示例

### 代码

```typescript
// recruitment-funnel-service.ts:136-137
const interviewCompleted = stages.find(s => s.stageKey === "interview_completed")?.count || 0;
const feedbackSubmitted = stages.find(s => s.stageKey === "feedback_submitted")?.count || 0;
const feedbackSubmitRate = safeRate(feedbackSubmitted, interviewCompleted);
```

### 样例

假设 interview_completed = 50, feedback_submitted = 37：

| 步骤 | 值 |
|------|-----|
| interviewCompleted | 50 |
| feedbackSubmitted | 37 |
| safeRate(37, 50) | Number((37/50).toFixed(4)) = Number("0.7400") = 0.74 |
| fmtRate(0.74) | "74%" |

**验证**: 面评提交率 = 37/50 = 74%。✅

---

## Formula Evidence 总结

| # | 公式 | 验证方式 | 判决 |
|---|------|----------|------|
| 1 | safeRate 边界条件 (9 用例) | 代码逻辑 + 数值代入 | PASS |
| 2 | safeAvg 边界条件 (6 用例) | 代码逻辑 + 数值代入 | PASS |
| 3 | formatRateForUi (6 用例) | 代码逻辑 + 数值代入 | PASS |
| 4 | fmtRate 前端等效 (4 用例) | 代码逻辑 | PASS |
| 5 | 阶段累积计数 (3 apps 样例) | 手动推导 | PASS |
| 6 | 掉落率 (5 用例) | 代码逻辑 + 数值代入 | PASS |
| 7 | 分母为零 → "---" | 完整链路追踪 | PASS |
| 8 | No NaN | 全路径防护分析 | PASS |
| 9 | 简历通过率 | 样例数值代入 | PASS |
| 10 | 面评提交率 | 样例数值代入 | PASS |

**所有公式验证 PASS。**
