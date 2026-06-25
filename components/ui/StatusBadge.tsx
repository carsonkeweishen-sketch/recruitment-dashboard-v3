type BadgeVariant = "default" | "success" | "warning" | "danger";

const variantStyles: Record<BadgeVariant, string> = {
  default: "bg-[var(--color-surface-tertiary)] text-[var(--color-text-secondary)]",
  success: "bg-[var(--color-success-light)] text-[var(--color-success)]",
  warning: "bg-[var(--color-warning-light)] text-[var(--color-warning)]",
  danger: "bg-[var(--color-danger-light)] text-[var(--color-danger)]",
};

export function StatusBadge({
  label,
  variant = "default",
}: {
  label: string;
  variant?: BadgeVariant;
}) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${variantStyles[variant]}`}
    >
      {label}
    </span>
  );
}
