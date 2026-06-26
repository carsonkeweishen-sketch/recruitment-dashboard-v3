# CEO Demo 重置运维手册

> 用途：演示前将环境恢复到干净状态，确保数据一致性和功能完整性
> 执行时间：约 2 分钟 | 风险等级：低

---

## 一、快速重置（推荐）

在 `/workspace/recruitment-dashboard` 目录下执行：

```bash
# 1. 确保 PostgreSQL 运行
pg_isready || sudo pg_ctlcluster 16 main start

# 2. 强制重置 Schema + 数据
NODE_OPTIONS="" npx prisma db push --force-reset --accept-data-loss

# 3. 插入 9 条 CEO Demo 专业业务语义 Action
NODE_OPTIONS="" npx tsx prisma/seed.ts

# 4. 验证数据完整性
NODE_OPTIONS="" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const total = await p.actionItem.count();
  const pending = await p.actionItem.count({ where: { status: 'pending' } });
  const overdue = await p.actionItem.count({ where: { status: 'pending', dueDate: { lt: new Date() } } });
  const urgent = await p.actionItem.count({ where: { priority: 'urgent' } });
  const resolved = await p.actionItem.count({ where: { status: 'resolved' } });
  const dismissed = await p.actionItem.count({ where: { status: 'dismissed' } });
  const activityLogs = await p.activityLog.count();
  console.log(JSON.stringify({ total, pending, overdue, urgent, resolved, dismissed, activityLogs }, null, 2));
  await p.\$disconnect();
})();
"
```

**期望输出**：
```json
{
  "total": 9,
  "pending": 5,
  "overdue": 2,
  "urgent": 1,
  "resolved": 2,
  "dismissed": 2,
  "activityLogs": 4
}
```

---

## 二、逐步重置（排查用）

如果快速重置遇到问题，逐步执行：

### Step 1: 确认 PostgreSQL 状态
```bash
pg_isready
# 期望: /var/run/postgresql:5432 - accepting connections
```

如果失败：
```bash
# 检查 PostgreSQL 服务
sudo systemctl status postgresql

# 启动服务
sudo pg_ctlcluster 16 main start

# 验证端口监听
ss -tlnp | grep 5432
```

### Step 2: 检查 Prisma Schema 同步状态
```bash
NODE_OPTIONS="" npx prisma db push --accept-data-loss
# 期望: Your database is now in sync with your Prisma schema.
```

### Step 3: 清空所有 Action 数据
```bash
NODE_OPTIONS="" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  await p.activityLog.deleteMany();
  await p.actionItem.deleteMany();
  console.log('All actions and activity logs deleted');
  await p.\$disconnect();
})();
"
```

### Step 4: 重新 Seed
```bash
NODE_OPTIONS="" npx tsx prisma/seed.ts
# 期望: Database seeded successfully with 9 action items.
```

### Step 5: 验证
```bash
NODE_OPTIONS="" npx tsx -e "
const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();
(async () => {
  const actions = await p.actionItem.findMany({
    select: { title: true, category: true, priority: true, status: true, dueDate: true },
    orderBy: { createdAt: 'asc' }
  });
  actions.forEach((a, i) => {
    const overdue = a.status === 'pending' && a.dueDate < new Date() ? ' ⚠️逾期' : '';
    console.log(\`\${i+1}. [\${a.priority}][\${a.status}] \${a.title.substring(0, 40)}\${overdue}\`);
  });
  await p.\$disconnect();
})();
"
```

---

## 三、重置后验证清单

| # | 检查项 | 验证方法 | 期望 |
|---|--------|---------|------|
| 1 | Action 总数 | API 或 DB 查询 | 9 |
| 2 | 待处理 Action | `status: 'pending'` | 5 |
| 3 | 逾期 Action | pending + dueDate < now | 2 |
| 4 | 紧急 Action | `priority: 'urgent'` | 1 |
| 5 | 已解决 Action | `status: 'resolved'` | 2 |
| 6 | 已忽略 Action | `status: 'dismissed'` | 2 |
| 7 | ActivityLog 条数 | count | 4（已解决+已忽略的记录） |
| 8 | /api/actions 可访问 | `curl localhost:3000/api/actions` | 200 |
| 9 | /actions 页面可访问 | 浏览器打开 | 正常渲染 |
| 10 | Dev server 运行中 | `curl -s localhost:3000` | HTML 响应 |

---

## 四、常见问题

### Q: `prisma db push --force-reset` 报错
- 确认 DATABASE_URL 环境变量正确
- 确认 PostgreSQL 正在运行（`pg_isready`）
- 检查 `.env` 文件中的数据库连接字符串

### Q: Seed 脚本报 unique constraint 错误
- 必须先执行 `--force-reset`，不能跳过
- 如果之前手动插入过数据，需要先清空

### Q: 验证查询返回数据不一致
- 检查是否有人在演示过程中修改了数据
- 重新执行完整重置流程

---

## 五、回滚方案

如果重置过程中出现问题：

1. **恢复到重置前状态**：无（`--force-reset` 不可逆）
2. **最小化影响**：重置脚本幂等，重新运行即可
3. **应急备选**：使用 14 张 Final Lock 截图进行静态演示

---

> 版本：v1.0 | 日期：2026-06-27 | 分支：agent/workbuddy/phase-7
