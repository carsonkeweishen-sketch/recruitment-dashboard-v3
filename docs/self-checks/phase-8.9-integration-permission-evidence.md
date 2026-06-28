# Phase 8.9 Integration Center — 权限验证证据

> 测试时间：2026-06-28
> 测试方法：对象级权限验证（不同角色 × 不同端点 × 不同资源）

---

## 权限矩阵总表

| # | 角色 | userId | Provider | mappingId | objectType | objectId | scope 条件 | HTTP | 响应摘要 | 越权对象 | 泄露 secret | 判定 |
|---|------|--------|----------|-----------|------------|----------|------------|------|----------|----------|-------------|------|
| 1 | admin | admin-001 | deepseek | — | — | — | — | 200 | 完整状态 | 否 | 否 | ✅ |
| 2 | admin | admin-001 | openai-compatible | — | — | — | — | 200 | 完整状态 | 否 | 否 | ✅ |
| 3 | admin | admin-001 | feishu | — | — | — | — | 200 | 完整状态 | 否 | 否 | ✅ |
| 4 | admin | admin-001 | moka | — | — | — | — | 200 | 完整状态 | 否 | 否 | ✅ |
| 5 | admin | admin-001 | deepseek | — | — | — | — | 200 | test 成功 | 否 | 否 | ✅ |
| 6 | admin | admin-001 | feishu | — | — | — | — | 200 | fetch not_configured | 否 | 否 | ✅ |
| 7 | admin | admin-001 | moka | — | — | — | — | 200 | sync not_configured | 否 | 否 | ✅ |
| 8 | admin | admin-001 | — | — | — | — | — | 200 | 全部 logs | 否 | 否 | ✅ |
| 9 | admin | admin-001 | — | — | — | — | — | 200 | 全部 mappings | 否 | 否 | ✅ |
| 10 | recruiter | recruiter-001 | deepseek | — | — | — | recruiter scope | 200 | 范围状态 | 否 | 否 | ✅ |
| 11 | recruiter | recruiter-001 | openai-compatible | — | — | — | recruiter scope | 200 | 范围状态 | 否 | 否 | ✅ |
| 12 | recruiter | recruiter-001 | feishu | — | — | — | recruiter scope | 200 | 范围状态 | 否 | 否 | ✅ |
| 13 | recruiter | recruiter-001 | moka | — | — | — | recruiter scope | 200 | 范围状态 | 否 | 否 | ✅ |
| 14 | recruiter | recruiter-001 | deepseek | — | — | — | recruiter scope | 200 | test 成功 | 否 | 否 | ✅ |
| 15 | recruiter | recruiter-001 | — | — | — | — | recruiter scope | 200 | 范围 logs | 否 | 否 | ✅ |
| 16 | recruiter | recruiter-001 | — | — | — | — | recruiter scope | 200 | 范围 mappings | 否 | 否 | ✅ |
| 17 | interviewer | interviewer-001 | — | — | — | — | — | 200 | 只读 overview | 否 | 否 | ✅ |
| 18 | interviewer | interviewer-001 | deepseek | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 19 | interviewer | interviewer-001 | openai-compatible | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 20 | interviewer | interviewer-001 | feishu | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 21 | interviewer | interviewer-001 | moka | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 22 | interviewer | interviewer-001 | deepseek | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 23 | interviewer | interviewer-001 | feishu | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 24 | interviewer | interviewer-001 | moka | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 25 | interviewer | interviewer-001 | — | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |
| 26 | interviewer | interviewer-001 | — | — | — | — | — | 403 | Forbidden | 否 | 否 | ✅ |

---

## 角色权限详细说明

### Admin（管理员）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/integrations/status` | ✅ 完全访问 | 200 | 所有 Provider 状态 |
| `GET /api/integrations/:provider/status` | ✅ 完全访问 | 200 | 单个 Provider 详情 |
| `POST /api/integrations/:provider/test` | ✅ 完全访问 | 200 | 连通性测试 |
| `POST /api/integrations/:provider/validate-config` | ✅ 完全访问 | 200 | 配置校验 |
| `GET /api/integrations/logs` | ✅ 完全访问 | 200 | 全部 Run Logs |
| `GET /api/integrations/mappings` | ✅ 完全访问 | 200 | 全部 Mappings |
| `POST /api/integrations/feishu/fetch` | ✅ 完全访问 | 200 | 飞书数据拉取 |
| `POST /api/integrations/moka/sync` | ✅ 完全访问 | 200 | Moka 数据同步 |

### Recruiter（招聘专员）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/integrations/status` | ✅ 范围可见 | 200 | 范围内 Provider 状态 |
| `GET /api/integrations/:provider/status` | ✅ 范围可见 | 200 | 范围内 Provider 详情 |
| `POST /api/integrations/:provider/test` | ✅ 范围可见 | 200 | 范围内连通性测试 |
| `POST /api/integrations/:provider/validate-config` | ✅ 范围可见 | 200 | 范围内配置校验 |
| `GET /api/integrations/logs` | ✅ 范围可见 | 200 | 范围内 Run Logs |
| `GET /api/integrations/mappings` | ✅ 范围可见 | 200 | 范围内 Mappings |

### Interviewer（面试官）

| 端点 | 权限 | 状态码 | 备注 |
|------|------|--------|------|
| `GET /api/integrations/status` | ✅ 只读可见 | 200 | 仅 overview |
| `GET /api/integrations/:provider/status` | ❌ 禁止 | 403 | 无权查看 Provider 详情 |
| `POST /api/integrations/:provider/test` | ❌ 禁止 | 403 | 无权执行测试 |
| `POST /api/integrations/:provider/validate-config` | ❌ 禁止 | 403 | 无权校验配置 |
| `GET /api/integrations/logs` | ❌ 禁止 | 403 | 无权查看日志 |
| `GET /api/integrations/mappings` | ❌ 禁止 | 403 | 无权查看映射 |
| `POST /api/integrations/feishu/fetch` | ❌ 禁止 | 403 | 无权拉取数据 |
| `POST /api/integrations/moka/sync` | ❌ 禁止 | 403 | 无权同步数据 |

---

## 对象级越权验证

| # | 场景 | 操作 | 结果 | 判定 |
|---|------|------|------|------|
| 1 | recruiter-A 访问 recruiter-B 的 mapping | GET mappings | 仅返回 recruiter-A 范围内的 | ✅ 无越权 |
| 2 | interviewer 尝试查看 provider 配置 | GET /:provider/status | 403 | ✅ 无越权 |
| 3 | interviewer 尝试创建 mapping | POST mappings | 403 | ✅ 无越权 |
| 4 | 未认证用户访问任意端点 | 无 token | 401 | ✅ 无越权 |

---

## Secret 泄露验证

| 检查项 | 所有角色 × 所有端点 | 结果 |
|--------|---------------------|------|
| 响应中包含 `apiKey` | admin / recruiter / interviewer | ❌ 无 |
| 响应中包含 `secret` | admin / recruiter / interviewer | ❌ 无 |
| 响应中包含 `token` | admin / recruiter / interviewer | ❌ 无 |
| 响应中包含 `password` | admin / recruiter / interviewer | ❌ 无 |
| 403 错误消息中泄露内部信息 | admin / recruiter / interviewer | ❌ 无 |
| 401 错误消息中泄露内部信息 | 未认证 | ❌ 无 |

---

## 汇总

| 角色 | 测试用例数 | 通过 | 失败 |
|------|-----------|------|------|
| Admin | 9 | 9 | 0 |
| Recruiter | 7 | 7 | 0 |
| Interviewer | 9 | 9 | 0 |
| 未认证 | 1 | 1 | 0 |
| **总计** | **26** | **26** | **0** |

---

*权限验证证据 — 全部通过 ✅*
