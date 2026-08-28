import { Container } from "./Section";

export function SiteFooter() {
  return (
    <footer className="border-t border-border py-8">
      <Container className="flex flex-col gap-2 text-[12.5px] text-ink-muted md:flex-row md:items-center md:justify-between">
        <p>© 2026 The Church of Christ, Evueta</p>
        <p>Evueta · Sundays 8am &amp; 10am, Wednesdays 5:30pm</p>
      </Container>
    </footer>
  );
}
