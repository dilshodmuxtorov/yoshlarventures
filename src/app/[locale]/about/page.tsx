import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import SafeImage from "@/components/SafeImage";
import { Monogram } from "@/components/ui";
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
  const g = t.page;
  // The fund's headline numbers live on the home page in the CMS; the about
  // hero repeats them rather than keeping a second copy that can drift.
  const [{ texts }, steps, team, portfel, home] = await Promise.all([
    getPageTexts("about", loc),
    getCollection("jarayon", loc),
    getCollection("jamoa", loc),
    getCollection("portfel", loc),
    getPageTexts("home", loc),
  ]);

  const stats = [
    { v: `${portfel.items.length || 14}+`, l: g.aboutStatProjects },
    { v: home.texts.stat1 || "$300K+", l: g.aboutStatInvested },
    { v: home.texts.stat3 || "2 mlrd", l: g.aboutStatCheque },
    { v: g.aboutStage, l: g.aboutStageLabel },
  ];

  return (
    <>
      {/* ── Hero ── */}
      <section className="section">
        <div className="container-yv">
          {texts.pill && <span className="eyebrow-pill">{texts.pill}</span>}
          <h1 className="font-display font-bold" style={{ marginTop: 20, fontSize: "clamp(34px,5.4vw,60px)", letterSpacing: "-0.035em", lineHeight: 1.04, maxWidth: "17ch" }}>
            {texts.h1 || g.aboutIntro}
          </h1>
          {texts.intro && <p style={{ margin: "22px 0 0", maxWidth: "62ch", fontSize: 17, lineHeight: 1.7, color: "var(--n500)" }}>{texts.intro}</p>}

          <dl className="flex flex-wrap" style={{ gap: "clamp(24px,4vw,56px)", margin: "44px 0 0", paddingTop: 26, borderTop: "1px solid var(--hair)" }}>
            {stats.map((st) => (
              <div key={st.l}>
                <dt className="font-display" style={{ fontSize: 32, fontWeight: 700, letterSpacing: "-0.03em" }}>{st.v}</dt>
                <dd style={{ margin: "4px 0 0", fontSize: 12, color: "var(--n500)" }}>{st.l}</dd>
              </div>
            ))}
          </dl>
        </div>
      </section>

      {/* ── Process ── */}
      {steps.items.length > 0 && (
        <section className="section" style={{ paddingTop: 0 }}>
          <div className="container-yv">
            {/* The CMS's about.processTitle holds the full heading ("From
                application to investment in 4 steps"), not a section label — the
                pill above it is the static one. */}
            <span className="eyebrow-pill">{g.processTitle}</span>
            <h2 className="font-display font-bold" style={{ margin: "18px 0 0", fontSize: "clamp(28px,4.2vw,46px)", letterSpacing: "-0.03em", lineHeight: 1.06 }}>
              {texts.processTitle || g.processHeading}
            </h2>
            <ol className="grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4" style={{ listStyle: "none", margin: "40px 0 0", padding: 0 }}>
              {steps.items.map((st, i) => {
                const lime = i === steps.items.length - 1;
                // The CMS stores the bare ordinal ("03"); the design prints it as
                // "Qadam 03". Anything that isn't just digits is left alone.
                const ordinal = s(st, "number").trim() || String(i + 1).padStart(2, "0");
                const stepLabel = /^\d+$/.test(ordinal) ? `${g.step} ${ordinal.padStart(2, "0")}` : ordinal;
                return (
                  <li key={st.id} className="yv-card" style={lime ? { background: "rgba(200,242,48,.28)", borderColor: "rgba(160,200,20,.35)" } : undefined}>
                    <div className="yv-card-inner flex flex-col gap-2.5" style={{ padding: 26, minHeight: 190, background: lime ? "var(--lime)" : undefined }}>
                      <span style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, color: lime ? "#5A6A18" : "var(--orange-ink)" }}>
                        {stepLabel}
                      </span>
                      <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", margin: 0, color: lime ? "#141414" : undefined }}>{s(st, "title")}</h3>
                      <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: lime ? "#31380F" : "var(--n500)", maxWidth: "56ch" }}>{s(st, "note")}</p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </section>
      )}

      {/* ── "The bird in our logo is no accident" ── */}
      <section style={{ background: "var(--warm)", borderTop: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)" }}>
        <div className="container-yv grid items-center grid-cols-1 md:grid-cols-2" style={{ padding: "clamp(64px,8vw,112px) 24px", gap: "clamp(32px,5vw,64px)" }}>
          <div>
            <h2 className="font-display font-bold" style={{ margin: 0, fontSize: "clamp(28px,4vw,46px)", letterSpacing: "-0.03em", lineHeight: 1.08 }}>{g.birdTitle}</h2>
            <p style={{ margin: "20px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--n700)", maxWidth: "52ch" }}>{g.birdBody}</p>
            <div className="flex flex-wrap" style={{ gap: 10, marginTop: 26 }}>
              {[texts.chip0 || g.birdChip1, texts.chip1 || g.birdChip2, texts.chip2 || g.birdChip3].map((chip) => (
                <span key={chip} style={{ padding: "11px 18px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--hair)", fontSize: 14, fontWeight: 500, color: "var(--n700)" }}>{chip}</span>
              ))}
            </div>
          </div>
          <div className="flex justify-center">
            <Image src="/yv/logo3d.png" alt="Yoshlar Ventures" width={320} height={316} className="h-auto" style={{ width: "min(320px,80%)", filter: "drop-shadow(0 40px 60px rgba(255,122,26,.35))" }} />
          </div>
        </div>
      </section>

      {/* ── Team ── */}
      <section className="section">
        <div className="container-yv">
          {team.items.length > 0 && (
            <>
              <span className="eyebrow-pill">{texts.teamTitle || g.teamTitle}</span>
              <h2 className="font-display font-bold" style={{ margin: "18px 0 0", fontSize: "clamp(28px,4.2vw,46px)", letterSpacing: "-0.03em", lineHeight: 1.06 }}>
                {texts.teamHeading || g.teamHeading}
              </h2>
              <div className="grid gap-[18px] grid-cols-2 lg:grid-cols-4" style={{ marginTop: 40 }}>
                {team.items.map((m) => (
                  <article key={m.id} className="yv-card">
                    <div className="yv-card-inner overflow-hidden">
                      <div className="aspect-[3/4] grid place-items-center" style={{ background: "var(--warm)" }}>
                        <SafeImage
                          src={s(m, "photo_url")}
                          alt={s(m, "full_name")}
                          className="w-full h-full object-cover"
                          fallback={<Monogram text={s(m, "full_name")} size={64} />}
                        />
                      </div>
                      <div style={{ padding: "18px 20px 22px" }}>
                        <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{s(m, "full_name")}</h3>
                        <p style={{ margin: "5px 0 0", fontSize: 14, color: "var(--n500)" }}>{s(m, "position")}</p>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            </>
          )}

          <div style={{ marginTop: 40 }}>
            <Link href={`/${loc}/apply`} className="btn-primary">{t.cta.apply}<span className="badge">↗</span></Link>
          </div>
        </div>
      </section>
    </>
  );
}

export const revalidate = 300;
