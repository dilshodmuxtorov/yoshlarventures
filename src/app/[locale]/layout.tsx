import type { Metadata } from "next";
import { Space_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import { notFound } from "next/navigation";

import AnimatedBackground from "@/components/AnimatedBackground";
import CustomCursor from "@/components/CustomCursor";
import Header from "@/components/Header";
import ThemeSync from "@/components/ThemeSync";
import Footer from "@/components/Footer";
import { getCompanyInfo, getSections, isVisible } from "@/lib/api";
import { LOCALES, isLocale, type Locale } from "@/lib/i18n";
import { jsonLdScript, organizationJsonLd, pageMetadata, websiteJsonLd } from "@/lib/seo";
import "../globals.css";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], weight: ["500", "600", "700"], variable: "--font-space-grotesk", display: "swap" });
const jakarta = Plus_Jakarta_Sans({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-jakarta", display: "swap" });

export function generateStaticParams() {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return pageMetadata({ locale });
}

// Light is the design's default; dark only when the user explicitly toggles it.
const THEME_SCRIPT = `(function(){try{var t=localStorage.getItem('yv-theme')||'light';document.documentElement.setAttribute('data-theme',t);}catch(e){document.documentElement.setAttribute('data-theme','light');}})();`;

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;

  const [company, sections] = await Promise.all([getCompanyInfo(loc), getSections(loc)]);
  // Pages the dashboard has switched off: dropped from the menu and the footer,
  // and 404'd by the page itself so a stale link cannot reach them.
  const hidden = ["about", "portfolio", "news", "partners", "contact"].filter(
    (page) => !isVisible(sections, `page.${page}`),
  );

  return (
    <html lang={locale} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(organizationJsonLd(company)) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdScript(websiteJsonLd()) }} />
      </head>
      <body className={`${spaceGrotesk.variable} ${jakarta.variable}`}>
        <ThemeSync />
        <AnimatedBackground />
        <CustomCursor />
        <Header locale={loc} hidden={hidden} />
        <main className="pt-20">{children}</main>
        <Footer locale={loc} company={company} hidden={hidden} />
      </body>
    </html>
  );
}
