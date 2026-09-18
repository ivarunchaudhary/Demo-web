import Link from "next/link";
import { Search } from "@/components/Search";
import { StatusDot } from "@/components/StatusDot";
import { RelativeTime } from "@/components/RelativeTime";
import { listAssets, PROVIDER_MODE } from "@/lib/provider";
import { OVERALL_MEANING } from "@/lib/format";
import type { OverallStatus } from "@/lib/types";

export const dynamic = "force-dynamic";

const ENDPOINTS = [
  ["GET /assets", "Every tracked Stock Token with its overall status."],
  ["GET /assets/{asset}", "Full status record with signals and sources."],
  ["GET /assets/{asset}/status", "The compact status summary."],
  ["GET /assets/{asset}/oracle", "Reference price health."],
  ["GET /assets/{asset}/transfers", "Token and transfer state."],
  ["GET /assets/{asset}/trading", "Trading and underlying security state."],
  ["GET /assets/{asset}/corporate-actions", "Dividends, splits, mergers, suspensions."],
  ["GET /assets/{asset}/sources", "Where each status came from."],
] as const;

export default async function Home() {
  const assets = await listAssets();
  const counts = assets.reduce<Record<OverallStatus, number>>(
    (acc, a) => ({ ...acc, [a.overall_status]: acc[a.overall_status] + 1 }),
    { ACTIVE: 0, WARNING: 0, BLOCKED: 0, UNKNOWN: 0 },
  );

  return (
    <>
      <section className="grid gap-12 pb-24 pt-10 md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] md:pt-20 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)]">
        <div className="border-l border-ivory-16 pl-6 md:pl-10">
          <h1 className="display text-[52px] text-ivory md:text-[72px] lg:text-[84px]">
            Know the state of your Stock Token before you use it.
          </h1>
          <p className="mt-8 max-w-[44ch] text-[18px] leading-relaxed text-ivory-75">
            AssetStatus is the live operational-status layer for tokenized stocks on Robinhood Chain. One answer, built
            from verifiable onchain state and authoritative issuer information.
          </p>
          <div className="mt-12">
            <Search assets={assets} />
          </div>
        </div>

        <aside className="self-end">
          <div className="card p-7">
            <p className="display text-[26px] italic text-ivory">Right now across {assets.length} tokens</p>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 gap-y-5">
              {(["ACTIVE", "WARNING", "BLOCKED", "UNKNOWN"] as OverallStatus[]).map((s) => (
                <li key={s} className="flex items-start gap-3">
                  <StatusDot tone={s} className="mt-2" />
                  <div>
                    <p className="display text-[40px] leading-none">{counts[s]}</p>
                    <p className="mt-1 text-[14px] text-ivory-75">{s.charAt(0) + s.slice(1).toLowerCase()}</p>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-6 border-t border-ivory-16 pt-4 text-[13px] text-ivory-50">
              {PROVIDER_MODE === "live"
                ? "Token pause state is re-read from Robinhood Chain on every request."
                : "Reading from the recorded snapshot. Set a Robinhood Chain RPC to read pause state live."}
            </p>
          </div>
        </aside>
      </section>

      <section id="tracked" className="scroll-mt-24 border-t border-ivory-16 pt-12">
        <div className="flex flex-wrap items-baseline justify-between gap-4">
          <h2 className="display text-[40px] md:text-[52px]">Tracked Stock Tokens</h2>
          <p className="text-[15px] text-ivory-75">Robinhood Chain</p>
        </div>
        <ul className="mt-8 divide-y divide-ivory-16 border-y border-ivory-16">
          {assets.map((a) => (
            <li key={a.asset}>
              <Link
                href={`/assets/${a.asset}`}
                className="grid grid-cols-[auto_72px_1fr_auto] items-center gap-4 py-4 transition-colors hover:bg-ivory-08 sm:grid-cols-[auto_96px_1fr_140px_160px] md:px-3"
              >
                <StatusDot tone={a.overall_status} />
                <span className="text-[17px] font-semibold">{a.asset}</span>
                <span className="truncate text-ivory-75">{a.name}</span>
                <span className="text-[14px]">
                  {a.overall_status.charAt(0) + a.overall_status.slice(1).toLowerCase()}
                </span>
                <span className="hidden text-[14px] text-ivory-50 sm:block">
                  <RelativeTime iso={a.last_updated} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section id="verification" className="scroll-mt-24 grid gap-10 pt-24 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <div>
          <h2 className="display text-[40px] md:text-[52px]">What a status means</h2>
          <p className="mt-5 max-w-[40ch] text-ivory-75">
            Every status carries a source, a timestamp and a verification state. An asset is never called “safe”
            just because nothing was detected.
          </p>
        </div>
        <dl className="divide-y divide-ivory-16 border-y border-ivory-16">
          {(Object.keys(OVERALL_MEANING) as OverallStatus[]).map((s) => (
            <div key={s} className="grid grid-cols-[auto_120px_1fr] items-baseline gap-4 py-5">
              <StatusDot tone={s} className="translate-y-[1px]" />
              <dt className="font-semibold">{s.charAt(0) + s.slice(1).toLowerCase()}</dt>
              <dd className="text-ivory-75">{OVERALL_MEANING[s]}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section id="api" className="scroll-mt-24 pt-24">
        <div className="grid gap-10 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
          <div>
            <h2 className="display text-[40px] md:text-[52px]">Query it before you interact</h2>
            <p className="mt-5 max-w-[40ch] text-ivory-75">
              Protocols, wallets and applications can ask the same question the page answers. Send{" "}
              <code className="text-ivory">Accept: application/json</code> to any asset path, or use the{" "}
              <code className="text-ivory">/api</code> prefix.
            </p>
            <pre className="card mt-6 overflow-x-auto bg-charcoal-2 p-5 text-[13px] leading-relaxed text-ivory-75">
{`curl -H "Accept: application/json" \\
  https://assetstatus.example/assets/AAPL/status

{
  "asset": "AAPL",
  "token": "0x2a1c…9D01",
  "chain": "Robinhood Chain",
  "overall_status": "ACTIVE",
  "token_status": "ACTIVE",
  "transfer_status": "ENABLED",
  "trading_status": "ACTIVE",
  "oracle_status": "HEALTHY",
  "corporate_action": null,
  "last_updated": "2026-09-17T19:29:30Z"
}`}
            </pre>
          </div>
          <ul className="divide-y divide-ivory-16 border-y border-ivory-16">
            {ENDPOINTS.map(([path, what]) => (
              <li key={path} className="grid gap-1 py-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] sm:gap-6">
                <code className="text-[15px] text-ivory">{path}</code>
                <span className="text-[15px] text-ivory-75">{what}</span>
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
