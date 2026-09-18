import type { OverallStatus, Verification } from "./types";

export function timeAgo(iso: string, now: Date = new Date()): string {
  const diff = Math.max(0, now.getTime() - new Date(iso).getTime());
  const s = Math.round(diff / 1000);
  if (s < 60) return `${s} seconds ago`;
  const m = Math.round(s / 60);
  if (m < 60) return m === 1 ? "1 minute ago" : `${m} minutes ago`;
  const h = Math.round(m / 60);
  if (h < 48) return h === 1 ? "1 hour ago" : `${h} hours ago`;
  const d = Math.round(h / 24);
  return `${d} days ago`;
}

export function shortAddress(addr: string): string {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function humanise(value: string): string {
  return value.charAt(0) + value.slice(1).toLowerCase().replace(/_/g, " ");
}

export const OVERALL_MEANING: Record<OverallStatus, string> = {
  ACTIVE: "No detected operational issue.",
  WARNING: "Something requires attention, but the asset remains usable.",
  BLOCKED: "A detected condition means the asset should not currently be treated as normally usable.",
  UNKNOWN: "Insufficient verified information.",
};

export const VERIFICATION_LABEL: Record<Verification, string> = {
  VERIFIED_ONCHAIN: "Verified onchain",
  VERIFIED_AUTHORITATIVE: "Verified from authoritative source",
  UNKNOWN: "Unknown",
};

/** Maps any category value to the tone used for its indicator. */
export function tone(value: string): OverallStatus {
  switch (value) {
    case "ACTIVE":
    case "ENABLED":
    case "HEALTHY":
      return "ACTIVE";
    case "RESTRICTED":
    case "STALE":
      return "WARNING";
    case "PAUSED":
    case "FROZEN":
    case "HALTED":
    case "SUSPENDED":
    case "UNAVAILABLE":
    case "DELISTED":
      return "BLOCKED";
    default:
      return "UNKNOWN";
  }
}
