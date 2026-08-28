import { cn } from "./cn";

export function Card({
  className,
  flat,
  children,
}: {
  className?: string;
  /** A card nested inside another card never carries its own shadow — flat tint fill instead. */
  flat?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "rounded-lg p-4 md:p-[22px]",
        flat ? "bg-tint" : "bg-surface shadow-card",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function CardHead({
  title,
  subtitle,
  action,
  className,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("mb-4 flex items-start justify-between gap-3", className)}>
      <div>
        <div className="text-[15px] font-semibold text-ink">{title}</div>
        {subtitle && <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
