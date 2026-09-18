import Link from "next/link";
import { knownSymbols } from "@/lib/provider";

export default function AssetNotFound() {
  return (
    <section className="wrap pb-40"><div className="border-l border-ink-50 pl-6 pt-10 md:pl-10 md:pt-20">
      <h1 className="display display-lg text-[44px] md:text-[65px]">Not tracked yet.</h1>
      <p className="lead mt-6 max-w-[44ch]">
        No Stock Token with that ticker is tracked on Robinhood Chain. Only tokens with a verifiable contract and an
        authoritative issuer record are listed.
      </p>
      <p className="eyebrow mt-8">Tracked tickers</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {knownSymbols().map((s) => (
          <li key={s}>
            <Link href={`/assets/${s}`} className="btn btn-ghost btn-sm">{s}</Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-primary mt-10">Search again</Link>
      </div>
    </section>
  );
}
