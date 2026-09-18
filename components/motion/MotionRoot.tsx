"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";

gsap.registerPlugin(ScrollTrigger, SplitText);

/**
 * One GSAP context for the whole page, rebuilt on every route change.
 *
 *  [data-hero] / [data-hero-item] / [data-hero-art]  one orchestrated page-load sequence
 *  [data-split]                                     headings rise line by line out of a mask
 *  [data-reveal]                                    scroll-in entrance, batched so neighbours stagger
 *  [data-stagger]                                   children enter one after another
 *  [data-parallax="0.6"]                            scrubbed drift against the scroll
 *  [data-scrub-rotate="3"]                          scrubbed tilt as the section scrolls away
 *  [data-drift]                                     illustration slides a little inside its tile
 *  [data-marquee]                                   ticker that speeds up and leans with the scroll
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
        const splits = gsap.utils.toArray<HTMLElement>("[data-split]");
        const staggers = gsap.utils.toArray<HTMLElement>("[data-stagger]");

        if (reduced) {
          gsap.set([...reveals, ...heroItems, ...heroArt, ...splits], { clearProps: "all", opacity: 1 });
          staggers.forEach((s) => gsap.set(Array.from(s.children), { clearProps: "all", opacity: 1 }));
          return;
        }

        // Headings: each line lifts out of its own clipping box. The hero h1
        // starts with the page-load sequence; the rest wait for the scroll.
        // autoSplit re-runs onSplit when fonts land or the width changes.
        const splitters = splits.map((el) => {
          const inHero = Boolean(el.closest("[data-hero]"));
          gsap.set(el, { opacity: 1 });
          return SplitText.create(el, {
            type: "lines",
            linesClass: "split-line",
            mask: "lines",
            autoSplit: true,
            onSplit: (self) =>
              gsap.from(self.lines, {
                yPercent: 110,
                rotate: 1.5,
                duration: 1.1,
                ease: "power4.out",
                stagger: 0.09,
                delay: inHero ? 0.15 : 0,
                scrollTrigger: inHero ? undefined : { trigger: el, start: "top 88%", once: true },
              }),
          });
        });

        // Hero: art breathes in behind, then the copy lands line by line.
        if (heroArt.length || heroItems.length) {
          const tl = gsap.timeline({ defaults: { ease: "power3.out" } });
          if (heroArt.length) tl.fromTo(heroArt, { opacity: 0, scale: 1.08, y: 24 }, { opacity: 1, scale: 1, y: 0, duration: 1.8, ease: "power2.out" }, 0);
          const rest = heroItems.filter((el) => !el.hasAttribute("data-split"));
          if (rest.length) tl.fromTo(rest, { opacity: 0, y: 40 }, { opacity: 1, y: 0, duration: 1.1, stagger: 0.14 }, 0.45);
        }

        // Section entrances.
        gsap.set(reveals, { opacity: 0, y: 28 });
        ScrollTrigger.batch(reveals, {
          start: "top 88%",
          once: true,
          onEnter: (batch) =>
            gsap.to(batch, { opacity: 1, y: 0, duration: 1, ease: "power3.out", stagger: 0.1, overwrite: true }),
        });

        // Lists: rows file in one after another.
        staggers.forEach((list) => {
          const rows = Array.from(list.children) as HTMLElement[];
          gsap.set(rows, { opacity: 0, x: -18 });
          ScrollTrigger.create({
            trigger: list,
            start: "top 85%",
            once: true,
            onEnter: () => gsap.to(rows, { opacity: 1, x: 0, duration: 0.8, ease: "power3.out", stagger: 0.06 }),
          });
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

        // Boughs tilt and grow a touch as their section scrolls out from under them.
        gsap.utils.toArray<HTMLElement>("[data-scrub-rotate]").forEach((el) => {
          const amount = parseFloat(el.dataset.scrubRotate ?? "3");
          const scope = el.closest<HTMLElement>("[data-parallax-scope]") ?? el.parentElement!;
          gsap.to(el, {
            rotate: amount,
            scale: 1.06,
            ease: "none",
            scrollTrigger: { trigger: scope, start: "top top", end: "bottom top", scrub: 1.2 },
          });
        });

        // Illustrations inside tiles slide a little as the tile crosses the viewport.
        // The tile's hover transform already owns `transform`, so the drift goes
        // through a custom property that transform reads (see .eco-tile img).
        gsap.utils.toArray<HTMLElement>("[data-drift]").forEach((el) => {
          const amount = parseFloat(el.dataset.drift ?? "40");
          gsap.fromTo(
            el,
            { "--dy": `${amount}px` },
            { "--dy": `${-amount}px`, ease: "none", scrollTrigger: { trigger: el.parentElement, start: "top bottom", end: "bottom top", scrub: 0.8 } },
          );
        });

        // Ticker: a steady loop that speeds up and leans with the scroll, then settles.
        const settles: (() => void)[] = [];
        gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((track) => {
          track.style.animation = "none"; // the CSS loop is only the no-JS fallback
          const loop = gsap.to(track, { xPercent: -50, duration: 45, ease: "none", repeat: -1 });
          const speed = gsap.quickTo(loop, "timeScale", { duration: 0.6, ease: "power2.out" });
          const lean = gsap.quickTo(track, "skewX", { duration: 0.5, ease: "power2.out" });
          ScrollTrigger.create({
            trigger: track,
            start: "top bottom",
            end: "bottom top",
            onUpdate: (self) => {
              const v = gsap.utils.clamp(-8, 8, self.getVelocity() / 240);
              speed(1 + Math.abs(v));
              lean(-v * 0.8);
            },
          });
          const settle = () => {
            speed(1);
            lean(0);
          };
          // Velocity is only reported while scrolling; ease back once it stops.
          ScrollTrigger.addEventListener("scrollEnd", settle);
          settles.push(() => ScrollTrigger.removeEventListener("scrollEnd", settle));
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

        return () => {
          settles.forEach((off) => off());
          splitters.forEach((s) => s.revert());
          gsap.utils.toArray<HTMLElement>("[data-marquee]").forEach((t) => (t.style.animation = ""));
        };
      },
    );

    return () => mm.revert();
  }, [pathname]);

  return null;
}
