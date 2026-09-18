import Link from "next/link";

export function Wordmark() {
  return (
    <Link href="/" className="display text-[26px] leading-none tracking-[-0.03em]" aria-label="AssetStatus home">
      AssetStatus
    </Link>
  );
}

/** Line-art mark: an oval seal with a rising signal, drawn in Grove's yellow. */
export function Glyph({ className = "", size = 84 }: { className?: string; size?: number }) {
  return (
    <svg
      aria-hidden
      className={`text-ink ${className}`}
      width={size}
      height={size * 1.28}
      viewBox="0 0 84 108"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
    >
      <ellipse cx="42" cy="54" rx="39" ry="51" />
      <ellipse cx="42" cy="54" rx="33" ry="45" strokeOpacity=".5" />
      <path d="M42 86V40" />
      <path d="M42 40c-8 0-14-6-16-14M42 40c8 0 14-6 16-14M42 46c-6 4-11 4-15 1M42 46c6 4 11 4 15 1" />
      <path d="M26 64c8-4 24-4 32 0M22 72c10-6 30-6 40 0" strokeOpacity=".7" />
      <circle cx="42" cy="28" r="3.5" fill="#e3d27a" stroke="none" />
    </svg>
  );
}
