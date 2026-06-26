# CEO Demo Readiness Checklist — Phase 7 Final Lock

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | `pnpm build` 通过 | ✅ |
| 2 | `pnpm typecheck` 通过 | ✅ |
| 3 | `pnpm lint` 通过 | ✅ |
| 4 | DB 已 seed 9 条 CEO Demo 数据 | ✅ |
| 5 | 数据含逾期 (≥1) | ✅ 1 条 |
| 6 | 数据含紧急 (≥1) | ✅ 1 条 |
| 7 | 数据含今日到期 (≥1) | ✅ 1 条 |
| 8 | 数据含已解决 (≥1) | ✅ 2 条 |
| 9 | 数据含已忽略 (≥1) | ✅ 2 条 |
| 10 | 数据含完整关联链 | ✅ |
| 11 | 无测试感名称 | ✅ |
| 12 | 无 null/undefined/NaN 暴露 | ✅ |
| 13 | `/actions` 页面可访问 | ✅ |
| 14 | `GET /api/actions` 正常 | ✅ |
| 15 | Create / Resolve / Dismiss 可用 | ✅ |
| 16 | ActivityLog 更新正常 | ✅ |
| 17 | 权限控制生效 | ✅ |
| 18 | 12 张 Final Lock 截图 | ✅ |
| 19 | git status clean | 待提交 |
| 20 | 未合并 main | ✅ |
| 21 | 未 force push | ✅ |

## Demo 账号

| 角色 | Cookie 值 |
|------|----------|
| admin | rd_dev_role=admin; rd_dev_user_id=cmqv2nfjo0007y3jxiwti2eer |
| interviewer | rd_dev_role=interviewer; rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq |

## Demo 主路径 Action

推荐演示用：**"媒介投放一面反馈已超时 5 天，需催办面试官"**

理由：逾期 + 关联完整 + 面试反馈场景典型 + 可演示闭环
