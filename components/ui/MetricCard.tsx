export function MetricCard({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: string;
  subtitle?: string;
}) {
  return (
    <div className="rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-4">
      <div className="text-xs font-medium text-[var(--color-text-tertiary)] uppercase tracking-wider">
        {title}
      </div>
      <div className="mt-1 text-2xl font-semibold text-[var(--color-text-primary)]">
        {value}
      </div>
      {subtitle && (
        <div className="mt-1 text-xs text-[var(--color-text-secondary)]">
          {subtitle}
        </div>
      )}
    </div>
  );
}
