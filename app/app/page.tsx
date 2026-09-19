import type { Metadata } from "next";
import Link from "next/link";
import { Search } from "@/components/Search";
import { StatusDot } from "@/components/StatusDot";
import { RelativeTime } from "@/components/RelativeTime";
import { Botanical } from "@/components/Botanical";
import { Marquee } from "@/components/Marquee";
import { ApiTabs, type ApiExample } from "@/components/ApiTabs";
import { Reveal } from "@/components/motion/Reveal";
import { getAsset, listAssets, PROVIDER_MODE } from "@/lib/provider";
import { humanise } from "@/lib/format";
import type { AssetStatusResponse, AssetSummary, OverallStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Check a token",
  description: "Search any tracked Stock Token on Robinhood Chain and read its live operational status.",
};

const STATUSES: OverallStatus[] = ["ACTIVE", "WARNING", "BLOCKED", "UNKNOWN"];

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
      title: "Everything Feels knows about the token",
      blurb: "The complete record: every signal, its verification state, its source and its observation time.",
      path: base,
      body: j(a),
    },
  ];
}

export default async function App() {
  const assets = await listAssets();
  const counts = assets.reduce<Record<OverallStatus, number>>(
    (acc, a) => ({ ...acc, [a.overall_status]: acc[a.overall_status] + 1 }),
    { ACTIVE: 0, WARNING: 0, BLOCKED: 0, UNKNOWN: 0 },
  );
  const sample = (await getAsset("MSFT")) ?? (await getAsset(assets[0]?.asset ?? ""));
  const exampleFor = (s: OverallStatus): AssetSummary | undefined => assets.find((a) => a.overall_status === s);

  return (
    <>
      {/* App hero: the search is the whole point of this page. */}
      <section data-hero data-parallax-scope className="relative overflow-hidden bg-paper">
        <Botanical variant="asset" />
        <div className="wrap relative z-10">
          <div aria-hidden className="pointer-events-none absolute inset-y-0 left-6 w-px bg-ink-40 md:left-10" />
          <div className="grid gap-12 pb-20 pt-10 md:pt-16 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-10">
            <div className="pl-6 md:pl-10">
              <p data-hero-item className="eyebrow">App</p>
              <h1 data-hero-item data-split className="display display-lg max-w-[12ch] text-[40px] md:text-[54px] lg:text-[60px]">
                Check a Stock Token.
              </h1>
              <p data-hero-item className="lead mt-6 max-w-[42ch]">
                Search a ticker to read its live status: token, transfers, trading, oracle and underlying, each with its
                source and timestamp.
              </p>
              <div data-hero-item className="mt-10">
                <Search assets={assets} />
              </div>
              <p data-hero-item className="body-sm mt-6 text-ink-50">
                {PROVIDER_MODE === "live"
                  ? "Token pause state is re-read from Robinhood Chain on every request."
                  : "Reading from the recorded snapshot. Set a Robinhood Chain RPC to read pause state live."}
              </p>
            </div>

            <div className="flex flex-col justify-end gap-6 lg:pl-10">
              <div data-hero-item className="grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-4 lg:grid-cols-2">
                {STATUSES.map((s) => (
                  <Link
                    key={s}
                    href={`/assets/${exampleFor(s)?.asset ?? assets[0]?.asset ?? ""}`}
                    className="row-link group flex items-center gap-3 rounded-[4px] border border-ink-16 bg-paper/70 px-4 py-3 backdrop-blur-[6px]"
                  >
                    <StatusDot tone={s} />
                    <span className="display text-[28px] leading-none">{counts[s]}</span>
                    <span className="body-sm text-ink-75">{humanise(s)}</span>
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
            </div>
          </div>
        </div>
      </section>

      {/* Ticker band. */}
      <section className="bg-cream pb-12 pt-16 md:pb-16 md:pt-20">
        <Reveal>
          <p className="display mx-auto max-w-[680px] px-6 text-center text-[28px] md:text-[32px]">
            Every tracked token, as it stands right now.
          </p>
        </Reveal>
        <Reveal className="mt-12 md:mt-16">
          <Marquee assets={assets} />
        </Reveal>
      </section>

      {/* Tracked list. */}
      <section id="tracked" className="scroll-mt-24 py-16 md:py-20">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Robinhood Chain</p>
            <div className="flex flex-wrap items-baseline justify-between gap-4">
              <h2 data-split className="display text-[36px] md:text-[60px]">Tracked Stock Tokens</h2>
              <p className="body-sm text-ink-75">{assets.length} tokens · updated <RelativeTime iso={assets[0]?.last_updated ?? new Date().toISOString()} /></p>
            </div>
          </Reveal>
          <Reveal>
            <ul data-stagger className="mt-8 divide-y divide-hairline border-y border-hairline">
              {assets.map((a) => (
                <li key={a.asset}>
                  <Link
                    href={`/assets/${a.asset}`}
                    className="row-link grid grid-cols-[auto_64px_1fr_auto] items-center gap-3 py-4 sm:grid-cols-[auto_96px_1fr_140px_160px] sm:gap-4 md:px-3"
                  >
                    <StatusDot tone={a.overall_status} />
                    <span className="text-[17px] font-medium tracking-[0.45px]">{a.asset}</span>
                    <span className="truncate text-ink-75">{a.name}</span>
                    <span className="body-sm">{humanise(a.overall_status)}</span>
                    <span className="body-sm hidden text-ink-50 sm:block">
                      <RelativeTime iso={a.last_updated} />
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>
      </section>

      {/* API: live tabbed responses. */}
      <section id="api" className="scroll-mt-24 pb-32 pt-16 md:pb-40 md:pt-24">
        <div className="wrap">
          <Reveal>
            <p className="eyebrow">Developer API</p>
            <h2 data-split className="display text-[45px] md:text-[60px]">Query it before you interact</h2>
            <p className="body-md mt-4 max-w-[52ch] text-ink-75">
              Send{" "}
              <code className="text-ink">Accept: application/json</code> to any asset path, or use the{" "}
              <code className="text-ink">/api</code> prefix. Live responses below are for {sample?.name ?? "a tracked token"}.
            </p>
          </Reveal>
          <Reveal className="mt-10">{sample && <ApiTabs examples={examplesFor(sample)} />}</Reveal>
        </div>
      </section>
    </>
  );
}
