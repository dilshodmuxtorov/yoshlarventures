import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import Hero from "@/components/sections/Hero";
import Marquee from "@/components/Marquee";
import Reveal from "@/components/Reveal";
import { getHomeData, type ContentRecord } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";

const s = (r: ContentRecord, k: string) => (typeof r[k] === "string" ? (r[k] as string) : "");
const mono = (name: string) => (name || "?").trim().slice(0, 2);
const Badge = () => <span className="badge">↗</span>;

export const revalidate = 300;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const t = UI[loc];
  const g = t.page;
  const p = (path: string) => `/${loc}${path}`;
  const d = await getHomeData(loc);
  const x = d.texts;

  const ctaFull = x.ctaTitle || g.ctaTitle;
  const cq = ctaFull.indexOf("?");
  const ctaA = cq >= 0 ? ctaFull.slice(0, cq + 1) : ctaFull;
  const ctaB = cq >= 0 ? ctaFull.slice(cq + 1).trim() : "";

  const bandText = x.band || "";
  const bci = bandText.lastIndexOf(", ");
  const bandA = bci >= 0 ? bandText.slice(0, bci + 1) : bandText;
  const bandB = bci >= 0 ? bandText.slice(bci + 2) : "";
  const beliefPill = g.beliefPill;

  return (
    <>
      <Hero texts={x} applyHref={p("/apply")} portfolioHref={p("/portfolio")} applyLabel={t.cta.apply} portfolioLabel={t.nav.portfolio} />

      {/* ── Stats bar ── */}
      <section style={{ borderTop: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)", background: "var(--card)" }}>
        <dl className="container-yv !px-5 grid grid-cols-3 items-start" style={{ marginBlock: 0 }}>
          {[
            { v: `${d.portfel.length || 14}+`, l: g.statProjects },
            { v: x.stat1 || "$300K+", l: g.statInvested },
            { v: x.stat3 || "2 mlrd", l: g.statCheque, accent: true },
          ].map((st, i) => (
            <div key={i} style={{ padding: "clamp(22px,3.4vw,32px) clamp(16px,2vw,24px)", borderRight: i < 2 ? "1px solid var(--hair)" : undefined }}>
              <dt className="font-display" style={{ fontSize: "clamp(26px,5.6vw,62px)", fontWeight: 700, letterSpacing: "-0.04em", lineHeight: 1, color: st.accent ? "var(--orange)" : "var(--ink)" }}>{st.v}</dt>
              <dd style={{ margin: "8px 0 0", fontSize: 12, letterSpacing: "0.12em", textTransform: "uppercase", fontWeight: 600, lineHeight: 1.45, color: "var(--n500)" }}>{st.l}</dd>
            </div>
          ))}
        </dl>
      </section>

      {/* ── Investment stages ── */}
      {d.stages.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container-yv">
            <h2 className="section-title" style={{ maxWidth: "13ch" }}>{x.secStage || g.secStage}</h2>
            <ul style={{ listStyle: "none", margin: "48px 0 0", padding: 0, borderTop: "1px solid var(--hair)" }}>
              {d.stages.map((st, i) => {
                const lime = i === d.stages.length - 1;
                return (
                  <li key={st.id} className="grid items-baseline grid-cols-1 md:grid-cols-[88px_1fr_1fr]" style={{ gap: "8px 28px", padding: "26px 20px 26px 4px", borderBottom: "1px solid var(--hair)", borderRadius: 16, background: lime ? "var(--lime)" : undefined }}>
                    <span className="font-display" style={{ fontSize: 14, fontWeight: 600, letterSpacing: "0.1em", color: lime ? "#5A6A18" : "var(--n300)" }}>0{i + 1}</span>
                    <h3 className="font-display" style={{ fontSize: "clamp(26px,3.6vw,40px)", fontWeight: 600, letterSpacing: "-0.03em", margin: 0, color: lime ? "#141414" : undefined }}>{s(st, "amount")}</h3>
                    <p style={{ margin: 0, fontSize: 16, lineHeight: 1.6, color: lime ? "#31380F" : "var(--n500)", maxWidth: "36ch" }}>{s(st, "note")}</p>
                  </li>
                );
              })}
            </ul>
          </div>
        </Reveal>
      )}

      {/* ── Objections band ── */}
      <section style={{ background: "var(--warm)", borderTop: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)" }}>
        <div className="container-yv grid items-center grid-cols-1 md:grid-cols-2" style={{ padding: "clamp(64px,8vw,112px) 24px", gap: "clamp(32px,5vw,72px)" }}>
          <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {[g.obj1, g.obj2, g.obj3].map((o, i) => (
              <li key={i} className="font-display" style={{ fontSize: "clamp(24px,3.6vw,42px)", fontWeight: 600, letterSpacing: "-0.03em", color: "var(--ink)", opacity: 0.45, textDecoration: "line-through", textDecorationThickness: "3px", textDecorationColor: "var(--orange)", padding: "16px 0", borderBottom: i < 2 ? "1px solid rgba(20,20,20,.08)" : undefined }}>{o}</li>
            ))}
          </ul>
          <div>
            <h2 className="font-display" style={{ fontWeight: 700, letterSpacing: "-0.04em", fontSize: "clamp(28px,4.2vw,46px)", lineHeight: 1.02, margin: 0 }}>
              {g.bandTitle}
            </h2>
            <p style={{ margin: "22px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--n700)", maxWidth: "46ch" }}>{g.bandBody}</p>
            <Link href={p("/apply")} className="btn-primary" style={{ marginTop: 30 }}>{t.cta.apply}<Badge /></Link>
          </div>
        </div>
      </section>

      {/* ── Portfolio rail ── */}
      {d.portfel.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container-yv flex flex-wrap items-end justify-between gap-5 mb-2">
            <div>
              <span className="eyebrow-pill">{t.nav.portfolio}</span>
              <h2 className="section-title" style={{ marginTop: 18 }}>{x.secPort || g.secPortfolio}</h2>
            </div>
            <Link href={p("/portfolio")} className="hidden sm:inline-flex font-semibold text-[16px]" style={{ color: "var(--ink)", borderBottom: "1px solid var(--hair)", padding: "12px 0" }}>{g.seeAll}</Link>
          </div>
          <Marquee durationSec={60} gap={18}>
            {d.portfel.map((c, i) => (
              <article key={c.id} className="yv-card yv-card-hover" style={{ flex: "0 0 clamp(268px,80vw,344px)", borderRadius: 24, padding: 0, background: "var(--card)", boxShadow: "var(--elev-sm)", position: "relative", overflow: "hidden", display: "flex" }}>
                {/* Column layout with the footer pinned to the bottom so the sector and
                    amount line up across cards regardless of description length. */}
                <div style={{ padding: 28, display: "flex", flexDirection: "column", width: "100%" }}>
                  <span className="font-display" aria-hidden style={{ position: "absolute", right: -6, top: -18, fontSize: 96, fontWeight: 700, letterSpacing: "-0.06em", color: "var(--shell)" }}>{String(i + 1).padStart(2, "0")}</span>
                  <span className="font-display grid place-items-center shrink-0" style={{ position: "relative", width: 52, height: 52, borderRadius: 16, background: "var(--warm)", fontWeight: 700, color: "var(--warm-ink)" }}>{mono(s(c, "name"))}</span>
                  <h3 className="font-display" style={{ position: "relative", fontSize: 26, fontWeight: 600, letterSpacing: "-0.03em", margin: "22px 0 0" }}>{s(c, "name")}</h3>
                  <p className="line-clamp-2" style={{ margin: "8px 0 26px", fontSize: 14, lineHeight: 1.6, color: "var(--n500)", maxWidth: "26ch", minHeight: 45 }}>{s(c, "short_description")}</p>
                  <div style={{ marginTop: "auto" }}>
                    <p style={{ margin: 0, paddingTop: 18, borderTop: "1px solid var(--hair)", fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, color: "var(--n300)" }}>{s(c, "sector")}</p>
                    <p className="font-display" style={{ margin: "6px 0 0", fontSize: 32, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--orange)", minHeight: "1.1em" }}>{s(c, "investment_thousand_usd")}</p>
                  </div>
                </div>
              </article>
            ))}
          </Marquee>
        </Reveal>
      )}

      {/* ── Belief band (full-bleed dark) ── */}
      {x.band && (
        <section style={{ position: "relative", overflow: "hidden", background: "var(--band)", padding: "clamp(96px,13vw,168px) 24px" }}>
          <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg,rgba(255,255,255,.045) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.045) 1px,transparent 1px)", backgroundSize: "104px 104px" }} />
          <div aria-hidden style={{ position: "absolute", left: "50%", top: "-40%", width: "min(820px, 160vw)", height: "min(820px, 160vw)", transform: "translateX(-50%)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,26,.32), transparent 62%)" }} />
          <div className="relative mx-auto text-center" style={{ maxWidth: 1000 }}>
            <span style={{ display: "inline-flex", padding: "7px 14px", borderRadius: 999, background: "rgba(255,255,255,.08)", color: "var(--orange-ink)", fontSize: 12, fontWeight: 600, letterSpacing: "0.16em", textTransform: "uppercase" }}>{beliefPill}</span>
            <p className="font-display" style={{ fontWeight: 700, letterSpacing: "-0.04em", fontSize: "clamp(30px,5.2vw,60px)", lineHeight: 1.06, margin: "28px auto 0", color: "#fff", maxWidth: "56ch" }}>
              {bandA} {bandB && <span style={{ color: "var(--orange)" }}>{bandB}</span>}
            </p>
            {x.bandSub && <p style={{ margin: "24px auto 0", maxWidth: "52ch", fontSize: 17, lineHeight: 1.7, color: "rgba(255,255,255,.66)" }}>{x.bandSub}</p>}
          </div>
        </section>
      )}

      {/* ── Ecosystem projects ── */}
      {d.projects.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container-yv flex flex-wrap items-end justify-between gap-5">
            <div>
              <span className="eyebrow-pill">{g.ecosystem}</span>
              <h2 className="section-title" style={{ marginTop: 18, maxWidth: "14ch" }}>{x.secProj || g.secProjects}</h2>
            </div>
            {x.projText && <p style={{ margin: 0, maxWidth: "38ch", fontSize: 16, lineHeight: 1.7, color: "var(--n500)" }}>{x.projText}</p>}
          </div>
          <div className="container-yv grid gap-[18px] sm:grid-cols-2 lg:grid-cols-4" style={{ marginTop: 40 }}>
            {d.projects.map((pr) => {
              const inner = (
                <div className="yv-card-inner flex flex-col gap-[14px] h-full" style={{ padding: 24 }}>
                  <span className="font-display grid place-items-center text-white" style={{ width: 64, height: 64, borderRadius: 16, background: "linear-gradient(160deg,#FF8B2E,#FF6F0D)", fontSize: 22, fontWeight: 700, letterSpacing: "-0.03em", boxShadow: "0 18px 30px -20px rgba(255,122,26,.9)" }}>{s(pr, "mark") || mono(s(pr, "name"))}</span>
                  <div className="flex flex-col gap-1.5">
                    <span style={{ fontSize: 12, letterSpacing: "0.16em", textTransform: "uppercase", fontWeight: 600, color: "var(--orange-ink)" }}>{s(pr, "kind")}</span>
                    <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{s(pr, "name")}</h3>
                  </div>
                  <p style={{ margin: 0, fontSize: 14, lineHeight: 1.6, color: "var(--n500)" }}>{s(pr, "short_description")}</p>
                  <span style={{ marginTop: "auto", paddingTop: 14, fontSize: 14, fontWeight: 600, color: "var(--ink)" }}>{g.more}</span>
                </div>
              );
              const link = s(pr, "link_url");
              return link ? (
                <a key={pr.id} href={link} target="_blank" rel="noopener noreferrer" className="yv-card yv-card-hover text-left">{inner}</a>
              ) : (
                <div key={pr.id} className="yv-card">{inner}</div>
              );
            })}
          </div>
        </Reveal>
      )}

      {/* ── News ── */}
      {d.news.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container-yv flex flex-wrap items-end justify-between gap-5">
            <h2 className="section-title" style={{ maxWidth: "14ch" }}>{x.secNews || g.secNews}</h2>
            <Link href={p("/news")} className="hidden sm:inline-flex font-semibold text-[16px]" style={{ color: "var(--ink)", borderBottom: "1px solid var(--hair)", padding: "12px 0" }}>{g.seeAllShort}</Link>
          </div>
          <div className="container-yv grid gap-[18px] md:grid-cols-3" style={{ marginTop: 40 }}>
            {d.news.slice(0, 3).map((n) => (
              <article key={n.id} className="yv-card yv-card-hover">
                <div className="yv-card-inner overflow-hidden flex flex-col h-full">
                  {s(n, "image_url") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s(n, "image_url")} alt={s(n, "title")} style={{ width: "100%", height: 180, objectFit: "cover" }} />
                  ) : (
                    <div style={{ height: 180, background: "var(--warm)" }} />
                  )}
                  <div className="flex flex-col gap-2.5 flex-1" style={{ padding: 24 }}>
                    <h3 className="font-display" style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{s(n, "title")}</h3>
                    <p style={{ fontSize: 14, lineHeight: 1.6, color: "var(--n500)" }}>{s(n, "body")}</p>
                    <span style={{ marginTop: "auto", fontSize: 14, fontWeight: 600, color: "var(--orange-ink)" }}>{g.more}</span>
                  </div>
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      )}

      {/* ── Story / video ── */}
      {(x.story || x.storyText) && (
        <section className="section">
          <div className="container-yv grid items-center grid-cols-1 md:grid-cols-2" style={{ gap: "clamp(32px,5vw,64px)" }}>
            <div>
              <h2 className="font-display" style={{ fontWeight: 700, letterSpacing: "-0.035em", fontSize: "clamp(28px,4.2vw,50px)", lineHeight: 1.04, margin: 0 }}>{x.story}</h2>
              <p style={{ margin: "20px 0 0", fontSize: 17, lineHeight: 1.7, color: "var(--n500)", maxWidth: "52ch" }}>{x.storyText}</p>
            </div>
            <div className="yv-card" style={{ boxShadow: "var(--elev)" }}>
              <div className="yv-card-inner relative overflow-hidden" style={{ background: "#141414" }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/yv/startup-card.png" alt="" style={{ width: "100%", height: "clamp(240px,32vw,360px)", objectFit: "cover", opacity: 0.72 }} />
                <span className="grid place-items-center text-white" style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", width: 76, height: 76, borderRadius: 999, background: "var(--orange)", fontSize: 22, boxShadow: "0 18px 30px -20px rgba(255,122,26,.9)" }}>▶</span>
                <span style={{ position: "absolute", left: 20, bottom: 18, color: "#fff", fontSize: 12, fontWeight: 600, letterSpacing: "0.02em" }}>{x.videoNote || g.introVideo}</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ── Team ── */}
      {d.team.length > 0 && (
        <Reveal as="section" className="section">
          <div className="container-yv">
            <h2 className="section-title">{x.secTeam || g.secTeam}</h2>
          </div>
          <Marquee durationSec={55} gap={18}>
            {d.team.map((m) => (
              <article key={m.id} className="yv-card" style={{ flex: "0 0 clamp(230px,72vw,260px)" }}>
                <div className="yv-card-inner overflow-hidden">
                  {s(m, "photo_url") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s(m, "photo_url")} alt={s(m, "full_name")} style={{ width: "100%", aspectRatio: "3/4", objectFit: "cover" }} />
                  ) : (
                    <div style={{ aspectRatio: "3/4", background: "var(--warm)" }} />
                  )}
                  <div style={{ padding: "18px 20px 22px" }}>
                    <h3 className="font-display" style={{ fontSize: 17, fontWeight: 600, letterSpacing: "-0.02em", margin: 0 }}>{s(m, "full_name")}</h3>
                    <p style={{ margin: "5px 0 0", fontSize: 14, color: "var(--n500)" }}>{s(m, "position")}</p>
                  </div>
                </div>
              </article>
            ))}
          </Marquee>
        </Reveal>
      )}

      {/* ── Partners marquee ── */}
      {d.logos.length > 0 && (
        <section style={{ padding: "clamp(64px,8vw,112px) 0", borderTop: "1px solid var(--hair)", borderBottom: "1px solid var(--hair)" }}>
          <div className="container-yv">
            <h2 className="font-display" style={{ fontWeight: 700, letterSpacing: "-0.04em", fontSize: "clamp(28px,4.2vw,46px)", lineHeight: 1.02, margin: 0 }}>{x.lentaTitle || g.secPartners}</h2>
          </div>
          <div style={{ marginTop: 36 }}>
            <Marquee durationSec={34} gap={14}>
              {d.logos.map((l) => (
                <span key={l.id} style={{ display: "inline-flex", alignItems: "center", gap: 12, padding: "10px 24px 10px 10px", borderRadius: 999, background: "var(--card)", border: "1px solid var(--hair)", boxShadow: "var(--hi)", fontSize: 15, fontWeight: 600, color: "var(--n700)", whiteSpace: "nowrap" }}>
                  {s(l, "logo_url") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={s(l, "logo_url")} alt={s(l, "name")} width={36} height={36} style={{ width: 36, height: 36, borderRadius: 11, flexShrink: 0 }} />
                  ) : null}
                  {s(l, "name")}
                </span>
              ))}
            </Marquee>
          </div>
        </section>
      )}

      {/* ── Final CTA ── */}
      <section className="section">
        <div className="container-yv">
          <div style={{ position: "relative", borderRadius: 32, overflow: "hidden", background: "var(--band)", padding: "clamp(40px,6.5vw,96px)" }}>
            <div aria-hidden style={{ position: "absolute", inset: 0, backgroundImage: "linear-gradient(90deg,rgba(255,255,255,.05) 1px,transparent 1px),linear-gradient(180deg,rgba(255,255,255,.05) 1px,transparent 1px)", backgroundSize: "104px 104px" }} />
            <div aria-hidden style={{ position: "absolute", right: -90, bottom: -120, width: "min(460px, 90vw)", height: "min(460px, 90vw)", borderRadius: "50%", background: "radial-gradient(circle, rgba(255,122,26,.55), transparent 62%)" }} />
            <Image src="/yv/logo3d.png" alt="" aria-hidden width={320} height={316} className="hidden md:block floaty" style={{ position: "absolute", right: -30, bottom: -50, width: "min(320px,42%)", height: "auto", opacity: 0.92 }} />
            <div className="relative" style={{ maxWidth: "36ch" }}>
              <span style={{ display: "block", width: 64, height: 4, borderRadius: 8, background: "var(--lime)" }} />
              <h2 className="font-display" style={{ fontWeight: 700, letterSpacing: "-0.045em", fontSize: "clamp(34px,6.4vw,80px)", lineHeight: 0.98, margin: "26px 0 0", color: "#fff", maxWidth: "12ch" }}>
                {ctaA}{ctaB && <><br /><span style={{ color: "var(--orange)" }}>{ctaB}</span></>}
              </h2>
              {x.ctaText && <p style={{ margin: "20px 0 0", fontSize: 17, color: "rgba(255,255,255,.72)", maxWidth: "36ch" }}>{x.ctaText}</p>}
              <Link href={p("/apply")} className="btn-primary" style={{ marginTop: 36, minHeight: 62, background: "#fff", color: "#141414", padding: "7px 7px 7px 30px", fontSize: 17 }}>
                {x.ctaBtn || t.cta.apply}<span className="badge" style={{ width: 48, height: 48 }}>↗</span>
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
