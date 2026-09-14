"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Seamless marquee built on NATIVE horizontal scroll. Earlier versions animated a
 * giant `transform`ed track; on phones that single compositor layer (tens of
 * thousands of px wide) got dropped by Safari/Chrome and the strip went blank.
 * Native scroll only renders the visible region, so it never blanks, and the
 * finger drag is the browser's own — smooth on every device.
 *
 * The auto-advance nudges `scrollLeft` from a float accumulator (iOS rounds
 * scrollLeft to whole pixels, so writing the float — not `+=` a sub-pixel — is
 * what keeps it moving), wrapping at one copy's width for a seamless loop. It
 * pauses while a finger or mouse is on the strip and follows the user's own
 * scroll, then resumes.
 */
export default function Marquee({ children, durationSec = 40, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null); // first of the two identical copies
  const setRef = useRef<HTMLDivElement>(null); // one set, for the repeat-count measure
  const [perHalf, setPerHalf] = useState(1);

  useEffect(() => {
    const compute = () => {
      const c = scrollRef.current;
      const s = setRef.current;
      if (!c || !s) return;
      const setW = s.scrollWidth;
      if (!setW || !c.offsetWidth) return;
      // +1 so one copy always overflows the viewport (never exactly flush).
      setPerHalf(Math.max(1, Math.ceil(c.offsetWidth / setW) + 1));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (scrollRef.current) ro.observe(scrollRef.current);
    if (setRef.current) ro.observe(setRef.current); // re-measure when images load
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [children]);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = 0;
    let pos = el.scrollLeft;
    let hovering = false; // mouse
    let touching = false; // finger on the strip

    const period = () => (copyRef.current?.offsetWidth ?? 0) + gap; // one copy + boundary gap
    const speed = () => period() / Math.max(1, durationSec); // px per second

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (reduce || hovering || touching) {
        pos = el.scrollLeft; // follow the user's own scroll so auto resumes from here
        return;
      }
      pos += speed() * dt;
      const per = period();
      if (per > 0 && pos >= per) pos -= per; // seamless wrap (content is duplicated)
      el.scrollLeft = pos;
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; last = 0; };
    const onTouchStart = () => { touching = true; };
    const onTouchEnd = () => { touching = false; last = 0; };

    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
    };
  }, [durationSec, gap, perHalf]);

  const sets = (measureFirst: boolean) =>
    Array.from({ length: perHalf }).map((_, i) => (
      <div key={i} ref={measureFirst && i === 0 ? setRef : undefined} className="flex shrink-0" style={{ gap }}>
        {children}
      </div>
    ));

    // No -webkit-overflow-scrolling:touch — on iOS it blanks large scroll content
    // mid-scroll; the projects/news rails omit it and stay solid. Modern iOS has
    // momentum scrolling by default anyway.
  return (
    <div ref={scrollRef} className="overflow-x-auto hide-scrollbar">
      <div className="flex w-max" style={{ gap }}>
        <div ref={copyRef} className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
