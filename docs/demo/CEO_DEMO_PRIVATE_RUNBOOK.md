# CEO Demo 私密运维手册

> ⚠️ **机密文档** — 仅限演示技术负责人查看
> 包含 Cookie 注入、Dev 角色设置、API 调试等敏感信息
> **不得**随自检报告或公开文档分发给外部 Review

---

## 一、演示环境架构

```
┌─────────────┐     ┌──────────────┐     ┌────────────┐
│  Browser     │────▶│  Next.js Dev  │────▶│ PostgreSQL │
│  (无痕模式)   │     │  localhost:3000│     │  localhost  │
└─────────────┘     └──────────────┘     └────────────┘
```

- 全部本地运行，无外部依赖
- Dev 角色通过 Cookie 模拟（无真实登录系统）
- 数据库每次演示前重置为干净的 Seed 数据

---

## 二、演示前环境准备（完整流程）

### Step 1: 确认 PostgreSQL 运行

```bash
pg_isready
# 期望: /var/run/postgresql:5432 - accepting connections
```

如果未运行：
```bash
sudo pg_ctlcluster 16 main start
```

### Step 2: 重置数据库 + 重新 Seed

```bash
cd /workspace/recruitment-dashboard

# 强制重置（会清除所有数据）
NODE_OPTIONS="" npx prisma db push --force-reset --accept-data-loss

# 重新插入 9 条 CEO Demo 专业业务语义 Action
NODE_OPTIONS="" npx tsx prisma/seed.ts
```

### Step 3: 验证 Seed 数据

```bash
NODE_OPTIONS="" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const total = await p.actionItem.count();
  const pending = await p.actionItem.count({ where: { status: 'pending' } });
  const overdue = await p.actionItem.count({ where: { status: 'pending', dueDate: { lt: new Date() } } });
  const urgent = await p.actionItem.count({ where: { priority: 'urgent' } });
  const resolved = await p.actionItem.count({ where: { status: 'resolved' } });
  console.log(JSON.stringify({ total, pending, overdue, urgent, resolved }));
  await p.\$disconnect();
})();
"
# 期望: {"total":9,"pending":5,"overdue":2,"urgent":1,"resolved":2}
```

### Step 4: 启动 Dev Server

```bash
NODE_OPTIONS="" pnpm dev
# 等待: ready - started server on http://localhost:3000
```

---

## 三、Cookie 注入（演示身份切换）

本系统使用 Cookie 模拟角色权限（dev 模式），无真实登录流程。

### Admin 角色（主演示路径）

在浏览器 Console 执行：
```js
document.cookie = "rd_dev_role=admin; path=/; max-age=86400";
document.cookie = "rd_dev_user_id=cmqv2nfjo0007y3jxiwti2eer; path=/; max-age=86400";
location.reload();
```

### Interviewer 角色（权限演示）

```js
document.cookie = "rd_dev_role=interviewer; path=/; max-age=86400";
document.cookie = "rd_dev_user_id=cmqv2nfjr000cy3jxq62urqiq; path=/; max-age=86400";
location.reload();
```

### 清除角色（恢复未登录态）

```js
document.cookie = "rd_dev_role=; path=/; max-age=0";
document.cookie = "rd_dev_user_id=; path=/; max-age=0";
location.reload();
```

### 其他可用角色

| 角色 | role 值 | 用途 |
|------|---------|------|
| Admin | `admin` | 主演示角色，全权限 |
| HRBP | `hrbp` | HR 业务视角 |
| Interviewer | `interviewer` | 面试官视角（权限受限） |
| Recruiter | `recruiter` | 招聘专员视角 |
| Dept Manager | `dept_manager` | 部门经理视角 |

---

## 四、演示中常见问题排查

### Q: 页面空白或 API 报错
```bash
# 检查服务是否运行
curl -s http://localhost:3000/api/actions | head -c 200

# 检查数据库
pg_isready
```

### Q: Action 列表为空
```bash
# 确认已执行 seed
NODE_OPTIONS="" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
p.actionItem.count().then(c => { console.log('Actions:', c); p.\$disconnect(); });
"
```

### Q: 权限不生效
- 确认 Cookie 已正确设置（F12 → Application → Cookies → localhost）
- 确认 `rd_dev_role` 值拼写正确（区分大小写）
- 设置 Cookie 后必须 `location.reload()`

### Q: Drawer 打不开或数据不完整
- 检查 Network 面板中 `/api/actions/:id` 请求
- 确认返回的 JSON 中包含 `activity` 数组

---

## 五、演示后清理

```bash
# 停止 dev server: Ctrl+C

# 如需完全清除数据库:
NODE_OPTIONS="" npx prisma db push --force-reset --accept-data-loss

# 停止 PostgreSQL（可选）:
sudo pg_ctlcluster 16 main stop
```

---

## 六、备选方案

如果现场出现严重问题：
1. **截图模式**：14 张 Final Lock 截图完整覆盖全部功能路径
2. **Word 报告**：自检报告含全部截图，可离线展示
3. **口述传达**：核心价值 + 截图即可讲清楚产品定位

---

> 版本：v1.0 | 日期：2026-06-27 | 分支：agent/workbuddy/phase-7
