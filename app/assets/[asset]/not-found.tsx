import Link from "next/link";
import { knownSymbols } from "@/lib/provider";

export default function AssetNotFound() {
  return (
    <section className="border-l border-ivory-16 pl-6 pt-10 md:pl-10 md:pt-20">
      <h1 className="display text-[52px] md:text-[84px]">Not tracked yet.</h1>
      <p className="mt-6 max-w-[48ch] text-[18px] text-ivory-75">
        No Stock Token with that ticker is tracked on Robinhood Chain. Only tokens with a verifiable contract and an
        authoritative issuer record are listed.
      </p>
      <p className="mt-8 text-[15px] text-ivory-50">Tracked tickers</p>
      <ul className="mt-3 flex flex-wrap gap-2">
        {knownSymbols().map((s) => (
          <li key={s}>
            <Link href={`/assets/${s}`} className="btn btn-ghost h-10">{s}</Link>
          </li>
        ))}
      </ul>
      <Link href="/" className="btn btn-primary mt-10">Search again</Link>
    </section>
  );
}
