"use client";

import { useState } from "react";

/** Story video card. Shows a poster + play button (a lightweight facade so the
 *  heavy YouTube player is not loaded on every page view) and, on click, swaps
 *  it for the embedded player in place — the video plays inside the card instead
 *  of opening YouTube in a new tab. */
export default function VideoEmbed({ videoId, note, title, poster }: { videoId: string; note?: string; title?: string; poster?: string }) {
  const [playing, setPlaying] = useState(false);
  // Default to the video's own YouTube thumbnail so the card shows the actual
  // video. maxres isn't generated for every upload, so fall back to hqdefault.
  const [posterSrc, setPosterSrc] = useState(poster || `https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`);
  const height = "clamp(240px,32vw,360px)";

  if (playing) {
    return (
      <div className="yv-card-inner relative overflow-hidden block" style={{ background: "#000" }}>
        <iframe
          src={`https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title || "Video"}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
          style={{ width: "100%", height, border: 0, display: "block" }}
        />
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={() => setPlaying(true)}
      aria-label={title ? `${title} — video` : "Video"}
      className="yv-card-inner relative overflow-hidden block w-full text-left"
      style={{ background: "#141414", cursor: "pointer" }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={posterSrc}
        alt=""
        onError={() => setPosterSrc(`https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`)}
        style={{ width: "100%", height, objectFit: "cover", opacity: 0.72 }}
      />
      <span aria-hidden className="grid place-items-center text-white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 76, height: 76, borderRadius: 999, background: "var(--orange)", fontSize: 22, boxShadow: "0 18px 30px -20px rgba(255,122,26,.9)" }}>▶</span>
      {note && <span style={{ position: "absolute", left: 20, bottom: 18, color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>{note}</span>}
    </button>
  );
}
