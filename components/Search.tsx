"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { AssetSummary } from "@/lib/types";
import { StatusDot } from "./StatusDot";

export function Search({ assets }: { assets: AssetSummary[] }) {
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  const matches = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return assets
      .filter((a) => a.asset.toLowerCase().startsWith(q) || a.name.toLowerCase().includes(q))
      .slice(0, 6);
  }, [assets, query]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "/" && document.activeElement !== inputRef.current) {
        e.preventDefault();
        inputRef.current?.focus();
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  function go(symbol: string) {
    setOpen(false);
    router.push(`/assets/${symbol.toUpperCase()}`);
  }

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const pick = matches[active]?.asset ?? query.trim();
    if (pick) go(pick);
  }

  return (
    <form onSubmit={submit} role="search" className="relative w-full max-w-[720px]">
      <label htmlFor="asset-search" className="sr-only">
        Search a Stock Token
      </label>
      <div className="flex items-center gap-4 border-b border-ink-40 pb-3 transition-colors focus-within:border-ink">
        <svg aria-hidden width="22" height="22" viewBox="0 0 24 24" fill="none" className="shrink-0 text-ink-50">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.6" />
          <path d="M16.5 16.5L21 21" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
        <input
          ref={inputRef}
          id="asset-search"
          type="text"
          autoComplete="off"
          spellCheck={false}
          placeholder="Search a Stock Token…"
          value={query}
          onChange={(e) => { setQuery(e.target.value); setActive(0); setOpen(true); }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 120)}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown") { e.preventDefault(); setActive((i) => Math.min(i + 1, matches.length - 1)); }
            if (e.key === "ArrowUp") { e.preventDefault(); setActive((i) => Math.max(i - 1, 0)); }
            if (e.key === "Escape") setOpen(false);
          }}
          role="combobox"
          aria-expanded={open && matches.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          className="w-full bg-transparent text-[24px] leading-none tracking-[-0.28px] text-ink placeholder:text-ink-50 focus:outline-none md:text-[28px]"
        />
        <kbd className="hidden rounded border border-hairline px-2 py-0.5 text-[12px] text-ink-50 sm:block">/</kbd>
      </div>

      {open && query.trim() && (
        <ul
          id={listId}
          role="listbox"
          className="card absolute left-0 right-0 top-full z-10 mt-3 overflow-hidden bg-paper"
        >
          {matches.length === 0 && (
            <li className="body-sm px-5 py-4 text-ink-75">
              No Stock Token tracked for “{query.trim().toUpperCase()}”. Try a ticker like AAPL or TSLA.
            </li>
          )}
          {matches.map((a, i) => (
            <li
              key={a.asset}
              role="option"
              aria-selected={i === active}
              onMouseDown={() => go(a.asset)}
              onMouseEnter={() => setActive(i)}
              className={`flex cursor-pointer items-center gap-4 px-5 py-3.5 ${i === active ? "bg-ink-05" : ""}`}
            >
              <StatusDot tone={a.overall_status} />
              <span className="w-[72px] font-medium tracking-[0.45px]">{a.asset}</span>
              <span className="flex-1 truncate text-ink-75">{a.name}</span>
              <span className="body-sm text-ink-50">{a.overall_status.charAt(0) + a.overall_status.slice(1).toLowerCase()}</span>
            </li>
          ))}
        </ul>
      )}
    </form>
  );
}
