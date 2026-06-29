# Phase 8.15 交接指南

**项目**: 理然智能招聘 AI 看板 (Recruitment Dashboard v3)  
**分支**: agent/workbuddy/phase-7  
**版本**: Phase 8.15 Release Lock  
**更新日期**: 2026-06-29

---

## 1. 本地启动

### 1.1 环境要求

| 依赖 | 版本要求 | 检查命令 |
|---|---|---|
| Node.js | >= 18.0.0 | `node -v` |
| pnpm | >= 8.0.0 | `pnpm -v` |
| PostgreSQL | >= 14 | `psql --version` |

### 1.2 安装与启动步骤

```bash
# 1. 安装依赖
pnpm install

# 2. 生成 Prisma Client
npx prisma generate

# 3. 推送数据库 Schema（创建表结构）
npx prisma db push

# 4. 导入种子数据（100 个真实岗位 + Knowledge）
npx prisma db seed

# 5. 启动开发服务器
pnpm dev
```

启动后访问: **http://localhost:3000**

---

## 2. 环境变量配置

创建 `.env.local` 文件（参考 `.env.example`）：

```env
# 数据库连接
DATABASE_URL="postgresql://postgres:password@localhost:5432/recruitment_dashboard"

# AI Provider（必填 — AI Copilot 依赖此项）
DEEPSEEK_API_KEY="sk-your-deepseek-api-key"

# 以下为可选集成（Phase 8.15 未配置）
# MOKA_API_KEY=
# MOKA_API_SECRET=
# FEISHU_APP_ID=
# FEISHU_APP_SECRET=
```

### 2.1 环境变量说明

| 变量 | 必填 | 说明 | 当前状态 |
|---|---|---|---|
| `DATABASE_URL` | **是** | PostgreSQL 连接字符串 | 已配置 |
| `DEEPSEEK_API_KEY` | **是** | DeepSeek API 密钥，用于 AI Copilot | 已配置 |
| `MOKA_API_KEY` | 否 | Moka ATS API 密钥 | 未配置 |
| `MOKA_API_SECRET` | 否 | Moka ATS API 密钥对 | 未配置 |
| `FEISHU_APP_ID` | 否 | 飞书应用 ID | 未配置 |
| `FEISHU_APP_SECRET` | 否 | 飞书应用密钥 | 未配置 |

---

## 3. 演示账号

### 3.1 主演示账号 (admin)

| 属性 | 值 |
|---|---|
| 用户名 | `admin` |
| 角色 | `admin` |
| 权限 | 全权限 — 可访问所有岗位、数据、AI Copilot |
| 用途 | **CEO 演示、全功能展示** |

### 3.2 其他演示角色

| 用户名 | 角色 | 权限范围 | 用途 |
|---|---|---|---|
| `recruiter` | recruiter | 自有岗位（job-001 ~ job-030） | 招聘专员演示 |
| `business_owner` | business_owner | 自有岗位（job-031 ~ job-060） | 业务负责人演示 |
| `interviewer` | interviewer | 受限（无岗位详情、无 AI、无漏斗） | 面试官权限演示 |
| `hrbp` | hrbp | 本组织岗位（job-061 ~ job-080） | HRBP 权限演示 |

---

## 4. 演示主路径

### 4.1 CEO 演示路线（推荐 15 分钟）

```
1. Dashboard (/dashboard)
   → 展示 100 个真实岗位概览
   → 集成状态一览（DeepSeek ✓, Moka ✗, 飞书 ✗）

2. 岗位管理 (/jobs)
   → 浏览 100 个真实岗位列表
   → 点击进入岗位详情，展示 source_file/source_sheet/source_row 追溯

3. AI Copilot (/copilot)
   → 提问："前端开发工程师需要什么技能？"
   → 展示 AI 回复 + citations 引用来源
   → 展示 Human Review 机制 (accepted/edited/rejected)
   → 提问一个无证据问题，展示 no-evidence short circuit

4. 知识库 (/knowledge)
   → 搜索"面试"查看 SOP chunks
   → 展示 knowledge_documents → data_sources 追溯链

5. 漏斗 (/funnel) [可选]
   → 展示漏斗可视化框架（当前数据为空，诚实说明）

6. Action Center (/actions) [可选]
   → 展示待办列表框架（当前数据为空，诚实说明）

7. 数据来源 (/data-sources)
   → 展示 6 个导入的 JD 文件
   → 强调所有岗位来自理然真实 JD 库

8. 权限演示
   → 切换到 interviewer 角色
   → 展示 403 权限拒绝
```

### 4.2 演示时间分配建议

| 环节 | 时间 | 关键展示点 |
|---|---|---|
| Dashboard | 2 min | 100 岗位概览 |
| 岗位管理 | 3 min | 岗位详情 + 数据追溯 |
| AI Copilot | 5 min | AI 问答 + citations + Human Review + no-evidence |
| 知识库 | 2 min | 知识追溯链 |
| 权限演示 | 2 min | 角色切换 + 403 |
| Q&A | 1 min | — |

---

## 5. CEO 演示禁止承诺清单

> **重要**: 以下内容在 CEO 演示中**不得承诺**，如被问及应诚实回答"该功能计划在后续版本实现"。

| 禁止承诺的内容 | 原因 | 建议回答 |
|---|---|---|
| "系统已有候选人数据" | `candidates` 表为空 | "候选人数据将在 Moka 对接后导入，目前候选人中心界面已就绪" |
| "可以与 Moka 双向同步" | Moka 未配置 | "Moka 集成计划在 Phase 9 完成" |
| "飞书审批流已集成" | 飞书未配置 | "飞书集成在 Phase 9 路线图中" |
| "AI 可以自动筛选候选人" | AI 仅辅助问答，不自动决策 | "AI 目前提供知识库问答辅助，不替代人工决策" |
| "支持视频面试" | 未实现 | "视频面试在 Phase 10 规划中" |
| "系统已可生产使用" | 缺少 Moka/飞书集成 | "当前为演示版本，展示核心能力和数据完整性" |

---

## 6. 常见问题排查

### 6.1 启动失败

| 问题 | 可能原因 | 解决方法 |
|---|---|---|
| `prisma generate` 失败 | Prisma schema 有变更 | 运行 `npx prisma generate` 重新生成 |
| `prisma db push` 失败 | 数据库未启动或连接字符串错误 | 检查 PostgreSQL 服务和 `DATABASE_URL` |
| `pnpm dev` 端口占用 | 3000 端口被占用 | 使用 `PORT=3001 pnpm dev` 更换端口 |
| AI Copilot 无响应 | `DEEPSEEK_API_KEY` 未设置或无效 | 检查 `.env.local` 中的 API Key |

### 6.2 数据问题

| 问题 | 解决方法 |
|---|---|
| 岗位列表为空 | 运行 `npx prisma db seed` 重新导入种子数据 |
| 知识库搜索无结果 | 检查 `knowledge_chunks` 表是否有数据 |
| 权限验证 403 异常 | 确认当前登录角色与请求资源的权限匹配 |

---

## 7. 项目结构速览

```
recruitment-dashboard/
├── prisma/
│   ├── schema.prisma          # 数据库 Schema
│   └── seed.ts                # 种子数据（100 岗位 + Knowledge）
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   ├── dashboard/     # Dashboard API
│   │   │   ├── jobs/          # 岗位 API
│   │   │   ├── ai/            # AI Copilot API
│   │   │   ├── knowledge/     # 知识库 API
│   │   │   ├── funnel/        # 漏斗 API
│   │   │   ├── actions/       # Action Center API
│   │   │   ├── data-sources/  # 数据来源 API
│   │   │   └── integrations/  # 集成状态 API
│   │   ├── dashboard/         # Dashboard 页面
│   │   ├── jobs/              # 岗位页面
│   │   ├── copilot/           # AI Copilot 页面
│   │   ├── knowledge/         # 知识库页面
│   │   ├── funnel/            # 漏斗页面
│   │   └── actions/           # Action Center 页面
│   ├── components/            # 共享组件
│   ├── lib/                   # 工具库
│   └── middleware.ts           # 权限中间件
├── docs/
│   └── self-checks/           # Phase 8.15 自检文档
├── screenshots/
│   └── phase-8.14a/           # 18 张验证截图
├── .env.example               # 环境变量模板
├── .env.local                 # 本地环境变量（不提交）
└── package.json
```

---

## 8. 联系人

| 角色 | 负责内容 |
|---|---|
| 开发负责人 | 代码实现、Bug 修复 |
| 数据负责人 | JD 库、Knowledge 数据维护 |
| 演示负责人 | CEO 演示、操作手册 |

---

## 附录：快速验证命令

```bash
# 验证数据库状态
npx prisma studio

# 验证 API 可用性
curl http://localhost:3000/api/dashboard/summary
curl http://localhost:3000/api/jobs
curl http://localhost:3000/api/integrations

# 验证 AI Copilot
curl -X POST http://localhost:3000/api/ai/copilot \
  -H "Content-Type: application/json" \
  -d '{"query": "前端开发工程师需要什么技能？", "role": "admin", "userId": "admin-001"}'
```
