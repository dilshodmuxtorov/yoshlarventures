"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Seamless marquee driven by `transform: translateX` (not scrollLeft): iOS Safari
 * rounds scrollLeft to whole pixels, so a sub-pixel per-frame step never moved the
 * strip there. A float translate accumulator advances smoothly on every browser,
 * wrapping at the halfway point of the duplicated track so the loop shows no seam.
 * Hovering (desktop) or touching (mobile) pauses it in place, and a pointer drag
 * moves it left/right by hand.
 */
export default function Marquee({ children, durationSec = 40, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
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

  useEffect(() => {
    const c = containerRef.current;
    const track = trackRef.current;
    if (!c || !track) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let raf = 0;
    let last = 0;
    let pos = 0; // float px offset; the source of truth for the transform
    let hovering = false;
    let dragging = false;
    let startX = 0;
    let startPos = 0;
    let moved = 0;

    // One of the two identical halves — the seamless wrap distance.
    const half = () => track.scrollWidth / 2;
    const speed = () => half() / Math.max(1, durationSec); // px per second
    const wrap = () => {
      const h = half();
      if (h > 0) pos = ((pos % h) + h) % h;
    };
    const apply = () => {
      track.style.transform = `translate3d(${-pos}px,0,0)`;
    };

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (reduce || hovering || dragging) return;
      pos += speed() * dt;
      wrap();
      apply();
    };
    raf = requestAnimationFrame(tick);

    const isOver = (x: number, y: number) => {
      const r = c.getBoundingClientRect();
      return x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
    };
    const onEnter = () => { hovering = true; };
    const onLeave = () => { if (!dragging) { hovering = false; last = 0; } };

    // Move/up bound to the window for the life of a drag: capturing the pointer on
    // the element would suppress the enter/leave events resume relies on.
    const onWinMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      pos = startPos - dx;
      wrap();
      apply();
    };
    const onWinUp = (e: PointerEvent) => {
      if (!dragging) return;
      dragging = false;
      c.style.cursor = "grab";
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
      startPos = pos;
      moved = 0;
      c.style.cursor = "grabbing";
      window.addEventListener("pointermove", onWinMove);
      window.addEventListener("pointerup", onWinUp);
      window.addEventListener("pointercancel", onWinUp);
    };
    // A drag must not also click a card link, nor start a native image drag.
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onDragStart = (e: Event) => e.preventDefault();

    c.addEventListener("pointerenter", onEnter);
    c.addEventListener("pointerleave", onLeave);
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("click", onClickCapture, true);
    c.addEventListener("dragstart", onDragStart);

    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("pointerenter", onEnter);
      c.removeEventListener("pointerleave", onLeave);
      c.removeEventListener("pointerdown", onDown);
      c.removeEventListener("click", onClickCapture, true);
      c.removeEventListener("dragstart", onDragStart);
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
    // overflow hidden clips the moving track; touch-action pan-y keeps vertical
    // page scroll while horizontal drags are ours to handle.
    <div ref={containerRef} className="overflow-hidden" style={{ cursor: "grab", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}>
      <div ref={trackRef} className="flex w-max" style={{ gap, willChange: "transform" }}>
        <div className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
