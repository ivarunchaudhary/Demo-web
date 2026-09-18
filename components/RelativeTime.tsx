"use client";

import { useEffect, useState } from "react";
import { timeAgo } from "@/lib/format";

/** Renders "30 seconds ago" and keeps it ticking on the client. */
export function RelativeTime({ iso }: { iso: string }) {
  const [label, setLabel] = useState(() => timeAgo(iso));
  useEffect(() => {
    const id = setInterval(() => setLabel(timeAgo(iso)), 10_000);
    return () => clearInterval(id);
  }, [iso]);
  return (
    <time dateTime={iso} title={new Date(iso).toUTCString()} suppressHydrationWarning>
      {label}
    </time>
  );
}
