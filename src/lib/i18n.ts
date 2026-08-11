export const LOCALES = ["uz", "ru", "en"] as const;
export type Locale = (typeof LOCALES)[number];
export const DEFAULT_LOCALE: Locale = "uz";

export function isLocale(value: string): value is Locale {
  return (LOCALES as readonly string[]).includes(value);
}

export const LOCALE_LABELS: Record<Locale, string> = {
  uz: "O‘zbekcha",
  ru: "Русский",
  en: "English",
};

// html lang / hreflang codes for each locale.
export const HREFLANG: Record<Locale, string> = {
  uz: "uz",
  ru: "ru",
  en: "en",
};

// Static UI strings (nav, footer, buttons) — content comes from the CMS, but
// chrome labels live here so they render even before the API responds.
type Dict = {
  nav: { home: string; about: string; portfolio: string; news: string; partners: string; video: string; apply: string; contact: string };
  cta: { apply: string; more: string; allNews: string; allPartners: string; backHome: string };
  footer: { rights: string; nav: string; contact: string; social: string };
  misc: { menu: string; close: string; loading: string; empty: string };
};

export const UI: Record<Locale, Dict> = {
  uz: {
    nav: { home: "Asosiy", about: "Biz haqimizda", portfolio: "Portfel", news: "Yangiliklar", partners: "Hamkorlar", video: "Video", apply: "Ariza yuborish", contact: "Kontaktlar" },
    cta: { apply: "Ariza yuborish", more: "Batafsil", allNews: "Barcha yangiliklar", allPartners: "Barcha hamkorlar", backHome: "Bosh sahifaga" },
    footer: { rights: "Barcha huquqlar himoyalangan", nav: "Sahifalar", contact: "Aloqa", social: "Ijtimoiy tarmoqlar" },
    misc: { menu: "Menyu", close: "Yopish", loading: "Yuklanmoqda…", empty: "Hozircha maʼlumot yoʻq" },
  },
  ru: {
    nav: { home: "Главная", about: "О нас", portfolio: "Портфель", news: "Новости", partners: "Партнёры", video: "Видео", apply: "Подать заявку", contact: "Контакты" },
    cta: { apply: "Подать заявку", more: "Подробнее", allNews: "Все новости", allPartners: "Все партнёры", backHome: "На главную" },
    footer: { rights: "Все права защищены", nav: "Страницы", contact: "Контакты", social: "Соцсети" },
    misc: { menu: "Меню", close: "Закрыть", loading: "Загрузка…", empty: "Пока нет данных" },
  },
  en: {
    nav: { home: "Home", about: "About", portfolio: "Portfolio", news: "News", partners: "Partners", video: "Video", apply: "Apply", contact: "Contact" },
    cta: { apply: "Apply now", more: "Learn more", allNews: "All news", allPartners: "All partners", backHome: "Back home" },
    footer: { rights: "All rights reserved", nav: "Pages", contact: "Contact", social: "Social" },
    misc: { menu: "Menu", close: "Close", loading: "Loading…", empty: "Nothing here yet" },
  },
};

/** Canonical origin for metadata, sitemap and robots.
 *
 * Read at runtime (SITE_URL), not baked into the bundle: the same image is
 * deployed to the staging host and to production, and only the environment
 * differs. NEXT_PUBLIC_SITE_URL stays supported for local development. Every
 * consumer is server-side (sitemap, robots, seo metadata), so no client bundle
 * needs this value. */
export const SITE_URL = (
  process.env.SITE_URL ||
  process.env.NEXT_PUBLIC_SITE_URL ||
  "https://yoshlarventures.uz"
).replace(/\/$/, "");

/** Whether search engines may index this deployment. Staging must stay out of
 * the index — a public beta that ranks would split traffic and duplicate every
 * page of the real site. */
export const SITE_INDEXABLE = process.env.SITE_INDEXABLE === "true";
