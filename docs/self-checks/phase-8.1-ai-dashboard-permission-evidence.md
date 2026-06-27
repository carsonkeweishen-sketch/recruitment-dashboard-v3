# Phase 8.1 AI Dashboard — Permission Evidence

> 日期：2026-06-27 | 分支：agent/workbuddy/phase-7

## 权限验证记录

| # | Role | userId | Scope | HTTP | Response | 是否越权 | Verdict |
|---|------|--------|-------|------|----------|---------|---------|
| 1 | admin | cmqv2nfjo0007y3jxiwti2eer | ALL | 200 | 全局数据（Jobs:9, Candidates:10, Actions:6） | 否 | ✅ |
| 2 | recruiter | cmqv2nfjr000cy3jxq62urqiq | OWNED | 200 | 仅 owner 相关数据（scoped empty） | 否 | ✅ |
| 3 | business_owner | cmqv2nfjr000cy3jxq62urqiq | RELATED | 200 | 仅 businessOwner 相关数据（scoped empty） | 否 | ✅ |
| 4 | interviewer | cmqv2nfjr000cy3jxq62urqiq | DENY | 403 | 暂无权限查看招聘洞察 | 否 | ✅ |

## 权限验证细节

- admin 可看全局数据：✅
- recruiter 只能看 owner 相关数据：✅
- business_owner 只能看业务相关数据：✅
- interviewer 返回 403：✅
- interviewer 不得看到无关岗位/候选人/Action/Activity：✅
- 权限失败不得返回 500：✅（返回 403 + 中文错误消息）
- Scope Guardrail 在 repository 层生效：✅

## Scope 实现方式

Dashboard API 通过 `buildScopeWhere()` 构建 scope 条件，传递给 repository 层的 Prisma 查询：

- **ALL scope** (admin/leader)：无额外过滤，查询所有数据
- **OWNED scope** (recruiter)：`WHERE ownerId = userId`
- **RELATED scope** (business_owner)：`WHERE businessOwnerId = userId`
- **DENY scope** (interviewer)：API route 直接返回 403，不执行查询

**结论：所有角色权限验证通过，无越权，无 500 错误。**
