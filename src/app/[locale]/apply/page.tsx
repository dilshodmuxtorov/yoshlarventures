import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ApplyForm from "@/components/ApplyForm";
import { Pill } from "@/components/ui";
import { getPageTexts } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("apply", locale);
  return pageMetadata({ locale, path: "apply", title: texts.h1 || "Ariza yuborish" });
}

export default async function ApplyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const { texts } = await getPageTexts("apply", loc);

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || "Ariza yuborish"}</h1>

        <div className="grid gap-6 lg:grid-cols-[.8fr_1.2fr] mt-10 items-start">
          <aside className="space-y-4 lg:sticky lg:top-24">
            <div className="yv-card"><div className="yv-card-inner p-6">
              <p className="eyebrow mb-3">{texts.prepTitle || "Nima tayyorlash kerak"}</p>
              <ul className="space-y-2 text-sm" style={{ color: "var(--n500)" }}>
                {[texts.prep1, texts.prep2, texts.prep3].filter(Boolean).map((p, i) => (
                  <li key={i} className="flex gap-2"><span style={{ color: "var(--orange)" }}>0{i + 1}</span>{p}</li>
                ))}
              </ul>
              {texts.prepNote && <p className="text-xs mt-4 rounded-lg p-3" style={{ background: "var(--warm)", color: "var(--warm-ink)" }}>{texts.prepNote}</p>}
            </div></div>
          </aside>

          <ApplyForm locale={loc} />
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
