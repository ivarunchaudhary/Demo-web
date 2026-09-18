"use client";

import { useEffect, useId, useRef, useState } from "react";
import Link from "next/link";
import gsap from "gsap";

export type ApiExample = {
  id: string;
  label: string;
  title: string;
  blurb: string;
  path: string;
  body: string;
};

/**
 * grove.finance's "Enter the Grove" pattern: a centred tab strip whose yellow
 * underline glides between tabs, above one wide card. The card's copy and code
 * cross-fade when the tab changes.
 */
export function ApiTabs({ examples }: { examples: ApiExample[] }) {
  const [active, setActive] = useState(0);
  const id = useId();
  const stripRef = useRef<HTMLDivElement>(null);
  const indicatorRef = useRef<HTMLSpanElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const ex = examples[active];

  useEffect(() => {
    const strip = stripRef.current;
    const ind = indicatorRef.current;
    if (!strip || !ind) return;
    const tab = strip.querySelectorAll<HTMLButtonElement>("[role=tab]")[active];
    if (!tab) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    gsap.to(ind, {
      x: tab.offsetLeft - strip.scrollLeft,
      width: tab.offsetWidth,
      duration: reduced ? 0 : 0.45,
      ease: "power3.out",
    });
    tab.scrollIntoView({ block: "nearest", inline: "nearest", behavior: reduced ? "auto" : "smooth" });
  }, [active]);

  useEffect(() => {
    const card = cardRef.current;
    if (!card || window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(card.querySelectorAll("[data-swap]"), { opacity: 0, y: 12 }, { opacity: 1, y: 0, duration: 0.5, stagger: 0.06, ease: "power3.out" });
    }, card);
    return () => ctx.revert();
  }, [active]);

  return (
    <div>
      <div ref={stripRef} role="tablist" aria-label="API endpoints" className="tabstrip">
        {examples.map((e, i) => (
          <button
            key={e.id}
            role="tab"
            id={`${id}-tab-${e.id}`}
            aria-selected={i === active}
            aria-controls={`${id}-panel`}
            onClick={() => setActive(i)}
          >
            {e.label}
          </button>
        ))}
        <span ref={indicatorRef} aria-hidden className="tab-indicator" />
      </div>

      <div ref={cardRef} id={`${id}-panel`} role="tabpanel" aria-labelledby={`${id}-tab-${ex.id}`} className="feature-card mt-8">
        <div>
          <h3 data-swap className="display text-[32px] text-balance md:text-[40px] xl:text-[48px]">
            {ex.title}
          </h3>
          <p data-swap className="body-sm mt-5 max-w-[42ch] text-ink-80">
            {ex.blurb}
          </p>
          <p data-swap className="mt-6 font-mono text-[13px] text-ink-60">
            GET {ex.path}
          </p>
          <Link data-swap href={`/api${ex.path}`} className="btn btn-ghost mt-8">
            Open the JSON
            <svg aria-hidden width="14" height="14" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
        </div>
        <pre data-swap className="code-panel">{ex.body}</pre>
      </div>
    </div>
  );
}
