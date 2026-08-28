import { cn } from "./cn";
import { Icon, type IconName } from "./icons";

export interface BottomNavItem {
  label: string;
  href: string;
  icon: IconName;
}

export function BottomNav({
  items,
  activeHref,
  className,
}: {
  items: BottomNavItem[];
  activeHref: string;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex items-center justify-around border-t border-border bg-surface py-2",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.href === activeHref;
        return (
          <a
            key={item.href}
            href={item.href}
            className={cn(
              "flex flex-col items-center gap-1 px-2",
              active ? "text-primary" : "text-ink-faint",
            )}
          >
            <Icon name={item.icon} size={19} />
            <span className="text-[9.5px] font-medium">{item.label}</span>
          </a>
        );
      })}
    </nav>
  );
}
