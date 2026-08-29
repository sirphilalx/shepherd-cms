import { ClerkProvider } from "@clerk/nextjs";
import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import { SanityLive } from "@/sanity/lib/live";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  weight: ["500"],
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: "The Church of Christ, Evueta",
  description:
    "A church family, gathered every week — service times, sermons, events, and the member portal for The Church of Christ, Evueta.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col font-sans">
        <ClerkProvider>{children}</ClerkProvider>
        <SanityLive />
      </body>
    </html>
  );
}
