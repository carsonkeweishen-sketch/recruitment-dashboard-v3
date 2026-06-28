// Phase 8.11: GET /api/ai/copilot/suggestions — Prompt starters per module
import { getSession } from "@/server/auth/session";
import { requirePermission } from "@/server/permissions/check-permission";

const MODULE_SUGGESTIONS: Record<string, string[]> = {
  dashboard: ["今日最需要关注的风险是什么？", "哪些岗位招聘进度最滞后？", "有哪些未处理的行动项？"],
  jobs: ["这个岗位的画像有什么缺口？", "面试官应该关注哪些核心能力？", "JD 有哪些可以优化的地方？"],
  candidates: ["这个候选人的面试反馈如何？", "候选人有哪些风险信号？", "候选人适合哪些岗位？"],
  interviews: ["面评证据是否充分？", "下一轮应该追问哪些问题？", "面试官反馈质量如何？"],
  "offer-risks": ["这个风险如何缓释？", "closing 沟通建议是什么？", "候选人可能有哪些顾虑？"],
  actions: ["这个行动项如何处理？", "处理建议是什么？", "关闭说明草稿是什么？"],
  funnel: ["哪个阶段是瓶颈？", "渠道转化有什么问题？", "停留时长异常在哪？"],
  knowledge: ["岗位画像标准是什么？", "面试评估标准有哪些？", "公司招聘流程是什么？"],
  media: ["面试转写分析结果如何？", "STAR 结构完整度如何？", "追问质量有什么改进建议？"],
};

export async function GET(request: Request) {
  const session = await getSession();
  if (!session.userId) return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
  const ctx = { role: session.role, userId: session.userId, departmentId: session.departmentId || undefined };
  try { requirePermission(ctx, "aiAssistant", "analyze"); } catch { return Response.json({ success: false, error: "暂无权限" }, { status: 403 }); }
  const url = new URL(request.url);
  const moduleKey = url.searchParams.get("moduleKey") || "dashboard";
  return Response.json({ success: true, data: MODULE_SUGGESTIONS[moduleKey] || MODULE_SUGGESTIONS.dashboard });
}
