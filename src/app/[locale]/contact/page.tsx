import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactForm from "@/components/ContactForm";
import { Pill } from "@/components/ui";
import { getCompanyInfo, getPageTexts } from "@/lib/api";
import { isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("contact", locale);
  return pageMetadata({ locale, path: "contact", title: texts.h1 || "Kontaktlar" });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const [{ texts }, company] = await Promise.all([getPageTexts("contact", loc), getCompanyInfo(loc)]);

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || "Savolingiz bormi? Yozing."}</h1>

        <div className="grid gap-6 lg:grid-cols-2 mt-10">
          <ContactForm locale={loc} />

          <div className="yv-card"><div className="yv-card-inner p-6">
            <p className="eyebrow mb-4">Aloqa maʼlumotlari</p>
            <ul className="space-y-3 text-sm">
              {company.email && <li><a href={`mailto:${company.email}`} className="hover:underline">{company.email}</a></li>}
              {company.phone_number && <li><a href={`tel:${company.phone_number.replace(/\s/g, "")}`} className="hover:underline">{company.phone_number}</a></li>}
              {company.telegram_url && <li><a href={company.telegram_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Telegram</a></li>}
              {company.address && <li style={{ color: "var(--n500)" }}>{company.address}</li>}
            </ul>
            <div className="mt-5 rounded-2xl aspect-video grid place-items-center" style={{ background: "var(--warm)" }}>
              <span className="text-sm" style={{ color: "var(--warm-ink)" }}>Xarita</span>
            </div>
          </div></div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
