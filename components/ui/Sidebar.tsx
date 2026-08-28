"use client";

import { useState } from "react";
import { cn } from "./cn";
import { Icon, type IconName } from "./icons";

export interface SidebarItem {
  label: string;
  href: string;
  icon: IconName;
}

/**
 * A collapsible sidebar navigation component with brand header and optional footer items.
 * @param items - Main navigation items to display
 * @param footerItems - Optional items to display in footer section
 * @param activeHref - The currently active route
 * @param brandName - Brand name to display in header (defaults to "Shepherd")
 * @param defaultCollapsed - Whether sidebar starts collapsed
 * @param className - Optional additional CSS classes
 * @returns A sidebar navigation component
 */
export function Sidebar({
  items,
  footerItems,
  activeHref,
  brandName = "Shepherd",
  defaultCollapsed = false,
  className,
}: {
  items: SidebarItem[];
  footerItems?: SidebarItem[];
  activeHref: string;
  brandName?: string;
  defaultCollapsed?: boolean;
  className?: string;
}) {
  const [collapsed, setCollapsed] = useState(defaultCollapsed);

  return (
    <aside
      className={cn(
        "flex h-full flex-col border-r border-border bg-surface transition-[width] duration-150",
        collapsed ? "w-[76px]" : "w-[236px]",
        className,
      )}
    >
      <div className="flex items-center gap-2 p-[14px] pt-5">
        <span className="flex h-8 w-8 flex-none items-center justify-center rounded-[10px] bg-primary text-white">
          <Icon name="gatherings" size={17} strokeWidth={1.8} />
        </span>
        {!collapsed && (
          <span className="font-serif text-[17px] text-ink">{brandName}</span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((c) => !c)}
          className="ml-auto flex h-7 w-7 flex-none items-center justify-center rounded-md text-ink-faint hover:bg-tint hover:text-primary"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <Icon name="collapse" size={16} />
        </button>
      </div>

      <nav className="flex flex-1 flex-col gap-1 px-[14px]">
        {items.map((item) => (
          <SidebarLink key={item.href} item={item} active={item.href === activeHref} collapsed={collapsed} />
        ))}
      </nav>

      {footerItems && (
        <div className="mt-auto flex flex-col gap-1 border-t border-border px-[14px] py-[14px]">
          {footerItems.map((item) => (
            <SidebarLink key={item.href} item={item} active={item.href === activeHref} collapsed={collapsed} />
          ))}
        </div>
      )}
    </aside>
  );
}

/**
 * Renders a single navigation link within the sidebar.
 * @param item - The sidebar item containing label, href, and icon
 * @param active - Whether this link is currently active
 * @param collapsed - Whether the sidebar is in collapsed state
 * @returns A styled navigation link
 */
function SidebarLink({
  item,
  active,
  collapsed,
}: {
  item: SidebarItem;
  active: boolean;
  collapsed: boolean;
}) {
  return (
    <a
      href={item.href}
      className={cn(
        "flex items-center gap-3 rounded-[10px] px-3 py-[9px] text-[13px] font-medium",
        collapsed && "justify-center px-0",
        active ? "bg-tint font-semibold text-primary" : "text-ink-muted hover:bg-bg",
      )}
    >
      <Icon name={item.icon} size={17} />
      {!collapsed && <span>{item.label}</span>}
    </a>
  );
}
