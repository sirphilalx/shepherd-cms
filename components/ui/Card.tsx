import { cn } from "./cn";

/**
 * A container card component with optional shadow or flat styling.
 * @param className - Optional additional CSS classes
 * @param flat - If true, uses flat tint fill instead of shadow (for nested cards)
 * @param children - Content to display inside the card
 * @returns A styled card component
 */
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

/**
 * A header section for cards with title, optional subtitle, and optional action button.
 * @param title - The main heading text
 * @param subtitle - Optional descriptive text below the title
 * @param action - Optional action button or element to display on the right
 * @param className - Optional additional CSS classes
 * @returns A styled card header component
 */
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
