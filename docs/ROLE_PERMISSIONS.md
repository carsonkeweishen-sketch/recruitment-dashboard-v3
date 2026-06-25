# 角色权限设计

> Phase 1 实现，基于 cookie 的开发态权限系统。Phase 1 只是权限基础设施，不是完整登录系统。

## 角色定义

| 角色 | 标识 | 说明 |
|------|------|------|
| Admin | admin | 系统管理员，全量权限，可管理 settings |
| Leader | leader | 管理层，全局查看和报告确认 |
| HRBP | hrbp | 部门 HRBP，部门范围 |
| Recruiter | recruiter | 招聘负责人，自己负责范围 |
| Business Owner | business_owner | 业务负责人，部门/相关岗位范围 |
| Interviewer | interviewer | 面试官，只看自己相关面试任务 |

## Scope 定义

| Scope | 说明 |
|-------|------|
| ALL | 全量数据 |
| DEPARTMENT | 部门范围 |
| OWNED | 自己负责范围 |
| RELATED | 与自己相关 |
| DENY | 无权限 |

## 权限矩阵

| 模块 | admin | leader | hrbp | recruiter | business_owner | interviewer |
|------|-------|--------|------|-----------|----------------|-------------|
| dashboard | ALL | ALL | DEPARTMENT | OWNED | DEPARTMENT | DENY |
| workbench | ALL | ALL | DEPARTMENT | OWNED | RELATED | RELATED |
| jobs | ALL | ALL | DEPARTMENT | OWNED | DEPARTMENT | RELATED |
| candidates | ALL | ALL | DEPARTMENT | OWNED | RELATED | RELATED |
| applications | ALL | ALL | DEPARTMENT | OWNED | RELATED | RELATED |
| interviews | ALL | ALL | DEPARTMENT | OWNED | RELATED | RELATED |
| actions | ALL | ALL | DEPARTMENT | OWNED | RELATED | RELATED |
| imports | ALL | ALL | DEPARTMENT | DENY | DENY | DENY |
| offerRisks | ALL | ALL | DEPARTMENT | OWNED | RELATED | DENY |
| reports | ALL | ALL | DEPARTMENT | OWNED | DEPARTMENT | DENY |
| aiAssistant | ALL | ALL | DEPARTMENT | OWNED | DENY | DENY |
| interviewerEnablement | ALL | ALL | DEPARTMENT | DEPARTMENT | DEPARTMENT | RELATED |
| settings | ALL | ALL | DENY | DENY | DENY | DENY |

## 关键规则

1. interviewer 不能访问 reports / imports / aiAssistant / offerRisks
2. business_owner 不能访问 aiAssistant / imports
3. recruiter 不能 confirm reports
4. hrbp 可以 confirm 部门 reports
5. admin / leader 可以 confirm reports
6. imports 只给 admin / leader / hrbp
7. AI 权限必须服务端校验，不允许只靠前端隐藏

## 开发态

- Phase 1 不做真实登录，使用 cookie-based 开发态角色切换
- 默认角色: admin
- 切换入口: Topbar RoleSwitcher
- 调试入口: /permissions-debug
- 权限由服务端 `requirePermission()` 强制执行

## 文件结构

```
server/permissions/
├── types.ts              # Role, Scope, Resource, Action 类型
├── matrix.ts             # 权限矩阵 + hasPermission() + getScopeFor()
└── check-permission.ts   # requirePermission() + buildScopeWhere()

server/auth/
└── session.ts            # cookie-based 开发态会话

components/auth/
├── RoleSwitcher.tsx      # Topbar 角色切换下拉
└── PermissionGate.tsx    # 客户端权限门控

app/api/auth/             # 角色切换 API
app/api/permissions/      # 权限查询 API
app/permissions-debug/    # 权限调试页面
```
