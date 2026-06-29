# Phase 8.15B Demo Access Information

## 本地启动命令
```bash
cd /workspace/recruitment-dashboard
export PATH=/root/.nvm/versions/node/v22.13.1/bin:$PATH
NODE_OPTIONS="" npx next dev -p 3000
```

## 访问地址
```
http://localhost:3000
```

## 登录账号
当前开发版本无登录系统，默认以 admin 角色访问。

## 登录密码/登录方式
无密码 — 开发模式直接访问。

## 推荐演示角色
admin（全权限）— 可访问所有页面。

## Demo 主路径
```
Dashboard → AI Copilot → Funnel → Action Center → Action Detail → Job Center → Job Detail → Knowledge
```

## DeepSeek 当前状态
**真实调用** — DEEPSEEK_API_KEY 已配置在 .env.local

## Moka 当前状态
**未配置** — writebackEnabled=false

## 飞书当前状态
**未配置**

## 哪些页面建议演示

| 页面 | 路由 | 原因 |
|------|------|------|
| Dashboard | /dashboard | 首页，100 岗位统计，AI 入口 |
| AI Copilot | 点击"AI 助手" | 核心亮点，citation/Human Review/No Evidence |
| Funnel | /analytics/recruitment-funnel | 漏斗框架 |
| Action Center | /actions | 有 1 个真实逾期行动项可打开详情 |
| Job Center | /jobs | 100 个真实岗位 |
| Job Detail | 点击岗位卡片 | JD 原文 + source trace |
| Knowledge | /knowledge | 搜索 JD/SOP |
| Data Sources | /data-sources | 资料文件列表 |
| Integrations | /integrations | 集成状态（诚实） |

## 哪些页面不建议重点演示

| 页面 | 原因 |
|------|------|
| Candidates | 空态，无真实候选人数据 |
| Offer Risks | 空态 |
| Media/Speech | 无真实样本 |
| Interview Quality | 无真实面试数据 |
