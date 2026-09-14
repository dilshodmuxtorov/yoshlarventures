"use client";

import { useEffect, useRef, type ReactNode } from "react";

/**
 * Swipeable horizontal rail — the same native-scroll pattern as the projects/news
 * rails, which are rock-solid on mobile. Every auto-advancing variant (transform,
 * CSS animation, rAF-nudged scrollLeft) eventually got its layer dropped by iOS
 * Safari and the strip went blank, so this deliberately does NOT auto-scroll: it
 * is plain native scroll (finger swipe on touch, wheel/trackpad on desktop) plus
 * mouse drag-to-scroll for desktop pointers. No duplication, no transform, no rAF
 * — nothing for the browser to blank.
 *
 * `durationSec` is accepted (call sites still pass it) but unused now.
 */
export default function Marquee({ children, gap = 16 }: { children: ReactNode; durationSec?: number; gap?: number }) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Mouse drag-to-scroll (desktop). Touch is left to native scrolling.
    let down = false;
    let startX = 0;
    let startLeft = 0;
    let moved = 0;

    const onDown = (e: PointerEvent) => {
      if (e.pointerType !== "mouse") return;
      down = true;
      startX = e.clientX;
      startLeft = el.scrollLeft;
      moved = 0;
      el.style.cursor = "grabbing";
    };
    const onMove = (e: PointerEvent) => {
      if (!down) return;
      const dx = e.clientX - startX;
      moved = Math.max(moved, Math.abs(dx));
      el.scrollLeft = startLeft - dx;
    };
    const onUp = () => {
      down = false;
      el.style.cursor = "grab";
    };
    // Suppress the click a drag would otherwise fire on a card link underneath.
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    el.addEventListener("pointerdown", onDown);
    window.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    el.addEventListener("click", onClick, true);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
      el.removeEventListener("click", onClick, true);
    };
  }, []);

  return (
    <div ref={ref} className="flex overflow-x-auto hide-scrollbar" style={{ gap, cursor: "grab", scrollPaddingInline: 24 }}>
      {children}
    </div>
  );
}
