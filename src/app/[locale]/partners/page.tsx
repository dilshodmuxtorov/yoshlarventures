import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Card, Pill } from "@/components/ui";
import { getCollection, getPageTexts, type ContentRecord } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const s = (r: ContentRecord, k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("partners", locale);
  return pageMetadata({ locale, path: "partners", title: texts.h1 || "Hamkorlar", description: texts.intro });
}

export default async function PartnersPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = UI[loc];
  const [{ texts }, { items }] = await Promise.all([getPageTexts("partners", loc), getCollection("hamkorlar", loc)]);

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || "Bizga ishongan hamkorlarimiz"}</h1>
        {texts.intro && <p className="mt-4 text-lg max-w-2xl" style={{ color: "var(--n500)" }}>{texts.intro}</p>}

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-10">
          {items.map((c) => (
            <article key={c.id}>
              <Card>
                <p className="eyebrow">{s(c, "kind")}</p>
                <h2 className="font-display font-semibold text-lg mt-1">{s(c, "name")}</h2>
                <p className="text-sm mt-2" style={{ color: "var(--n500)" }}>{s(c, "note")}</p>
              </Card>
            </article>
          ))}
        </div>

        {items.length === 0 && <p className="mt-10" style={{ color: "var(--n500)" }}>{t.misc.empty}</p>}

        {(texts.ctaTitle || texts.ctaText) && (
          <div className="mt-12 rounded-[2rem] p-10" style={{ background: "var(--warm)" }}>
            <h2 className="font-display font-bold text-2xl" style={{ color: "var(--warm-ink)" }}>{texts.ctaTitle}</h2>
            <p className="mt-2 max-w-xl" style={{ color: "var(--warm-ink)" }}>{texts.ctaText}</p>
            <Link href={`/${loc}/contact`} className="btn-primary mt-6">{t.nav.contact}<span className="badge">↗</span></Link>
          </div>
        )}
      </div>
    </div>
  );
}

export const revalidate = 300;
