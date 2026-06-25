export function ErrorState({
  title = "加载失败",
  description = "请稍后重试或联系管理员",
  onRetry,
}: {
  title?: string;
  description?: string;
  onRetry?: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-4xl">⚠️</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
        {title}
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-sm">
        {description}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-4 rounded-md bg-[var(--color-primary)] px-4 py-2 text-sm font-medium text-white hover:bg-[var(--color-primary-hover)] transition-colors"
        >
          重试
        </button>
      )}
    </div>
  );
}
