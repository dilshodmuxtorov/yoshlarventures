"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/**
 * Seamless, draggable marquee. The auto-loop is a CSS compositor animation (see
 * `.marquee` in globals.css) — iOS Safari throttles rAF during scroll, so a JS
 * loop froze at the end; a CSS animation keeps looping. Drag is driven through
 * the Web Animations API by setting the running animation's `currentTime`, so
 * the finger scrubs the same animation (no restart, no inline-transform fight,
 * and it repaints on iOS without needing a page scroll to kick it).
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

    // The CSS animation as a WAAPI Animation. Queried live (it may not exist yet
    // on the first run, and prefers-reduced-motion removes it entirely).
    const anim = () => track.getAnimations()[0] as Animation | undefined;

    let dragging = false;
    let hovering = false; // mouse only
    let startX = 0;
    let startTime = 0;
    let moved = 0;

    const periodPx = () => track.scrollWidth / 2 + gap / 2; // one loop, in px
    const periodMs = () => Math.max(1, durationSec) * 1000; // one loop, in ms

    const applyPlayState = () => {
      const a = anim();
      if (!a) return;
      if (dragging || hovering) a.pause();
      else a.play();
    };

    const onEnter = () => { hovering = true; applyPlayState(); };
    const onLeave = () => { hovering = false; applyPlayState(); };

    const onWinMove = (e: PointerEvent) => {
      if (!dragging) return;
      const a = anim();
      if (!a) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      // Dragging left (dx < 0) advances the loop (content moves left).
      const per = periodMs();
      const dtime = (dx / periodPx()) * per;
      let ct = startTime - dtime;
      ct = ((ct % per) + per) % per;
      a.currentTime = ct;
    };
    const onWinUp = () => {
      if (!dragging) return;
      dragging = false;
      wrap.style.cursor = "grab";
      applyPlayState(); // resume unless a mouse is still hovering
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
    };
    const onDown = (e: PointerEvent) => {
      const a = anim();
      if (!a) return;
      dragging = true;
      a.pause();
      startX = e.clientX;
      startTime = Number(a.currentTime) || 0;
      moved = 0;
      wrap.style.cursor = "grabbing";
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

    wrap.addEventListener("mouseenter", onEnter);
    wrap.addEventListener("mouseleave", onLeave);
    wrap.addEventListener("pointerdown", onDown);
    wrap.addEventListener("click", onClickCapture, true);
    wrap.addEventListener("dragstart", onDragStart);
    return () => {
      wrap.removeEventListener("mouseenter", onEnter);
      wrap.removeEventListener("mouseleave", onLeave);
      wrap.removeEventListener("pointerdown", onDown);
      wrap.removeEventListener("click", onClickCapture, true);
      wrap.removeEventListener("dragstart", onDragStart);
      window.removeEventListener("pointermove", onWinMove);
      window.removeEventListener("pointerup", onWinUp);
      window.removeEventListener("pointercancel", onWinUp);
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
