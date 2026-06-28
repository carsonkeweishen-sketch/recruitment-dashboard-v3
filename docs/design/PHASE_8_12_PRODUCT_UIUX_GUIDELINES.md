# Phase 8.12 — 理然智能招聘 AI 看板 v3 产品 UI/UX 指南

## 1. 导航与信息架构

侧边栏按业务分组：
- **概览** — Dashboard（招聘总览）
- **招聘运营** — 岗位中心、候选人中心
- **面试** — 面试管理、面试质量
- **风险与行动** — 行动中心、Offer 风险
- **分析** — 招聘漏斗
- **AI 与知识** — 音视频转写、知识库、资料接入
- **集成与设置** — 集成中心、报告（规划中）、设置（规划中）

## 2. Design Tokens

统一颜色变量（CSS variables）：
- `--color-primary` / `--color-primary-light` — 主色
- `--color-surface` / `--color-surface-secondary` / `--color-surface-tertiary` — 表面
- `--color-border` / `--color-border-light` — 边框
- `--color-text-primary` / `--color-text-secondary` / `--color-text-tertiary` — 文本
- `--color-success` / `--color-warning` / `--color-danger` / `--color-info` — 语义色

统一圆角：
- 卡片/面板：rounded-2xl (16px)
- 按钮/Badge：rounded-full
- 输入框：rounded-lg (8px)

统一间距：4px/8px scale

## 3. 统一组件

### StatusBadge
```tsx
<StatusBadge label="转写完成" variant="success" />
```
variants: success / warning / danger / info / neutral / default / pending / ai / system_rule

### StateBlock
```tsx
<StateBlock type="empty" action={<button>上传资料</button>} />
```
types: empty / error / permission / loading / not_configured / no_evidence / partial_data / data_quality_warning

### ProvenanceBadge
```tsx
<ProvenanceBadge type="llm" provider="deepseek" model="deepseek-v4-flash" />
```
types: system_rule / llm / retrieval / data_source / transcript

## 4. AI Copilot 体验规范

- Topbar 统一 AI 按钮（🤖 AI 助手）
- 右侧 Panel max-w-xl
- Context Stack 可折叠
- Answer 必须显示：provider / model / promptVersion / citation / disclaimer
- Human Review 三态：接受 / 编辑后接受 / 忽略
- Draft Action 仅草稿，人工确认后创建
- no evidence 不调用 LLM

## 5. 文案规范

- AI 输出统一叫"AI 辅助建议"，不叫"AI 决策"
- Action 叫"行动项 / 已解决 / 已忽略"
- 面试反馈对事不对人，不做面试官排名
- 不出现工程术语（Adapter Contract、readonly、L0/L5等）
- 安全声明必须出现在 AI/媒体/候选人/Offer 页面

## 6. 安全与隐私

- 所有 AI/媒体页面有安全横幅
- 明确：不自动录用、不自动淘汰、不自动推进、不自动发 Offer
- 媒体分析：不做情绪、声音、口音、性格或撒谎判断
- 敏感字段不展示：手机号、邮箱、身份证、详细薪资、API Key
