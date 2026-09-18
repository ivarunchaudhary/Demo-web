/**
 * Marks its content for the scroll-in entrance run by MotionRoot. Renders on
 * the server; the class keeps the block invisible until GSAP brings it in
 * (and a <noscript> rule in the layout shows everything when scripts are off).
 */
export function Reveal({
  children,
  className = "",
  as: Tag = "div",
}: {
  children: React.ReactNode;
  className?: string;
  /** Kept for call-site compatibility; stagger is now computed per batch. */
  delay?: number;
  as?: "div" | "section" | "li" | "header" | "aside";
}) {
  return (
    <Tag data-reveal className={`reveal ${className}`}>
      {children}
    </Tag>
  );
}
