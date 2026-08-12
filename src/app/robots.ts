import type { MetadataRoute } from "next";

import { SITE_INDEXABLE, SITE_URL } from "@/lib/i18n";

// Read at request time, not baked at build: SITE_URL and SITE_INDEXABLE are set
// per host in the server's .env, and switching to the real domain is meant to be
// an env change plus a restart. A statically prerendered robots/sitemap would
// keep serving the values that were present when the image was built.
export const dynamic = "force-dynamic";


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
