import type { OverallStatus } from "@/lib/types";

export function StatusDot({ tone, live = false, className = "" }: { tone: OverallStatus; live?: boolean; className?: string }) {
  return <span aria-hidden className={`tone-${tone} dot ${live ? "dot-live" : ""} ${className}`} />;
}
