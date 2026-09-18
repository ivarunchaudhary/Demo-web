import type { Metadata } from "next";
import { Inter, Newsreader, Geist_Mono } from "next/font/google";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { MotionRoot } from "@/components/motion/MotionRoot";
import "./globals.css";

/*
 * grove.finance is set in Söhne, GT Super Text and Söhne Mono, all licensed.
 * These open faces match their proportions: Inter for the neutral grotesk,
 * Newsreader (optical-size axis) for the high-contrast Times-lineage serif,
 * Geist Mono for code. globals.css lists the licensed names ahead of these,
 * so dropping the real files in (next/font/local) is a one-line swap.
 */
const sans = Inter({
  variable: "--font-sans-face",
  subsets: ["latin"],
  display: "swap",
});

const serif = Newsreader({
  variable: "--font-serif-face",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["opsz"],
  display: "swap",
});

const mono = Geist_Mono({
  variable: "--font-mono-face",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "AssetStatus — Live operational status for Stock Tokens",
    template: "%s — AssetStatus",
  },
  description:
    "Know the state of your Stock Token before you use it. One standardized status layer built from verifiable onchain and authoritative offchain information.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} ${mono.variable} h-full`}>
      <body className="flex min-h-full flex-col overflow-x-hidden">
        <noscript>
          <style>{`.reveal,[data-hero-item],[data-hero-art],[data-split]{opacity:1!important;transform:none!important}.petal{display:none}`}</style>
        </noscript>
        <MotionRoot />
        <SiteHeader />
        <main className="relative z-10 flex flex-1 flex-col pt-[88px]">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
