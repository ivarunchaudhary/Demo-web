import type { Metadata } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import Link from "next/link";
import "./globals.css";

const sans = Instrument_Sans({
  variable: "--font-instrument-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

const serif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
});

export const metadata: Metadata = {
  title: {
    default: "AssetStatus — Live operational status for Stock Tokens",
    template: "%s — AssetStatus",
  },
  description:
    "Know the state of your Stock Token before you use it. One standardized status layer built from verifiable onchain and authoritative offchain information.",
};

function Wordmark() {
  return (
    <Link href="/" className="display text-[26px] tracking-[-0.02em] text-ivory" aria-label="AssetStatus home">
      AssetStatus
    </Link>
  );
}

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${sans.variable} ${serif.variable} h-full`}>
      <body className="min-h-full flex flex-col">
        <header className="mx-auto w-full max-w-[1336px] px-6 md:px-10">
          <nav className="flex h-[88px] items-center justify-between">
            <Wordmark />
            <div className="flex items-center gap-8">
              <Link href="/#tracked" className="hidden text-[15px] font-medium text-ivory-75 hover:text-ivory sm:block">
                Tracked tokens
              </Link>
              <Link href="/#api" className="hidden text-[15px] font-medium text-ivory-75 hover:text-ivory sm:block">
                API
              </Link>
              <Link href="/api/assets" className="btn btn-secondary">
                Query API
              </Link>
            </div>
          </nav>
        </header>
        <main className="mx-auto w-full max-w-[1336px] flex-1 px-6 md:px-10">{children}</main>
        <footer className="mx-auto w-full max-w-[1336px] px-6 pb-12 pt-20 md:px-10">
          <div className="hairline grid gap-10 border-t pt-10 md:grid-cols-[1.4fr_1fr_1fr]">
            <div>
              <Wordmark />
              <p className="mt-4 max-w-[36ch] text-[15px] text-ivory-75">
                Live operational status for Stock Tokens. Status infrastructure, not a trading dashboard.
              </p>
            </div>
            <div className="text-[15px]">
              <p className="display text-[22px] italic text-ivory">Product —</p>
              <ul className="mt-3 space-y-2 text-ivory-75">
                <li><Link href="/#tracked" className="hover:text-ivory">Tracked tokens</Link></li>
                <li><Link href="/#api" className="hover:text-ivory">API reference</Link></li>
                <li><Link href="/#verification" className="hover:text-ivory">How statuses are verified</Link></li>
              </ul>
            </div>
            <div className="text-[15px]">
              <p className="display text-[22px] italic text-ivory">Scope —</p>
              <ul className="mt-3 space-y-2 text-ivory-75">
                <li>Robinhood Chain</li>
                <li>Stock Tokens only</li>
                <li>Operational status, never investment advice</li>
              </ul>
            </div>
          </div>
          <p className="mt-10 text-[13px] text-ivory-50">
            {new Date().getFullYear()} AssetStatus. Statuses describe operational state and are not a recommendation to buy, sell or hold any asset.
          </p>
        </footer>
      </body>
    </html>
  );
}
