/**
 * Loading Skeleton — 统一加载骨架屏
 *
 * 用于数据加载中状态。使用 animate-pulse 实现骨架屏效果。
 * 参考：Linear Loading / Stripe Skeleton / Tremor Skeleton
 */

// design-tokens used via CSS variables in className strings

interface LoadingSkeletonProps {
  /** 行数 */
  rows?: number;
  /** 是否显示标题骨架 */
  showTitle?: boolean;
}

export function LoadingSkeleton({
  rows = 3,
  showTitle = true,
}: LoadingSkeletonProps) {
  return (
    <div className="animate-pulse space-y-4 p-6">
      {showTitle && (
        <div className="h-4 w-1/3 rounded bg-[var(--color-surface-tertiary)]" />
      )}
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded bg-[var(--color-surface-tertiary)]"
          style={{ width: `${85 - i * 15}%` }}
        />
      ))}
    </div>
  );
}
