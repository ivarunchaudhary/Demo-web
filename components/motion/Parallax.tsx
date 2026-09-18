/**
 * A layer that MotionRoot drifts against the scroll (ScrollTrigger scrub).
 * `factor` is the fraction of the enclosing [data-parallax-scope]'s height the
 * layer travels over that section. `from="below"` starts it pushed down and
 * rising, for decorations that sit ahead of the footer.
 */
export function Parallax({
  factor = 0.6,
  from,
  className = "",
  children,
}: {
  factor?: number;
  from?: "below";
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <div data-parallax={factor} data-parallax-from={from} className={`will-change-transform ${className}`}>
      {children}
    </div>
  );
}
