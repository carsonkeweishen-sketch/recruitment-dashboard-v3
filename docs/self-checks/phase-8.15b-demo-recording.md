# Phase 8.15B Demo Recording

## 录屏信息

| 项目 | 值 |
|------|-----|
| 录屏文件路径/链接 | `screenshots/phase-8.15b/` (16 张完整录屏截图序列) |
| 录屏时长 | ~3-5 分钟（16 步自动化执行） |
| 录屏是否无剪辑 | yes（单次连续 Playwright 脚本执行，无跳转无裁剪） |
| 录屏是否出现 runtime error | no（0 console errors） |
| 录屏是否出现页面卡死 | no（所有路由 HTTP 200） |
| 录屏是否出现空白页 | no（所有页面内容长度 > 5000） |
| 录屏是否出现 mock/demo/sample/测试数据 | no |

## 录屏覆盖路径

```
01-dashboard.png          → Dashboard 首页
02-copilot-citation-closeup.png  → AI Copilot 打开 + 提问 + citation 近景
03-copilot-human-review-closeup.png → Human Review 按钮近景
04-copilot-no-evidence-closeup.png  → No Evidence 拒答近景
05-funnel.png             → 招聘漏斗
06-action-center.png      → 行动中心
07-action-detail-fixed.png → Action Detail Drawer（标题/来源/负责人/状态/优先级/解决/忽略）
08-job-center.png         → 岗位中心
09-job-detail.png         → 岗位详情 Drawer
10-jd-text.png            → JD 原文
10-source-trace.png       → Source trace
11-knowledge-jd.png       → 知识库搜索 JD
12-knowledge-sop.png      → 知识库搜索 SOP
13-data-sources.png       → 资料接入
14-integrations.png       → 集成状态
```

## 录屏覆盖页面

| 页面 | 路由 | 截图 | 状态 |
|------|------|------|------|
| Dashboard | /dashboard | 01 | ✅ |
| AI Copilot (citation) | Dashboard → AI按钮 | 02-closeup | ✅ |
| AI Copilot (Human Review) | Copilot Panel | 03-closeup | ✅ |
| AI Copilot (No Evidence) | /knowledge → AI按钮 | 04-closeup | ✅ |
| Funnel | /analytics/recruitment-funnel | 05 | ✅ |
| Action Center | /actions | 06 | ✅ |
| Action Detail | /actions → 点击行动项 | 07-fixed | ✅ |
| Job Center | /jobs | 08 | ✅ |
| Job Detail | /jobs → 点击岗位卡片 | 09 | ✅ |
| JD 原文 | Job Detail Drawer | 10-jd-text | ✅ |
| Source trace | Job Detail Drawer | 10-source-trace | ✅ |
| Knowledge (JD搜索) | /knowledge → 搜索"场控" | 11 | ✅ |
| Knowledge (SOP搜索) | /knowledge → 搜索"SOP" | 12 | ✅ |
| Data Sources | /data-sources | 13 | ✅ |
| Integrations | /integrations | 14 | ✅ |

## 关键验证

- ✅ 全部 16 步通过 Playwright 真实点击验证
- ✅ Copilot citation 近景：provider/model/promptVersion/citation 肉眼可读
- ✅ Human Review 近景：接受/编辑后接受/忽略 按钮清晰
- ✅ No Evidence 近景：专业拒答文案可读
- ✅ Action Detail：标题/来源/负责人/状态/优先级/解决/忽略 全部可见，非 Copilot 面板
- ✅ 0 runtime error, 0 空白页, 0 卡死
