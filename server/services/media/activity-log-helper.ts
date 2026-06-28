// Phase 8.10: Media Activity Log Helper
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter: new PrismaPg(pool) });

export async function logMediaActivity(
  actorId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  detail?: object
): Promise<void> {
  await prisma.activityLog.create({
    data: {
      actorId,
      action,
      resourceType,
      resourceId,
      detail: detail ?? {},
    },
  });
}
