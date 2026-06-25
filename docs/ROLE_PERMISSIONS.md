# 角色权限设计 (Phase 1 启用)

> 本文档定义系统角色与权限矩阵，Phase 1 实现。

## 角色定义

| 角色 | 标识 | 说明 |
|------|------|------|
| Admin | admin | 系统管理员，全部权限 |
| Leader | leader | 部门负责人，管辖部门数据 |
| HRBP | hrbp | HR 业务伙伴，跨部门协调 |
| Recruiter | recruiter | 招聘专员，负责具体岗位 |
| Business Owner | business_owner | 业务线负责人，面试官 |
| Interviewer | interviewer | 面试官，反馈提交 |

## 权限矩阵 (Phase 1 实现)

| 操作 | Admin | Leader | HRBP | Recruiter | Business Owner | Interviewer |
|------|-------|--------|------|-----------|----------------|-------------|
| 查看全部岗位 | ✅ | 管辖 | 管辖 | 负责 | 参与 | 参与 |
| 创建岗位 | ✅ | ✅ | ✅ | ✅ | ❌ | ❌ |
| 查看候选人 | ✅ | 管辖 | 管辖 | 负责 | 参与 | 参与 |
| 提交面试反馈 | ❌ | ❌ | ❌ | ❌ | ✅ | ✅ |
| 查看 AI 分析 | ✅ | 管辖 | 管辖 | 负责 | ❌ | ❌ |
| 系统配置 | ✅ | ❌ | ❌ | ❌ | ❌ | ❌ |

## Scope 规则

- `admin`: 全量数据
- `leader`: 本部门 + 下属部门
- `hrbp`: 负责部门范围
- `recruiter`: 本人负责岗位
- `business_owner`: 本人参与岗位
- `interviewer`: 本人面试记录
