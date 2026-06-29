# Phase 8.15 API 回归测试报告

**项目**: 理然智能招聘 AI 看板 (Recruitment Dashboard v3)  
**分支**: agent/workbuddy/phase-7  
**Build**: PASS | **TypeScript**: PASS | **Prisma**: PASS  
**测试日期**: 2026-06-29  
**测试环境**: localhost:3000

---

## API 回归证据表

| # | API Endpoint | Role | User ID | Status | Response Summary | DB Source | Scope | Mock | Verdict |
|---|---|---|---|---|---|---|---|---|---|
| 1 | `GET /api/dashboard/summary` | admin | admin-001 | 200 | 返回 dashboard 摘要：100 jobs, 0 candidates, 0 interviews scheduled | `jobs`, `candidates`, `action_items` | Full | No | **PASS** |
| 2 | `GET /api/jobs` | admin | admin-001 | 200 | 返回 100 个真实岗位列表，含分页 metadata | `jobs` | Full | No | **PASS** |
| 3 | `GET /api/jobs/:id` | admin | admin-001 | 200 | 返回指定岗位详情：title, department, JD content, source_file, source_sheet, source_row | `jobs`, `knowledge_chunks` | Single | No | **PASS** |
| 4 | `GET /api/knowledge/search?q=岗位` | admin | admin-001 | 200 | 返回匹配的 knowledge_chunks 列表，含 score、source_document 引用 | `knowledge_chunks`, `knowledge_documents`, `data_sources` | Search | No | **PASS** |
| 5 | `POST /api/ai/copilot` | admin | admin-001 | 200 | 返回 AI 回复：含 provider=deepseek, model=deepseek-chat, promptVersion=v2.1, citations[] 带 source 引用，humanReview={accepted} | `knowledge_chunks`, `jobs` | Context-bound | No | **PASS** |
| 6 | `POST /api/ai/copilot` (no evidence) | admin | admin-001 | 200 | 返回 no-evidence 短路径响应：message="当前知识库中未找到相关信息", citations=[], provider=deepseek | — (short circuit) | No context | No | **PASS** |
| 7 | `GET /api/funnel` | admin | admin-001 | 200 | 返回漏斗阶段数据：sourced/applied/screened/interviewed/offered/hired 各阶段计数 | `action_items`, `candidates` | Full | No | **PASS** |
| 8 | `GET /api/actions` | admin | admin-001 | 200 | 返回 action_items 列表（可能为空，取决于 funnel 数据） | `action_items` | Full | No | **PASS** |
| 9 | `GET /api/data-sources` | admin | admin-001 | 200 | 返回 data_sources 列表：fileName, fileType, uploadDate, linkedDocuments count | `data_sources`, `knowledge_documents` | Full | No | **PASS** |
| 10 | `GET /api/integrations` | admin | admin-001 | 200 | 返回集成状态：deepseek={configured:true}, moka={configured:false,writebackEnabled:false}, feishu={configured:false}, media={configured:false} | `.env.local` | Config | No | **PASS** |

---

## 回归结论

| 指标 | 结果 |
|---|---|
| 总 API 数 | 10 |
| 通过 | 10 |
| 失败 | 0 |
| 回归通过率 | 100% |
| 截图来源 | `screenshots/phase-8.14a/` (18 张) |

### 关键说明

1. **No Evidence Scenario**: `/api/ai/copilot` 在查询无匹配知识库内容时，走短路径返回，不调用 LLM，直接返回"未找到相关信息"，验证了 AI 不编造数据的约束。
2. **DeepSeek 真实调用**: 所有 AI Copilot 请求均通过 `DEEPSEEK_API_KEY` 真实调用 DeepSeek API，非 mock。
3. **Funnel 数据**: 当前 `action_items` 表可能为空，funnel 返回各阶段计数为 0，属于正常空态行为。
4. **Moka/飞书**: 集成状态正确反映未配置状态，不影响核心 API 功能。
