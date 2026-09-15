"use client";

import { Children, useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Infinite auto-scrolling rail that NEVER blanks on iOS.
 *
 * History of what does NOT work on mobile Safari: (1) any track that lays the whole
 * list out ≥2× in one row is tens of thousands of px wide and iOS drops the slice it
 * can't texture → blank "after the last card"; (2) positioning each card with its own
 * `translate3d` promotes ~23 cards to ~23 compositor layers at once, iOS runs out of
 * GPU memory and drops one → blank; (3) papering over (2) by toggling
 * `visibility:hidden` on off-screen cards made iOS repaint the layers late → cards
 * flickered in and out.
 *
 * What DOES work: keep every card ABSOLUTELY positioned inside a viewport-width,
 * `overflow:hidden` box and move it by animating `left` — a plain layout property that
 * creates NO compositor layer, so there is no GPU memory to exhaust and nothing to
 * flicker. Off-screen cards are clipped by the box so they cost no paint. An item that
 * scrolls past the left edge wraps one run-length to the right (`x += totalRun`), so
 * the loop is seamless. Only ~2-3 cards are ever painted, at slow speed, so `left`
 * repaints stay cheap and smooth.
 *
 * `durationSec` = seconds to travel one full run (one copy of the list), so speed
 * stays consistent. Pauses on hover; follows finger/mouse drag then resumes.
 */
export default function Marquee({
  children,
  durationSec = 40,
  gap = 16,
}: {
  children: ReactNode;
  durationSec?: number;
  gap?: number;
}) {
  const items = Children.toArray(children);
  const n = items.length;
  const boxRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<(HTMLDivElement | null)[]>([]);
  // How many times the list is repeated in the DOM. A single copy of the list has
  // to be at least one screen + one card wide, otherwise a gap would open at the
  // wrap; short lists (a few partner logos) are repeated until they fill it.
  const [reps, setReps] = useState(1);

  useEffect(() => {
    const box = boxRef.current;
    if (!box || n === 0) return;
    const nodes = nodeRefs.current.slice(0, reps * n).filter(Boolean) as HTMLDivElement[];
    if (nodes.length === 0) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    let widths: number[] = [];
    let basePos: number[] = [];
    let totalRun = 0; // width of ALL rendered nodes (reps copies) + their gaps
    let singleRun = 0; // width of ONE copy of the list + gaps
    let boxW = 0; // viewport width of the clip box

    // Measure the natural (flex) size of each card, then pin it absolutely. We let
    // the nodes lay out in normal flow first so their clamp()/vw widths resolve,
    // read them, then take them out of flow and drive them by transform.
    const layout = (): boolean => {
      nodes.forEach((el) => {
        el.style.position = "";
        el.style.left = "";
        el.style.top = "";
        el.style.width = "";
      });
      box.style.height = "";

      widths = nodes.map((el) => el.offsetWidth);
      const maxH = Math.max(...nodes.map((el) => el.offsetHeight));
      const maxW = Math.max(...widths);

      basePos = [];
      let acc = 0;
      for (let i = 0; i < nodes.length; i++) {
        basePos[i] = acc;
        acc += widths[i] + gap;
      }
      totalRun = acc;
      singleRun = 0;
      for (let i = 0; i < n; i++) singleRun += widths[i] + gap;

      // Need one copy to span the viewport plus a card, so no gap shows at the wrap.
      boxW = box.offsetWidth || 1;
      if (singleRun > 0) {
        const need = Math.max(1, Math.ceil((boxW + maxW) / singleRun));
        if (need !== reps) {
          setReps(need); // re-render with the right number of copies; effect re-runs
          return false;
        }
      }

      box.style.height = `${maxH}px`;
      nodes.forEach((el, i) => {
        el.style.position = "absolute";
        el.style.top = "0";
        el.style.left = "0";
        el.style.width = `${widths[i]}px`;
      });
      return true;
    };

    if (!layout()) return; // bailed to fix `reps`; the re-render restarts the effect

    let offset = 0;
    const place = () => {
      if (totalRun <= 0) return;
      const off = ((offset % totalRun) + totalRun) % totalRun;
      for (let i = 0; i < nodes.length; i++) {
        let x = basePos[i] - off;
        if (x < -(widths[i] + gap)) x += totalRun; // wrapped past the left → to the right end
        // `left`, not transform: no compositor layer, so nothing for iOS to drop or flicker.
        nodes[i].style.left = `${x}px`;
      }
    };
    place();

    const pxPerSec = () => singleRun / Math.max(1, durationSec);

    let raf = 0;
    let last = 0;
    let paused = false; // mouse hover
    let dragging = false;
    let maybeDrag = false;
    let startX = 0;
    let startY = 0;
    let startOffset = 0;
    let moved = 0;

    const tick = (t: number) => {
      raf = requestAnimationFrame(tick);
      if (!last) last = t;
      const dt = (t - last) / 1000;
      last = t;
      if (reduce || paused || dragging) return;
      offset += pxPerSec() * dt;
      place();
    };
    raf = requestAnimationFrame(tick);

    const onEnter = () => {
      paused = true;
    };
    const onLeave = () => {
      paused = false;
      last = 0;
    };
    const onDown = (e: PointerEvent) => {
      maybeDrag = true;
      dragging = false;
      startX = e.clientX;
      startY = e.clientY;
      startOffset = offset;
      moved = 0;
    };
    const onMove = (e: PointerEvent) => {
      if (!maybeDrag) return;
      const dx = e.clientX - startX;
      const dy = e.clientY - startY;
      // Wait until the gesture is clearly horizontal before hijacking it, so a
      // vertical page scroll on touch is never stolen.
      if (!dragging) {
        if (Math.abs(dx) < 6 || Math.abs(dx) <= Math.abs(dy)) return;
        dragging = true;
        box.style.cursor = "grabbing";
        box.setPointerCapture?.(e.pointerId);
      }
      moved = Math.max(moved, Math.abs(dx));
      offset = startOffset - dx;
      place();
    };
    const endDrag = (e: PointerEvent) => {
      maybeDrag = false;
      if (!dragging) return;
      dragging = false;
      box.style.cursor = "grab";
      box.releasePointerCapture?.(e.pointerId);
      last = 0;
    };
    const onClick = (e: MouseEvent) => {
      if (moved > 6) {
        e.preventDefault();
        e.stopPropagation();
        moved = 0;
      }
    };

    const ro = new ResizeObserver(() => {
      if (dragging) return;
      if (layout()) place();
    });
    ro.observe(box);

    box.addEventListener("mouseenter", onEnter);
    box.addEventListener("mouseleave", onLeave);
    box.addEventListener("pointerdown", onDown);
    box.addEventListener("pointermove", onMove);
    box.addEventListener("pointerup", endDrag);
    box.addEventListener("pointercancel", endDrag);
    box.addEventListener("click", onClick, true);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      box.removeEventListener("mouseenter", onEnter);
      box.removeEventListener("mouseleave", onLeave);
      box.removeEventListener("pointerdown", onDown);
      box.removeEventListener("pointermove", onMove);
      box.removeEventListener("pointerup", endDrag);
      box.removeEventListener("pointercancel", endDrag);
      box.removeEventListener("click", onClick, true);
    };
  }, [children, durationSec, gap, reps, n]);

  return (
    <div
      ref={boxRef}
      className="relative overflow-hidden hide-scrollbar flex"
      style={{ cursor: "grab", touchAction: "pan-y", gap }}
    >
      {Array.from({ length: reps }).flatMap((_, r) =>
        items.map((child, i) => (
          // `flex` on the wrapper keeps the child a flex item so its
          // `flex: 0 0 clamp(...)` basis still resolves while we measure.
          <div
            key={`${r}-${i}`}
            ref={(el) => {
              nodeRefs.current[r * n + i] = el;
            }}
            className="shrink-0 flex"
          >
            {child}
          </div>
        )),
      )}
    </div>
  );
}
