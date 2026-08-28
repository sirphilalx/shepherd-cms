import { Badge, type BadgeStatus } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Avatar } from "@/components/ui/Avatar";
import { Card, CardHead } from "@/components/ui/Card";
import { KpiCard } from "@/components/ui/KpiCard";
import { Field, Input } from "@/components/ui/Field";
import { Table } from "@/components/ui/Table";
import { Sidebar, type SidebarItem } from "@/components/ui/Sidebar";
import { BottomNav } from "@/components/ui/BottomNav";
import { Icon, icons, type IconName } from "@/components/ui/icons";

const navItems: SidebarItem[] = [
  { label: "Dashboard", href: "#dashboard", icon: "dashboard" },
  { label: "Attendance", href: "#attendance", icon: "attendance" },
  { label: "Headcount", href: "#headcount", icon: "headcount" },
  { label: "Membership", href: "#membership", icon: "members" },
  { label: "Zones & Ministries", href: "#zones", icon: "zones" },
  { label: "Worship Schedule", href: "#schedule", icon: "schedule" },
  { label: "Content Review", href: "#content", icon: "content" },
  { label: "Gatherings", href: "#gatherings", icon: "gatherings" },
];

const footerItems: SidebarItem[] = [
  { label: "Settings", href: "#settings", icon: "settings" },
  { label: "Help Center", href: "#help", icon: "book" },
];

const bottomNavItems = navItems.slice(0, 5);

const statuses: BadgeStatus[] = ["success", "warning", "danger", "info", "neutral"];

const colorSwatches: { name: string; className: string; hex: string }[] = [
  { name: "bg", className: "bg-bg", hex: "#F6F4EF" },
  { name: "surface", className: "bg-surface", hex: "#FFFFFF" },
  { name: "primary", className: "bg-primary", hex: "#12362C" },
  { name: "primary-hover", className: "bg-primary-hover", hex: "#0C281F" },
  { name: "tint", className: "bg-tint", hex: "#E5EEE7" },
  { name: "tint-strong", className: "bg-tint-strong", hex: "#CFE1D5" },
  { name: "accent", className: "bg-accent", hex: "#3E7A64" },
  { name: "ink", className: "bg-ink", hex: "#161E1A" },
  { name: "ink-muted", className: "bg-ink-muted", hex: "#68716B" },
  { name: "ink-faint", className: "bg-ink-faint", hex: "#9AA29B" },
  { name: "border", className: "bg-border", hex: "#E7E3D9" },
  { name: "border-strong", className: "bg-border-strong", hex: "#D9D4C6" },
];

type MemberRow = { id: number; name: string; initials: string; zone: string; role: string };

const memberRows: MemberRow[] = [
  { id: 1, name: "Chiamaka Eze", initials: "CE", zone: "Zone 1", role: "Member" },
  { id: 2, name: "Tamuno Wobo", initials: "TW", zone: "Zone 2", role: "Usher" },
];

function SectionCard({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="mb-6">
      <div className="mb-[18px]">
        <h2 className="font-serif text-xl text-ink">{title}</h2>
        <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>
      </div>
      {children}
    </Card>
  );
}

export default function DesignSystemPage() {
  return (
    <div className="mx-auto max-w-[1100px] px-4 py-8 md:px-6 md:py-12">
      <div className="mb-8">
        <h1 className="font-serif text-[34px] text-ink">Shepherd design system</h1>
        <p className="mt-2 text-sm text-ink-muted">
          Live reference — every token and component rendered from the real app stylesheet
          and components. Written companion: design/DESIGN-SYSTEM.md
        </p>
      </div>

      <SectionCard title="Color" subtitle="Core palette, ink scale, and status pairs.">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <div className="mb-3 text-[15px] font-semibold text-ink">Core & structure</div>
            <div className="flex flex-col gap-[10px]">
              {colorSwatches.map((s) => (
                <div key={s.name} className="flex items-center gap-[14px]">
                  <div className={`h-[52px] w-[52px] flex-none rounded-md border border-border ${s.className}`} />
                  <div>
                    <div className="text-[13px] font-semibold text-ink">{s.name}</div>
                    <div className="font-mono text-[11.5px] text-ink-muted">{s.hex}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="mb-3 text-[15px] font-semibold text-ink">Status pairs</div>
            <div className="flex flex-col gap-[10px]">
              {statuses.map((status) => (
                <div key={status} className="flex items-center gap-[10px]">
                  <Badge status={status}>{status[0].toUpperCase() + status.slice(1)}</Badge>
                </div>
              ))}
            </div>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Typography" subtitle="Inter for UI, Newsreader for display and numbers.">
        <h1 className="font-serif text-[46px] text-ink">Hero H1 · 46px Newsreader</h1>
        <h2 className="mt-[18px] font-serif text-[26px] text-ink">Section H2 · 26px Newsreader</h2>
        <h3 className="mt-4 font-serif text-lg text-ink">Card H3 · 18px Newsreader</h3>
        <div className="mt-4 font-serif text-[32px] tabular-nums text-ink">287 · KPI value, tabular nums</div>
        <p className="mt-4 text-sm text-ink">
          Body text · 14px Inter regular. The quick brown fox jumps over the lazy dog.
        </p>
        <p className="mt-2 text-[12.5px] text-ink-muted">Muted caption · 12.5px Inter</p>
        <div className="mt-3 text-[11px] font-bold tracking-[0.05em] text-ink-faint uppercase">
          Uppercase label · 11px, 0.05em tracking
        </div>
      </SectionCard>

      <SectionCard title="Elevation" subtitle="Two-layer shadows only — a tight contact shadow plus a soft ambient one.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="rounded-lg bg-surface p-6 text-center text-xs text-ink-muted shadow-card">
            shadow-card · default for every card
          </div>
          <div className="rounded-lg bg-surface p-6 text-center text-xs text-ink-muted shadow-pop">
            shadow-pop · modals & popovers
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Buttons" subtitle="Pill radius always. Exactly one primary button per screen region.">
        <div className="mb-[14px] flex flex-wrap items-center gap-3">
          <Button variant="primary">
            <Icon name="check" size={14} />
            Primary
          </Button>
          <Button variant="secondary">Secondary</Button>
          <Button variant="ghost">Ghost</Button>
          <Button variant="primary" size="sm">
            <Icon name="plus" size={13} />
            Small
          </Button>
        </div>
        <Button variant="primary" block>
          Block width
        </Button>
      </SectionCard>

      <SectionCard title="KPI cards" subtitle="One dark card marks the headline metric; the rest stay light.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <KpiCard variant="dark" label="Members, church-wide" value={287} trend="↑ +6 this quarter" />
          <KpiCard variant="light" label="Attendance today" value="81%" trend="↑ 3.2pt vs last Sunday" />
          <KpiCard variant="light" label="Content in review" value={5} trend="↓ 2 overdue" />
        </div>
      </SectionCard>

      <SectionCard title="Forms" subtitle="Labeled inputs, two-column rows on desktop.">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Full name">
            <Input placeholder="e.g. Peace Amadi" />
          </Field>
          <Field label="Phone number">
            <Input placeholder="+234 803 000 0000" />
          </Field>
        </div>
      </SectionCard>

      <SectionCard
        title="Tables"
        subtitle="Real table on desktop; converts to stacked label/value rows on mobile."
      >
        <Card flat>
          <CardHead title="Example" />
          <Table<MemberRow>
            columns={[
              {
                header: "Name",
                cell: (row) => (
                  <span className="flex items-center gap-[10px]">
                    <Avatar initials={row.initials} />
                    {row.name}
                  </span>
                ),
              },
              { header: "Zone", cell: (row) => row.zone },
              { header: "Role", cell: (row) => row.role },
              { header: "Status", cell: () => <Badge status="success">Active</Badge> },
            ]}
            rows={memberRows}
          />
        </Card>
      </SectionCard>

      <SectionCard title="Iconography" subtitle="Outline style, 1.7 stroke, currentColor. 16px default.">
        <div className="flex flex-wrap gap-4">
          {(Object.keys(icons) as IconName[])
            .filter((name) => name !== "collapse")
            .map((name) => (
              <div key={name} className="text-center">
                <div className="mx-auto mb-[6px] flex h-10 w-10 items-center justify-center rounded-[10px] bg-tint text-primary">
                  <Icon name={name} />
                </div>
                <span className="text-[10px] text-ink-muted">{name}</span>
              </div>
            ))}
        </div>
      </SectionCard>

      <SectionCard title="Sidebar navigation" subtitle="236px expanded, 76px collapsed — same component, both states.">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="h-[420px] flex-1 overflow-hidden rounded-2xl border border-border">
            <Sidebar items={navItems} footerItems={footerItems} activeHref="#dashboard" />
          </div>
          <div className="h-[420px] flex-1 overflow-hidden rounded-2xl border border-border">
            <Sidebar items={navItems} footerItems={footerItems} activeHref="#dashboard" defaultCollapsed />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Bottom navigation" subtitle="Mobile tab bar — fixed to the bottom of the frame.">
        <div className="mx-auto max-w-[390px] overflow-hidden rounded-2xl border border-border">
          <BottomNav items={bottomNavItems} activeHref="#dashboard" />
        </div>
      </SectionCard>
    </div>
  );
}
