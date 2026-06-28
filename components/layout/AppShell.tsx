import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { CopilotProvider } from "@/components/domain/ai/copilot/CopilotContext";
import { UniversalCopilotPanel } from "@/components/domain/ai/copilot/UniversalCopilotPanel";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <CopilotProvider>
      <div className="flex h-screen overflow-hidden">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Topbar />
          <main className="flex-1 overflow-auto bg-[var(--color-surface-secondary)] p-6">
            {children}
          </main>
        </div>
      </div>
      <UniversalCopilotPanel />
    </CopilotProvider>
  );
}
