"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Seamless, draggable marquee driven by `transform: translateX` (a float
 * accumulator — iOS Safari rounds scrollLeft to whole pixels, so a scroll-based
 * strip never moved there).
 *
 * The track is two identical copies. The wrap distance is the FIRST copy's width
 * plus one gap (the exact start-to-start distance of the two copies), not
 * scrollWidth/2 — the latter is short by half a gap and leaves a visible jump.
 *
 * Pause: only a real mouse hover pauses it (mouseenter/leave). Touch never pauses
 * via hover — earlier this used pointerenter/leave, which fire on touch but whose
 * `leave` is unreliable, so after one tap on a phone the strip froze forever.
 * A pointer drag (mouse or finger) scrolls it by hand and it resumes on release.
 */
export default function Marquee({ children, durationSec = 40, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const copyRef = useRef<HTMLDivElement>(null); // first of the two identical copies
  const setRef = useRef<HTMLDivElement>(null); // one set, for the repeat-count measure
  const posRef = useRef(0); // px offset; persisted across re-renders so it never jumps to 0
  const [perHalf, setPerHalf] = useState(1);

  useEffect(() => {
    const compute = () => {
      const c = containerRef.current;
      const s = setRef.current;
      if (!c || !s) return;
      const setW = s.scrollWidth;
      if (!setW || !c.offsetWidth) return;
      // +1 so one copy always overflows the container (never exactly flush).
      setPerHalf(Math.max(1, Math.ceil(c.offsetWidth / setW) + 1));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (containerRef.current) ro.observe(containerRef.current);
    if (setRef.current) ro.observe(setRef.current); // re-measure when images load and widen a set
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

    let raf = 0;
    let last = 0;
    let mouseInside = false; // mouse hover only — never set by touch
    let dragging = false;
    let startX = 0;
    let startPos = 0;
    let moved = 0;

    // Exact start-to-start distance between the two identical copies.
    const period = () => (copyRef.current?.offsetWidth ?? track.scrollWidth / 2) + gap;
    const speed = () => period() / Math.max(1, durationSec); // px per second
    const norm = () => {
      const p = period();
      if (p > 0) posRef.current = ((posRef.current % p) + p) % p;
    };
    const apply = () => {
      track.style.transform = `translate3d(${-posRef.current}px,0,0)`;
    };
    apply();

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (dragging || mouseInside) return;
      posRef.current += speed() * dt;
      norm();
      apply();
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => { mouseInside = true; };
    const onLeave = () => { mouseInside = false; last = 0; };

    const onWinMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      posRef.current = startPos - dx;
      norm();
      apply();
    };
    const onWinUp = () => {
      if (!dragging) return;
      dragging = false;
      c.style.cursor = "grab";
      last = 0; // resume immediately; mouseInside alone decides a lingering pause
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startPos = posRef.current;
      moved = 0;
      c.style.cursor = "grabbing";
      window.addEventListener("pointermove", onWinMove);
      window.addEventListener("pointerup", onWinUp);
      window.addEventListener("pointercancel", onWinUp);
    };
    // A drag must not also click a card link, nor start the native image drag.
    const onClickCapture = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };
    const onDragStart = (e: Event) => e.preventDefault();

    c.addEventListener("mouseenter", onEnter);
    c.addEventListener("mouseleave", onLeave);
    c.addEventListener("pointerdown", onDown);
    c.addEventListener("click", onClickCapture, true);
    c.addEventListener("dragstart", onDragStart);

    return () => {
      cancelAnimationFrame(raf);
      c.removeEventListener("mouseenter", onEnter);
      c.removeEventListener("mouseleave", onLeave);
      c.removeEventListener("pointerdown", onDown);
      c.removeEventListener("click", onClickCapture, true);
      c.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
  }, [durationSec, perHalf, gap]);

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
        <div ref={copyRef} className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
