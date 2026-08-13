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
  // React attaches onError — for an image that 403s, the error event is usually
  // gone by the time this component hydrates and the reader is left with the
  // browser's broken-image glyph. A finished request with no intrinsic width is
  // a load that failed, so the same state is recovered on mount.
  useEffect(() => {
    const el = ref.current;
    if (el && el.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (!src || failed) return <>{fallback}</>;
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img ref={ref} src={src} alt={alt} className={className} style={style} loading={loading} onError={() => setFailed(true)} />
  );
}
