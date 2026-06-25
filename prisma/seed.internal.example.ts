// Phase 2 Internal Seed Example — 理然真实数据种子
// 
// ⚠️ 此文件仅作示例，不提交到 Git。
//    真实 seed.internal.ts 包含理然真实岗位、部门、候选人等内部数据。
//
// 使用方法:
//   1. 复制此文件为 prisma/seed.internal.ts
//   2. 填入理然真实业务数据（岗位/部门/用户等）
//   3. 候选人数据必须脱敏（虚拟手机号、example.com 邮箱）
//   4. 运行: pnpm tsx prisma/seed.internal.ts
//
// 禁止提交 prisma/seed.internal.ts 到公开仓库。

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Internal seed placeholder — 理然真实数据");

  // 示例: 真实部门
  // await prisma.department.create({ data: { name: "真实部门名", code: "REAL" } });

  // 示例: 真实用户
  // await prisma.user.create({ data: { name: "真实姓名", email: "real@liran.com", role: "recruiter" } });

  console.log("✅ Internal seed placeholder done.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
