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
  apply: {
    step: string; of: string;
    s1: string; s2: string; s3: string; s4: string;
    startupName: string; startupNamePh: string; sector: string; sectorPh: string;
    description: string; descriptionPh: string; deckLink: string;
    stage: string; stageIdea: string; stageMvp: string; stagePost: string;
    amount: string; amountPh: string; currency: string; uzs: string; usd: string;
    spendPlan: string; hasAccel: string; programName: string; programYear: string;
    hasCompetition: string; competitionName: string; competitionYear: string;
    fullName: string; age: string; role: string; rolePh: string;
    gender: string; male: string; female: string;
    region: string; cofounders: string; team: string;
    hasRevenue: string; monthlyRevenue: string;
    raisedBefore: string; fundingSources: string; totalRaised: string;
    phone: string; email: string; socials: string; heardFrom: string;
    disclaimer: string;
    back: string; next: string; submit: string; sending: string;
    yes: string; no: string; choose: string;
    sentTitle: string; sentBody: string;
  };
};

export const UI: Record<Locale, Dict> = {
  uz: {
    nav: { home: "Asosiy", about: "Biz haqimizda", portfolio: "Portfel", news: "Yangiliklar", partners: "Hamkorlar", video: "Video", apply: "Ariza yuborish", contact: "Kontaktlar" },
    cta: { apply: "Ariza yuborish", more: "Batafsil", allNews: "Barcha yangiliklar", allPartners: "Barcha hamkorlar", backHome: "Bosh sahifaga" },
    footer: { rights: "Barcha huquqlar himoyalangan", nav: "Sahifalar", contact: "Aloqa", social: "Ijtimoiy tarmoqlar" },
    misc: { menu: "Menyu", close: "Yopish", loading: "Yuklanmoqda…", empty: "Hozircha maʼlumot yoʻq" },
    apply: {
      step: "Bosqich", of: "/",
      s1: "Startap haqida", s2: "Bosqich va investitsiya", s3: "Jamoa haqida", s4: "Aloqa maʼlumotlari",
      startupName: "Startap nomi", startupNamePh: "Masalan, Educoin", sector: "Startap yoʻnalishi", sectorPh: "Masalan, EdTech",
      description: "Startap tavsifi", descriptionPh: "Maksimum 500 ta belgi", deckLink: "Taqdimot / biznes reja fayliga havola",
      stage: "Startapingiz hozir qaysi bosqichda?", stageIdea: "Gʻoya", stageMvp: "MVP ishlab chiqilmoqda", stagePost: "Post MVP",
      amount: "Qancha investitsiya soʻrayapsiz?", amountPh: "Masalan, 500 000 000", currency: "Valyuta", uzs: "soʻm", usd: "dollar",
      spendPlan: "Mablagʻni sarflash rejasi", hasAccel: "Akseleratsiya/inkubatsiya guvohnomasi bormi?", programName: "Dastur nomi", programYear: "Dastur yili",
      hasCompetition: "Startap tanlovlarida qatnashganmisiz?", competitionName: "Tanlov nomi", competitionYear: "Tanlov yili",
      fullName: "Toʻliq ism", age: "Yoshi", role: "Roli", rolePh: "CEO",
      gender: "Jinsi", male: "Erkak", female: "Ayol",
      region: "Hudud", cofounders: "Hamtasischilar soni", team: "Jamoa haqida (ismi, yoshi, vazifasi)",
      hasRevenue: "Hozirda savdo bormi?", monthlyRevenue: "Oʻrtacha oylik daromad",
      raisedBefore: "Oldin investitsiya jalb qilganmisiz?", fundingSources: "Moliyalashtirish manbalari", totalRaised: "Umumiy miqdor",
      phone: "Telefon raqami", email: "Email", socials: "Qaysi ijtimoiy tarmoqlarda faolsiz?", heardFrom: "Biz haqimizda qayerdan eshitdingiz?",
      disclaimer: "Eslatma. Ushbu arizani yuborish investitsiyani kafolatlamaydi. Yoshlar Ventures barcha maʼlumotlarni maxfiy saqlaydi.",
      back: "Orqaga", next: "Davom etish →", submit: "Ariza yuborish", sending: "Yuborilmoqda…",
      yes: "Ha", no: "Yoʻq", choose: "—",
      sentTitle: "Arizangiz qabul qilindi",
      sentBody: "Rahmat! Arizangizni koʻrib chiqamiz va javob xatini email orqali yuboramiz.",
    },
  },
  ru: {
    nav: { home: "Главная", about: "О нас", portfolio: "Портфель", news: "Новости", partners: "Партнёры", video: "Видео", apply: "Подать заявку", contact: "Контакты" },
    cta: { apply: "Подать заявку", more: "Подробнее", allNews: "Все новости", allPartners: "Все партнёры", backHome: "На главную" },
    footer: { rights: "Все права защищены", nav: "Страницы", contact: "Контакты", social: "Соцсети" },
    misc: { menu: "Меню", close: "Закрыть", loading: "Загрузка…", empty: "Пока нет данных" },
    apply: {
      step: "Шаг", of: "/",
      s1: "О стартапе", s2: "Стадия и инвестиции", s3: "О команде", s4: "Контактные данные",
      startupName: "Название стартапа", startupNamePh: "Например, Educoin", sector: "Направление стартапа", sectorPh: "Например, EdTech",
      description: "Описание стартапа", descriptionPh: "Максимум 500 символов", deckLink: "Ссылка на презентацию / бизнес-план",
      stage: "На какой стадии сейчас ваш стартап?", stageIdea: "Идея", stageMvp: "MVP в разработке", stagePost: "После MVP",
      amount: "Сколько инвестиций вы запрашиваете?", amountPh: "Например, 500 000 000", currency: "Валюта", uzs: "сум", usd: "доллар",
      spendPlan: "План расходования средств", hasAccel: "Есть ли сертификат акселерации/инкубации?", programName: "Название программы", programYear: "Год программы",
      hasCompetition: "Участвовали ли в стартап-конкурсах?", competitionName: "Название конкурса", competitionYear: "Год конкурса",
      fullName: "Полное имя", age: "Возраст", role: "Роль", rolePh: "CEO",
      gender: "Пол", male: "Мужской", female: "Женский",
      region: "Регион", cofounders: "Количество сооснователей", team: "О команде (имя, возраст, роль)",
      hasRevenue: "Есть ли продажи сейчас?", monthlyRevenue: "Средний месячный доход",
      raisedBefore: "Привлекали ли инвестиции ранее?", fundingSources: "Источники финансирования", totalRaised: "Общая сумма",
      phone: "Номер телефона", email: "Email", socials: "В каких соцсетях вы активны?", heardFrom: "Откуда вы узнали о нас?",
      disclaimer: "Примечание. Подача заявки не гарантирует инвестиции. Yoshlar Ventures хранит все данные конфиденциально.",
      back: "Назад", next: "Продолжить →", submit: "Отправить заявку", sending: "Отправляется…",
      yes: "Да", no: "Нет", choose: "—",
      sentTitle: "Заявка принята",
      sentBody: "Спасибо! Мы рассмотрим вашу заявку и отправим ответное письмо на email.",
    },
  },
  en: {
    nav: { home: "Home", about: "About", portfolio: "Portfolio", news: "News", partners: "Partners", video: "Video", apply: "Apply", contact: "Contact" },
    cta: { apply: "Apply now", more: "Learn more", allNews: "All news", allPartners: "All partners", backHome: "Back home" },
    footer: { rights: "All rights reserved", nav: "Pages", contact: "Contact", social: "Social" },
    misc: { menu: "Menu", close: "Close", loading: "Loading…", empty: "Nothing here yet" },
    apply: {
      step: "Step", of: "/",
      s1: "About the startup", s2: "Stage and investment", s3: "About the team", s4: "Contact details",
      startupName: "Startup name", startupNamePh: "For example, Educoin", sector: "Startup sector", sectorPh: "For example, EdTech",
      description: "Startup description", descriptionPh: "Up to 500 characters", deckLink: "Link to your deck / business plan",
      stage: "What stage is your startup at?", stageIdea: "Idea", stageMvp: "Building an MVP", stagePost: "Post-MVP",
      amount: "How much investment are you asking for?", amountPh: "For example, 500 000 000", currency: "Currency", uzs: "soum", usd: "dollar",
      spendPlan: "How you plan to spend the funds", hasAccel: "Do you have an accelerator/incubator certificate?", programName: "Programme name", programYear: "Programme year",
      hasCompetition: "Have you taken part in startup competitions?", competitionName: "Competition name", competitionYear: "Competition year",
      fullName: "Full name", age: "Age", role: "Role", rolePh: "CEO",
      gender: "Gender", male: "Male", female: "Female",
      region: "Region", cofounders: "Number of co-founders", team: "About the team (name, age, role)",
      hasRevenue: "Do you have revenue yet?", monthlyRevenue: "Average monthly revenue",
      raisedBefore: "Have you raised investment before?", fundingSources: "Funding sources", totalRaised: "Total amount",
      phone: "Phone number", email: "Email", socials: "Which social networks are you active on?", heardFrom: "How did you hear about us?",
      disclaimer: "Note. Submitting this application does not guarantee investment. Yoshlar Ventures keeps all information confidential.",
      back: "Back", next: "Continue →", submit: "Submit application", sending: "Sending…",
      yes: "Yes", no: "No", choose: "—",
      sentTitle: "Your application has been received",
      sentBody: "Thank you! We will review your application and send our reply by email.",
    },
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
