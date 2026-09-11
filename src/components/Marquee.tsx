"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Seamless marquee that the reader can also grab. The track is two identical
 * halves; a rAF loop advances scrollLeft and wraps at the halfway point, so the
 * stream never shows a seam. Hovering (desktop) or touching (mobile) pauses it
 * in place, and a pointer drag scrolls it left/right by hand.
 *
 * Each half must be at least as wide as the viewport for the wrap to land on
 * identical content, so one set of children is measured and repeated enough
 * times per half.
 */
export default function Marquee({ children, durationSec = 40, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null);
  const [perHalf, setPerHalf] = useState(1);

  useEffect(() => {
    const compute = () => {
      const c = scrollRef.current;
      const s = setRef.current;
      if (!c || !s) return;
      const setW = s.scrollWidth;
      if (!setW) return;
      // +1 so a half always overflows the container (never exactly flush).
      setPerHalf(Math.max(1, Math.ceil(c.offsetWidth / setW) + 1));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (scrollRef.current) ro.observe(scrollRef.current);
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
    let hovering = false;
    let dragging = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;

    // One of the two identical halves — the seamless wrap distance.
    const half = () => el.scrollWidth / 2;
    const wrap = () => {
      const h = half();
      if (h <= 0) return;
      if (el.scrollLeft >= h) el.scrollLeft -= h;
      else if (el.scrollLeft < 0) el.scrollLeft += h;
    };
    const speed = () => half() / Math.max(1, durationSec); // px per second

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (reduce || hovering || dragging) return;
      el.scrollLeft += speed() * dt;
      wrap();
    };
    raf = requestAnimationFrame(tick);

    // True while the pointer is within the element's box. Recomputed on release
    // so a drag that ends off the track resumes immediately.
    const isOver = (x: number, y: number) => {
      const r = el.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };

    const onEnter = () => { hovering = true; };
    const onLeave = () => { if (!dragging) { hovering = false; last = 0; } };

    // Move/up are bound to the window (not captured on the element) for the life
    // of a drag: pointer capture would suppress the enter/leave events this relies
    // on to know when to resume, so after a drag the track would stay paused.
    const onWinMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startLeft - dx;
      wrap();
    };
    const onWinUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      el.style.cursor = "grab";
      // Resume unless the pointer is still resting over the track.
      hovering = isOver(e.clientX, e.clientY);
      last = 0;
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      hovering = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      moved = 0;
      el.style.cursor = "grabbing";
      window.addEventListener("pointermove", onWinMove);
      window.addEventListener("pointerup", onWinUp);
      window.addEventListener("pointercancel", onWinUp);
    };
    // A drag must not also click a card link underneath it, nor start the native
    // image ghost-drag.
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onDragStart = (e: Event) => e.preventDefault();

    el.addEventListener("pointerenter", onEnter);
    el.addEventListener("pointerleave", onLeave);
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("click", onClickCapture, true);
    el.addEventListener("dragstart", onDragStart);

    return () => {
      cancelAnimationFrame(raf);
      el.removeEventListener("pointerenter", onEnter);
      el.removeEventListener("pointerleave", onLeave);
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("click", onClickCapture, true);
      el.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
  }, [durationSec, perHalf]);

  const sets = (measureFirst: boolean) =>
    Array.from({ length: perHalf }).map((_, i) => (
      <div key={i} ref={measureFirst && i === 0 ? setRef : undefined} className="flex shrink-0" style={{ gap }}>
        {children}
      </div>
    ));

  return (
    // touch-action pan-y: vertical swipes still scroll the page, horizontal drags
    // are ours to handle via the pointer events above.
    <div ref={scrollRef} className="overflow-x-auto hide-scrollbar" style={{ cursor: "grab", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}>
      <div className="flex w-max" style={{ gap }}>
        <div className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
