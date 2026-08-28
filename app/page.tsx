import Link from "next/link";

export default function Home() {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
      <h1 className="font-serif text-3xl text-ink">Shepherd</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The public site, member portal, and admin panel are built here as they&rsquo;re scoped.
      </p>
      <Link
        href="/design-system"
        className="rounded-full bg-primary px-[18px] py-[10px] text-[13.5px] font-semibold text-white hover:bg-primary-hover"
      >
        View the design system
      </Link>
    </div>
  );
}
