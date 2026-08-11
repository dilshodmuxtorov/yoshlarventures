"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Seamless CSS marquee. The track is two identical halves sliding -50%. For the
 * loop to never expose a gap, each half must be at least as wide as the viewport,
 * so we measure one set of children against the container and repeat the set
 * enough times per half. Every gap (card↔card, set↔set, half↔half) is equal, so
 * the whole track is a uniform stream and -50% always lands on identical content.
 */
export default function Marquee({ children, durationSec = 40, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [perHalf, setPerHalf] = useState(1);

  useEffect(() => {
    const compute = () => {
      const c = containerRef.current;
      const s = setRef.current;
      if (!c || !s) return;
      const setW = s.scrollWidth;
      if (!setW) return;
      // +1 so a half always overflows the container (never exactly flush).
      setPerHalf(Math.max(1, Math.ceil(c.offsetWidth / setW) + 1));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [children]);

  const sets = (measureFirst: boolean) =>
    Array.from({ length: perHalf }).map((_, i) => (
      <div key={i} ref={measureFirst && i === 0 ? setRef : undefined} className="flex shrink-0" style={{ gap }}>
        {children}
      </div>
    ));

  return (
    <div ref={containerRef} className="overflow-hidden">
      <div className="marquee" style={{ ["--dur" as string]: `${durationSec}s`, gap }}>
        <div className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
