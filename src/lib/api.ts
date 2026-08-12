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

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

// Statuses worth a second attempt: the public API is IP rate-limited, and a
// production build prerenders every page in every locale — dozens of calls in a
// few seconds from one address, which trips that limit. Without a retry those
// pages are baked with empty content and stay that way until ISR revalidates
// them, so the site ships looking half-broken.
// 403 is in here on purpose: django_ratelimit raises a PermissionDenied
// subclass, so a throttled read arrives as 403 rather than 429. These endpoints
// are anonymous and read-only, so a 403 has no other meaning — treating it as
// permanent is what left builds shipping pages with no content.
const RETRYABLE = new Set([403, 408, 425, 429, 500, 502, 503, 504]);
const ATTEMPTS = 5;

async function pub<T>(path: string, locale: Locale, fallback: T): Promise<T> {
  const sep = path.includes("?") ? "&" : "?";
  const url = `${API_BASE}/api/v1/public${path}${sep}locale=${locale}`;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { "Accept-Language": locale },
        next: { revalidate: REVALIDATE },
      });
      if (res.ok) {
        const json = (await res.json()) as { response?: T } & T;
        return (json.response ?? json) as T;
      }
      if (!RETRYABLE.has(res.status) || attempt === ATTEMPTS) return fallback;
      // Honour Retry-After when the server sends one, else back off: 1s, 3s, 7s.
      const retryAfter = Number(res.headers.get("retry-after"));
      await sleep(Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 2 ** attempt * 500 - 500);
    } catch {
      // Backend unreachable (e.g. a build with no live API) — render the page
      // shell rather than crashing; ISR fills it in on a later request.
      if (attempt === ATTEMPTS) return fallback;
      await sleep(2 ** attempt * 500 - 500);
    }
  }
  return fallback;
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
