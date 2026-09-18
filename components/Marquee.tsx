import Link from "next/link";
import type { AssetSummary } from "@/lib/types";
import { humanise } from "@/lib/format";
import { StatusDot } from "./StatusDot";

/**
 * Continuous ticker of every tracked token and its status. The track is
 * rendered twice and slid by half its width, so the loop never shows a seam.
 */
export function Marquee({ assets }: { assets: AssetSummary[] }) {
  const items = [...assets, ...assets];
  return (
    <div className="marquee-mask mx-auto w-full max-w-[1920px] overflow-hidden">
      <div data-marquee className="marquee-track flex w-max items-center gap-16 motion-reduce:animate-none">
        {items.map((a, i) => (
          <Link
            key={`${a.asset}-${i}`}
            href={`/assets/${a.asset}`}
            aria-hidden={i >= assets.length}
            tabIndex={i >= assets.length ? -1 : 0}
            className="flex shrink-0 items-center gap-4 opacity-80 transition-opacity duration-200 hover:opacity-100"
          >
            <StatusDot tone={a.overall_status} />
            <span className="display text-[34px] leading-none md:text-[44px]">{a.asset}</span>
            <span className="label leading-none text-ink-50">
              {humanise(a.overall_status)}
            </span>
          </Link>
        ))}
      </div>
    </div>
  );
}
