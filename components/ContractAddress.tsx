"use client";

import { useEffect, useState } from "react";

export type Contract = {
  /** Network the contract is deployed on. */
  network: string;
  /** Deployed address. `null` until the contract is live. */
  address: string | null;
};

/** Contracts listed on the landing page. Fill in `address` once each is deployed. */
export const CONTRACTS: Contract[] = [{ network: "Robinhood Chain", address: null }];

const PLACEHOLDER = "Coming soon";

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const t = setTimeout(() => setCopied(false), 1600);
    return () => clearTimeout(t);
  }, [copied]);

  async function copy() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      const ta = document.createElement("textarea");
      ta.value = value;
      ta.setAttribute("readonly", "");
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      ta.remove();
    }
    setCopied(true);
  }

  return (
    <button type="button" onClick={copy} aria-label={label} aria-live="polite" className={`copy-btn ${copied ? "is-copied" : ""}`}>
      {copied ? (
        <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M3 8.5l3 3 7-7" />
        </svg>
      ) : (
        <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="5.5" y="5.5" width="8" height="8" rx="1.5" />
          <path d="M10.5 5.5V3.5a1 1 0 0 0-1-1h-6a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h2" />
        </svg>
      )}
      <span>{copied ? "Copied" : "Copy"}</span>
    </button>
  );
}

/**
 * Contract-address block for the hero. Each network gets its own row with the
 * address (or a "Coming soon" placeholder) and a copy button.
 */
export function ContractAddress({ contracts = CONTRACTS }: { contracts?: Contract[] }) {
  return (
    <div className="ca-box">
      <p className="ca-title">Contract address</p>
      <ul className="ca-list">
        {contracts.map((c) => {
          const value = c.address ?? PLACEHOLDER;
          return (
            <li key={c.network} className="ca-row">
              <span className="ca-network">{c.network}</span>
              <code className={`ca-value ${c.address ? "" : "is-pending"}`} title={value}>
                {value}
              </code>
              <CopyButton value={value} label={`Copy ${c.network} contract address`} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
