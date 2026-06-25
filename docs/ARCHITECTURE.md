# Recruitment Dashboard v3 — 架构文档

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5 (strict mode)
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **认证**: 开发态 cookie-based（Phase 1），NextAuth.js（Phase 1+）
- **包管理**: pnpm

## 目录结构

```
recruitment-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root Layout (AppShell)
│   ├── page.tsx            # Home page
│   ├── api/                # API Routes
│   └── permissions-debug/  # 权限调试页面
├── components/             # React Components
│   ├── layout/             # AppShell, Sidebar, Topbar
│   ├── ui/                 # Design System Components
│   └── auth/               # RoleSwitcher, PermissionGate
├── server/                 # Server-only code
│   ├── auth/               # Session management
│   └── permissions/        # Matrix, check-permission, scope
├── prisma/                 # Database Schema & Seed
├── docs/                   # Documentation
├── .env.example            # Environment template
└── MEMORY.md               # Project long-term memory
```

## 权限架构 (Phase 1)

- **6 角色**: admin, leader, hrbp, recruiter, business_owner, interviewer
- **5 Scope**: ALL, DEPARTMENT, OWNED, RELATED, DENY
- **13 Resource**: dashboard ~ settings
- **权限矩阵**: `server/permissions/matrix.ts`
- **服务端校验**: `requirePermission()` 强制执行
- **开发态切换**: Topbar RoleSwitcher + cookie session
- **调试入口**: `/permissions-debug`

Phase 1 只是权限基础设施，不是完整登录系统。

## 设计原则

1. Server Components 优先，Client Components 按需
2. 所有数据获取走 Server Actions 或 API Routes
3. 类型安全贯穿全栈
4. 不依赖第三方 UI 库（自建 Design System）
5. 权限服务端 enforce，不依赖前端隐藏
