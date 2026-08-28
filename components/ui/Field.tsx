import { type InputHTMLAttributes, forwardRef } from "react";
import { cn } from "./cn";

/**
 * A styled text input component.
 * @param className - Optional additional CSS classes
 * @param props - Standard HTML input attributes
 * @returns A styled input element
 */
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

/**
 * Wraps its input/select/textarea in a real <label> — no id plumbing required.
 * @param label - The label text to display above the input
 * @param className - Optional additional CSS classes
 * @param children - The input, select, or textarea element to wrap
 * @returns A labeled field component
 */
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
