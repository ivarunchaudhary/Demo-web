"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * One GSAP context for the whole page, rebuilt on every route change.
 *
 *  [data-hero] / [data-hero-item] / [data-hero-art]  one orchestrated page-load sequence
 *  [data-reveal]                                    scroll-in entrance, batched so neighbours stagger
 *  [data-parallax="0.6"]                            scrubbed drift against the scroll
 *  [data-count]                                     numbers roll up from zero when they enter
 *
 * With prefers-reduced-motion everything is simply shown in place.
 */
export function MotionRoot() {
  const pathname = usePathname();

  useEffect(() => {
    const mm = gsap.matchMedia();

    mm.add(
      { motion: "(prefers-reduced-motion: no-preference)", reduced: "(prefers-reduced-motion: reduce)" },
      (ctx) => {
        const reduced = Boolean(ctx.conditions?.reduced);
        const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
        const heroItems = gsap.utils.toArray<HTMLElement>("[data-hero-item]");
        const heroArt = gsap.utils.toArray<HTMLElement>("[data-hero-art]");

        if (reduced) {
          gsap.set([...reveals, ...heroItems, ...heroArt], { clearProps: "all", opacity: 1 });
          return;
        }

        // Hero: art breathes in behind, then the copy lands line by line.
        if (heroArt.length || heroItems.length) {
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          if (heroArt.length) tl.fromTo(heroArt, { opacity: 0, scale: 1.08, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 1.8, ease: "power2.out" }, 0);
          if (heroItems.length) tl.fromTo(heroItems, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.14 }, 0.2);
        }

        // Section entrances.
        gsap.set(reveals, { opacity: 0, y: 28 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, overwrite: true }),
        });

        // Parallax layers drift against the scroll, scrubbed with a little lag.
        gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
          const factor = parseFloat(el.dataset.parallax ?? "0.5");
          const scope = el.closest<HTMLElement>("[data-parallax-scope]") ?? el.parentElement!;
          const fromBelow = el.dataset.parallaxFrom === "below";
          gsap.fromTo(
            el,
            { y: fromBelow ? () => scope.offsetHeight * factor * 0.5 : 0 },
            {
              y: fromBelow ? () => -scope.offsetHeight * factor * 0.2 : () => -scope.offsetHeight * factor,
              ease: "none",
              scrollTrigger: {
                trigger: scope,
                start: fromBelow ? "top bottom" : "top top",
                end: fromBelow ? "bottom bottom" : "bottom top",
                scrub: 0.9,
                invalidateOnRefresh: true,
              },
            },
          );
        });

        // Counters.
        gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
          const target = parseFloat(el.dataset.count ?? el.textContent ?? "0");
          const obj = { v: 0 };
          gsap.to(obj, {
            v: target,
            duration: 1.6,
            ease: "power2.out",
            scrollTrigger: { trigger: el, start: "top 92%", once: true },
            onUpdate: () => {
              el.textContent = Math.round(obj.v).toLocaleString("en-US");
            },
          });
        });

        // Fonts swapping in changes heights; re-measure once they arrive.
        document.fonts?.ready.then(() => ScrollTrigger.refresh());
      },
    );

    return () => mm.revert();
  }, [pathname]);

  return null;
}
