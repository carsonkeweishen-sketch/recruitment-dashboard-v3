import { SectionCard } from "@/components/ui/SectionCard";
import { StatusBadge } from "@/components/ui/StatusBadge";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Hero */}
      <SectionCard>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-[var(--color-text-primary)]">
              Recruitment Dashboard v3
            </h2>
            <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-lg">
              智能招聘 AI 看板 — 招聘效率分析、岗位卡点诊断、候选人全链路管理、
              面试质量评估、Offer 风险提醒
            </p>
          </div>
          <StatusBadge label="Phase 1 · 权限与角色" variant="default" />
        </div>
      </SectionCard>

      {/* Tech Stack */}
      <SectionCard title="技术栈">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            { label: "框架", value: "Next.js 16" },
            { label: "语言", value: "TypeScript 5" },
            { label: "样式", value: "Tailwind CSS 4" },
            { label: "数据库", value: "PostgreSQL" },
            { label: "ORM", value: "Prisma 7" },
            { label: "认证", value: "NextAuth.js" },
            { label: "包管理", value: "pnpm" },
            { label: "Git 托管", value: "GitHub" },
          ].map((tech) => (
            <div
              key={tech.label}
              className="rounded-md border border-[var(--color-border)] px-3 py-2"
            >
              <div className="text-xs text-[var(--color-text-tertiary)]">
                {tech.label}
              </div>
              <div className="text-sm font-medium text-[var(--color-text-primary)]">
                {tech.value}
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* System Boundary */}
      <SectionCard title="系统边界">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-success)] mb-2">
              做什么
            </h4>
            <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
              <li>· 招聘效率分析与漏斗诊断</li>
              <li>· 候选人全链路管理</li>
              <li>· 面试质量评估与结构化反馈</li>
              <li>· Offer 风险提醒与入职前承接</li>
              <li>· 协同 Action 任务中心</li>
              <li>· AI 辅助分析（Phase 10）</li>
              <li>· 周报复盘（Phase 11）</li>
              <li>· 面试官赋能（Phase 13）</li>
            </ul>
          </div>
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-[var(--color-danger)] mb-2">
              不做什么
            </h4>
            <ul className="space-y-1 text-sm text-[var(--color-text-secondary)]">
              <li>· 不替代 Moka / ATS</li>
              <li>· 不发 Offer / 不做审批</li>
              <li>· 不做薪酬 / 合同 / 入职</li>
              <li>· 不自动录用 / 淘汰 / 推进</li>
              <li>· 不做 AI 自动决策</li>
            </ul>
          </div>
        </div>
      </SectionCard>

      {/* Phase Plan */}
      <SectionCard title="Phase 规划">
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {[
            { phase: "0", name: "工程底座", status: "done" },
            { phase: "1", name: "权限与角色", status: "current" },
            { phase: "2", name: "核心数据模型", status: "pending" },
            { phase: "3", name: "岗位管理", status: "pending" },
            { phase: "4", name: "候选人链路", status: "pending" },
            { phase: "5", name: "筛选反馈", status: "pending" },
            { phase: "6", name: "面试反馈", status: "pending" },
            { phase: "7", name: "协同 Action", status: "pending" },
            { phase: "8", name: "数据导入", status: "pending" },
            { phase: "9", name: "Offer 风险", status: "pending" },
            { phase: "10", name: "AI 分析", status: "pending" },
            { phase: "11", name: "周报复盘", status: "pending" },
            { phase: "12", name: "Design System", status: "pending" },
            { phase: "13", name: "面试官赋能", status: "pending" },
          ].map((p) => (
            <div
              key={p.phase}
              className={`rounded-md border px-3 py-2 ${
                  p.status === "done"
                    ? "border-[var(--color-success)] bg-[var(--color-success-light)]"
                    : p.status === "current"
                    ? "border-[var(--color-primary)] bg-[var(--color-primary-light)]"
                    : "border-[var(--color-border)]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span
                  className={`text-xs font-bold ${
                    p.status === "done"
                      ? "text-[var(--color-success)]"
                      : p.status === "current"
                        ? "text-[var(--color-primary)]"
                        : "text-[var(--color-text-tertiary)]"
                  }`}
                >
                  P{p.phase}
                </span>
                <span className="text-sm text-[var(--color-text-secondary)]">
                  {p.name}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
