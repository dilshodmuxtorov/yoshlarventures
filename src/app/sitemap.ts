import type { MetadataRoute } from "next";

import { getSections, isVisible } from "@/lib/api";
import { DEFAULT_LOCALE, HREFLANG, LOCALES, SITE_URL, type Locale } from "@/lib/i18n";

// Read at request time, not baked at build: SITE_URL and SITE_INDEXABLE are set
// per host in the server's .env, and switching to the real domain is meant to be
// an env change plus a restart. A statically prerendered robots/sitemap would
// keep serving the values that were present when the image was built.
export const dynamic = "force-dynamic";


const PAGES = ["", "about", "portfolio", "news", "partners", "apply", "contact"] as const;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Pages hidden from the dashboard 404, so listing them would advertise dead
  // URLs to crawlers. A failed read leaves everything listed — a sitemap that
  // errors is worse than one naming a page that is temporarily off.
  let hidden = new Set<string>();
  try {
    const sections = await getSections(DEFAULT_LOCALE);
    hidden = new Set(PAGES.filter((page) => page && !isVisible(sections, `page.${page}`)));
  } catch {
    hidden = new Set();
  }

  const entries: MetadataRoute.Sitemap = [];
  for (const page of PAGES) {
    if (hidden.has(page)) continue;
    for (const locale of LOCALES) {
      const path = `${SITE_URL}/${locale}${page ? `/${page}` : ""}`;
      const languages: Record<string, string> = {};
      for (const l of LOCALES) {
        languages[HREFLANG[l as Locale]] = `${SITE_URL}/${l}${page ? `/${page}` : ""}`;
      }
      entries.push({
        url: path,
        lastModified: new Date(),
        changeFrequency: page === "" || page === "news" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.7,
        alternates: { languages },
      });
    }
  }
  return entries;
}
