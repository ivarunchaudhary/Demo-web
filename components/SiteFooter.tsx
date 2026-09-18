import Link from "next/link";
import { Glyph, Wordmark } from "./Wordmark";
import { Parallax } from "./motion/Parallax";

/**
 * Footer with the mirrored botanical decorations rising up from behind it,
 * each dimmed by the same gradient veil used in the hero.
 */
export function SiteFooter() {
  return (
    <footer data-parallax-scope className="relative z-0 overflow-visible">
      <Parallax factor={0.5} from="below" className="pointer-events-none absolute bottom-full right-0 -z-10 w-72 sm:w-96 md:w-[32rem] lg:w-[42rem]">
        <div aria-hidden className="sway">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/botanical-left.svg" alt="" loading="lazy" className="h-auto w-full -scale-x-100 -scale-y-100" />
          <div className="veil absolute inset-0" />
        </div>
      </Parallax>
      <Parallax factor={0.4} from="below" className="pointer-events-none absolute bottom-full left-0 -z-10 w-72 sm:w-96 md:w-[32rem] lg:w-[42rem]">
        <div aria-hidden className="sway-slow">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/art/botanical-right.svg" alt="" loading="lazy" className="h-auto w-full -scale-y-100" />
          <div className="veil absolute inset-0" />
        </div>
      </Parallax>

      <div className="wrap pb-12 pt-20">
        <div className="grid gap-10 border-t border-ink pt-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div>
            <Glyph size={48} className="mb-6" />
            <Wordmark />
            <p className="body-md mt-4 max-w-[36ch] text-ink">
              Live operational status for Stock Tokens. Status infrastructure, not a trading dashboard.
            </p>
          </div>
          <div className="body-sm">
            <p className="display-italic text-[18px] tracking-[-0.6px]">Product —</p>
            <ul className="mt-4 space-y-3 text-ink">
              <li><Link href="/app" className="transition-colors hover:text-ink-75">Check a token</Link></li>
              <li><Link href="/app#tracked" className="transition-colors hover:text-ink-75">Tracked tokens</Link></li>
              <li><Link href="/#verification" className="transition-colors hover:text-ink-75">What a status means</Link></li>
              <li><Link href="/#use-cases" className="transition-colors hover:text-ink-75">Who asks</Link></li>
            </ul>
          </div>
          <div className="body-sm">
            <p className="display-italic text-[18px] tracking-[-0.6px]">Developers —</p>
            <ul className="mt-4 space-y-3 text-ink">
              <li><Link href="/#api" className="transition-colors hover:text-ink-75">API reference</Link></li>
              <li><Link href="/app#api" className="transition-colors hover:text-ink-75">Live responses</Link></li>
              <li><Link href="/api/assets" className="transition-colors hover:text-ink-75">All tokens, JSON</Link></li>
              <li><Link href="/api/assets/AAPL/status" className="transition-colors hover:text-ink-75">Example response</Link></li>
            </ul>
          </div>
          <div className="body-sm">
            <p className="display-italic text-[18px] tracking-[-0.6px]">Scope —</p>
            <ul className="mt-4 space-y-3 text-ink">
              <li>Robinhood Chain</li>
              <li>Stock Tokens only</li>
              <li>Operational status, never investment advice</li>
            </ul>
          </div>
        </div>
        <p className="mt-12 text-[12px] leading-[1.4] text-ink">
          {new Date().getFullYear()} AssetStatus. Statuses describe operational state and are not a recommendation to buy, sell or hold any asset.
        </p>
      </div>
    </footer>
  );
}
