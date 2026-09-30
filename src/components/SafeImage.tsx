"use client";

import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from "react";

/** An <img> that falls back to `fallback` when the file cannot be fetched.
 *
 * CMS images are uploaded to object storage and referenced by absolute URL, so
 * the site has no way to know at render time whether one will actually load — a
 * storage permission or a deleted object only shows up in the browser. Without
 * this the reader gets the browser's broken-image glyph in the middle of a team
 * card. An empty URL takes the same path, which is why there is no separate
 * check at the call sites. */
export default function SafeImage({
  src,
  alt,
  fallback,
  className,
  style,
  loading = "lazy",
}: {
  src: string;
  alt: string;
  fallback: ReactNode;
  className?: string;
  style?: CSSProperties;
  loading?: "lazy" | "eager";
}) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  // The markup is server-rendered, so the browser starts fetching long before
  // React attaches onError — for an EAGER image that 403s, the error event is
  // usually gone by the time this component hydrates and the reader is left with
  // the browser's broken-image glyph. A finished eager request with no intrinsic
  // width is a load that failed, so that state is recovered on mount.
  //
  // We NEVER pre-judge `loading="lazy"` images: iOS Safari / WebKit reports a
  // lazy image as `complete` with `naturalWidth === 0` — sometimes even with
  // `currentSrc` set — while it is still deferred or merely decoding. The old
  // `currentSrc` guard was not enough, so real CMS images (e.g. the news cards)
  // were wrongly flagged as failed and vanished on mobile Safari and Chrome.
  // Lazy images are left entirely to their own onLoad / onError below.
  useEffect(() => {
    const el = ref.current;
    if (el && loading !== "lazy" && el.complete && el.naturalWidth === 0 && el.currentSrc) setFailed(true);
  }, [loading]);

  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt}
      className={className}
      style={style}
      loading={loading}
      onLoad={() => setFailed(false)}
      onError={() => setFailed(true)}
    />
  );
}
