import type { ContentRecord } from "./api";

/** Read a string field off a CMS record. */
export const field = (r: ContentRecord, k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");

/**
 * Parse one portfel record's investment into thousands of USD.
 *
 * The column is free text typed by the marketing team, so it arrives in several
 * shapes: "$150K", "20.7", "$1.2M", "35 000". Anything unparseable returns 0 so
 * one bad cell can never turn the whole total into NaN on the public page.
 */
export function investmentK(raw: string): number {
  const cleaned = raw.replace(/[\s,$ ]/g, "");
  const match = cleaned.match(/^([0-9]*\.?[0-9]+)([KkMm])?$/);
  if (!match) return 0;
  const n = parseFloat(match[1]);
  if (!Number.isFinite(n)) return 0;
  // No suffix means the field's own unit — thousands of USD — as the dashboard
  // label ("Sarmoya, ming dollar") instructs.
  return match[2]?.toLowerCase() === "m" ? n * 1000 : n;
}

/** Total invested across the visible portfolio, in thousands of USD. */
export function totalInvestedK(items: ContentRecord[]): number {
  return items.reduce((sum, item) => sum + investmentK(field(item, "investment_thousand_usd")), 0);
}

/** "$1.47M" / "$820K" — compact money for a stat tile. */
export function formatK(thousands: number): string {
  if (thousands <= 0) return "";
  if (thousands >= 1000) {
    const millions = thousands / 1000;
    // Two decimals below 10M, one above — enough precision to be honest without
    // making the headline number hard to read.
    const text = millions >= 10 ? millions.toFixed(1) : millions.toFixed(2);
    return `$${text.replace(/\.?0+$/, "")}M`;
  }
  return `$${Math.round(thousands)}K`;
}

/** Label a portfel website_url — many of them point at Instagram or Telegram. */
export function linkKind(url: string): string {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    if (host.includes("instagram")) return "Instagram";
    if (host.includes("t.me") || host.includes("telegram")) return "Telegram";
    if (host.includes("facebook")) return "Facebook";
    if (host.includes("linkedin")) return "LinkedIn";
    if (host.includes("youtube") || host.includes("youtu.be")) return "YouTube";
    return host;
  } catch {
    return url;
  }
}
