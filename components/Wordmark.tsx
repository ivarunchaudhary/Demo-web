import Image from "next/image";
import Link from "next/link";

/*
 * The delivered Feels artwork, trimmed to its own ink and resized by
 * scripts/make-brand.mjs. Ratios come from those files, so a caller only ever
 * picks the drawn height (lockup) or width (glyph) and the other side follows.
 */
const LOCKUP = { src: "/brand/feels-lockup.png", ratio: 960 / 322 };
const GLYPH = { src: "/brand/feels-glyph.png", ratio: 488 / 640 };

/** The mark and "Feels" set together, linking home. `height` is drawn height in px. */
export function Wordmark({
  height = 28,
  preload = false,
  className = "",
}: {
  height?: number;
  preload?: boolean;
  className?: string;
}) {
  return (
    <Link href="/" aria-label="Feels home" className={`inline-flex items-center ${className}`}>
      <Image
        src={LOCKUP.src}
        alt=""
        width={Math.round(height * LOCKUP.ratio)}
        height={height}
        preload={preload}
      />
    </Link>
  );
}

/** The mark on its own, in its gradient cut. `size` is drawn width in px. */
export function Glyph({ className = "", size = 84 }: { className?: string; size?: number }) {
  return (
    <Image
      aria-hidden
      alt=""
      src={GLYPH.src}
      width={size}
      height={Math.round(size / GLYPH.ratio)}
      className={className}
    />
  );
}
