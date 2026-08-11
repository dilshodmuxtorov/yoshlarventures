"use client";

import { useEffect, useRef } from "react";

const INTERACTIVE = "a,button,input,textarea,select,label,[role=button],[data-cursor]";

// Desktop-only custom cursor. A solid dot tracks the pointer exactly; an orange
// ring follows with a soft lag. Over a button/link the ring simply grows ~2x in
// place (stays round) — no morphing to the element. Disabled on touch devices;
// respects prefers-reduced-motion.
export default function CustomCursor() {
  const ring = useRef<HTMLDivElement>(null);
  const dot = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine) return;

    const BASE = 30;
    const HOVER = 60; // 2× in place
    let mx = window.innerWidth / 2;
    let my = window.innerHeight / 2;
    let rx = mx;
    let ry = my;
    let size = BASE;
    let raf = 0;
    let over = false;

    const onMove = (e: MouseEvent) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot.current) dot.current.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;
      const nextOver = Boolean((e.target as HTMLElement)?.closest?.(INTERACTIVE));
      if (nextOver !== over) {
        over = nextOver;
        if (ring.current) ring.current.style.background = over ? "rgba(255,122,26,.10)" : "transparent";
      }
    };

    const loop = () => {
      const ease = reduce ? 1 : 0.3;
      rx += (mx - rx) * ease;
      ry += (my - ry) * ease;
      size += ((over ? HOVER : BASE) - size) * (reduce ? 1 : 0.25);
      if (ring.current) {
        ring.current.style.width = `${size}px`;
        ring.current.style.height = `${size}px`;
        ring.current.style.transform = `translate3d(${rx - size / 2}px, ${ry - size / 2}px, 0)`;
      }
      raf = requestAnimationFrame(loop);
    };

    document.documentElement.classList.add("has-custom-cursor");
    window.addEventListener("mousemove", onMove, { passive: true });
    raf = requestAnimationFrame(loop);
    return () => {
      window.removeEventListener("mousemove", onMove);
      cancelAnimationFrame(raf);
      document.documentElement.classList.remove("has-custom-cursor");
    };
  }, []);

  return (
    <>
      <div
        ref={ring}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 30,
          height: 30,
          borderRadius: 999,
          border: "1.5px solid var(--orange)",
          background: "transparent",
          boxShadow: "0 0 12px rgba(255,122,26,.30)",
          pointerEvents: "none",
          zIndex: 2147483647,
          willChange: "transform, width, height",
          transition: "background .25s var(--ease)",
        }}
      />
      <div
        ref={dot}
        aria-hidden
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: 999,
          background: "var(--orange)",
          pointerEvents: "none",
          zIndex: 2147483647,
          willChange: "transform",
        }}
      />
    </>
  );
}
