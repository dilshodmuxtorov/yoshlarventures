"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useEffect, useState, useSyncExternalStore } from "react";

import { LOCALES, UI, type Locale } from "@/lib/i18n";

/** Subscribe to the theme the inline boot script wrote onto <html>.
 *
 * The attribute is set before hydration, so it cannot be read during the server
 * render; reading it in an effect and mirroring it into state would trigger a
 * second render pass on every mount. useSyncExternalStore reads the live value
 * instead, with "light" as the server snapshot to match the boot default. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

function useTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribeToTheme,
    () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"),
    () => "light",
  );
}

export default function Header({ locale, hidden = [] }: { locale: Locale; hidden?: string[] }) {
  const pathname = usePathname();
  const t = UI[locale];
  // The menu is remembered against the path it was opened on, so navigating
  // closes it without an effect that reacts to the route changing.
  const [openedOn, setOpenedOn] = useState<string | null>(null);
  const open = openedOn === pathname;
  const setOpen = useCallback(
    (next: boolean | ((current: boolean) => boolean)) => {
      setOpenedOn((current) => {
        const isOpen = current === pathname;
        const wanted = typeof next === "function" ? next(isOpen) : next;
        return wanted ? pathname : null;
      });
    },
    [pathname],
  );
  const theme = useTheme();

  // Lock the page behind the mobile menu. The viewport scrolls <html> on this
  // site (globals.css sets overflow-x: clip there), so <body> locks do nothing —
  // only the block axis is touched so the clip survives.
  useEffect(() => {
    if (!open) return;
    const root = document.documentElement;
    const prev = root.style.overflowY;
    root.style.overflowY = "hidden";
    return () => {
      root.style.overflowY = prev;
    };
  }, [open]);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    // The observer above turns this into a re-render — no setState needed.
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("yv-theme", next);
    } catch {}
  };

  const p = (path: string) => `/${locale}${path}`;
  // strip current locale prefix to build language-switch links preserving path
  const rest = pathname.replace(new RegExp(`^/(${LOCALES.join("|")})`), "") || "";

  // `page` matches the dashboard's section key, so hiding a page there takes it
  // out of the menu as well as off the site.
  const links: { href: string; label: string; external?: boolean; page?: string }[] = [
    { href: p(""), label: t.nav.home },
    { href: p("/about"), label: t.nav.about, page: "about" },
    { href: p("/news"), label: t.nav.news, page: "news" },
    { href: p("/portfolio"), label: t.nav.portfolio, page: "portfolio" },
    { href: p("/partners"), label: t.nav.partners, page: "partners" },
    { href: "https://youtube.com/@yoshlarventures", label: t.nav.video, external: true },
    { href: p("/contact"), label: t.nav.contact, page: "contact" },
  ].filter((l) => !l.page || !hidden.includes(l.page));

  const isActive = (href: string) => pathname === href || (href !== p("") && pathname.startsWith(href));

  return (
    <header className="fixed top-0 inset-x-0 z-50 px-4 pt-[18px]">
      <div className="container-yv">
        <nav
          className="flex items-center rounded-full border"
          style={{ gap: 18, padding: "9px 9px 9px 18px", background: "var(--navbg)", borderColor: "var(--hair)", boxShadow: "var(--elev-sm)", backdropFilter: "blur(18px) saturate(160%)", WebkitBackdropFilter: "blur(18px) saturate(160%)" }}
          aria-label="Asosiy navigatsiya"
        >
          <Link href={p("")} className="flex items-center gap-2 pl-1 pr-2 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/yv/logo.png" alt="Yoshlar Ventures" width={32} height={32} className="w-8 h-8 rounded-lg" />
            <span className="font-display leading-none text-[12px] font-bold tracking-tight block">
              YOSHLAR<br />VENTURES
            </span>
          </Link>

          <div className="hidden lg:flex items-center mx-auto" style={{ gap: 2 }}>
            {links.map((l) =>
              l.external ? (
                <a
                  key={l.href}
                  href={l.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full transition-colors hover:bg-[var(--shell)] whitespace-nowrap"
                  style={{ padding: "12px 14px", fontSize: 14, fontWeight: 500, color: "var(--n700)" }}
                >
                  {l.label}
                </a>
              ) : (
                <Link
                  key={l.href}
                  href={l.href}
                  className="rounded-full transition-colors hover:bg-[var(--shell)] whitespace-nowrap"
                  style={isActive(l.href) ? { padding: "12px 14px", fontSize: 14, fontWeight: 500, background: "var(--warm)", color: "var(--warm-ink)" } : { padding: "12px 14px", fontSize: 14, fontWeight: 500, color: "var(--n700)" }}
                >
                  {l.label}
                </Link>
              ),
            )}
          </div>

          <div className="ml-auto lg:ml-0 flex items-center" style={{ gap: 8 }}>
            <div className="hidden sm:flex items-center rounded-full" style={{ padding: 3, background: "var(--shell)", border: "1px solid var(--hair)" }}>
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={`/${l}${rest}`}
                  className="rounded-full uppercase"
                  style={l === locale ? { padding: "10px 12px", fontSize: 12, fontWeight: 600, background: "var(--card)", color: "var(--ink)", boxShadow: "var(--hi)" } : { padding: "10px 12px", fontSize: 12, fontWeight: 600, color: "var(--n500)" }}
                >
                  {l}
                </Link>
              ))}
            </div>
            <button onClick={toggleTheme} aria-label="Rejimni almashtirish" className="grid place-items-center rounded-full" style={{ width: 44, height: 44, background: "var(--shell)", border: "1px solid var(--hair)", fontSize: 16 }}>
              {theme === "dark" ? "☀" : "☾"}
            </button>
            <Link href={p("/apply")} className="hidden md:inline-flex items-center rounded-full font-semibold whitespace-nowrap shrink-0" style={{ gap: 12, padding: "5px 5px 5px 18px", background: "var(--btn)", color: "var(--btn-fg)", fontSize: 14 }}>
              {t.cta.apply}
              <span className="grid place-items-center rounded-full text-white" style={{ width: 34, height: 34, background: "var(--orange)", fontSize: 12 }}>↗</span>
            </Link>
            {/* var(--btn)/--btn-fg, not raw --ink/#fff: in dark mode --ink is
                near-white, so an ink button with a white glyph became an
                invisible white blob. --btn flips with the theme (black-on-white
                in light, white-on-black glyph in dark). */}
            <button onClick={() => setOpen((o) => !o)} aria-label={t.misc.menu} className="lg:hidden grid place-items-center rounded-full" style={{ width: 44, height: 44, background: "var(--btn)", color: "var(--btn-fg)" }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        // Full-screen sheet above the floating bar (z-50): its own top row carries
        // the logo and a clear close, the links are a divided list, and language +
        // the apply CTA are pinned to the bottom — a structured menu, not a stack.
        <div className="lg:hidden fixed inset-0 z-[60] flex flex-col overflow-y-auto" style={{ background: "var(--surface)" }}>
          <div className="flex items-center justify-between px-5" style={{ height: 74, borderBottom: "1px solid var(--hair)" }}>
            <Link href={p("")} onClick={() => setOpen(false)} className="flex items-center gap-2">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/yv/logo.png" alt="Yoshlar Ventures" width={34} height={34} className="rounded-lg" style={{ width: 34, height: 34 }} />
              <span className="font-display leading-none text-[12px] font-bold tracking-tight">YOSHLAR<br />VENTURES</span>
            </Link>
            <button
              onClick={() => setOpen(false)}
              aria-label={t.misc.close}
              className="grid place-items-center rounded-full"
              style={{ width: 42, height: 42, background: "var(--shell)", border: "1px solid var(--hair)", fontSize: 17, color: "var(--ink)" }}
            >
              ✕
            </button>
          </div>

          <nav className="flex flex-col px-5 pt-2">
            {links.map((l) => {
              const cls = "flex items-center justify-between font-display text-xl font-semibold";
              const st = { padding: "16px 2px", borderBottom: "1px solid var(--hair)", color: "var(--ink)" };
              const chevron = <span aria-hidden style={{ color: "var(--n300)", fontSize: 18 }}>{l.external ? "↗" : "→"}</span>;
              return l.external ? (
                <a key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className={cls} style={st} onClick={() => setOpen(false)}>
                  {l.label}{chevron}
                </a>
              ) : (
                <Link key={l.href} href={l.href} className={cls} style={st} onClick={() => setOpen(false)}>
                  {l.label}{chevron}
                </Link>
              );
            })}
          </nav>

          {/* Pinned footer: language, then the primary action. */}
          <div className="mt-auto px-5 pb-8 pt-6">
            <p className="eyebrow mb-3">Til / Язык / Language</p>
            <div className="flex items-center gap-2">
              {LOCALES.map((l) => (
                <Link
                  key={l}
                  href={`/${l}${rest}`}
                  onClick={() => setOpen(false)}
                  className="rounded-full uppercase"
                  style={
                    l === locale
                      ? { padding: "9px 18px", fontSize: 13, fontWeight: 700, background: "var(--warm)", color: "var(--warm-ink)" }
                      : { padding: "9px 18px", fontSize: 13, fontWeight: 600, color: "var(--n500)", border: "1px solid var(--hair)" }
                  }
                >
                  {l}
                </Link>
              ))}
            </div>

            <Link
              href={p("/apply")}
              onClick={() => setOpen(false)}
              className="flex items-center justify-center gap-2 rounded-full font-semibold mt-5"
              style={{ height: 54, background: "var(--btn)", color: "var(--btn-fg)", fontSize: 16 }}
            >
              {t.cta.apply}
              <span className="grid place-items-center rounded-full text-white" style={{ width: 30, height: 30, background: "var(--orange)", fontSize: 12 }}>↗</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
