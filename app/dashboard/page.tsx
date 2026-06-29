import { AiRecruitmentDashboard } from "@/components/domain/dashboard/AiRecruitmentDashboard";
import { RuntimeProofBadge } from "@/components/domain/dashboard/RuntimeProofBadge";

export const metadata = {
  title: "AI 招聘洞察看板",
  description: "基于招聘过程数据，辅助识别招聘风险、流程卡点和优先处理事项。系统仅提供辅助洞察，不替代 HR 或业务做录用、淘汰和阶段推进决策。",
};

export default function DashboardPage() {
  return (
    <>
      <RuntimeProofBadge />
      <AiRecruitmentDashboard />
    </>
  );
}
