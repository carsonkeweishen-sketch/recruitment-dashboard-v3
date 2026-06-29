# Phase 8.15A Demo Access Information

## 1. 本地启动命令
```bash
cd /workspace/recruitment-dashboard
export PATH=/root/.nvm/versions/node/v22.13.1/bin:$PATH
NODE_OPTIONS="" npx next dev -p 3000
```

## 2. 访问地址
```
http://localhost:3000
```

## 3. 登录账号
当前开发版本无登录系统，默认以 admin 角色访问。

## 4. 登录角色
admin（全权限）

## 5. 推荐演示角色
admin — 可访问所有页面、岗位详情、AI Copilot、Funnel、Action Center

## 6. DeepSeek 当前状态
**真实调用** — DEEPSEEK_API_KEY 已配置在 .env.local，AI Copilot 通过 DeepSeek API 真实生成回复

## 7. Moka 当前状态
**未配置** — writebackEnabled=false，无候选人数据同步

## 8. 飞书当前状态
**未配置** — 无消息通知，无审批流

## 9. 哪些页面建议演示
| 页面 | 路由 | 原因 |
|------|------|------|
| Dashboard | /dashboard | 首页概览，100 岗位统计 |
| AI Copilot | 任意页面点击"AI 助手" | 核心亮点，真实 AI 问答+引用 |
| Job Center | /jobs | 100 个真实岗位，可点击详情 |
| Job Detail Drawer | 点击岗位卡片 | JD 原文+来源追溯 |
| Knowledge | /knowledge | 知识库搜索 JD/SOP |
| Data Sources | /data-sources | 资料接入文件列表 |
| Integrations | /integrations | 集成状态（诚实） |
| Funnel | /analytics/recruitment-funnel | 漏斗框架（数据待填充） |

## 10. 哪些页面不建议重点演示
| 页面 | 原因 |
|------|------|
| Candidates | 空态，无真实候选人数据 |
| Action Center | 空态，无待处理行动项 |
| Offer Risks | 空态，无候选人 |
| Media/Speech | 无真实音视频样本 |
| Interview Quality | 无真实面试数据 |
