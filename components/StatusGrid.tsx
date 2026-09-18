import Link from "next/link";
import type { CSSProperties } from "react";
import { EcoRow } from "./motion/EcoRow";
import type { OverallStatus } from "@/lib/types";
import { humanise, tone } from "@/lib/format";
import { StatusDot } from "./StatusDot";

export type StatusExplainer = {
  status: OverallStatus;
  meaning: string;
  causes: string[];
  /** What a reader should do about this status. */
  advice: string;
  /** A tracked token currently in this state, if any, with the five signals behind its status. */
  example?: { asset: string; name: string; signals?: { label: string; value: string; tone?: OverallStatus }[] };
};

/**
 * Four status rows in grove.finance's ecosystem layout: an illustrated tile
 * carrying the status word beside a moss panel with the definition. Rows
 * alternate sides. Hovering a row widens the tile, slides the illustration
 * aside and reveals a readout: the five signals behind an example token's
 * status, and what to do about it.
 */
export function StatusGrid({ items }: { items: StatusExplainer[] }) {
  return (
    <div className="grid gap-2">
      {items.map((it, i) => (
        <EcoRow key={it.status} tone={`tone-${it.status}`} flip={i % 2 === 1}>
          <div className="eco-tile">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={i % 2 === 0 ? "/art/botanical-right.svg" : "/art/botanical-left.svg"} alt="" loading="lazy" style={i % 2 === 1 ? { top: "-70%", right: "-25%", height: "230%" } : undefined} />
            <StatusDot tone={it.status} live={it.status !== "UNKNOWN"} className="eco-tile-dot dot-lg" />
            <span className="eco-tile-word">{humanise(it.status)}</span>
            <div className="eco-reveal" aria-hidden>
              <p className="eco-reveal-kicker">{it.example ? `Read from ${it.example.asset}` : "Signals behind it"}</p>
              {it.example?.signals ? (
                <ul className="eco-reveal-signals">
                  {it.example.signals.map((sig, n) => (
                    <li
                      key={sig.label}
                      className={`tone-${sig.tone ?? tone(sig.value)}`}
                      /* Where in the 0 → 1 reveal this signal starts fading up. */
                      style={{ "--d": 0.12 + n * 0.09 } as CSSProperties}
                    >
                      <span className="dot" />
                      <span className="eco-reveal-label">{sig.label}</span>
                      <span className="eco-reveal-value">{humanise(sig.value)}</span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="eco-reveal-empty">No token is in this state right now.</p>
              )}
              <p className="eco-reveal-advice">{it.advice}</p>
            </div>
          </div>
          <div className="eco-panel">
            <div>
              <h3>{humanise(it.status)}</h3>
              <p className="mt-6">{it.meaning}</p>
              <ul className="mt-5">
                {it.causes.map((c) => (
                  <li key={c}>{c}</li>
                ))}
              </ul>
            </div>
            {it.example ? (
              <Link href={`/assets/${it.example.asset}`} className="link self-start text-[14px]">
                See {it.example.asset} — currently {humanise(it.status).toLowerCase()}
              </Link>
            ) : (
              <span className="text-[14px] text-ivory-60">No tracked token is in this state right now.</span>
            )}
          </div>
        </EcoRow>
      ))}
    </div>
  );
}
