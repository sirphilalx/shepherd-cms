import { cn } from "./cn";

export type BadgeStatus = "success" | "warning" | "danger" | "info" | "neutral";

const statusClasses: Record<BadgeStatus, string> = {
  success: "bg-success-bg text-success-text",
  warning: "bg-warning-bg text-warning-text",
  danger: "bg-danger-bg text-danger-text",
  info: "bg-info-bg text-info-text",
  neutral: "bg-tint text-primary",
};

/**
 * Displays a colored badge with rounded styling based on status.
 * @param status - The status type that determines badge color (success, warning, danger, info, neutral)
 * @param className - Optional additional CSS classes
 * @param children - Content to display inside the badge
 * @returns A styled badge component
 */
export function Badge({
  status = "neutral",
  className,
  children,
}: {
  status?: BadgeStatus;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-[10px] py-[4px] text-[11.5px] font-semibold",
        statusClasses[status],
        className,
      )}
    >
      {children}
    </span>
  );
}
