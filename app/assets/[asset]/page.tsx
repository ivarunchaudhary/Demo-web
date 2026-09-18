import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { StatusDot } from "@/components/StatusDot";
import { RelativeTime } from "@/components/RelativeTime";
import { Botanical } from "@/components/Botanical";
import { Reveal } from "@/components/motion/Reveal";
import { getAsset, knownSymbols, PROVIDER_MODE } from "@/lib/provider";
import { humanise, OVERALL_MEANING, shortAddress, tone, VERIFICATION_LABEL } from "@/lib/format";
import type { Signal, Source } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps<"/assets/[asset]">): Promise<Metadata> {
  const { asset } = await params;
  const data = await getAsset(asset);
  if (!data) return { title: "Not tracked" };
  return {
    title: `${data.asset} ${humanise(data.overall_status)}`,
    description: `${data.name} Stock Token on ${data.chain}: ${OVERALL_MEANING[data.overall_status]}`,
  };
}

function sourceFor(sources: Source[], id: string) {
  return sources.find((s) => s.id === id);
}

function Row({ label, signal, sources }: { label: string; signal: Signal<string>; sources: Source[] }) {
  const src = sourceFor(sources, signal.source_id);
  const t = tone(signal.value);
  return (
    <div className="grid gap-x-6 gap-y-2 py-5 md:grid-cols-[170px_190px_1fr_260px] md:items-baseline">
      <dt className="text-[15px] text-ivory-75">{label}</dt>
      <dd className="flex items-center gap-3 text-[20px] font-medium">
        <StatusDot tone={t} />
        {humanise(signal.value)}
      </dd>
      <dd className="text-[15px] text-ivory-75">
        {signal.detail ?? (signal.verification === "UNKNOWN" ? "No verified reading." : "")}
        {src && (
          <span className="block text-[13px] text-ivory-50">
            {src.name}
            {src.reference ? ` · ${src.reference.startsWith("0x") ? shortAddress(src.reference) : src.reference}` : ""}
          </span>
        )}
      </dd>
      <dd className="text-[13px] text-ivory-50 md:text-right">
        <span className={signal.verification === "UNKNOWN" ? "text-yellow" : "text-sage"}>
          {VERIFICATION_LABEL[signal.verification]}
        </span>
        <span className="block"><RelativeTime iso={signal.observed_at} /></span>
      </dd>
    </div>
  );
}

export default async function AssetPage({ params }: PageProps<"/assets/[asset]">) {
  const { asset } = await params;
  const data = await getAsset(asset);
  if (!data) notFound();

  const ca = data.corporate_action;
  const caSource = ca ? sourceFor(data.sources, ca.source_id) : undefined;
  const caTone = ca ? (ca.type === "SUSPENSION" ? "BLOCKED" : "WARNING") : "ACTIVE";

  return (
    <article className={`tone-${data.overall_status}`}>
      <section data-parallax-scope className="relative overflow-hidden">
        <Botanical variant="asset" />
        <div className="wrap relative z-10 pb-16 pt-4 md:pt-10">
      <nav aria-label="Breadcrumb" className="body-sm text-ivory-50">
        <Link href="/" className="transition-colors hover:text-ivory">Tracked tokens</Link>
        <span aria-hidden> / </span>
        <span className="text-ivory-75">{data.asset}</span>
      </nav>

      <header className="grid gap-10 pt-8 md:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] md:items-end">
        <div className="border-l border-ivory-50 pl-6 md:pl-10">
          <Reveal>
            <p className="eyebrow">
              {data.name} <span className="text-ivory-50">·</span> {data.asset} Stock Token
            </p>
          </Reveal>
          <Reveal delay={100}>
            <h1 className="display mt-2 flex items-center gap-5 text-[72px] leading-none md:text-[112px] lg:text-[140px]" style={{ color: "var(--tone)" }}>
              <StatusDot tone={data.overall_status} live className="dot-lg" />
              {humanise(data.overall_status)}
            </h1>
          </Reveal>
          <Reveal delay={220}>
            <p className="lead mt-6 max-w-[48ch]">{OVERALL_MEANING[data.overall_status]}</p>
            <ul className="body-sm mt-5 max-w-[60ch] space-y-2 text-ivory-75">
              {data.reasons.map((r) => (
                <li key={r} className="flex gap-3">
                  <span aria-hidden className="mt-[9px] h-[5px] w-[5px] flex-none rounded-full bg-ivory-50" />
                  <span>{r}</span>
                </li>
              ))}
            </ul>
          </Reveal>
        </div>

        <Reveal as="aside" delay={340}>
        <dl className="card body-sm grid grid-cols-2 gap-x-6 gap-y-5 bg-charcoal/85 p-6 backdrop-blur-[6px]">
          <div>
            <dt className="text-ivory-50">Chain</dt>
            <dd className="mt-0.5 text-ivory">{data.chain}</dd>
          </div>
          <div>
            <dt className="text-ivory-50">Issuer</dt>
            <dd className="mt-0.5 text-ivory">{data.issuer}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-ivory-50">Token contract</dt>
            <dd className="mt-0.5 break-all font-medium text-ivory">{data.token}</dd>
          </div>
          <div>
            <dt className="text-ivory-50">Last updated</dt>
            <dd className="mt-0.5 text-ivory"><RelativeTime iso={data.last_updated} /></dd>
          </div>
          <div>
            <dt className="text-ivory-50">Machine-readable</dt>
            <dd className="mt-0.5">
              <a href={`/api/assets/${data.asset}`} className="link">JSON</a>
              <span className="text-ivory-50"> · </span>
              <a href={`/api/assets/${data.asset}/status`} className="link">status only</a>
            </dd>
          </div>
        </dl>
        </Reveal>
      </header>
        </div>
      </section>

      <div className="wrap">
      <section className="pt-4">
        <Reveal>
          <h2 className="display text-[36px] md:text-[48px]">Status by category</h2>
        </Reveal>
        <Reveal delay={100} as="div">
        <dl className="mt-6 divide-y divide-hairline border-y border-hairline">
          <Row label="Token" signal={data.signals.token} sources={data.sources} />
          <Row label="Transfers" signal={data.signals.transfers} sources={data.sources} />
          <Row label="Trading" signal={data.signals.trading} sources={data.sources} />
          <Row label="Price / Oracle" signal={data.signals.oracle} sources={data.sources} />
          <Row label="Underlying asset" signal={data.signals.underlying} sources={data.sources} />
          <div className="grid gap-x-6 gap-y-2 py-5 md:grid-cols-[170px_190px_1fr_260px] md:items-baseline">
            <dt className="text-[15px] text-ivory-75">Corporate action</dt>
            <dd className="flex items-center gap-3 text-[20px] font-medium">
              <StatusDot tone={caTone} />
              {ca ? humanise(ca.type) : "None"}
            </dd>
            <dd className="text-[15px] text-ivory-75">
              {ca ? (
                <>
                  {ca.summary}
                  {ca.effective_date && (
                    <span className="block text-ivory">
                      Effective {new Date(ca.effective_date + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" })}
                    </span>
                  )}
                  {caSource && <span className="block text-[13px] text-ivory-50">{caSource.name}</span>}
                </>
              ) : (
                "No dividend, split, merger or suspension on record."
              )}
            </dd>
            <dd className="text-[13px] text-ivory-50 md:text-right">
              {ca ? (
                <>
                  <span className={ca.verification === "UNKNOWN" ? "text-yellow" : "text-sage"}>{VERIFICATION_LABEL[ca.verification]}</span>
                  <span className="block"><RelativeTime iso={ca.observed_at} /></span>
                </>
              ) : (
                <span className="text-sage">Verified from authoritative source</span>
              )}
            </dd>
          </div>
        </dl>
        </Reveal>
      </section>

      <section className="grid gap-10 pt-20 md:grid-cols-[minmax(0,5fr)_minmax(0,7fr)]">
        <Reveal>
          <h2 className="display text-[36px] md:text-[48px]">Sources</h2>
          <p className="body-md mt-4 max-w-[40ch] text-ivory-75">
            Where each reading comes from. Onchain sources are observed directly from Robinhood Chain; authoritative
            sources are issuer or market publications.
          </p>
        </Reveal>
        <Reveal delay={100} as="div">
        <ul className="divide-y divide-hairline border-y border-hairline">
          {data.sources.map((s) => (
            <li key={s.id} className="grid gap-1 py-4 sm:grid-cols-[150px_1fr] sm:gap-6">
              <span className="text-[13px] text-ivory-50">{s.kind === "onchain" ? "Onchain" : "Authoritative"}</span>
              <div>
                {s.url ? (
                  <a href={s.url} target="_blank" rel="noreferrer" className="text-ivory underline decoration-ivory-40 underline-offset-[3px] transition-colors hover:text-yellow">
                    {s.name}
                  </a>
                ) : (
                  <span>{s.name}</span>
                )}
                {s.reference && <span className="block break-all text-[13px] text-ivory-50">{s.reference}</span>}
              </div>
            </li>
          ))}
        </ul>
        </Reveal>
      </section>

      <p className="body-sm mb-40 mt-16 max-w-[70ch] text-ivory-50">
        {PROVIDER_MODE === "live"
          ? "Token pause state was read from Robinhood Chain for this request. Other signals come from the most recent recorded observation."
          : "This deployment reads from a recorded snapshot. Configure ROBINHOOD_CHAIN_RPC_URL to re-read token pause state onchain on every request."}
      </p>
      </div>
    </article>
  );
}

export function generateStaticParams() {
  return knownSymbols().map((asset) => ({ asset }));
}
