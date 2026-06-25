# Recruitment Dashboard v2 — 环境搭建

## 前置条件

- Node.js >= 22
- pnpm >= 10
- PostgreSQL (Supabase)

## 快速开始

```bash
# 1. 安装依赖
pnpm install

# 2. 配置环境变量
cp .env.example .env
# 编辑 .env 填入 DATABASE_URL

# 3. 初始化数据库
pnpm db:migrate
pnpm db:seed

# 4. 启动开发服务器
pnpm dev
```

## 验证

- 访问 http://localhost:3000
- 访问 http://localhost:3000/api/health
