import { type ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "./cn";

type ButtonVariant = "primary" | "secondary" | "ghost";
type ButtonSize = "default" | "sm";

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  block?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: "bg-primary text-white hover:bg-primary-hover",
  secondary: "bg-surface text-ink border border-border-strong hover:bg-bg",
  ghost: "bg-transparent text-ink-muted hover:bg-tint",
};

const sizeClasses: Record<ButtonSize, string> = {
  default: "px-[18px] py-[10px] text-[13.5px]",
  sm: "px-[13px] py-[7px] text-[12.5px]",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = "primary", size = "default", block, className, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center gap-2 rounded-full font-semibold whitespace-nowrap transition-colors disabled:opacity-50 disabled:pointer-events-none",
          variantClasses[variant],
          sizeClasses[size],
          block && "w-full",
          className,
        )}
        {...props}
      >
        {children}
      </button>
    );
  },
);
Button.displayName = "Button";
