"use client";

import { useEffect, useRef, type ReactNode } from "react";
import gsap from "gsap";

/**
 * One status row, with its hover state carried by a single number.
 *
 * `--p` runs 0 → 1 and everything in the row reads from it: the illustration's
 * drift, the readout's slide, each signal's fade. A GSAP quickTo tweens it, so
 * a pointer that leaves mid-reveal reverses from wherever the row actually is
 * rather than restarting a fixed-length CSS transition. Nothing here touches
 * layout — only transforms and opacity — so the whole thing stays on the
 * compositor.
 */
export function EcoRow({ flip, tone, children }: { flip: boolean; tone: string; children: ReactNode }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    // Below the md breakpoint the readout is a static strip, not a hover state.
    if (!window.matchMedia("(min-width: 768px) and (hover: hover)").matches) return;

    const to = gsap.quickTo(el, "--p", { duration: 0.7, ease: "power3.out" });
    const open = () => to(1);
    const close = () => to(0);

    el.addEventListener("pointerenter", open);
    el.addEventListener("pointerleave", close);
    el.addEventListener("focusin", open);
    el.addEventListener("focusout", close);
    return () => {
      el.removeEventListener("pointerenter", open);
      el.removeEventListener("pointerleave", close);
      el.removeEventListener("focusin", open);
      el.removeEventListener("focusout", close);
      gsap.killTweensOf(el);
    };
  }, []);

  return (
    <div ref={ref} className={`${tone} eco-row`} data-flip={flip}>
      {children}
    </div>
  );
}
