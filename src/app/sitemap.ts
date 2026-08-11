import type { MetadataRoute } from "next";

import { HREFLANG, LOCALES, SITE_URL, type Locale } from "@/lib/i18n";

const PAGES = ["", "about", "portfolio", "news", "partners", "apply", "contact"] as const;

export default function sitemap(): MetadataRoute.Sitemap {
  const entries: MetadataRoute.Sitemap = [];
  for (const page of PAGES) {
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
