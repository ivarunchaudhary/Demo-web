"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Wordmark } from "./Wordmark";

/**
 * Fixed header that slides away while you scroll down and returns as soon as
 * you scroll up. Once the page is scrolled, a blurred bar with a hairline sits
 * behind it, exactly as on grove.finance.
 */
export function SiteHeader() {
  const [hidden, setHidden] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    let last = window.scrollY;
    let raf = 0;
    const onScroll = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = 0;
        const y = window.scrollY;
        setScrolled(y > 8);
        if (y < 80) setHidden(false);
        else if (Math.abs(y - last) > 6) setHidden(y > last);
        last = y;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <header
      className={`site-header fixed inset-x-0 top-0 z-50 transition-transform duration-300 ease-out motion-reduce:transition-none ${hidden ? "-translate-y-full" : ""}`}
    >
      <div
        aria-hidden
        className={`pointer-events-none absolute inset-x-0 top-0 h-[88px] border-b border-hairline bg-paper/85 backdrop-blur-[12px] transition-opacity duration-200 ${scrolled ? "opacity-100" : "opacity-0"}`}
      />
      <nav className="wrap relative flex h-[88px] items-center justify-between">
        <Wordmark preload />
        <div className="flex items-center gap-4 md:gap-8">
          <Link href="/#use-cases" className="link-nav hidden md:block">
            Use cases
          </Link>
          <Link href="/#verification" className="link-nav hidden md:block">
            Statuses
          </Link>
          <Link href="/#api" className="link-nav hidden md:block">
            API
          </Link>
          <Link href="/api/assets" className="btn btn-secondary btn-sm hidden sm:inline-flex">
            Launch data
          </Link>
          <Link href="/app" className="btn btn-primary btn-sm">
            Check a token
          </Link>
        </div>
      </nav>
    </header>
  );
}
