"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, useSyncExternalStore } from "react";

type Texts = Record<string, string>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

const REDUCED_MOTION = "(prefers-reduced-motion: reduce)";

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

export default function Hero({ texts, applyHref, portfolioHref, applyLabel, portfolioLabel }: { texts: Texts; applyHref: string; portfolioHref: string; applyLabel: string; portfolioLabel: string }) {
  const pairs = [
    { q: texts.q1, a: texts.a1 },
    { q: texts.q2, a: texts.a2 },
    { q: texts.q3, a: texts.a3 },
    { q: texts.q4, a: texts.a4 },
  ].filter((p) => p.q || p.a);

  const reduced = usePrefersReducedMotion();
  const [pi, setPi] = useState(0);
  const [qt, setQt] = useState(pairs[0]?.q ?? texts.h1 ?? "");
  const [at, setAt] = useState(pairs[0]?.a ?? "");

  // With motion suppressed the pair is shown whole instead of typed out.
  const shownQ = reduced ? (pairs[pi]?.q ?? texts.h1 ?? "") : qt;
  const shownA = reduced ? (pairs[pi]?.a ?? "") : at;

  useEffect(() => {
    if (pairs.length === 0 || reduced) return;
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
  }, [pi, reduced]);

  return (
    <section className="relative overflow-hidden -mt-20">
      {/* Warm hero backdrop + grid */}
      <div aria-hidden className="absolute inset-0 -z-10" style={{ background: "radial-gradient(120% 90% at 72% -10%, var(--warm) 0%, transparent 55%)" }} />
      <div aria-hidden className="absolute inset-0 -z-10 opacity-60" style={{ backgroundImage: "linear-gradient(var(--hair) 1px, transparent 1px), linear-gradient(90deg, var(--hair) 1px, transparent 1px)", backgroundSize: "48px 48px", WebkitMaskImage: "radial-gradient(80% 60% at 50% 0%, #000 0%, transparent 80%)", maskImage: "radial-gradient(80% 60% at 50% 0%, #000 0%, transparent 80%)" }} />

      <div className="container-yv pt-28 md:pt-36 pb-16 md:pb-24 grid gap-10 lg:grid-cols-[1.1fr_.9fr] items-center">
        <div>
          {texts.pill && (
            <span className="inline-flex items-center font-semibold uppercase mb-5" style={{ gap: 9, padding: "7px 15px 7px 7px", borderRadius: 999, background: "var(--warm)", color: "var(--warm-ink)", fontSize: 12, letterSpacing: "0.16em", border: "1px solid rgba(255,122,26,.16)" }}>
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
          <div className="grid w-max max-w-full">
            {pairs.map((p, i) => (
              <div
                key={i}
                aria-hidden
                className="invisible font-display font-bold"
                style={{ gridArea: "1 / 1", fontSize: "clamp(36px,4.8vw,68px)", letterSpacing: "-0.04em", lineHeight: 1.04, maxWidth: "18ch" }}
              >
                <span className="block">{p.q}</span>
                <span className="block">{p.a}</span>
              </div>
            ))}
            <h1
              className="font-display font-bold"
              style={{ gridArea: "1 / 1", alignSelf: "end", fontSize: "clamp(36px,4.8vw,68px)", letterSpacing: "-0.04em", lineHeight: 1.04, maxWidth: "18ch" }}
            >
              <span className="block">{shownQ}</span>
              <span className="block" style={{ color: "var(--orange)" }}>
                {shownA}
                <span className="caret">|</span>
              </span>
            </h1>
          </div>
          {texts.sub && <p style={{ margin: "20px 0 0", maxWidth: 480, fontSize: 17, lineHeight: 1.6, color: "var(--n500)" }}>{texts.sub}</p>}

          {(texts.stat1 || texts.stat1l) && (
            <div className="inline-flex items-center" style={{ gap: 12, marginTop: 20, padding: "10px 18px 10px 12px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "var(--elev-sm)" }}>
              <span className="font-display font-bold" style={{ fontSize: 20, letterSpacing: "-0.03em", color: "var(--orange)" }}>{texts.stat1}</span>
              <span style={{ fontSize: 14, color: "var(--n500)" }}>{texts.stat1l}</span>
            </div>
          )}

          <div className="flex flex-wrap" style={{ gap: 12, marginTop: 20 }}>
            <Link href={applyHref} className="btn-primary">
              {texts.cta || applyLabel}
              <span className="badge">↗</span>
            </Link>
            <Link href={portfolioHref} className="btn-outline">
              {texts.cta2 || portfolioLabel}
            </Link>
          </div>
        </div>

        <div className="hidden lg:flex justify-center items-center relative">
          {/* orange gradient shell, tilted -4deg, with the floating 3D logo inside */}
          <div
            className="relative"
            style={{
              width: "min(420px,100%)",
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
              <Image src="/yv/logo3d.png" alt="Yoshlar Ventures" width={440} height={434} priority className="floaty w-[78%] h-auto" style={{ filter: "drop-shadow(0 30px 40px rgba(20,20,20,.35))" }} />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
