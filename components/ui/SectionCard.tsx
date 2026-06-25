export function SectionCard({
  title,
  children,
  className,
}: {
  title?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-lg border border-[var(--color-border)] bg-[var(--color-surface)] p-5 ${className ?? ""}`}
    >
      {title && (
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-text-primary)]">
          {title}
        </h3>
      )}
      {children}
    </div>
  );
}
