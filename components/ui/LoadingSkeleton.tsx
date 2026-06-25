export function LoadingSkeleton() {
  return (
    <div className="animate-pulse space-y-4 p-6">
      <div className="h-4 w-1/3 rounded bg-[var(--color-surface-tertiary)]" />
      <div className="h-8 w-1/2 rounded bg-[var(--color-surface-tertiary)]" />
      <div className="space-y-2">
        <div className="h-3 rounded bg-[var(--color-surface-tertiary)]" />
        <div className="h-3 rounded bg-[var(--color-surface-tertiary)]" />
        <div className="h-3 w-2/3 rounded bg-[var(--color-surface-tertiary)]" />
      </div>
    </div>
  );
}
