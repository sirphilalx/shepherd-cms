import { cn } from "./cn";

export function KpiCard({
  variant = "light",
  label,
  value,
  trend,
  className,
}: {
  variant?: "dark" | "light";
  label: string;
  value: string | number;
  trend?: string;
  className?: string;
}) {
  const dark = variant === "dark";
  return (
    <div
      className={cn(
        "rounded-lg p-5",
        dark ? "bg-primary text-white" : "bg-surface text-ink shadow-card",
        className,
      )}
    >
      <div
        className={cn(
          "text-[12.5px] font-semibold",
          dark ? "text-white/85" : "text-ink-muted",
        )}
      >
        {label}
      </div>
      <div className="mt-2 font-serif text-[32px] tabular-nums leading-none">{value}</div>
      {trend && (
        <div className={cn("mt-2 text-[11.5px]", dark ? "text-[#CFE1D5]" : "text-ink-muted")}>
          {trend}
        </div>
      )}
    </div>
  );
}
