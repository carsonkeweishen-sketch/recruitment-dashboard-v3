# Recruitment Dashboard v2 — 架构文档

## 技术栈

- **框架**: Next.js 16 (App Router)
- **语言**: TypeScript 5 (strict mode)
- **样式**: Tailwind CSS 4
- **数据库**: PostgreSQL (Supabase)
- **ORM**: Prisma 7
- **认证**: NextAuth.js / Auth.js (Phase 1)
- **包管理**: pnpm

## 目录结构

```
recruitment-dashboard/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # Root Layout (AppShell)
│   ├── page.tsx            # Home page
│   └── api/                # API Routes
├── components/             # React Components
│   ├── layout/             # AppShell, Sidebar, Topbar
│   └── ui/                 # Design System Components
├── prisma/                 # Database Schema & Seed
├── docs/                   # Documentation
├── .env.example            # Environment template
└── MEMORY.md               # Project long-term memory
```

## 设计原则

1. Server Components 优先，Client Components 按需
2. 所有数据获取走 Server Actions 或 API Routes
3. 类型安全贯穿全栈
4. 不依赖第三方 UI 库（自建 Design System）
