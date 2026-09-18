import { Parallax } from "./motion/Parallax";
import { Petals } from "./motion/Petals";

/**
 * The hero backdrop: two botanical illustrations (cherry boughs, pink maple,
 * ginkgo and green leaves, each swaying on its own inside the SVG) that drift
 * and tilt on scroll behind the content, with loose petals falling through. A
 * gradient veil fades only the top and bottom edges so the foliage stays vivid
 * where it meets the copy. `variant="asset"` shows only the right-hand branch.
 */
export function Botanical({ variant = "home" }: { variant?: "home" | "asset" }) {
  return (
    <>
      <Parallax factor={variant === "home" ? 0.55 : 0.45} className="pointer-events-none absolute inset-0 z-0">
        <div className="absolute inset-y-0 left-1/2 w-full max-w-[1920px] -translate-x-1/2">
          {variant === "home" && (
            <div data-hero-art data-scrub-rotate="-4" className="sway absolute left-[-340px] top-[520px] h-[900px] w-[720px] lg:left-[-400px] lg:top-[440px]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/art/botanical-left.svg" alt="" className="h-full w-full object-contain" />
            </div>
          )}
          <div
            data-hero-art
            data-scrub-rotate="3"
            className={
              variant === "home"
                ? "sway-slow absolute right-[-260px] top-[-160px] h-[600px] w-[760px] lg:right-[-120px] lg:top-[-140px] lg:h-[960px] lg:w-[1240px]"
                : "sway-slow absolute right-[-300px] top-[-200px] h-[540px] w-[700px] opacity-80 lg:right-[-180px] lg:top-[-200px] lg:h-[860px] lg:w-[1110px]"
            }
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/art/botanical-right.svg" alt="" className="h-full w-full object-contain" />
          </div>
        </div>
      </Parallax>
      <div aria-hidden className="veil pointer-events-none absolute inset-0 z-[1]" />
      <Petals count={variant === "home" ? 12 : 7} />
    </>
  );
}
