export function PermissionDenied({
  message = "您没有权限访问此页面",
}: {
  message?: string;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-3 text-4xl">🔒</div>
      <h3 className="text-sm font-medium text-[var(--color-text-primary)]">
        权限不足
      </h3>
      <p className="mt-1 text-sm text-[var(--color-text-secondary)] max-w-sm">
        {message}
      </p>
    </div>
  );
}
