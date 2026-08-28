import { cn } from "./cn";

export function Avatar({ initials, className }: { initials: string; className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex h-[30px] w-[30px] flex-none items-center justify-center rounded-full bg-tint text-[11.5px] font-semibold text-primary",
        className,
      )}
    >
      {initials}
    </span>
  );
}
