"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

/**
 * A handful of loose blossom petals drifting down through the hero, each on
 * its own loop: a slow fall, a side-to-side sway and a tumble. Rebuilt on
 * resize so they always span the section. Hidden under reduced motion (CSS).
 */
export function Petals({ count = 12 }: { count?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const host = ref.current;
    if (!host) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const ctx = gsap.context(() => {
      const petals = gsap.utils.toArray<HTMLElement>(".petal", host);
      const fall = (el: HTMLElement) => {
        const h = host.offsetHeight + 80;
        const x = gsap.utils.random(0, host.offsetWidth);
        const dur = gsap.utils.random(11, 19);
        gsap.set(el, { x, y: -40, opacity: 0, rotate: gsap.utils.random(0, 360), scale: gsap.utils.random(0.7, 1.2) });
        const tl = gsap.timeline({ onComplete: () => fall(el) });
        tl.to(el, { y: h, duration: dur, ease: "none" }, 0)
          .to(el, { x: `+=${gsap.utils.random(-90, 90)}`, duration: dur / 2, yoyo: true, repeat: 1, ease: "sine.inOut" }, 0)
          .to(el, { rotate: `+=${gsap.utils.random(240, 540)}`, duration: dur, ease: "none" }, 0)
          .to(el, { opacity: 0.9, duration: 1.2 }, 0)
          .to(el, { opacity: 0, duration: 1.6 }, dur - 1.6);
      };
      petals.forEach((el, i) => gsap.delayedCall(gsap.utils.random(0, 12) * (i ? 1 : 0), () => fall(el)));
    }, host);

    return () => ctx.revert();
  }, []);

  return (
    <div ref={ref} aria-hidden className="pointer-events-none absolute inset-0 z-[2] overflow-hidden">
      {Array.from({ length: count }, (_, i) => (
        <svg key={i} className="petal" viewBox="-8 -14 16 16" fill="currentColor">
          <path d="M0 0C-4.4-.4-5-6.8-1.6-8Q0-6.9 1.6-8C5-6.8 4.4-.4 0 0Z" fillOpacity=".85" stroke="#c2405f" strokeOpacity=".5" strokeWidth=".6" />
        </svg>
      ))}
    </div>
  );
}
