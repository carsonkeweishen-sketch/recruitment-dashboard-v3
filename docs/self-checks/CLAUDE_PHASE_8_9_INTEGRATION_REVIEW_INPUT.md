# Phase 8.9 Integration Center — GPT/Claude Review Input

> 目标：为外部 AI Review（GPT-4 / Claude）提供完整的 Phase 8.9 审查上下文
> 版本：v1.0
> 日期：2026-06-28

---

## Phase 概览

**Phase 8.9 Integration Center** 是招聘仪表盘项目的集成中心模块，负责统一管理和展示外部系统（AI 模型、文档协作、ATS）的接入状态。本阶段采用 Adapter Contract 模式实现 Provider 抽象，支持 DeepSeek、OpenAI 兼容接口、飞书和 Moka 四个 Provider。

**核心目标：**
- 提供统一的集成中心页面，展示所有 Provider 状态
- 实现 Adapter Contract 架构，确保 Provider 可扩展
- 建立完整的权限体系（Admin / Recruiter / Interviewer）
- 实现 Run Logs 和 External Mappings 追踪
- 确保无 fake 状态、无 secret 泄露、无越权访问

---

## 架构决策

### Adapter Contract 模式

所有 Provider 实现统一的抽象基类 `IntegrationProvider`：

```typescript
abstract class IntegrationProvider {
  abstract id: string;
  abstract name: string;
  abstract type: 'ai_model' | 'document_provider' | 'ats_provider';
  abstract get status(): ProviderStatus;
  abstract get writebackEnabled(): boolean;
  abstract get mode(): string;
  abstract get lastCheckedAt(): Date | null;
  abstract testConnection(): Promise<TestResult>;
  abstract validateConfig(): Promise<ValidationResult>;
}
```

**Provider 实现：**

| Provider | 类名 | 类型 | 模式 |
|----------|------|------|------|
| DeepSeek | `DeepSeekProvider` | ai_model | chat / completion |
| OpenAI 兼容 | `OpenAICompatibleProvider` | ai_model | chat / completion |
| 飞书 | `FeishuProvider` | document_provider | document_provider |
| Moka | `MokaProvider` | ats_provider | ats_provider |

### 关键设计决策

1. **不写回（No Writeback）：** 飞书和 Moka 的 `writebackEnabled` 均为 `false`，Phase 8.9 不实现写回功能
2. **真实状态（No Fake）：** 所有 Provider 状态基于实际配置检测（检查环境变量），不使用硬编码的假状态
3. **Secret 保护：** API Key/Secret/Token 仅从 `process.env` 读取，不在任何 API 响应中返回
4. **预留接口：** OpenAI-compatible Provider 为预留，飞书 fetch 和 Moka sync 接口已实现但返回 `not_configured`

---

## Adapter Contract 详情

### 飞书 Adapter Contract

| 属性 | 值 |
|------|-----|
| Provider ID | `feishu` |
| 名称 | 飞书 |
| 类型 | document_provider |
| 模式 | document_provider |
| 写回 | false |
| 数据拉取 | `POST /api/integrations/feishu/fetch` → not_configured |
| 状态判定 | 检查 `FEISHU_APP_ID` + `FEISHU_APP_SECRET` 环境变量 |

### Moka Adapter Contract

| 属性 | 值 |
|------|-----|
| Provider ID | `moka` |
| 名称 | Moka |
| 类型 | ats_provider |
| 模式 | ats_provider |
| 写回 | false |
| 数据同步 | `POST /api/integrations/moka/sync` → not_configured |
| 状态判定 | 检查 `MOKA_TOKEN` + `MOKA_BASE_URL` 环境变量 |

### DeepSeek Adapter Contract

| 属性 | 值 |
|------|-----|
| Provider ID | `deepseek` |
| 名称 | DeepSeek |
| 类型 | ai_model |
| 状态 | connected（有 `DEEPSEEK_API_KEY`） |
| 连通性测试 | 向 DeepSeek API 发送测试请求 |

### OpenAI 兼容 Adapter Contract

| 属性 | 值 |
|------|-----|
| Provider ID | `openai-compatible` |
| 名称 | OpenAI 兼容 |
| 类型 | ai_model |
| 状态 | not_configured（无 `OPENAI_API_KEY`） |
| 说明 | 预留接口，兼容 OpenAI API 格式 |

---

## API 路由汇总

| 方法 | 路由 | 功能 | 权限 |
|------|------|------|------|
| GET | `/api/integrations/status` | 全局 Provider 状态 | Admin / Recruiter / Interviewer |
| GET | `/api/integrations/[provider]/status` | 单 Provider 状态 | Admin / Recruiter |
| POST | `/api/integrations/[provider]/test` | 连通性测试 | Admin / Recruiter |
| POST | `/api/integrations/[provider]/validate-config` | 配置校验 | Admin / Recruiter |
| GET | `/api/integrations/logs` | Run Logs 查询 | Admin / Recruiter |
| GET | `/api/integrations/mappings` | External Mappings 查询 | Admin / Recruiter |
| POST | `/api/integrations/feishu/fetch` | 飞书数据拉取 | Admin |
| POST | `/api/integrations/moka/sync` | Moka 数据同步 | Admin |

---

## 关键文件变更

```
prisma/schema.prisma                           # 新增 RunLog, ExternalMapping, IntegrationConfig 模型
src/lib/integrations/
  base-provider.ts                              # IntegrationProvider 抽象基类
  deepseek-provider.ts                          # DeepSeek Provider 实现
  openai-compatible-provider.ts                 # OpenAI 兼容 Provider 实现
  feishu-provider.ts                            # 飞书 Provider 实现
  moka-provider.ts                              # Moka Provider 实现
  types.ts                                      # 类型定义
  permissions.ts                                # 权限逻辑
src/app/api/integrations/
  status/route.ts                               # GET 全局状态
  [provider]/status/route.ts                    # GET 单 Provider 状态
  [provider]/test/route.ts                      # POST 连通性测试
  [provider]/validate-config/route.ts           # POST 配置校验
  logs/route.ts                                 # GET Run Logs
  mappings/route.ts                             # GET External Mappings
  feishu/fetch/route.ts                         # POST 飞书拉取
  moka/sync/route.ts                            # POST Moka 同步
src/app/integration/
  page.tsx                                      # 集成中心主页
  logs/page.tsx                                 # Run Logs 页面
  mappings/page.tsx                             # External Mappings 页面
  layout.tsx                                    # 布局
src/components/integration/
  kpi-cards.tsx                                 # KPI 概览卡片
  provider-card.tsx                             # Provider 卡片
  provider-drawer.tsx                           # Provider 详情 Drawer
  status-badge.tsx                              # 状态徽章
  run-log-table.tsx                             # Run Logs 表格
  mapping-table.tsx                             # Mappings 表格
  permission-guard.tsx                          # 权限守卫
```

---

## 截图清单（22 张）

| 编号 | 文件名 | 描述 |
|------|--------|------|
| 1 | integration-overview-admin.png | 集成中心总览（Admin） |
| 2 | integration-deepseek-card.png | DeepSeek 卡片 |
| 3 | integration-openai-card.png | OpenAI 兼容卡片 |
| 4 | integration-feishu-card.png | 飞书卡片 |
| 5 | integration-moka-card.png | Moka 卡片 |
| 6 | integration-deepseek-drawer.png | DeepSeek 详情 Drawer |
| 7 | integration-feishu-drawer.png | 飞书详情 Drawer |
| 8 | integration-moka-drawer.png | Moka 详情 Drawer |
| 9 | integration-run-logs.png | 运行日志 |
| 10 | integration-run-logs-filtered.png | 运行日志（过滤） |
| 11 | integration-external-mappings.png | 外部映射 |
| 12 | integration-mappings-filtered.png | 外部映射（过滤） |
| 13 | integration-test-deepseek.png | DeepSeek 测试 |
| 14 | integration-test-feishu.png | 飞书测试 |
| 15 | integration-test-moka.png | Moka 测试 |
| 16 | integration-validate-config.png | 配置校验 |
| 17 | integration-recruiter-view.png | Recruiter 视图 |
| 18 | integration-interviewer-view.png | Interviewer 视图 |
| 19 | integration-interviewer-403.png | Interviewer 403 |
| 20 | integration-api-response-status.png | API status 响应 |
| 21 | integration-api-response-logs.png | API logs 响应 |
| 22 | integration-api-response-mappings.png | API mappings 响应 |

---

## 已知限制

1. **飞书与 Moka 未实际配置：** 飞书和 Moka 处于 `not_configured` 状态，需生产环境配置凭证后方可启用实际数据同步
2. **OpenAI 兼容接口为预留：** 尚未对接具体 OpenAI 兼容模型服务，仅完成接口定义和 Provider 注册
3. **写回功能未启用：** `writebackEnabled` 统一为 `false`，写回功能留待后续阶段实现
4. **实时状态更新：** 当前为按需查询模式（API 调用时检测），未实现 WebSocket 推送或定时轮询
5. **集成配置持久化：** `IntegrationConfig` 模型已定义但当前通过环境变量检测状态，持久化配置 UI 留待后续

---

## 红线检查清单

| # | 红线项 | 状态 |
|---|--------|------|
| 1 | 无 fake connected | ✅ |
| 2 | 无 fake synced | ✅ |
| 3 | 无 fake sync | ✅ |
| 4 | 无"同步成功但未配置"文案 | ✅ |
| 5 | 无"写回 Moka" | ✅ |
| 6 | 无"写回飞书" | ✅ |
| 7 | 无"发 Offer" | ✅ |
| 8 | 无"审批 Offer" | ✅ |
| 9 | 前端无 API Key 明文 | ✅ |
| 10 | 前端无 FEISHU_APP_SECRET | ✅ |
| 11 | 前端无 MOKA_TOKEN | ✅ |
| 12 | 前端无 DATABASE_URL | ✅ |
| 13 | API 响应无 secret | ✅ |
| 14 | API 响应无 token | ✅ |
| 15 | API 响应无 API Key | ✅ |
| 16 | Adapter Contract 正确实现 | ✅ |
| 17 | 权限覆盖所有敏感端点 | ✅ |
| 18 | git status 干净 | ✅ |

---

## 审查建议

**建议 GPT/Claude Review 关注以下方面：**

1. **Adapter Contract 设计：** 基类抽象是否合理，Provider 实现是否遵循单一职责
2. **Secret 安全：** 确认所有密钥仅从 `process.env` 读取，无任何路径泄露到前端
3. **权限完备性：** 确认 Interviewer 角色对所有敏感端点为 403，无绕过路径
4. **红线合规：** 确认代码库中不存在 fake 状态、写回逻辑、Offer 操作
5. **API 响应结构：** 确认所有 API 响应不包含敏感字段
6. **UI 文案：** 确认前端文案与 Provider 实际状态一致
7. **数据模型：** 确认 Prisma Schema 中的 RunLog、ExternalMapping、IntegrationConfig 模型设计合理

---

## 相关文档

| 文档 | 路径 |
|------|------|
| 综合验收报告 | `phase-8.9-integration-report.md` |
| API 证据 | `phase-8.9-integration-api-evidence.md` |
| 权限证据 | `phase-8.9-integration-permission-evidence.md` |
| DOM 证据 | `phase-8.9-integration-dom-evidence.md` |
| UI 审查 | `phase-8.9-integration-ui-review.md` |
| 截图索引 | `phase-8.9-integration-screenshot-index.md` |
| 命令日志 | `phase-8.9-integration-commands.log` |

---

*Review Input 文档结束 — 提交 GPT/Claude Review*
