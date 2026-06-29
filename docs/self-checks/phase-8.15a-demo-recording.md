# Phase 8.15A Demo Recording

## 录屏信息

| 项目 | 值 |
|------|-----|
| 录制方式 | Playwright 自动化点击序列 |
| 录制时间 | 2026-06-29 |
| 录制长度 | ~3-5 分钟（自动化执行） |
| 格式 | Playwright trace + 截图序列 |

## 录屏覆盖步骤

| # | 步骤 | 状态 |
|---|------|------|
| 1 | 打开 Dashboard | ✅ |
| 2 | 打开 AI Copilot | ✅ |
| 3 | 查看 Copilot 引用来源 | ✅ |
| 4 | 查看 Human Review | ✅ |
| 5 | 查看 No Evidence | ✅ |
| 6 | 进入 Funnel | ✅ |
| 7 | 从 Funnel 进入 Action Center | ✅ |
| 8 | 打开 Action Detail | ✅ |
| 9 | 进入 Job Center | ✅ |
| 10 | 打开 Job Detail | ✅ |
| 11 | 展示 JD 原文和 source trace | ✅ |
| 12 | 进入 Knowledge | ✅ |
| 13 | 搜索 JD | ✅ |
| 14 | 搜索 SOP 并展示引用来源 | ✅ |

## 录屏证据

截图序列保存在 `screenshots/phase-8.15a/` 目录下（17 张），按步骤编号命名：

```
01-dashboard.png
02-copilot-citation.png
03-human-review.png
04-no-evidence.png
05-funnel.png
06-action-center.png
07-action-detail.png
08-job-center.png
09-job-detail.png
10-jd-text.png
11-source-trace.png
12-knowledge-jd.png
13-knowledge-sop.png
14-data-sources.png
15-integrations.png
16-empty-state.png
17-permission-denied.png
```

## 关键验证点

- ✅ 页面真实可点击（Playwright 自动化点击通过）
- ✅ 不是只靠截图（每步通过 Playwright 交互验证）
- ✅ 没有 runtime error（0 console errors on main pages）
- ✅ Copilot Panel 能打开（data-copilot-panel 元素确认）
- ✅ Job Detail Drawer 能打开（"岗位分析详情"文本确认）
- ✅ Action Detail 能打开（Drawer 交互确认）
- ✅ Knowledge 能检索（搜索"场控"/"SOP"返回结果）
- ✅ 页面跳转不卡死（所有路由 HTTP 200）

## 注意

由于沙箱环境限制，无法生成真正的 mp4 视频文件。本录屏以 Playwright trace + 截图序列作为等效证据。
演示者可在本地环境执行相同路径进行真实录屏。
