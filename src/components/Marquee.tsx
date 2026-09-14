"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Auto-scrolling, draggable rail on NATIVE horizontal scroll. Native scroll never
 * blanks on mobile (the transform/CSS-animation variants did — iOS dropped the
 * huge layer). The auto-advance nudges `scrollLeft` from a float accumulator
 * (iOS rounds scrollLeft to whole px, so we track the float and write it), and
 * wraps at exactly ONE copy's width for a seamless loop. `durationSec` is the
 * time to scroll one copy, so speed is consistent. It pauses on hover/touch and
 * follows the user's own swipe, then resumes; desktop also gets mouse drag.
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
      // Enough sets so one copy is at least the viewport wide (so the duplicate
      // fills the screen at the wrap). No +1 — when a single set already overflows
      // the viewport that doubled the content to ~25k px and mobile blanked it.
      setPerHalf(Math.max(1, Math.ceil(c.offsetWidth / setW)));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (scrollRef.current) ro.observe(scrollRef.current);
    if (setRef.current) ro.observe(setRef.current);
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
    let hovering = false; // mouse over
    let touching = false; // finger on the strip (native scroll owns it)
    let dragging = false; // desktop mouse drag-to-scroll
    let startX = 0;
    let startLeft = 0;
    let moved = 0;

    const period = () => (copyRef.current?.offsetWidth ?? 0) + gap; // ONE copy + boundary gap
    const pxPerSec = () => period() / Math.max(1, durationSec);

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (reduce) return;
      if (hovering || touching || dragging) {
        pos = el.scrollLeft; // follow the user, resume from where they left it
        return;
      }
      pos += pxPerSec() * dt;
      const per = period();
      if (per > 0 && pos >= per) pos -= per; // seamless wrap (content is duplicated)
      el.scrollLeft = pos;
    };
    raf = requestAnimationFrame(tick);

    // Infinite reposition: whenever the scroll crosses one copy (auto OR a user
    // swipe), jump back by exactly one copy. The two copies are identical so the
    // jump is invisible, and neither end is ever a dead wall the user hits.
    const onScroll = () => {
      const per = period();
      if (per <= 0) return;
      if (el.scrollLeft >= per) {
        el.scrollLeft -= per;
        pos -= per;
      } else if (el.scrollLeft < 0) {
        el.scrollLeft += per;
        pos += per;
      }
    };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { hovering = false; last = 0; };
    const onTouchStart = () => { touching = true; };
    const onTouchEnd = () => { touching = false; last = 0; };
    // Desktop mouse drag-to-scroll (touch already scrolls natively).
    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      dragging = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      moved = 0;
      el.style.cursor = "grabbing";
    };
    const onWinMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startLeft - dx;
    };
    const onWinUp = () => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      last = 0;
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    el.addEventListener("mouseenter", onEnter);
    el.addEventListener("mouseleave", onLeave);
    el.addEventListener("touchstart", onTouchStart, { passive: true });
    el.addEventListener("touchend", onTouchEnd, { passive: true });
    el.addEventListener("touchcancel", onTouchEnd, { passive: true });
    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onWinMove);
    window.addEventListener("pointerup", onWinUp);
    el.addEventListener("click", onClick, true);
    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("scroll", onScroll);
      el.removeEventListener("mouseenter", onEnter);
      el.removeEventListener("mouseleave", onLeave);
      el.removeEventListener("touchstart", onTouchStart);
      el.removeEventListener("touchend", onTouchEnd);
      el.removeEventListener("touchcancel", onTouchEnd);
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      el.removeEventListener("click", onClick, true);
    };
  }, [durationSec, gap, perHalf]);

  const sets = (measureFirst: boolean) =>
    Array.from({ length: perHalf }).map((_, i) => (
      <div key={i} ref={measureFirst && i === 0 ? setRef : undefined} className="flex shrink-0" style={{ gap }}>
        {children}
      </div>
    ));

  return (
    <div ref={scrollRef} className="overflow-x-auto hide-scrollbar" style={{ cursor: "grab" }}>
      <div className="flex w-max" style={{ gap }}>
        <div ref={copyRef} className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
