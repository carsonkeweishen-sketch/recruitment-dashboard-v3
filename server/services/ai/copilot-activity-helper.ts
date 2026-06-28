// Phase 8.11: Copilot Activity Log Helper
// 9 种 ActivityLog 封装，全部 try/catch 非阻断

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { Pool } from "pg";

let _prisma: PrismaClient | null = null;
function getPrisma(): PrismaClient {
  if (!_prisma) {
    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    _prisma = new PrismaClient({ adapter: new PrismaPg(pool) });
  }
  return _prisma;
}

// 9 种 ActivityLog action 常量
export const COPILOT_ACTIVITIES = {
  SESSION_CREATED: "AI_COPILOT_SESSION_CREATED",
  CONTEXT_BUILT: "AI_COPILOT_CONTEXT_BUILT",
  ANSWER_GENERATED: "AI_COPILOT_ANSWER_GENERATED",
  NO_EVIDENCE: "AI_COPILOT_NO_EVIDENCE",
  REVIEW_ACCEPTED: "AI_COPILOT_REVIEW_ACCEPTED",
  REVIEW_EDITED: "AI_COPILOT_REVIEW_EDITED",
  REVIEW_REJECTED: "AI_COPILOT_REVIEW_REJECTED",
  DRAFT_ACTION_CREATED: "AI_COPILOT_DRAFT_ACTION_CREATED",
  DRAFT_ACTION_CONFIRMED: "AI_COPILOT_DRAFT_ACTION_CONFIRMED",
} as const;

/**
 * 写入 ActivityLog（非阻断）
 * 失败时只 console.warn，不抛异常
 */
export async function logCopilotActivity(
  userId: string,
  action: string,
  resourceType: string,
  resourceId: string,
  detail?: Record<string, unknown>,
): Promise<void> {
  try {
    await getPrisma().activityLog.create({
      data: {
        actorId: userId,
        action,
        resourceType,
        resourceId,
        detail: (detail || {}) as any,
      },
    });
  } catch {
    // Activity log is non-critical; ignore FK errors in dev
    console.warn(`[CopilotActivity] Failed to log ${action} for ${resourceType}:${resourceId}`);
  }
}

/**
 * 人话化文案生成
 */
export function humanReadableActivity(
  action: string,
  detail: Record<string, unknown>,
  userName?: string,
): string {
  const who = userName || "用户";
  switch (action) {
    case COPILOT_ACTIVITIES.SESSION_CREATED:
      return `${who} 在 ${detail.moduleKey || ""} 模块发起了 AI Copilot 会话`;
    case COPILOT_ACTIVITIES.CONTEXT_BUILT:
      return `系统基于 ${detail.sourceCount || 0} 条授权证据构建了 AI 上下文`;
    case COPILOT_ACTIVITIES.ANSWER_GENERATED:
      return `AI 生成了辅助建议（${detail.provider || ""} / ${detail.model || ""}）`;
    case COPILOT_ACTIVITIES.NO_EVIDENCE:
      return `当前上下文证据不足，AI 未生成建议（缺失来源：${(detail.missingSources as string[])?.join("、") || "未知"}）`;
    case COPILOT_ACTIVITIES.REVIEW_ACCEPTED:
      return `${who} 接受了 AI 辅助建议`;
    case COPILOT_ACTIVITIES.REVIEW_EDITED:
      return `${who} 编辑后接受了 AI 辅助建议`;
    case COPILOT_ACTIVITIES.REVIEW_REJECTED:
      return `${who} 忽略了 AI 辅助建议`;
    case COPILOT_ACTIVITIES.DRAFT_ACTION_CREATED:
      return `AI 生成了行动草稿：${detail.title || ""}`;
    case COPILOT_ACTIVITIES.DRAFT_ACTION_CONFIRMED:
      return `${who} 确认了 AI 生成的行动草稿：${detail.title || ""}`;
    default:
      return `${who} 执行了 ${action}`;
  }
}
