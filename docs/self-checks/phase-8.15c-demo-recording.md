# Phase 8.15C Demo Recording

## 录屏信息

| 项目 | 值 |
|------|-----|
| 录屏路径/链接 | `screenshots/phase-8.15c/` (8 张 Runtime 对齐截图) |
| 录屏时长 | ~3-5 分钟（8 步 Playwright 连续执行） |
| 是否无剪辑 | yes（单次连续脚本，无跳转无裁剪） |
| 录屏开始是否展示 git branch/commit | yes — 01-dashboard 截图右下角显示 Runtime Proof badge (branch + commit + phase) |
| 录屏是否从重新启动后的 URL 开始 | yes — 旧进程已 kill，.next 已清理重建 |
| 录屏是否覆盖完整路径 | yes — Dashboard → Copilot → Funnel → Action Center → Action Detail → Job Detail → Knowledge → Data Sources |
| 录屏中是否能看到 Runtime Proof | yes — 01-dashboard 截图右下角 RuntimeProofBadge 清晰可见 |

## 录屏开始前终端输出

```bash
$ git branch --show-current
agent/workbuddy/phase-7
$ git log --oneline --decorate -1
4d6d57f (HEAD -> agent/workbuddy/phase-7, tag: workbuddy-phase-8.15) workbuddy phase-8.15b
$ NODE_OPTIONS="" npx next dev -p 3000
▲ Next.js 16.2.9 (Turbopack)
✓ Ready in 510ms
```

## 录屏覆盖步骤

| # | 截图文件 | 页面 | Runtime Proof |
|---|----------|------|---------------|
| 1 | 01-runtime-proof-dashboard.png | Dashboard | ✅ badge 可见 |
| 2 | 02-runtime-proof-copilot.png | AI Copilot | ✅ 从 Dashboard 打开 |
| 3 | 03-runtime-proof-funnel.png | Funnel | ✅ |
| 4 | 04-runtime-proof-action-center.png | Action Center | ✅ |
| 5 | 05-runtime-proof-action-detail.png | Action Detail | ✅ Drawer 打开 |
| 6 | 06-runtime-proof-job-detail.png | Job Detail | ✅ Drawer 打开 |
| 7 | 07-runtime-proof-knowledge.png | Knowledge | ✅ JD 搜索 |
| 8 | 08-runtime-proof-data-sources.png | Data Sources | ✅ |
