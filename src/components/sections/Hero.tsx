"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

type Texts = Record<string, string>;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

export default function Hero({ texts, applyHref, portfolioHref, applyLabel, portfolioLabel }: { texts: Texts; applyHref: string; portfolioHref: string; applyLabel: string; portfolioLabel: string }) {
  const pairs = [
    { q: texts.q1, a: texts.a1 },
    { q: texts.q2, a: texts.a2 },
    { q: texts.q3, a: texts.a3 },
    { q: texts.q4, a: texts.a4 },
  ].filter((p) => p.q || p.a);

  // The single tallest pair (by combined length) sizes an invisible block so the
  // hero reserves exactly that pair's height — fixed while typing, no extra gap.
  const tallest = pairs.reduce(
    (m, p) => ((p.q?.length ?? 0) + (p.a?.length ?? 0) > (m.q?.length ?? 0) + (m.a?.length ?? 0) ? p : m),
    { q: texts.h1 ?? "", a: "" },
  );
  const longestQ = tallest.q ?? "";
  const longestA = tallest.a ?? "";

  const [pi, setPi] = useState(0);
  const [qt, setQt] = useState(pairs[0]?.q ?? texts.h1 ?? "");
  const [at, setAt] = useState(pairs[0]?.a ?? "");

  useEffect(() => {
    if (pairs.length === 0) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      setQt(pairs[pi].q || "");
      setAt(pairs[pi].a || "");
      return;
    }
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
  }, [pi]);

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
          <div className="relative w-max max-w-full">
            {/* invisible sizer: reserves the tallest phrase's height so the hero
                stays a fixed size while the text types and erases. max-width:18ch
                is relative to THIS 68px font, so it wraps like the design. */}
            <div
              aria-hidden
              className="invisible font-display font-bold"
              style={{ fontSize: "clamp(36px,4.8vw,68px)", letterSpacing: "-0.04em", lineHeight: 1.04, maxWidth: "18ch" }}
            >
              <span className="block">{longestQ}</span>
              <span className="block">{longestA}</span>
            </div>
            <h1
              className="absolute inset-x-0 bottom-0 font-display font-bold"
              style={{ fontSize: "clamp(36px,4.8vw,68px)", letterSpacing: "-0.04em", lineHeight: 1.04, maxWidth: "18ch" }}
            >
              <span className="block">{qt}</span>
              <span className="block" style={{ color: "var(--orange)" }}>
                {at}
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
