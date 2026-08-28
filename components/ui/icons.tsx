import {
  LayoutGrid,
  UserCheck,
  BarChart3,
  Users,
  Package,
  Calendar,
  FileText,
  Church,
  Settings,
  Home,
  BookOpen,
  Download,
  Flag,
  Mail,
  Search,
  Bell,
  Check,
  Plus,
  PanelLeft,
  type LucideIcon,
  type LucideProps,
} from "lucide-react";

export const icons = {
  dashboard: LayoutGrid,
  attendance: UserCheck,
  headcount: BarChart3,
  members: Users,
  zones: Package,
  schedule: Calendar,
  content: FileText,
  gatherings: Church,
  settings: Settings,
  home: Home,
  book: BookOpen,
  download: Download,
  flag: Flag,
  mail: Mail,
  search: Search,
  bell: Bell,
  check: Check,
  plus: Plus,
  collapse: PanelLeft,
} satisfies Record<string, LucideIcon>;

export type IconName = keyof typeof icons;

/**
 * Renders a Lucide icon by name with consistent styling.
 * @param name - The icon name from the icons registry
 * @param size - Icon size in pixels (defaults to 16)
 * @param strokeWidth - Stroke width for the icon (defaults to 1.7)
 * @param props - Additional Lucide icon props
 * @returns A styled icon component
 */
export function Icon({
  name,
  size = 16,
  strokeWidth = 1.7,
  ...props
}: { name: IconName } & LucideProps) {
  const Component = icons[name];
  return <Component size={size} strokeWidth={strokeWidth} {...props} />;
}
