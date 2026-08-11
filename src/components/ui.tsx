import type { ReactNode } from "react";

export function Monogram({ text, size = 56 }: { text: string; size?: number }) {
  const mark = (text || "?").trim().slice(0, 2) || "Y";
  return (
    <span
      className="grid place-items-center rounded-2xl text-white font-display font-bold shrink-0"
      style={{ width: size, height: size, fontSize: size / 2.6, background: "linear-gradient(160deg,#FF8B2E,#FF6F0D)" }}
      aria-hidden="true"
    >
      {mark.charAt(0).toUpperCase() + mark.charAt(1)}
    </span>
  );
}

export function SectionHead({ eyebrow, title, sub, id }: { eyebrow?: string; title: string; sub?: string; id?: string }) {
  return (
    <div className="max-w-2xl mb-10">
      {eyebrow && <p className="eyebrow mb-3">{eyebrow}</p>}
      <h2 id={id} className="font-display font-bold leading-[1.05]" style={{ fontSize: "clamp(28px,4.4vw,52px)" }}>
        {title}
      </h2>
      {sub && <p className="mt-4 text-base md:text-lg" style={{ color: "var(--n500)" }}>{sub}</p>}
    </div>
  );
}

export function Pill({ children }: { children: ReactNode }) {
  return (
    <span className="inline-block px-3 py-1 rounded-full text-xs font-semibold" style={{ background: "var(--warm)", color: "var(--warm-ink)" }}>
      {children}
    </span>
  );
}

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <div className={`yv-card h-full ${className}`}>
      <div className="yv-card-inner p-6">{children}</div>
    </div>
  );
}
