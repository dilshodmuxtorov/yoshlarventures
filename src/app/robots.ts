import type { MetadataRoute } from "next";

import { SITE_INDEXABLE, SITE_URL } from "@/lib/i18n";

export default function robots(): MetadataRoute.Robots {
  // Only the production host invites crawlers. Staging serves the same pages on
  // a different origin, so indexing it would duplicate the entire site in search
  // results and compete with the real one.
  if (!SITE_INDEXABLE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
