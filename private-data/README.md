# private-data/

此目录存放理然内部真实资料，**不提交到公开 Git 仓库**。

## 目录结构

```
private-data/
├── README.md              # 本文档
├── ui-reference/          # UI 参考图片（不提交）
├── internal-docs/         # 内部业务文档（不提交）
└── seed-data/             # 内部 seed 数据（不提交）
```

## 使用规则

1. 真实岗位名称 / JD / 职级 → 可放入 `seed-data/`，通过 `prisma/seed.internal.ts` 导入
2. 真实候选人数据 → 不放入任何文件，通过 Phase 8 Imports 模块导入 PostgreSQL
3. 候选人隐私（手机号/邮箱/简历/薪资）→ 禁止硬编码
4. UI 参考图片 → `ui-reference/`，仅供设计参考

## 安全

- `.gitignore` 已配置 `private-data/*`（仅保留 README.md）
- `prisma/seed.internal.ts` 已加入 `.gitignore`
- 公开仓库不包含任何理然内部敏感数据
