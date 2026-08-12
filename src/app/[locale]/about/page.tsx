import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Monogram, Pill } from "@/components/ui";
import { getCollection, getPageTexts, type ContentRecord } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const s = (r: ContentRecord, k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("about", locale);
  const lc: Locale = isLocale(locale) ? locale : "uz";
  return pageMetadata({ locale, path: "about", title: texts.h1 || UI[lc].page.aboutTitle, description: texts.intro });
}

export default async function AboutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = UI[loc];
  const [{ texts }, steps, team] = await Promise.all([
    getPageTexts("about", loc),
    getCollection("jarayon", loc),
    getCollection("jamoa", loc),
  ]);

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4 max-w-3xl" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || "Startapingizga birinchi ishonadigan bizmiz."}</h1>
        {texts.intro && <p className="mt-5 text-lg max-w-2xl" style={{ color: "var(--n500)" }}>{texts.intro}</p>}

        {steps.items.length > 0 && (
          <section className="mt-16">
            <h2 className="eyebrow mb-2">{texts.processTitle || UI[loc].page.processTitle}</h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4 mt-5">
              {steps.items.map((st, i) => (
                <div key={st.id} className="rounded-3xl p-6" style={{ background: i === steps.items.length - 1 ? "var(--lime)" : "var(--card)", border: "1px solid var(--hair)", color: i === steps.items.length - 1 ? "#1a1a1a" : undefined }}>
                  <span className="font-display font-bold text-sm opacity-50">{s(st, "number")}</span>
                  <h3 className="font-display font-semibold text-lg mt-2">{s(st, "title")}</h3>
                  <p className="text-sm mt-2" style={{ color: i === steps.items.length - 1 ? "#333" : "var(--n500)" }}>{s(st, "note")}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {team.items.length > 0 && (
          <section className="mt-16">
            <h2 className="eyebrow mb-2">{texts.teamTitle || UI[loc].page.teamTitle}</h2>
            <p className="font-display font-bold text-2xl mb-6">{texts.teamHeading || UI[loc].page.teamHeading}</p>
            <div className="grid gap-5 grid-cols-2 lg:grid-cols-4">
              {team.items.map((m) => (
                <article key={m.id}>
                  <div className="yv-card h-full"><div className="yv-card-inner p-0 overflow-hidden">
                    <div className="aspect-[3/4] grid place-items-center" style={{ background: "var(--warm)" }}>
                      {s(m, "photo_url") ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={s(m, "photo_url")} alt={s(m, "full_name")} className="w-full h-full object-cover" />
                      ) : (<Monogram text={s(m, "full_name")} size={64} />)}
                    </div>
                    <div className="p-4">
                      <h3 className="font-display font-semibold">{s(m, "full_name")}</h3>
                      <p className="text-sm" style={{ color: "var(--n500)" }}>{s(m, "position")}</p>
                    </div>
                  </div></div>
                </article>
              ))}
            </div>
          </section>
        )}

        <div className="mt-12">
          <Link href={`/${loc}/apply`} className="btn-primary">{t.cta.apply}<span className="badge">↗</span></Link>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
