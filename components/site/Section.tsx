import { cn } from "@/components/ui/cn";

/**
 * Shared container width for every public page.
 * @param className - Optional additional CSS classes
 * @param children - Content to display inside the container
 * @returns A centered container with max-width constraints
 */
export function Container({
  className,
  children,
}: {
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div className={cn("mx-auto w-full max-w-[1180px] px-5 md:px-8", className)}>
      {children}
    </div>
  );
}

/**
 * A homepage section: serif h2 + optional subtitle on the left, one optional
 * action (link/button) on the right, then the section body. Vertical rhythm
 * matches DESIGN-SYSTEM.md §4/§16 (roomy on desktop, tight on mobile).
 */
export function Section({
  title,
  subtitle,
  action,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <section className={cn("py-12 md:py-16", className)}>
      <Container>
        <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h2 className="font-serif text-[21px] tracking-[-0.01em] text-ink md:text-[26px]">
              {title}
            </h2>
            {subtitle && (
              <p className="mt-1 text-[13px] text-ink-muted">{subtitle}</p>
            )}
          </div>
          {action && <div className="flex-none">{action}</div>}
        </div>
        {children}
      </Container>
    </section>
  );
}
