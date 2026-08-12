import type { Metadata } from "next";
import { notFound } from "next/navigation";

import ContactForm from "@/components/ContactForm";
import { Pill } from "@/components/ui";
import { getCompanyInfo, getPageTexts } from "@/lib/api";
import { UI, isLocale, type Locale } from "@/lib/i18n";
import { pageMetadata } from "@/lib/seo";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const { texts } = await getPageTexts("contact", locale);
  const lc: Locale = isLocale(locale) ? locale : "uz";
  return pageMetadata({ locale, path: "contact", title: texts.h1 || UI[lc].page.contactTitle });
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  const loc = locale as Locale;
  const [{ texts }, company] = await Promise.all([getPageTexts("contact", loc), getCompanyInfo(loc)]);
  const mapLink = UI[loc].page.openMap;

  return (
    <div className="section">
      <div className="container-yv">
        {texts.pill && <Pill>{texts.pill}</Pill>}
        <h1 className="font-display font-bold mt-4" style={{ fontSize: "clamp(30px,5vw,56px)" }}>{texts.h1 || UI[loc].page.contactH1}</h1>

        <div className="grid gap-6 lg:grid-cols-2 mt-10">
          <ContactForm locale={loc} />

          <div className="yv-card"><div className="yv-card-inner p-6">
            <p className="eyebrow mb-4">{UI[loc].page.contactDetails}</p>
            <ul className="space-y-3 text-sm">
              {company.email && <li><a href={`mailto:${company.email}`} className="hover:underline">{company.email}</a></li>}
              {company.phone_number && <li><a href={`tel:${company.phone_number.replace(/\s/g, "")}`} className="hover:underline">{company.phone_number}</a></li>}
              {company.telegram_url && <li><a href={company.telegram_url} target="_blank" rel="noopener noreferrer" className="hover:underline">Telegram</a></li>}
              {company.address && <li style={{ color: "var(--n500)" }}>{company.address}</li>}
            </ul>
            {company.address && (
              <div className="mt-5">
                {/* Keyless embed driven by the address the CMS holds, so moving
                    office is a content edit rather than a code change. */}
                <iframe
                  title={company.address}
                  src={`https://maps.google.com/maps?q=${encodeURIComponent(company.address)}&z=16&output=embed`}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  className="w-full aspect-video rounded-2xl border-0"
                  style={{ background: "var(--warm)" }}
                />
                <a
                  href={`https://maps.google.com/?q=${encodeURIComponent(company.address)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-3 text-sm hover:underline"
                  style={{ color: "var(--orange-ink)" }}
                >
                  {mapLink} ↗
                </a>
              </div>
            )}
          </div></div>
        </div>
      </div>
    </div>
  );
}

export const revalidate = 300;
