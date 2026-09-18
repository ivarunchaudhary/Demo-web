import Link from "next/link";
import { Search } from "@/components/Search";
import { StatusDot } from "@/components/StatusDot";
import { RelativeTime } from "@/components/RelativeTime";
import { Botanical } from "@/components/Botanical";
import { Marquee } from "@/components/Marquee";
import { StatusGrid, type StatusExplainer } from "@/components/StatusGrid";
import { ApiTabs, type ApiExample } from "@/components/ApiTabs";
import { Reveal } from "@/components/motion/Reveal";
import { Glyph } from "@/components/Wordmark";
import { getAsset, listAssets, PROVIDER_MODE } from "@/lib/provider";
import { humanise, OVERALL_MEANING } from "@/lib/format";
import type { AssetStatusResponse, AssetSummary, OverallStatus } from "@/lib/types";

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
    href: "/#tracked",
    cta: "Browse tracked tokens",
  },
  {
    n: "02",
    who: "Protocols",
    title: "Gate collateral and settlement on verified state",
    points: ["Refuse a deposit while trading is halted", "Reject a stale reference price automatically", "Every reason carries its source and timestamp"],
    href: "/#api",
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

function examplesFor(a: AssetStatusResponse): ApiExample[] {
  const j = (v: unknown) => JSON.stringify(v, null, 2);
  const base = `/assets/${a.asset}`;
  return [
    {
      id: "status",
      label: "Status",
      title: `The overall state of ${a.asset} in one call`,
      blurb: "The compact summary a wallet or protocol checks before every interaction: the verdict, the reasons behind it and each category's state.",
      path: `${base}/status`,
      body: j({
        asset: a.asset,
        token: a.token,
        chain: a.chain,
        overall_status: a.overall_status,
        reasons: a.reasons,
        token_status: a.token_status,
        transfer_status: a.transfer_status,
        trading_status: a.trading_status,
        oracle_status: a.oracle_status,
        underlying_status: a.underlying_status,
        corporate_action: a.corporate_action ? a.corporate_action.type : null,
        last_updated: a.last_updated,
      }),
    },
    {
      id: "oracle",
      label: "Oracle",
      title: "Is the reference price fresh enough to trust?",
      blurb: "Oracle health with its heartbeat, the source it was read from and when it was last observed.",
      path: `${base}/oracle`,
      body: j({ asset: a.asset, oracle_status: a.oracle_status, signal: a.signals.oracle }),
    },
    {
      id: "transfers",
      label: "Transfers",
      title: "Can this token move right now?",
      blurb: "Token pause state read from the contract, plus any transfer restriction the issuer has published.",
      path: `${base}/transfers`,
      body: j({ asset: a.asset, token_status: a.token_status, transfer_status: a.transfer_status, signals: { token: a.signals.token, transfers: a.signals.transfers } }),
    },
    {
      id: "trading",
      label: "Trading",
      title: "Is the market open for the underlying?",
      blurb: "Trading halts, suspensions and the listing state of the underlying security.",
      path: `${base}/trading`,
      body: j({ asset: a.asset, trading_status: a.trading_status, underlying_status: a.underlying_status, signals: { trading: a.signals.trading, underlying: a.signals.underlying } }),
    },
    {
      id: "corporate-actions",
      label: "Corporate",
      title: "What is about to change for holders?",
      blurb: "Dividends, splits, mergers and suspensions with their effective dates, before they settle.",
      path: `${base}/corporate-actions`,
      body: j({ asset: a.asset, corporate_actions: a.corporate_action ? [a.corporate_action] : [] }),
    },
    {
      id: "sources",
      label: "Sources",
      title: "Where every reading came from",
      blurb: "The contracts, registries and publications behind each status, so anyone can verify them independently.",
      path: `${base}/sources`,
      body: j({ asset: a.asset, sources: a.sources }),
    },
    {
      id: "full",
      label: "Full record",
      title: "Everything AssetStatus knows about the token",
      blurb: "The complete record: every signal, its verification state, its source and its observation time.",
      path: base,
      body: j(a),
    },
  ];
}

export default async function Home() {
  const assets = await listAssets();
  const counts = assets.reduce<Record<OverallStatus, number>>(
    (acc, a) => ({ ...acc, [a.overall_status]: acc[a.overall_status] + 1 }),
    { ACTIVE: 0, WARNING: 0, BLOCKED: 0, UNKNOWN: 0 },
  );
  const sample = (await getAsset("MSFT")) ?? (await getAsset(assets[0]?.asset ?? ""));
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
      {/* Hero: copy on the left of a hairline, stat box below, mist card and glyph on the right. */}
      <section data-hero data-parallax-scope className="relative overflow-hidden bg-charcoal">
        <Botanical />
        <div className="wrap relative z-10">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 w-px bg-ivory-40 md:left-10" />
          <div aria-hidden className="pointer-events-none absolute inset-y-0 right-[400px] hidden w-px bg-ivory-40 lg:block" />
          <div data-hero-item className="pointer-events-none absolute right-10 top-24 hidden lg:block">
            <Glyph />
          </div>

          <div className="grid gap-16 pb-24 pt-10 md:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            <div className="pl-6 md:pl-10">
              <h1 data-hero-item className="display display-lg max-w-[13ch] text-[44px] md:text-[58px] lg:text-[65px]">
                Know the state of your Stock Token before you use it.
              </h1>
              <p data-hero-item className="lead mt-8 max-w-[42ch]">
                AssetStatus is the live operational-status layer for tokenized stocks on Robinhood Chain. One answer,
                built from verifiable onchain state and authoritative issuer information.
              </p>
              <div data-hero-item className="mt-10">
                <Search assets={assets} />
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
                  <Link key={s} href={`/assets/${exampleFor(s)?.asset ?? assets[0]?.asset ?? ""}`} className="row-link group flex items-center gap-3 rounded-[4px] border border-ivory-16 bg-charcoal/70 px-4 py-3 backdrop-blur-[6px]">
                    <StatusDot tone={s} />
                    <span className="display text-[28px] leading-none">{counts[s]}</span>
                    <span className="body-sm text-ivory-75">{humanise(s)}</span>
                  </Link>
                ))}
              </div>
              <Link data-hero-item href="/api/assets" className="cta-mist">
                <span>
                  <span className="block font-serif text-[24px] italic leading-[1.1] tracking-[-0.02em] md:text-[28px]">Ask the API first</span>
                  <span className="mt-2 block text-[12px] font-bold uppercase tracking-[2px]">Every status, as JSON</span>
                </span>
                <span className="arrow">
                  <svg aria-hidden width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3 9h12M10 4l5 5-5 5" />
                  </svg>
                </span>
              </Link>
              <p data-hero-item className="body-sm text-ivory-50">
                {PROVIDER_MODE === "live"
                  ? "Token pause state is re-read from Robinhood Chain on every request."
                  : "Reading from the recorded snapshot. Set a Robinhood Chain RPC to read pause state live."}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Black ticker band, where grove puts its partner logos. */}
      <section className="bg-black pb-12 pt-16 md:pb-16 md:pt-24">
        <Reveal>
          <p className="display mx-auto max-w-[680px] px-6 text-center text-[28px] md:text-[32px]">
            Every tracked token, as it stands right now.
          </p>
        </Reveal>
        <Reveal className="mt-12 md:mt-20">
          <Marquee assets={assets} />
        </Reveal>
      </section>

      {/* Use cases: three hairlined columns with italic numbering. */}
      <section id="use-cases"  className="scroll-mt-24 py-16 md:py-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Use cases</p>
            <h2 className="display max-w-[14ch] text-[36px] md:text-[60px]">One question, asked before every interaction</h2>
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

      {/* Tracked list. */}
      <section id="tracked"  className="scroll-mt-24 py-16 md:py-20">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Robinhood Chain</p>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 className="display text-[36px] md:text-[60px]">Tracked Stock Tokens</h2>
              <p className="body-sm text-ivory-75">{assets.length} tokens · updated <RelativeTime iso={assets[0]?.last_updated ?? new Date().toISOString()} /></p>
            </div>
          </Reveal>
          <Reveal>
            <ul className="mt-8 divide-y divide-hairline border-y border-hairline">
              {assets.map((a) => (
                <li key={a.asset}>
                  <Link
                    href={`/assets/${a.asset}`}
                    className="row-link grid grid-cols-[auto_64px_1fr_auto] items-center gap-3 py-4 sm:grid-cols-[auto_96px_1fr_140px_160px] sm:gap-4 md:px-3"
                  >
                    <StatusDot tone={a.overall_status} />
                    <span className="text-[17px] font-medium tracking-[0.45px]">{a.asset}</span>
                    <span className="truncate text-ivory-75">{a.name}</span>
                    <span className="body-sm">{humanise(a.overall_status)}</span>
                    <span className="body-sm hidden text-ivory-50 sm:block">
                      <RelativeTime iso={a.last_updated} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* API: tabbed feature card. */}
      <section id="api"  className="scroll-mt-24 py-16 md:py-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Developer API</p>
            <h2 className="display text-[45px] md:text-[60px]">Query it before you interact</h2>
            <p className="body-md mt-4 max-w-[52ch] text-ivory-75">
              Protocols, wallets and applications can ask the same question this page answers. Send{" "}
              <code className="text-ivory">Accept: application/json</code> to any asset path, or use the{" "}
              <code className="text-ivory">/api</code> prefix. Live responses below are for {sample?.name ?? "a tracked token"}.
            </p>
          </Reveal>
          <Reveal className="mt-10">{sample && <ApiTabs examples={examplesFor(sample)} />}</Reveal>
        </div>
      </section>

      {/* Verification: ecosystem-style grid. */}
      <section id="verification"  className="scroll-mt-24 pb-32 pt-16 md:pb-40 md:pt-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Verification</p>
            <div className="grid gap-6 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] md:items-end">
              <h2 className="display text-[36px] md:text-[60px]">What a status means</h2>
              <p className="body-md max-w-[48ch] text-ivory-75">
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
    </>
  );
}
