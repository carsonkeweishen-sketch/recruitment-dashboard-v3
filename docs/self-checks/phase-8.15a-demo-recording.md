# Phase 8.15A Demo Recording

## 录屏信息

| 项目 | 值 |
|------|-----|
| 录制方式 | Playwright 自动化点击序列（等效录屏） |
| 录制时间 | 2026-06-29 |
| 录制长度 | ~3-5 分钟（自动化执行，17 步） |
| 格式 | Playwright trace + 截图序列（17 张 PNG） |
| 截图路径 | `screenshots/phase-8.15a/` |

## 录屏覆盖步骤

| # | 步骤 | 页面 | 截图文件 | 状态 |
|---|------|------|----------|------|
| 1 | 打开 Dashboard | /dashboard | 01-dashboard.png | ✅ |
| 2 | 打开 AI Copilot | Dashboard → AI 按钮 | 02-copilot-citation.png | ✅ |
| 3 | 查看 Copilot 引用来源 | Copilot Panel | 02-copilot-citation.png | ✅ |
| 4 | 查看 Human Review | Copilot Panel | 03-human-review.png | ✅ |
| 5 | 查看 No Evidence | /knowledge → AI 按钮 | 04-no-evidence.png | ✅ |
| 6 | 进入 Funnel | /analytics/recruitment-funnel | 05-funnel.png | ✅ |
| 7 | 进入 Action Center | /actions | 06-action-center.png | ✅ |
| 8 | 打开 Action Detail | /actions → 点击卡片 | 07-action-detail.png | ✅ |
| 9 | 进入 Job Center | /jobs | 08-job-center.png | ✅ |
| 10 | 打开 Job Detail | /jobs → 点击岗位卡片 | 09-job-detail.png | ✅ |
| 11 | 展示 JD 原文 | Job Detail Drawer | 10-jd-text.png | ✅ |
| 12 | 展示 source trace | Job Detail Drawer | 11-source-trace.png | ✅ |
| 13 | 进入 Knowledge | /knowledge | 12-knowledge-jd.png | ✅ |
| 14 | 搜索 JD | /knowledge → 搜索"场控" | 12-knowledge-jd.png | ✅ |
| 15 | 搜索 SOP 并展示引用来源 | /knowledge → 搜索"SOP" | 13-knowledge-sop.png | ✅ |
| 16 | 进入 Data Sources | /data-sources | 14-data-sources.png | ✅ |
| 17 | 进入 Integrations | /integrations | 15-integrations.png | ✅ |
| 18 | Candidates 空态 | /candidates | 16-empty-state.png | ✅ |
| 19 | 权限拒绝安全态 | /offer-risks | 17-permission-denied.png | ✅ |

## 关键验证点

- ✅ 页面真实可点击（Playwright 自动化点击全部通过）
- ✅ 不是只靠截图（每步通过 Playwright 交互验证，非静态截图）
- ✅ 没有 runtime error（0 console errors on main pages）
- ✅ Copilot Panel 能打开（data-copilot-panel 元素确认）
- ✅ Job Detail Drawer 能打开（"岗位分析详情"文本确认）
- ✅ Action Detail 能打开（Drawer 交互确认）
- ✅ Knowledge 能检索（搜索"场控"/"SOP"返回结果）
- ✅ 页面跳转不卡死（所有路由 HTTP 200）

## 注意

由于沙箱环境限制，无法生成真正的 mp4 视频文件。本录屏以 Playwright trace + 17 张截图序列作为等效证据。
演示者可在本地环境执行相同路径进行真实录屏。所有截图可通过 `screenshots/phase-8.15a/` 按顺序查看。
