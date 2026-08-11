import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, Monogram, Pill } from "@/components/ui";
import { getCollection, getPageTexts, type ContentRecord } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const s = (r: ContentRecord, k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("portfolio", locale);
  return pageMetadata({ locale, path: "portfolio", title: texts.h1 || "Bizning portfelimiz", description: texts.intro });
}

export default async function PortfolioPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = UI[loc];
  const [{ texts }, { items }] = await Promise.all([getPageTexts("portfolio", loc), getCollection("portfel", loc)]);

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || "Bizning portfelimiz"}</h1>
        {texts.intro && <p className="mt-4 text-lg max-w-2xl" style={{ color: "var(--n500)" }}>{texts.intro}</p>}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
          {items.map((c) => (
            <article key={c.id}>
              <Card>
                <Monogram text={s(c, "name")} />
                <h2 className="font-display font-semibold text-lg mt-4">{s(c, "name")}</h2>
                <p className="text-sm mt-2" style={{ color: "var(--n500)" }}>{s(c, "short_description")}</p>
                <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-sm" style={{ borderColor: "var(--hair)" }}>
                  <div><span className="eyebrow block">Soha</span>{s(c, "sector")}</div>
                  <div className="text-right"><span className="eyebrow block">Sarmoya</span><span style={{ color: "var(--orange)" }} className="font-semibold">{s(c, "investment_thousand_usd")}</span></div>
                </div>
              </Card>
            </article>
          ))}
        </div>

        {items.length === 0 && <p className="mt-10" style={{ color: "var(--n500)" }}>{t.misc.empty}</p>}

        <div className="mt-12">
          <Link href={`/${loc}/apply`} className="btn-primary">{t.cta.apply}<span className="badge">↗</span></Link>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
