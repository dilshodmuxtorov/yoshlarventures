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
  // React attaches onError — for an image that 403s, the error event can be gone
  // by hydration, leaving the reader with the browser's broken-image glyph.
  //
  // The old fix pre-judged that on mount with `complete && naturalWidth === 0`.
  // That is UNRELIABLE on iOS Safari / WebKit, which reports a perfectly good
  // image as `complete` with `naturalWidth === 0` while it is still decoding —
  // so real photos (team cards, news images) were wrongly flagged as failed and
  // vanished on mobile. `img.decode()` settles it reliably on every browser: it
  // resolves once the image can paint and rejects only when it truly cannot. We
  // consult it only for an image the browser has already selected a source for
  // (`currentSrc`) and finished (`complete`) yet has no dimensions — never for a
  // deferred lazy image, so lazy loading is preserved.
  useEffect(() => {
    const el = ref.current;
    if (!el || !el.currentSrc || !el.complete || el.naturalWidth > 0) return;
    let cancelled = false;
    el.decode().then(
      () => {
        if (!cancelled) setFailed(false);
      },
      () => {
        // Only give up if it still has no dimensions — decode() can reject when
        // the src changes mid-flight, which the cleanup already handles.
        if (!cancelled && el.complete && el.naturalWidth === 0) setFailed(true);
      },
    );
    return () => {
      cancelled = true;
    };
  }, [src]);

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
