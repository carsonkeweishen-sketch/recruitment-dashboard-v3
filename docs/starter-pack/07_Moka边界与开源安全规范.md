# 07｜Moka 边界与开源安全规范

## 1. Moka 边界

本系统不替代 Moka。

不做：Offer 发放、Offer 审批、薪酬审批、合同、入职手续、ATS 主流程替代、候选人正式状态写回 Moka、Moka API 强绑定。

只做：招聘效率分析、漏斗与卡点诊断、面试质量分析、Offer 风险提醒、入职前承诺台账、Action 协同、AI 辅助判断、周报复盘、人才池沉淀。

---

## 2. 开源安全

禁止提交：`.env`、API Key、真实数据库地址、真实候选人简历、真实手机号、真实邮箱、身份证号、真实薪资明细、公司内部敏感资料、seed.internal.ts、private-data/。

必须提交：`.env.example`、demo seed、README、SETUP、MOKA_BOUNDARY、ROLE_PERMISSIONS、AI_USAGE、UI_GUIDELINES。

---

## 3. gitignore 必须包含

```gitignore
.env
.env.local
.env.*.local
private-data/
prisma/seed.internal.ts
*.key
*.pem
.DS_Store
node_modules/
.next/
```

---

## 4. demo seed 原则

允许：真实感中文姓名、虚拟岗位、虚拟部门、虚拟邮箱域名、虚拟手机号、虚拟面试记录。

禁止：真实候选人、真实手机号、真实邮箱、真实简历、真实薪资、内部评价原文。

---

## 5. 最终发布前检查

```bash
grep -r "sk-" .
grep -r "OPENAI_API_KEY" .
grep -r "138" prisma app components server
grep -r "#[0-9A-Fa-f]\{6\}" app components
pnpm typecheck
pnpm lint
pnpm build
```
