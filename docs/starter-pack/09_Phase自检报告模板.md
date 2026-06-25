# 09｜Phase 自检报告模板

> 每个 Phase 完成后必须按此模板输出。

# Phase X 自检报告

## 一、Phase 信息

- Phase：
- 日期：
- 执行范围：
- 本阶段目标：

---

## 二、修改文件清单

| 文件 | 类型 | 说明 |
|---|---|---|

---

## 三、新增文件清单

| 文件 | 类型 | 说明 |
|---|---|---|

---

## 四、范围检查

| 检查项 | 结果 | 说明 |
|---|---:|---|
| 是否修改 API | 是/否 | |
| 是否修改 Schema | 是/否 | |
| 是否修改权限逻辑 | 是/否 | |
| 是否新增业务功能 | 是/否 | |
| 是否新增 mock 数据 | 是/否 | |
| 是否存在真实敏感数据 | 是/否 | |
| 是否替代 Moka | 是/否 | |
| 是否自动决策 | 是/否 | |

---

## 五、构建验证

| 命令 | 结果 |
|---|---|
| pnpm install | |
| pnpm typecheck | |
| pnpm lint | |
| pnpm build | |

---

## 六、数据库验证

如本 Phase 不涉及数据库，写“不涉及”。

| 命令 | 结果 |
|---|---|
| pnpm prisma migrate status | |
| pnpm db:seed | |

---

## 七、权限验证

如本 Phase 不涉及权限，写“不涉及”。

| 角色 | 验证内容 | 结果 |
|---|---|---|

---

## 八、UI 验证

如本 Phase 不涉及 UI，写“不涉及”。

截图清单：

| 截图 | 内容 |
|---|---|

检查：Loading、Empty、Error、PermissionDenied、无 undefined、无 null、无 NaN、无 Invalid Date、无 raw JSON。

---

## 九、Git 状态

```bash
git status
git log --oneline -1
```

- commit hash：
- tag：
- 是否已 push：

---

## 十、已知问题

1.
2.

---

## 十一、结论

- Phase 是否完成：
- 是否建议进入下一 Phase：
- 需要外部审查的问题：
