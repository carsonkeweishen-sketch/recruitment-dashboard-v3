# Phase 8.15A Demo Checklist

## Demo 前检查表

| # | 检查项 | 状态 |
|---|--------|------|
| 1 | Demo URL 可打开 | yes |
| 2 | 账号可登录 | yes (admin, 无登录系统) |
| 3 | Dashboard 可打开 | yes |
| 4 | Copilot 可打开 | yes |
| 5 | Copilot 引用来源可读 | yes (deepseek provider + citations) |
| 6 | Human Review 可见 | yes (接受/编辑后接受/忽略) |
| 7 | No Evidence 正常 | yes ("证据不足，无法生成 AI 建议") |
| 8 | Funnel 可打开 | yes |
| 9 | Action Center 可打开 | yes |
| 10 | Action Detail 可打开 | yes (如有 action item) |
| 11 | Job Center 可打开 | yes (100 岗位) |
| 12 | Job Detail 可打开 | yes (岗位分析详情 Drawer) |
| 13 | JD 原文可读 | yes (JD摘要文本) |
| 14 | source trace 可读 | yes (source_file 字段) |
| 15 | Knowledge 可检索 | yes (搜索"场控"/"SOP") |
| 16 | Data Sources 可打开 | yes |
| 17 | Integrations 状态诚实 | yes (Moka/飞书未配置) |
| 18 | 无 fake/mock/sample/测试数据 | yes |
| 19 | 无 API Key/DATABASE_URL 泄露 | yes |
| 20 | 无自动录用/淘汰/发 Offer | yes |

## 演示前 5 分钟确认

- [ ] 服务器已启动（`curl localhost:3000` 返回 307）
- [ ] DeepSeek API Key 有效（测试 Copilot 提问）
- [ ] 浏览器无缓存（或无痕模式）
- [ ] 演示路径已预演一次
- [ ] 已知限制话术已准备

## 演示后记录

- [ ] CEO 反馈记录
- [ ] 新发现的问题记录到 Phase 9
- [ ] 承诺事项记录到 Phase 9 任务清单
