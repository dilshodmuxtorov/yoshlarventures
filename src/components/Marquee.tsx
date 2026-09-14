"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Seamless, draggable marquee. The auto-loop is a CSS compositor animation
 * (see `.marquee` in globals.css) — iOS Safari throttles/pauses `requestAnimation
 * Frame` during and after scrolling, which froze the JS version at the end; a
 * compositor animation keeps looping. A pointer drag (mouse or finger) pauses the
 * animation, moves the strip by hand, then resumes it from the dragged position
 * via a negative animation-delay, so it never jumps.
 */
export default function Marquee({ children, durationSec = 40, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const setRef = useRef<HTMLDivElement>(null); // one set, for the repeat-count measure
  const [perHalf, setPerHalf] = useState(1);

  useEffect(() => {
    const compute = () => {
      const c = wrapRef.current;
      const s = setRef.current;
      if (!c || !s) return;
      const setW = s.scrollWidth;
      if (!setW || !c.offsetWidth) return;
      // +1 so one half always overflows the container (never exactly flush).
      setPerHalf(Math.max(1, Math.ceil(c.offsetWidth / setW) + 1));
    };
    compute();
    const ro = new ResizeObserver(compute);
    if (wrapRef.current) ro.observe(wrapRef.current);
    if (setRef.current) ro.observe(setRef.current); // re-measure when images load and widen a set
    window.addEventListener("resize", compute);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", compute);
    };
  }, [children]);

  useEffect(() => {
    const wrap = wrapRef.current;
    const track = trackRef.current;
    if (!wrap || !track) return;

    let dragging = false;
    let startX = 0;
    let startTX = 0;
    let moved = 0;

    // Current translateX in px (the compositor animation resolves to a matrix).
    const currentTX = () => {
      try {
        return new DOMMatrixReadOnly(getComputedStyle(track).transform).m41;
      } catch {
        return 0;
      }
    };
    // Exact loop distance in px = one half + half a gap (matches the keyframe).
    const periodPx = () => track.scrollWidth / 2 + gap / 2;

    const onMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      track.style.transform = `translate3d(${startTX + dx}px,0,0)`;
    };
    const onUp = () => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = "grab";
      const p = periodPx();
      let tx = currentTX(); // animation is disabled, so this is the inline offset
      if (p > 0) tx = -((((-tx % p) + p) % p)); // normalise into (-p, 0]
      const frac = p > 0 ? -tx / p : 0; // 0..1 progress through one loop
      // Re-enable the compositor animation starting from the dragged phase (a
      // negative delay = already-elapsed time). The animation origin overrides
      // the inline transform, so there is no jump.
      track.style.animationDelay = `${-frac * durationSec}s`;
      track.style.animationName = "yv-marquee";
      track.style.transform = "";
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
    const onDown = (e: PointerEvent) => {
      dragging = true;
      startX = e.clientX;
      startTX = currentTX(); // read the animation's current position first
      moved = 0;
      // Disable the animation entirely (not just pause) — a paused CSS animation
      // still wins over inline transform, so the strip wouldn't move under the drag.
      track.style.animationName = "none";
      track.style.transform = `translate3d(${startTX}px,0,0)`;
      wrap.style.cursor = "grabbing";
      window.addEventListener("pointermove", onMove);
      window.addEventListener("pointerup", onUp);
      window.addEventListener("pointercancel", onUp);
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

    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("click", onClickCapture, true);
    wrap.addEventListener("dragstart", onDragStart);
    return () => {
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("click", onClickCapture, true);
      wrap.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      window.removeEventListener("pointercancel", onUp);
    };
  }, [durationSec, gap, perHalf]);

  const sets = (measureFirst: boolean) =>
    Array.from({ length: perHalf }).map((_, i) => (
      <div key={i} ref={measureFirst && i === 0 ? setRef : undefined} className="flex shrink-0" style={{ gap }}>
        {children}
      </div>
    ));

  const trackStyle = { gap, "--dur": `${durationSec}s`, "--mq-gaphalf": `${gap / 2}px` } as CSSProperties;

  return (
    // touch-action pan-y keeps vertical page scroll while horizontal drags are ours.
    <div
      ref={wrapRef}
      className="marquee-wrap overflow-hidden"
      style={{ cursor: "grab", touchAction: "pan-y", userSelect: "none", WebkitUserSelect: "none" }}
    >
      <div ref={trackRef} className="marquee" style={trackStyle}>
        <div className="flex shrink-0" style={{ gap }}>{sets(true)}</div>
        <div className="flex shrink-0" style={{ gap }} aria-hidden="true">{sets(false)}</div>
      </div>
    </div>
  );
}
