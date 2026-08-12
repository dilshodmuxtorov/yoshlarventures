"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useCallback, useState, useSyncExternalStore } from "react";

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

export default function Header({ locale }: { locale: Locale }) {
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

  const links: { href: string; label: string; external?: boolean }[] = [
    { href: p(""), label: t.nav.home },
    { href: p("/about"), label: t.nav.about },
    { href: p("/news"), label: t.nav.news },
    { href: p("/portfolio"), label: t.nav.portfolio },
    { href: p("/partners"), label: t.nav.partners },
    { href: "https://youtube.com/@yoshlarventures", label: t.nav.video, external: true },
    { href: p("/contact"), label: t.nav.contact },
  ];

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
            <span className="font-display leading-none text-[12px] font-bold tracking-tight hidden sm:block">
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
            <button onClick={() => setOpen((o) => !o)} aria-label={t.misc.menu} className="lg:hidden grid place-items-center rounded-full" style={{ width: 44, height: 44, background: "var(--ink)", color: "#fff" }}>
              {open ? "✕" : "☰"}
            </button>
          </div>
        </nav>
      </div>

      {open && (
        <div className="lg:hidden fixed inset-0 top-0 z-40 pt-24 px-6" style={{ background: "var(--surface)" }}>
          <div className="flex flex-col gap-2">
            {links.map((l) => (
              <Link key={l.href} href={l.href} className="font-display text-2xl font-semibold py-2" onClick={() => setOpen(false)}>
                {l.label}
              </Link>
            ))}
            <Link href={p("/apply")} className="btn-primary mt-4 justify-center" onClick={() => setOpen(false)}>
              {t.cta.apply}
              <span className="badge">↗</span>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
