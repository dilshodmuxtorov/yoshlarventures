"use client";

import type { CSSProperties, ReactNode } from "react";

import SafeImage from "@/components/SafeImage";
import { useTheme } from "@/lib/useTheme";

/** A partner logo that swaps to a dark-theme variant when the site is in dark
 *  mode. `dark` is optional — partners without a dark logo simply keep `light`
 *  on both themes (matches the CMS `dark_logo_url or logo_url` fallback). */
export default function PartnerLogo({
  light,
  dark,
  alt,
  fallback,
  style,
  className,
  loading = "lazy",
}: {
  light: string;
  dark?: string;
  alt: string;
  fallback: ReactNode;
  style?: CSSProperties;
  className?: string;
  loading?: "lazy" | "eager";
}) {
  const theme = useTheme();
  const src = theme === "dark" && dark ? dark : light;
  return (
    <SafeImage src={src} alt={alt} fallback={fallback} style={style} className={className} loading={loading} />
  );
}
