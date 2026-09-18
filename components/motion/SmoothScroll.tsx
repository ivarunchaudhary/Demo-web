"use client";

import { useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

/**
 * Lenis smooth scroll, driven by GSAP's ticker so ScrollTrigger and every
 * scrubbed tween read the same eased scroll position on the same frame.
 * Wheel and trackpad input is interpolated (lerp) instead of jumping, which is
 * what makes the ticker lean, the parallax and the footer botanicals glide
 * rather than step. Skipped entirely under prefers-reduced-motion.
 */
export function SmoothScroll() {
  const pathname = usePathname();

  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const lenis = new Lenis({
      lerp: 0.09,
      wheelMultiplier: 1,
      touchMultiplier: 1.4,
      anchors: { offset: -88 }, // clear the fixed header on /#section links
      stopInertiaOnNavigate: true,
    });

    lenis.on("scroll", ScrollTrigger.update);
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);

    // Let ScrollTrigger drive the scroll position when it needs to (pinning, scrollTo).
    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length && typeof value === "number") lenis.scrollTo(value, { immediate: true });
        return lenis.scroll;
      },
      getBoundingClientRect: () => ({ top: 0, left: 0, width: window.innerWidth, height: window.innerHeight }),
    });
    ScrollTrigger.refresh();

    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
    };
  }, []);

  // New route: land at the top (or the hash) without carrying over inertia.
  useEffect(() => {
    if (window.location.hash) return;
    window.scrollTo(0, 0);
  }, [pathname]);

  return null;
}
