import type { Locale } from "./i18n";

// Server-side base URL for the dashboard's public API. In Docker compose this is
// the backend service DNS; standalone dev falls back to localhost.
const API_BASE = (process.env.API_BASE || "http://localhost:8000").replace(/\/$/, "");
const REVALIDATE = Number(process.env.CONTENT_REVALIDATE || 300);

export interface ContentRecord {
  id: number;
  public_id: string;
  order: number;
  [key: string]: unknown;
}

export interface CompanyInfo {
  address?: string;
  email?: string;
  phone_number?: string;
  telegram_url?: string;
  instagram_url?: string;
  youtube_url?: string;
  linkedin_url?: string;
  x_url?: string;
}

async function pub<T>(path: string, locale: Locale, fallback: T): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}/api/v1/public${path}${sep}locale=${locale}`;
  try {
    const res = await fetch(url, {
      headers: { "Accept-Language": locale },
      next: { revalidate: REVALIDATE },
    });
    if (!res.ok) return fallback;
    const json = (await res.json()) as { response?: T } & T;
    return (json.response ?? json) as T;
  } catch {
    // Backend unreachable (e.g. during a build with no live API) — render the
    // page shell rather than crashing; ISR will fill it in on the next request.
    return fallback;
  }
}

export function getCollection(slug: string, locale: Locale): Promise<{ items: ContentRecord[]; total: number }> {
  return pub(`/content/${slug}/`, locale, { items: [], total: 0 });
}

export function getPageTexts(page: string, locale: Locale): Promise<{ page: string; texts: Record<string, string> }> {
  return pub(`/page-texts/${page}/`, locale, { page, texts: {} });
}

export function getCompanyInfo(locale: Locale): Promise<CompanyInfo> {
  return pub(`/company-info/`, locale, {});
}

/** Convenience: fetch every collection + page texts a page needs in parallel. */
export async function getHomeData(locale: Locale) {
  const [texts, portfel, projects, news, partners, upcoming, archive, logos, team, stages, steps, company] =
    await Promise.all([
      getPageTexts("home", locale),
      getCollection("portfel", locale),
      getCollection("loyihalar", locale),
      getCollection("yangiliklar", locale),
      getCollection("hamkorlar", locale),
      getCollection("tadbirlar", locale),
      getCollection("arxiv", locale),
      getCollection("lenta", locale),
      getCollection("jamoa", locale),
      getCollection("bosqichlar", locale),
      getCollection("jarayon", locale),
      getCompanyInfo(locale),
    ]);
  return {
    texts: texts.texts,
    portfel: portfel.items,
    projects: projects.items,
    news: news.items,
    partners: partners.items,
    upcoming: upcoming.items,
    archive: archive.items,
    logos: logos.items,
    team: team.items,
    stages: stages.items,
    steps: steps.items,
    company,
  };
}
