"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

type Texts = Record<string, string>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";
// The hero is single-column below 980px (where it splits into copy + art).
// Across that whole range the rotating typewriter is dropped for a static
// headline: its reserved height (sized to the tallest of four phrases) leaves a
// large void under a short phrase on phone and tablet alike.
const SINGLE_COLUMN = "(max-width: 979px)";

function subscribeToReducedMotion(onChange: () => void) {
  const query = window.matchMedia(REDUCED_MOTION);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** Read as a render-time value rather than copied into state from an effect, so
 * the typewriter simply isn't started when motion is unwanted. Assumed false on
 * the server, which matches the markup the animation starts from. */
function usePrefersReducedMotion(): boolean {
  return useSyncExternalStore(
    subscribeToReducedMotion,
    () => window.matchMedia(REDUCED_MOTION).matches,
    () => false,
  );
}

function subscribeToSingleColumn(onChange: () => void) {
  const query = window.matchMedia(SINGLE_COLUMN);
  query.addEventListener("change", onChange);
  return () => query.removeEventListener("change", onChange);
}

/** True below the 980px two-column split. Server snapshot is false, matching the desktop markup
 * the page is prerendered with; it resolves to the real value on mount. */
function useIsSingleColumn(): boolean {
  return useSyncExternalStore(
    subscribeToSingleColumn,
    () => window.matchMedia(SINGLE_COLUMN).matches,
    () => false,
  );
}

export default function Hero({ texts, applyHref, portfolioHref, applyLabel, portfolioLabel, invested }: { texts: Texts; applyHref: string; portfolioHref: string; applyLabel: string; portfolioLabel: string; invested?: string }) {
  // The stats bar below derives this from the portfel collection; the pill has
  // to read the same figure or the page states two different totals.
  const investedLabel = invested || texts.stat1;
  const pairs = [
    { q: texts.q1, a: texts.a1 },
    { q: texts.q2, a: texts.a2 },
    { q: texts.q3, a: texts.a3 },
    { q: texts.q4, a: texts.a4 },
  ].filter((p) => p.q || p.a);

  const reduced = usePrefersReducedMotion();
  const singleColumn = useIsSingleColumn();
  // Below the two-column split the rotating typewriter reserves height for the
  // tallest of four phrases, leaving a large void under a short one. A static
  // headline removes both the gap and the CLS on phone and tablet.
  const still = reduced || singleColumn;
  const [pi, setPi] = useState(0);
  const [qt, setQt] = useState(pairs[0]?.q ?? texts.h1 ?? "");
  const [at, setAt] = useState(pairs[0]?.a ?? "");

  // With motion suppressed the pair is shown whole instead of typed out.
  const shownQ = still ? (pairs[pi]?.q ?? texts.h1 ?? "") : qt;
  const shownA = still ? (pairs[pi]?.a ?? "") : at;

  useEffect(() => {
    if (pairs.length === 0 || still) return;
    let cancelled = false;
    const pair = pairs[pi];
    const q = pair.q || "";
    const a = pair.a || "";
    (async () => {
      setQt("");
      setAt("");
      for (let i = 1; i <= q.length; i++) {
        if (cancelled) return;
        setQt(q.slice(0, i));
        await sleep(26);
      }
      await sleep(220);
      for (let i = 1; i <= a.length; i++) {
        if (cancelled) return;
        setAt(a.slice(0, i));
        await sleep(32);
      }
      await sleep(1900);
      if (!cancelled) setPi((p) => (p + 1) % pairs.length);
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pi, still]);

  return (
    <section className="relative overflow-hidden -mt-20">
      {/* Warm hero backdrop + grid */}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 90% at 72% -10%, var(--warm) 0%, transparent 55%)" }} />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "linear-gradient(var(--hair) 1px, transparent 1px), linear-gradient(90deg, var(--hair) 1px, transparent 1px)", backgroundSize: "48px 48px", WebkitMaskImage: "radial-gradient(80% 60% at 50% 0%, #000 0%, transparent 80%)", maskImage: "radial-gradient(80% 60% at 50% 0%, #000 0%, transparent 80%)" }} />

      {/* Two columns from 980px up, which is where the design splits them; below
          that the illustration sits under the copy rather than beside it. */}
      <div className="container-yv pt-28 md:pt-36 pb-16 md:pb-24 grid gap-10 min-[980px]:grid-cols-[1.15fr_.85fr] items-center">
        <div>
          {texts.pill && (
            <span className="inline-flex items-center font-semibold uppercase mb-4" style={{ gap: 9, padding: "7px 15px 7px 7px", borderRadius: 999, background: "var(--warm)", color: "var(--warm-ink)", fontSize: 12, letterSpacing: "0.16em", border: "1px solid rgba(255,122,26,.16)" }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/yv/logo.png" alt="" width={20} height={20} style={{ width: 20, height: 20, borderRadius: 8 }} />
              {texts.pill}
            </span>
          )}
          {/* Every phrase is stacked in the same grid cell, all but the live one
              invisible, so the block is exactly as tall as the tallest phrase
              actually renders. Measuring by character count instead would be
              wrong wherever the text wraps differently — in English the longest
              string is not the tallest, and the heading overflowed upward over
              the pill above it. */}
          <div className="grid w-full min-[680px]:w-max max-w-full">
            {pairs.map((p, i) => (
              <div
                key={i}
                aria-hidden
                className="invisible font-display font-bold hero-title hidden min-[980px]:block"
                style={{ gridArea: "1 / 1", letterSpacing: "-0.04em", lineHeight: 1.04 }}
              >
                <span className="block">{p.q}</span>
                <span className="block">{p.a}</span>
              </div>
            ))}
            <h1
              className="font-display font-bold hero-title"
              style={{ gridArea: "1 / 1", alignSelf: "start", letterSpacing: "-0.04em", lineHeight: 1.04 }}
            >
              <span className="block">{shownQ}</span>
              <span className="block" style={{ color: "var(--orange)" }}>
                {shownA}
                {!still && <span className="caret">|</span>}
              </span>
            </h1>
          </div>
          {texts.sub && <p style={{ margin: "14px 0 0", maxWidth: 480, fontSize: 17, lineHeight: 1.6, color: "var(--n500)" }}>{texts.sub}</p>}

          {/* The action, set off from the message above by a clear group break. */}
          <div className="hero-cta flex flex-wrap" style={{ gap: 12, marginTop: 28 }}>
            <Link href={applyHref} className="btn-primary">
              {texts.cta || applyLabel}
              <span className="badge">↗</span>
            </Link>
            <Link href={portfolioHref} className="btn-outline">
              {texts.cta2 || portfolioLabel}
            </Link>
          </div>

          {/* Social proof, sitting tight under the action it reinforces. */}
          {(investedLabel || texts.stat1l) && (
            <div className="inline-flex items-center" style={{ gap: 12, marginTop: 16, padding: "10px 18px 10px 12px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "var(--elev-sm)" }}>
              <span className="font-display font-bold" style={{ fontSize: 20, letterSpacing: "-0.03em", color: "var(--orange)" }}>{investedLabel}</span>
              <span style={{ fontSize: 14, color: "var(--n500)" }}>{texts.stat1l}</span>
            </div>
          )}
        </div>

        <div className="flex justify-center items-center relative">
          {/* orange gradient shell, tilted -4deg, with the floating 3D logo inside */}
          <div
            className="relative hero-art"
            style={{
              aspectRatio: "1 / 1.06",
              borderRadius: 40,
              padding: 6,
              background: "linear-gradient(160deg, rgba(255,122,26,.9), rgba(255,154,77,.75))",
              boxShadow: "0 60px 100px -50px rgba(255,122,26,.7)",
              transform: "rotate(-4deg)",
            }}
          >
            <div
              className="h-full grid place-items-center overflow-hidden"
              style={{ borderRadius: 34, background: "linear-gradient(160deg,#FF8B2E,#FF6F0D)", boxShadow: "inset 0 1px 0 rgba(255,255,255,.45)" }}
            >
              {/* preload, not priority: priority is deprecated as of Next 16. */}
              <Image src="/yv/logo3d.png" alt="Yoshlar Ventures" width={440} height={434} preload className="floaty w-[78%] h-auto" style={{ filter: "drop-shadow(0 30px 40px rgba(20,20,20,.35))" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
