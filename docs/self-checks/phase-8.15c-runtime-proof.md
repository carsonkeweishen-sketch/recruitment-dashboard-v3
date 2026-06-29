# Phase 8.15C Runtime Proof

## 环境重建记录

### 执行顺序

```bash
pwd                          # /workspace
cd /workspace/recruitment-dashboard
git branch --show-current    # agent/workbuddy/phase-7
git log --oneline --decorate -5
# 4d6d57f (HEAD -> agent/workbuddy/phase-7, tag: workbuddy-phase-8.15) workbuddy phase-8.15b
# f145d9b (origin/agent/workbuddy/phase-7) workbuddy phase-8.15a
# 7049c77 workbuddy phase-8.15a: demo bug bash
# c2da6db workbuddy phase-8.15: add Word self-check report
# cc69cd8 workbuddy phase-8.15: fix 4 cross-directory duplicate screenshots

git status --short
# (clean — only new 8.15C files)

git diff --stat
# (clean — no uncommitted changes)

# Kill old processes
pkill -9 -f "next dev"
pkill -9 -f "next-server"

# Remove .next cache
rm -rf .next

# Rebuild
npx prisma generate   # ✔ Generated Prisma Client (v7.8.0)
npx next build        # BUILD_ID: nl8Gp1pWFNYeZdXtJHACx

# Start
NODE_OPTIONS="" npx next dev -p 3000
# ▲ Next.js 16.2.9 (Turbopack)
# ✓ Ready in 510ms
```

### Git Push 验证

```bash
git push origin agent/workbuddy/phase-7
# f145d9b..4d6d57f  agent/workbuddy/phase-7 -> agent/workbuddy/phase-7
```

Remote 现在与 local 对齐到 `4d6d57f`。

---

## Root Cause: 为什么用户打开 Demo URL 看到的是旧版本？

### 原因分析

| 可能原因 | 是否发生 | 说明 |
|----------|----------|------|
| 旧进程未关闭 | **是** | `next-server (v16.2.9)` 进程从 13:54 开始运行，用的是之前的 `.next` 缓存 |
| 旧 .next 缓存 | **是** | `.next` 目录来自旧 build（BUILD_ID: `9hukHm5jK`），与最新代码不同步 |
| Git push 未完成 | **是** | 本地 commit `4d6d57f` 在截图时尚未 push 到 origin；remote 停留在 `f145d9b` |
| 启动错分支 | 否 | 始终在 `agent/workbuddy/phase-7` |
| 启动错目录 | 否 | 始终在 `/workspace/recruitment-dashboard` |
| 截图来自不同环境 | **部分** | 8.15A/8.15B 截图在旧进程下截取，Runtime Proof 未添加，无法自证版本 |

### 根本原因

**三个问题叠加**：
1. `.next` 缓存未清理 — 服务器使用旧 build 产物
2. Git push 滞后 — remote 版本落后于 local
3. 缺少 Runtime Proof — 截图无法自证运行的是哪个版本

### 如何避免再次发生

1. **每次 Phase 完成后必须 `git push` 并验证 remote 对齐**
2. **启动 Demo 前必须 `rm -rf .next && npx next build`**
3. **已添加 RuntimeProofBadge 组件** — 任何截图都会包含 branch/commit/phase/buildTime

---

## Runtime Proof 验证

| 验证项 | 结果 |
|--------|------|
| Dashboard body 含 "Demo Runtime Proof" | ✅ true |
| Dashboard body 含 "agent/workbuddy/phase-7" | ✅ true |
| Dashboard body 含 "4d6d57f" | ✅ true |
| RuntimeProofBadge 组件已添加到 Dashboard | ✅ |
| 不暴露 API Key/DATABASE_URL | ✅ |
| 8 张 Runtime 对齐截图已捕获 | ✅ |
