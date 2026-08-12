import Image from "next/image";
import Link from "next/link";

import { InstagramIcon, LinkedInIcon, TelegramIcon, XIcon, YouTubeIcon } from "@/components/SocialIcons";
import type { CompanyInfo } from "@/lib/api";
import { UI, type Locale } from "@/lib/i18n";

export default function Footer({ locale, company }: { locale: Locale; company: CompanyInfo }) {
  const t = UI[locale];
  const p = (path: string) => `/${locale}${path}`;
  const year = 2026;

  const socials = [
    { href: company.telegram_url, label: "Telegram", Icon: TelegramIcon, brand: "social-telegram" },
    { href: company.instagram_url, label: "Instagram", Icon: InstagramIcon, brand: "social-instagram" },
    { href: company.youtube_url, label: "YouTube", Icon: YouTubeIcon, brand: "social-youtube" },
    { href: company.linkedin_url, label: "LinkedIn", Icon: LinkedInIcon, brand: "social-linkedin" },
    { href: company.x_url, label: "X", Icon: XIcon, brand: "social-x" },
  ].filter((s) => s.href);

  return (
    <footer className="mt-16 border-t" style={{ borderColor: "var(--hair)", background: "var(--card)" }}>
      <div className="container-yv py-14 grid gap-10 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <Image src="/yv/logo.png" alt="" width={36} height={36} className="rounded-xl" style={{ width: 36, height: 36 }} />
            <span className="font-display font-bold">Yoshlar Ventures</span>
          </div>
          <p className="text-sm max-w-xs" style={{ color: "var(--n500)" }}>
            {locale === "ru" ? "Вы создаёте — мы даём крылья." : locale === "en" ? "You create, we give wings." : "Siz yarating, biz qanot beramiz."}
          </p>
          {socials.length > 0 && (
            <div className="flex flex-wrap gap-2.5 mt-5">
              {socials.map(({ href, label, Icon, brand }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={label}
                  title={label}
                  className={`grid place-items-center rounded-full border transition-colors ${brand}`}
                  style={{ width: 40, height: 40, borderColor: "var(--hair)", color: "var(--n500)", background: "var(--surface)" }}
                >
                  <Icon className="w-[18px] h-[18px]" />
                </a>
              ))}
            </div>
          )}
        </div>

        <div>
          <p className="eyebrow mb-3">{t.footer.nav}</p>
          <ul className="space-y-2 text-sm" style={{ color: "var(--n500)" }}>
            <li><Link href={p("")}>{t.nav.home}</Link></li>
            <li><Link href={p("/about")}>{t.nav.about}</Link></li>
            <li><Link href={p("/news")}>{t.nav.news}</Link></li>
            <li><Link href={p("/portfolio")}>{t.nav.portfolio}</Link></li>
            <li><Link href={p("/partners")}>{t.nav.partners}</Link></li>
            <li><Link href={p("/contact")}>{t.nav.contact}</Link></li>
          </ul>
        </div>

        <div>
          <p className="eyebrow mb-3">{t.footer.contact}</p>
          <ul className="space-y-2 text-sm" style={{ color: "var(--n500)" }}>
            {company.email && <li><a href={`mailto:${company.email}`} className="hover:underline">{company.email}</a></li>}
            {company.phone_number && <li><a href={`tel:${company.phone_number.replace(/\s/g, "")}`} className="hover:underline">{company.phone_number}</a></li>}
            {company.address && <li>{company.address}</li>}
          </ul>
        </div>
      </div>
      <div className="border-t" style={{ borderColor: "var(--hair)" }}>
        <div className="container-yv py-5 text-xs" style={{ color: "var(--n300)" }}>
          © {year} Yoshlar Ventures. {t.footer.rights}.
        </div>
      </div>
    </footer>
  );
}
