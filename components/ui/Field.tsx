import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "./cn";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "w-full rounded-[10px] border border-border-strong bg-surface px-3 py-[10px] text-[13px] text-ink placeholder:text-ink-faint focus:outline-none focus:ring-2 focus:ring-primary/30",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

/** Wraps its input/select/textarea in a real <label> — no id plumbing required. */
export function Field({
  label,
  className,
  children,
}: {
  label: string;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <label className={cn("flex flex-col gap-[6px]", className)}>
      <span className="text-[12px] font-semibold text-ink-muted">{label}</span>
      {children}
    </label>
  );
}
