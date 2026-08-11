import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { Card, Pill } from "@/components/ui";
import { getCollection, getPageTexts, type ContentRecord } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

const s = (r: ContentRecord, k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("news", locale);
  return pageMetadata({ locale, path: "news", title: texts.h1 || "Yangiliklar", description: texts.intro });
}

export default async function NewsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = UI[loc];
  const [{ texts }, upcoming, feed, archive] = await Promise.all([
    getPageTexts("news", loc),
    getCollection("tadbirlar", loc),
    getCollection("yangiliklar", loc),
    getCollection("arxiv", loc),
  ]);

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || "Yangiliklar va tadbirlar"}</h1>
        {texts.intro && <p className="mt-4 text-lg max-w-2xl" style={{ color: "var(--n500)" }}>{texts.intro}</p>}

        {upcoming.items.length > 0 && (
          <section className="mt-12">
            <h2 className="eyebrow mb-5">{texts.upTitle || "Yaqinlashayotgan tadbirlar"}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {upcoming.items.map((e) => (
                <article key={e.id}><Card>
                  <span className="inline-block text-xs px-2.5 py-1 rounded-full mb-3" style={{ background: "var(--warm)", color: "var(--warm-ink)" }}>{s(e, "date_place")}</span>
                  <h3 className="font-display font-semibold text-lg">{s(e, "name")}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--n500)" }}>{s(e, "description")}</p>
                </Card></article>
              ))}
            </div>
          </section>
        )}

        {feed.items.length > 0 && (
          <section className="mt-14">
            <h2 className="eyebrow mb-5">Telegram</h2>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-5 [&>*]:mb-5 [&>*]:break-inside-avoid">
              {feed.items.map((n) => (
                <article key={n.id}><Card>
                  <p className="eyebrow">{s(n, "source") || "Yoshlar Ventures"} · {s(n, "date_text")}</p>
                  <h3 className="font-display font-semibold mt-2">{s(n, "title")}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--n500)" }}>{s(n, "body")}</p>
                </Card></article>
              ))}
            </div>
          </section>
        )}

        {archive.items.length > 0 && (
          <section className="mt-14">
            <h2 className="eyebrow mb-5">{texts.archTitle || "Arxiv"}</h2>
            <div className="grid gap-5 md:grid-cols-3">
              {archive.items.map((e) => (
                <article key={e.id}><Card>
                  <p className="eyebrow">{s(e, "month_year")}</p>
                  <h3 className="font-display font-semibold text-lg mt-1">{s(e, "name")}</h3>
                  <p className="text-sm mt-2" style={{ color: "var(--n500)" }}>{s(e, "outcome")}</p>
                </Card></article>
              ))}
            </div>
          </section>
        )}

        {upcoming.items.length === 0 && feed.items.length === 0 && archive.items.length === 0 && (
          <p className="mt-10" style={{ color: "var(--n500)" }}>{t.misc.empty}</p>
        )}
      </div>
    </div>
  );
}

export const revalidate = 180;
