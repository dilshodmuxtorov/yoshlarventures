import type { Metadata } from "next";

import { HREFLANG, LOCALES, SITE_URL, type Locale } from "./i18n";

const SITE_NAME = "Yoshlar Ventures";

const DEFAULTS: Record<Locale, { title: string; description: string }> = {
  uz: {
    title: "Yoshlar Ventures. Yosh taʼsischilar uchun venchur fond",
    description:
      "Yoshlar Ventures — gʻoyasi bor yosh taʼsischilar uchun venchur fond. 500 mln soʻmdan 2 mlrd soʻmgacha investitsiya va ustozlik beramiz.",
  },
  ru: {
    title: "Yoshlar Ventures. Венчурный фонд для молодых основателей",
    description:
      "Yoshlar Ventures — венчурный фонд для молодых основателей с идеей. Инвестиции от 500 млн до 2 млрд сумов и менторство.",
  },
  en: {
    title: "Yoshlar Ventures. A venture fund for young founders",
    description:
      "Yoshlar Ventures is a venture fund for young founders with an idea. We invest from 500M to 2B UZS and mentor you from day one.",
  },
};

interface PageMetaInput {
  locale: Locale;
  path?: string; // e.g. "about" or "" for home
  title?: string;
  description?: string;
  image?: string;
}

export function pageMetadata({ locale, path = "", title, description, image }: PageMetaInput): Metadata {
  const base = DEFAULTS[locale];
  const url = `${SITE_URL}/${locale}${path ? `/${path}` : ""}`;
  const languages: Record<string, string> = {};
  for (const l of LOCALES) {
    languages[HREFLANG[l]] = `${SITE_URL}/${l}${path ? `/${path}` : ""}`;
  }
  languages["x-default"] = `${SITE_URL}/${LOCALES[0]}${path ? `/${path}` : ""}`;

  const finalTitle = title ? `${title} — ${SITE_NAME}` : base.title;
  const finalDesc = description || base.description;
  const ogImage = image || `${SITE_URL}/og.png`;

  return {
    metadataBase: new URL(SITE_URL),
    title: finalTitle,
    description: finalDesc,
    alternates: { canonical: url, languages },
    openGraph: {
      type: "website",
      siteName: SITE_NAME,
      locale,
      url,
      title: finalTitle,
      description: finalDesc,
      images: [{ url: ogImage, width: 1200, height: 630, alt: SITE_NAME }],
    },
    twitter: {
      card: "summary_large_image",
      title: finalTitle,
      description: finalDesc,
      images: [ogImage],
    },
    robots: { index: true, follow: true },
  };
}

/** Organization + WebSite JSON-LD for rich results / sitelinks. */
export function organizationJsonLd(company: {
  email?: string;
  phone_number?: string;
  telegram_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  x_url?: string;
  address?: string;
}) {
  const sameAs = [
    company.telegram_url,
    company.instagram_url,
    company.youtube_url,
    company.linkedin_url,
    company.x_url,
  ].filter(Boolean);

  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.png`,
    description: DEFAULTS.uz.description,
    email: company.email || undefined,
    telephone: company.phone_number || undefined,
    address: company.address
      ? { "@type": "PostalAddress", addressLocality: "Tashkent", addressCountry: "UZ", streetAddress: company.address }
      : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
  };
}

export function websiteJsonLd() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: SITE_NAME,
    url: SITE_URL,
    inLanguage: ["uz", "ru", "en"],
  };
}

/** Serialise for embedding inside a <script> element.
 *
 * JSON.stringify escapes quotes and backslashes but not "<", so a CMS value
 * containing "</script>" would close the tag and everything after it would be
 * parsed as HTML. These values come from Company Info, which staff can edit, so
 * the sequences that matter to the HTML parser are escaped to their \u form. */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, "\\u003c").replace(/>/g, "\\u003e").replace(/&/g, "\\u0026");
}
