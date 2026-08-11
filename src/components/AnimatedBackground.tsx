// Fixed animated backdrop ported 1:1 from the design: drifting grid, three
// aurora blobs, pulsing cells and a soft-light grain layer. Pure CSS (no JS),
// so it renders server-side and respects prefers-reduced-motion via globals.css.

const CELLS: [number, number, string, string, string][] = [
  [112, 168, "rgba(255,122,26,.10)", "13s", "0s"],
  [392, 392, "rgba(200,242,48,.12)", "17s", "2.4s"],
  [672, 112, "rgba(255,122,26,.08)", "15s", "5.2s"],
  [840, 504, "rgba(255,154,77,.11)", "19s", "1.1s"],
  [224, 616, "rgba(255,122,26,.09)", "21s", "7.5s"],
  [1120, 280, "rgba(200,242,48,.10)", "16s", "3.8s"],
  [1288, 672, "rgba(255,122,26,.10)", "18s", "9s"],
  [560, 784, "rgba(255,154,77,.09)", "14s", "6.3s"],
];

const GRID_MASK = "radial-gradient(ellipse 90% 70% at 50% 30%, #000, transparent 78%)";

export default function AnimatedBackground() {
  return (
    <div aria-hidden style={{ position: "fixed", inset: "-2%", zIndex: -1, pointerEvents: "none", overflow: "hidden", background: "var(--surface)", contain: "strict" }}>
      {/* grid */}
      <div
        style={{
          position: "absolute",
          inset: "-10%",
          backgroundImage:
            "linear-gradient(90deg, var(--hair) 1px, transparent 1px), linear-gradient(180deg, var(--hair) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          opacity: 0.4,
          animation: "yv-gridDrift 26s linear infinite",
          WebkitMaskImage: GRID_MASK,
          maskImage: GRID_MASK,
        }}
      />
      {/* pulsing cells */}
      <div style={{ position: "absolute", inset: "-10%", animation: "yv-cellDrift 26s linear infinite", WebkitMaskImage: GRID_MASK, maskImage: GRID_MASK }}>
        {CELLS.map(([left, top, bg, dur, delay], i) => (
          <span
            key={i}
            style={{
              position: "absolute",
              left,
              top,
              width: 55,
              height: 55,
              borderRadius: 4,
              background: bg,
              animation: `yv-cellPulse ${dur} ease-in-out ${delay} infinite`,
            }}
          />
        ))}
      </div>
      {/* aurora blobs (GPU-composited; lighter blur to keep scrolling smooth) */}
      <div style={{ position: "absolute", inset: 0 }}>
        <div style={{ position: "absolute", top: "-14%", left: "-12%", width: "62vw", height: "62vw", maxWidth: 900, maxHeight: 900, borderRadius: "50%", background: "radial-gradient(circle at 40% 40%, rgba(255,122,26,.22), rgba(255,122,26,0) 65%)", filter: "blur(22px)", willChange: "transform", animation: "yv-auroraA 24s ease-in-out infinite" }} />
        <div style={{ position: "absolute", top: "22%", right: "-16%", width: "56vw", height: "56vw", maxWidth: 820, maxHeight: 820, borderRadius: "50%", background: "radial-gradient(circle at 55% 45%, rgba(200,242,48,.15), rgba(200,242,48,0) 66%)", filter: "blur(24px)", willChange: "transform", animation: "yv-auroraB 31s ease-in-out infinite" }} />
        <div style={{ position: "absolute", bottom: "-18%", left: "26%", width: "58vw", height: "58vw", maxWidth: 860, maxHeight: 860, borderRadius: "50%", background: "radial-gradient(circle at 50% 50%, rgba(255,154,77,.18), rgba(255,154,77,0) 64%)", filter: "blur(22px)", willChange: "transform", animation: "yv-auroraC 27s ease-in-out infinite" }} />
      </div>
    </div>
  );
}
