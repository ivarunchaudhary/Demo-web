import Link from "next/link";
import { StatusDot } from "@/components/StatusDot";
import { Botanical } from "@/components/Botanical";
import { ContractAddress } from "@/components/ContractAddress";
import { StatusGrid, type StatusExplainer } from "@/components/StatusGrid";
import { Reveal } from "@/components/motion/Reveal";
import { Glyph } from "@/components/Wordmark";
import { getAsset, listAssets } from "@/lib/provider";
import { humanise, OVERALL_MEANING } from "@/lib/format";
import type { AssetSummary, OverallStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const STATUSES: OverallStatus[] = ["ACTIVE", "WARNING", "BLOCKED", "UNKNOWN"];

const CAUSES: Record<OverallStatus, string[]> = {
  ACTIVE: ["Every core signal verified", "Token live, transfers enabled", "Trading open, oracle healthy"],
  WARNING: ["Transfers restricted for some holders", "Reference price stale", "Dividend, split or merger pending"],
  BLOCKED: ["Token or transfers paused", "Trading halted or suspended", "Underlying halted or delisted"],
  UNKNOWN: ["A core signal could not be verified", "Never reported as Active by default", "Resolves when a source confirms"],
};

/** What a reader should do about each status. Revealed inside the tile on hover. */
const ADVICE: Record<OverallStatus, string> = {
  ACTIVE: "Safe to send, settle and price as normal.",
  WARNING: "Proceed, but surface the reason to the holder first.",
  BLOCKED: "Hold transfers and collateral until the source clears it.",
  UNKNOWN: "Treat as not usable until a source confirms.",
};

const USE_CASES = [
  {
    n: "01",
    who: "Wallets",
    title: "Warn before a transfer, not after it fails",
    points: ["Show the overall status next to the balance", "Hold a send while the token is paused", "Explain a restriction with the issuer's own reason"],
    href: "/app#tracked",
    cta: "Browse tracked tokens",
  },
  {
    n: "02",
    who: "Protocols",
    title: "Gate collateral and settlement on verified state",
    points: ["Refuse a deposit while trading is halted", "Reject a stale reference price automatically", "Every reason carries its source and timestamp"],
    href: "/app#api",
    cta: "See the status API",
  },
  {
    n: "03",
    who: "Applications",
    title: "Show the state of a token, never a guess",
    points: ["One status vocabulary across every ticker", "Unknown stays Unknown until a source confirms", "Corporate actions surface before they settle"],
    href: "/#verification",
    cta: "How statuses are verified",
  },
];

const ENDPOINTS = [
  { path: "/api/assets", what: "Every tracked token with its overall status" },
  { path: "/api/assets/{TICKER}/status", what: "The verdict, its reasons and each category's state" },
  { path: "/api/assets/{TICKER}/transfers", what: "Pause state and any published transfer restriction" },
  { path: "/api/assets/{TICKER}/oracle", what: "Reference price health and heartbeat" },
  { path: "/api/assets/{TICKER}/sources", what: "Where every reading came from" },
];

export default async function Home() {
  const assets = await listAssets();
  const counts = assets.reduce<Record<OverallStatus, number>>(
    (acc, a) => ({ ...acc, [a.overall_status]: acc[a.overall_status] + 1 }),
    { ACTIVE: 0, WARNING: 0, BLOCKED: 0, UNKNOWN: 0 },
  );
  const usable = counts.ACTIVE + counts.WARNING;
  const exampleFor = (s: OverallStatus): AssetSummary | undefined => assets.find((a) => a.overall_status === s);
  const explainers: StatusExplainer[] = await Promise.all(
    STATUSES.map(async (s) => {
      const ex = exampleFor(s);
      const full = ex ? await getAsset(ex.asset) : null;
      const signals = full
        ? [
            { label: "Token", value: full.signals.token.value },
            { label: "Transfers", value: full.signals.transfers.value },
            { label: "Trading", value: full.signals.trading.value },
            { label: "Oracle", value: full.signals.oracle.value },
            { label: "Underlying", value: full.signals.underlying.value },
            ...(full.corporate_action
              ? [{ label: "Corporate action", value: full.corporate_action.type, tone: (full.corporate_action.type === "SUSPENSION" ? "BLOCKED" : "WARNING") as OverallStatus }]
              : []),
          ]
        : undefined;
      return {
        status: s,
        meaning: OVERALL_MEANING[s],
        causes: CAUSES[s],
        advice: ADVICE[s],
        example: ex ? { asset: ex.asset, name: ex.name, signals } : undefined,
      };
    }),
  );

  return (
    <>
      {/* Hero: copy on the left of a hairline, contract address under the sub-heading, CTAs on the right. */}
      <section data-hero data-parallax-scope className="relative overflow-hidden bg-paper">
        <Botanical />
        <div className="wrap relative z-10">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 w-px bg-ink-40 md:left-10" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[400px] hidden w-px bg-ink-40 lg:block" />
          <div data-hero-item className="pointer-events-none absolute right-10 top-24 hidden lg:block">
            {/* The botanical layer runs right under the mark, so it gets its own clear space. */}
            <div aria-hidden className="absolute -inset-12 rounded-full bg-[radial-gradient(closest-side,var(--paper),color-mix(in_srgb,var(--paper)_60%,transparent)_55%,transparent)]" />
            <Glyph className="relative" />
          </div>

          <div className="grid gap-16 pb-24 pt-10 md:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            <div className="pl-6 md:pl-10">
              <h1 data-hero-item data-split className="display display-lg max-w-[13ch] text-[44px] md:text-[58px] lg:text-[65px]">
                Know the state of your Stock Token before you use it.
              </h1>
              <p data-hero-item className="lead mt-8 max-w-[42ch]">
                Feels is the live operational-status layer for tokenized stocks on Robinhood Chain. One answer,
                built from verifiable onchain state and authoritative issuer information.
              </p>

              <div data-hero-item className="mt-8 max-w-[560px]">
                <ContractAddress />
              </div>

              <div data-hero-item className="mt-8 flex flex-wrap items-center gap-4">
                <Link href="/app" className="btn btn-primary">
                  Check a token
                </Link>
                <Link href="/#api" className="btn btn-ghost">
                  Read the API
                </Link>
              </div>

              <div data-hero-item className="stat-box mt-14 max-w-[400px] text-center">
                <div className="px-6 py-8">
                  <p className="stat-figure" data-count={assets.length}>{assets.length}</p>
                  <p className="stat-label">Stock Tokens tracked</p>
                </div>
                <div className="px-6 py-8">
                  <p className="stat-figure" data-count={usable}>{usable}</p>
                  <p className="stat-label">Usable right now</p>
                </div>
              </div>
            </div>

            <div className="flex flex-col justify-end gap-6 lg:pl-10">
              <div data-hero-item className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
                {STATUSES.map((s) => (
                  <Link key={s} href="/app" className="row-link group flex items-center gap-3 rounded-[4px] border border-ink-16 bg-paper/70 px-4 py-3 backdrop-blur-[6px]">
                    <StatusDot tone={s} />
                    <span className="display text-[28px] leading-none">{counts[s]}</span>
                    <span className="body-sm text-ink-75">{humanise(s)}</span>
                  </Link>
                ))}
              </div>
              <Link data-hero-item href="/app" className="cta-mist">
                <span>
                  <span className="block font-serif text-[24px] italic leading-[1.1] tracking-[-0.02em] md:text-[28px]">Open the app</span>
                  <span className="mt-2 block text-[12px] font-bold uppercase tracking-[2px]">Search any tracked token</span>
                </span>
                <span className="arrow">
                  <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h12M10 4l5 5-5 5" />
                  </svg>
                </span>
              </Link>
              <p data-hero-item className="body-sm text-ink-50">
                Status infrastructure for Stock Tokens on Robinhood Chain. Not a trading dashboard.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Use cases: three hairlined columns with italic numbering. */}
      <section id="use-cases" className="scroll-mt-24 py-16 md:py-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Use cases</p>
            <h2 data-split className="display max-w-[14ch] text-[36px] md:text-[60px]">One question, asked before every interaction</h2>
          </Reveal>
          <div className="mt-12 grid gap-12 md:grid-cols-3 md:gap-6">
            {USE_CASES.map((u) => (
              <Reveal key={u.n} className="usecase flex flex-col">
                <p className="usecase-number">
                  {u.n} {u.who}
                </p>
                <h3 className="usecase-title">{u.title}</h3>
                <ul>
                  {u.points.map((p) => (
                    <li key={p}>{p}</li>
                  ))}
                </ul>
                <Link href={u.href} className="btn btn-ghost btn-sm mt-8 self-start">
                  {u.cta}
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Verification: ecosystem-style grid. */}
      <section id="verification" className="scroll-mt-24 py-16 md:py-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Verification</p>
            <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end">
              <h2 data-split className="display text-[36px] md:text-[60px]">What a status means</h2>
              <p className="body-md max-w-[48ch] text-ink-75">
                Every status carries a source, a timestamp and a verification state. An asset is never called safe just
                because nothing was detected.
              </p>
            </div>
          </Reveal>
          <Reveal className="mt-10">
            <StatusGrid items={explainers} />
          </Reveal>
        </div>
      </section>

      {/* API: what exists, with the live console living in the app. */}
      <section id="api" className="scroll-mt-24 pb-32 pt-16 md:pb-40 md:pt-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Developer API</p>
            <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end">
              <h2 data-split className="display text-[45px] md:text-[60px]">Query it before you interact</h2>
              <p className="body-md max-w-[48ch] text-ink-75">
                Protocols, wallets and applications can ask the same question the app answers. Send{" "}
                <code className="text-ink">Accept: application/json</code> to any asset path, or use the{" "}
                <code className="text-ink">/api</code> prefix.
              </p>
            </div>
          </Reveal>
          <Reveal className="mt-10">
            <ul className="divide-y divide-hairline border-y border-hairline">
              {ENDPOINTS.map((e) => (
                <li key={e.path} className="grid gap-1 py-4 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:gap-6 md:px-3">
                  <code className="font-mono text-[14px] text-ink">{e.path}</code>
                  <span className="body-sm text-ink-75">{e.what}</span>
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal className="mt-10 flex flex-wrap items-center gap-4">
            <Link href="/app#api" className="btn btn-primary">
              Try it live
            </Link>
            <Link href="/api/assets" className="btn btn-ghost">
              All tokens, JSON
            </Link>
          </Reveal>
        </div>
      </section>
    </>
  );
}
