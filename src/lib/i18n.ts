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
  page: {
    statProjects: string; statInvested: string; statCheque: string;
    secStage: string; obj1: string; obj2: string; obj3: string;
    secPortfolio: string; secProjects: string; secNews: string; secTeam: string; secPartners: string;
    bandTitle: string; bandBody: string; beliefPill: string;
    ecosystem: string; seeAll: string; seeAllShort: string; more: string; introVideo: string; ctaTitle: string;
    sector: string; investment: string;
    aboutTitle: string; aboutIntro: string; processTitle: string; processHeading: string; step: string;
    teamTitle: string; teamHeading: string;
    aboutStatProjects: string; aboutStatInvested: string; aboutStatCheque: string; aboutStage: string; aboutStageLabel: string;
    birdTitle: string; birdBody: string; birdChip1: string; birdChip2: string; birdChip3: string;
    newsTitle: string; newsH1: string; upcoming: string; archive: string;
    partnersTitle: string; partnersH1: string;
    contactTitle: string; contactH1: string; contactDetails: string; openMap: string;
    applyTitle: string; prepTitle: string;
    cfSentTitle: string; cfSentBody: string; cfName: string; cfContact: string; cfMessage: string;
    cfSending: string; cfSubmit: string;
  };
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
    page: {
      statProjects: "portfel loyihasi", statInvested: "jami sarmoya", statCheque: "soʻmgacha eng katta chek",
      secStage: "Bosqichingizga mos qoʻllab-quvvatlash", obj1: "“Hali tayyor emasman”", obj2: "“Yolgʻizman”", obj3: "“Pul yoʻq”",
      secPortfolio: "Bizning portfelimiz", secProjects: "Bizning loyihalarimiz", secNews: "Yangiliklar va tadbirlar",
      secTeam: "Biz yoshlarga ishonamiz", secPartners: "Bizga ishongan hamkorlarimiz",
      bandTitle: "Bularning hech biri toʻsiq emas", bandBody: "Eng yaxshi loyihalar ideal holatda tugʻilmaydi. Biz tayyor reja emas, rost fikrni kutamiz.", beliefPill: "Bizning ishonchimiz",
      ecosystem: "Ekotizim", seeAll: "Barchasini koʻrish ↗", seeAllShort: "Barchasi ↗", more: "Batafsil ↗",
      introVideo: "Intro video · 2:14", ctaTitle: "Gʻoyangiz bormi? Bugun boshlang.",
      sector: "Soha", investment: "Sarmoya",
      aboutTitle: "Biz haqimizda", aboutIntro: "Startapingizga birinchi ishonadigan bizmiz.",
      processTitle: "Jarayon", processHeading: "Arizadan investitsiyagacha, 4 qadam", step: "Qadam",
      teamTitle: "Jamoa", teamHeading: "Sizni eshitadigan odamlar",
      aboutStatProjects: "portfel loyihasi", aboutStatInvested: "jami investitsiya", aboutStatCheque: "soʻmgacha cheklov",
      aboutStage: "Pre-seed", aboutStageLabel: "asosiy bosqich",
      birdTitle: "Logotipimizdagi qush bejizga emas",
      birdBody: "Har bir gʻoya uchishni xohlaydi. Sizga faqat ozgina ishonch va yoʻl koʻrsatuvchi kerak. Biz aynan shunday qanot boʻlamiz.",
      birdChip1: "Erta bosqich", birdChip2: "Ochiq shartlar", birdChip3: "Uzoq muddatli hamrohlik",
      newsTitle: "Yangiliklar", newsH1: "Yangiliklar va tadbirlar", upcoming: "Yaqinlashayotgan tadbirlar", archive: "Arxiv",
      partnersTitle: "Hamkorlar", partnersH1: "Bizga ishongan hamkorlarimiz",
      contactTitle: "Kontaktlar", contactH1: "Savolingiz bormi? Yozing.", contactDetails: "Aloqa maʼlumotlari", openMap: "Xaritada ochish",
      applyTitle: "Ariza yuborish", prepTitle: "Nima tayyorlash kerak",
      cfSentTitle: "Xabaringiz yuborildi", cfSentBody: "Rahmat! Jamoamiz Telegram yoki telefon orqali bogʻlanadi.",
      cfName: "Ism", cfContact: "Telefon yoki Telegram", cfMessage: "Xabar", cfSending: "Yuborilmoqda…", cfSubmit: "Yuborish",
    },
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
    page: {
      statProjects: "проектов в портфеле", statInvested: "всего инвестиций", statCheque: "сумов — крупнейший чек",
      secStage: "Поддержка под вашу стадию", obj1: "«Я ещё не готов»", obj2: "«Я один»", obj3: "«Нет денег»",
      secPortfolio: "Наш портфель", secProjects: "Наши проекты", secNews: "Новости и мероприятия",
      secTeam: "Мы верим в молодых", secPartners: "Партнёры, которые нам доверяют",
      bandTitle: "Ничто из этого не помеха", bandBody: "Лучшие проекты не рождаются идеальными. Мы ждём не готовый план, а честную мысль.", beliefPill: "Наша вера",
      ecosystem: "Экосистема", seeAll: "Смотреть все ↗", seeAllShort: "Все ↗", more: "Подробнее ↗",
      introVideo: "Интро-видео · 2:14", ctaTitle: "Есть идея? Начните сегодня.",
      sector: "Сфера", investment: "Инвестиции",
      aboutTitle: "О нас", aboutIntro: "Мы верим в ваш стартап первыми.",
      processTitle: "Процесс", processHeading: "От заявки до инвестиции — 4 шага", step: "Шаг",
      teamTitle: "Команда", teamHeading: "Люди, которые вас услышат",
      aboutStatProjects: "проектов в портфеле", aboutStatInvested: "всего инвестиций", aboutStatCheque: "максимальный чек",
      aboutStage: "Pre-seed", aboutStageLabel: "основной этап",
      birdTitle: "Птица в нашем логотипе не случайна",
      birdBody: "Каждая идея хочет взлететь. Нужны лишь немного веры и проводник. Мы и есть эти крылья.",
      birdChip1: "Ранняя стадия", birdChip2: "Прозрачные условия", birdChip3: "Долгосрочное сопровождение",
      newsTitle: "Новости", newsH1: "Новости и мероприятия", upcoming: "Ближайшие мероприятия", archive: "Архив",
      partnersTitle: "Партнёры", partnersH1: "Партнёры, которые нам доверяют",
      contactTitle: "Контакты", contactH1: "Есть вопрос? Напишите.", contactDetails: "Контактные данные", openMap: "Открыть на карте",
      applyTitle: "Подать заявку", prepTitle: "Что подготовить",
      cfSentTitle: "Сообщение отправлено", cfSentBody: "Спасибо! Наша команда свяжется с вами в Telegram или по телефону.",
      cfName: "Имя", cfContact: "Телефон или Telegram", cfMessage: "Сообщение", cfSending: "Отправляется…", cfSubmit: "Отправить",
    },
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
    page: {
      statProjects: "portfolio companies", statInvested: "invested to date", statCheque: "soum — largest cheque",
      secStage: "Support that matches your stage", obj1: "“I'm not ready yet”", obj2: "“I'm on my own”", obj3: "“I have no money”",
      secPortfolio: "Our portfolio", secProjects: "Our projects", secNews: "News and events",
      secTeam: "We believe in young founders", secPartners: "Partners who trust us",
      bandTitle: "None of that is a barrier", bandBody: "The best projects are not born finished. We are looking for an honest idea, not a polished plan.", beliefPill: "Our belief",
      ecosystem: "Ecosystem", seeAll: "See all ↗", seeAllShort: "All ↗", more: "Read more ↗",
      introVideo: "Intro video · 2:14", ctaTitle: "Got an idea? Start today.",
      sector: "Sector", investment: "Investment",
      aboutTitle: "About us", aboutIntro: "We are the first to believe in your startup.",
      processTitle: "Process", processHeading: "From application to investment in 4 steps", step: "Step",
      teamTitle: "Team", teamHeading: "The people who will listen",
      aboutStatProjects: "portfolio companies", aboutStatInvested: "invested to date", aboutStatCheque: "maximum cheque",
      aboutStage: "Pre-seed", aboutStageLabel: "core stage",
      birdTitle: "The bird in our logo is no accident",
      birdBody: "Every idea wants to fly. All it needs is a little belief and a guide. That is exactly the wing we become.",
      birdChip1: "Early stage", birdChip2: "Transparent terms", birdChip3: "Long-term partnership",
      newsTitle: "News", newsH1: "News and events", upcoming: "Upcoming events", archive: "Archive",
      partnersTitle: "Partners", partnersH1: "Partners who trust us",
      contactTitle: "Contact", contactH1: "Have a question? Write to us.", contactDetails: "Contact details", openMap: "Open in Maps",
      applyTitle: "Apply", prepTitle: "What to prepare",
      cfSentTitle: "Your message has been sent", cfSentBody: "Thank you! Our team will get in touch on Telegram or by phone.",
      cfName: "Name", cfContact: "Phone or Telegram", cfMessage: "Message", cfSending: "Sending…", cfSubmit: "Send",
    },
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
