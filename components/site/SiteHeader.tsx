"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Show, SignInButton, UserButton } from "@clerk/nextjs";
import { cn } from "@/components/ui/cn";
import { Container } from "./Section";

interface NavLink {
  label: string;
  href: string;
}

const navLinks: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Sermons", href: "/sermons" },
  { label: "Library", href: "/library" },
  { label: "Events", href: "/events" },
  { label: "Schedule", href: "/schedule" },
  { label: "About", href: "/about" },
];

const loginBtn =
  "items-center justify-center gap-2 rounded-full bg-primary px-[18px] py-[10px] text-[13.5px] font-semibold text-white transition-colors hover:bg-primary-hover";

export function SiteHeader() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);

  const isActive = (href: string) =>
    href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-bg/90 backdrop-blur">
      <Container className="flex h-16 items-center justify-between gap-4">
        <Link
          href="/"
          className="flex items-center gap-[10px]"
          onClick={() => setOpen(false)}
        >
          <Image
            src="/logo.png"
            alt="The Church of Christ, Evueta"
            width={36}
            height={36}
            className="h-9 w-9 flex-none rounded-full"
            priority
          />
          <span className="hidden leading-tight lg:block">
            <span className="block text-[15px] font-semibold text-ink">
              The Church of Christ
            </span>
            <span className="block text-[10px] font-semibold tracking-[0.14em] text-ink-faint">
              EVUETA
            </span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "text-[13.5px] transition-colors hover:text-ink",
                isActive(link.href)
                  ? "font-semibold text-primary"
                  : "text-ink-muted",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          <Show when="signed-out">
            <SignInButton>
              <button type="button" className={cn(loginBtn, "inline-flex")}>
                Member Login
              </button>
            </SignInButton>
          </Show>
          <Show when="signed-in">
            <Link
              href="/portal"
              className="text-[13.5px] font-semibold text-primary transition-colors hover:text-primary-hover"
            >
              Portal
            </Link>
            <UserButton />
          </Show>
        </div>

        <button
          type="button"
          className="flex h-10 w-10 items-center justify-center rounded-full text-ink lg:hidden"
          aria-label={open ? "Close menu" : "Open menu"}
          aria-expanded={open}
          aria-controls="site-menu"
          onClick={() => setOpen((v) => !v)}
        >
          {open ? <X size={22} strokeWidth={1.7} /> : <Menu size={22} strokeWidth={1.7} />}
        </button>
      </Container>

      {open && (
        <div id="site-menu" className="border-t border-border bg-bg lg:hidden">
          <Container className="flex flex-col gap-1 py-4">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                className={cn(
                  "rounded-md px-2 py-[10px] text-[15px]",
                  isActive(link.href)
                    ? "font-semibold text-primary"
                    : "text-ink-muted",
                )}
              >
                {link.label}
              </Link>
            ))}
            <Show when="signed-out">
              <SignInButton>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className={cn(loginBtn, "mt-2 flex w-full")}
                >
                  Member Login
                </button>
              </SignInButton>
            </Show>
            <Show when="signed-in">
              <Link
                href="/portal"
                onClick={() => setOpen(false)}
                className={cn(loginBtn, "mt-2 flex w-full")}
              >
                Go to Portal
              </Link>
              <div className="mt-3 flex items-center gap-3 px-2">
                <UserButton />
                <span className="text-[13.5px] text-ink-muted">Your account</span>
              </div>
            </Show>
          </Container>
        </div>
      )}
    </header>
  );
}
