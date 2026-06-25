import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Phase 0: 仅创建系统管理员用户
  await prisma.user.upsert({
    where: { email: "admin@recruitment-dashboard.local" },
    update: {},
    create: {
      email: "admin@recruitment-dashboard.local",
      name: "System Admin",
    },
  });

  console.log("✅ Seed completed.");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
