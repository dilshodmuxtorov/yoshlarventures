import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import PortfolioExplorer from "@/components/PortfolioExplorer";
import { Pill } from "@/components/ui";
import { getCollection, getPageTexts } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";
import { formatK, totalInvestedK } from "@/lib/portfolio";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("portfolio", locale);
  const lc: Locale = isLocale(locale) ? locale : "uz";
  return pageMetadata({ locale, path: "portfolio", title: texts.h1 || UI[lc].page.secPortfolio, description: texts.intro });
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = UI[loc];
  const [{ texts }, { items }] = await Promise.all([getPageTexts("portfolio", loc), getCollection("portfel", loc)]);

  // Both figures are derived from the collection itself, so adding a startup in
  // the dashboard moves them without anyone editing a page text.
  const invested = formatK(totalInvestedK(items));

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || UI[loc].page.secPortfolio}</h1>
        {texts.intro && <p className="mt-4 text-lg max-w-2xl" style={{ color: "var(--n500)" }}>{texts.intro}</p>}

        {items.length > 0 && (
          <dl
            className="grid grid-cols-1 sm:grid-cols-2 mt-10"
            style={{ borderTop: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)" }}
          >
            {[
              { v: `${items.length}`, l: t.page.companies },
              { v: invested, l: t.page.totalInvested, accent: true },
            ]
              .filter((st) => st.v)
              .map((st, i) => (
                <div key={i} style={{ padding: "26px 4px" }}>
                  <dt
                    className="font-display"
                    style={{
                      fontSize: "clamp(30px,5vw,56px)",
                      fontWeight: 700,
                      letterSpacing: "-0.04em",
                      lineHeight: 1,
                      color: st.accent ? "var(--orange)" : "var(--ink)",
                    }}
                  >
                    {st.v}
                  </dt>
                  <dd
                    style={{
                      marginTop: 8,
                      fontSize: 12,
                      letterSpacing: "0.12em",
                      textTransform: "uppercase",
                      fontWeight: 600,
                      color: "var(--n500)",
                    }}
                  >
                    {st.l}
                  </dd>
                </div>
              ))}
          </dl>
        )}

        <PortfolioExplorer
          items={items}
          labels={{
            sector: t.page.sector,
            investment: t.page.investment,
            close: t.page.close,
            visitSite: t.page.visitSite,
            aboutStartup: t.page.aboutStartup,
          }}
        />

        {items.length === 0 && <p className="mt-10" style={{ color: "var(--n500)" }}>{t.misc.empty}</p>}

        <div className="mt-12">
          <Link href={`/${loc}/apply`} className="btn-primary">{t.cta.apply}<span className="badge">↗</span></Link>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
