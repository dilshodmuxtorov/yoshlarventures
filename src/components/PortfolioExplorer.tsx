"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import SafeImage from "@/components/SafeImage";
import { Monogram } from "@/components/ui";
import type { ContentRecord } from "@/lib/api";
import { field, linkKind } from "@/lib/portfolio";

type Labels = {
  sector: string;
  investment: string;
  close: string;
  visitSite: string;
  aboutStartup: string;
};

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';

/**
 * The portfolio grid plus the detail overlay.
 *
 * A client component because the overlay is pure interaction state; the page
 * around it stays a server component so the cards are still server-rendered and
 * indexable. The detail text lives in the CMS record we already fetched, so
 * opening a card costs no request.
 */
export default function PortfolioExplorer({ items, labels }: { items: ContentRecord[]; labels: Labels }) {
  const [openId, setOpenId] = useState<number | null>(null);
  const open = items.find((i) => i.id === openId) ?? null;
  // Focus goes back to the card that opened the overlay, so keyboard users are
  // not dropped at the top of the document on close.
  const originRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenId(null);
    originRef.current?.focus();
  }, []);

  return (
    <>
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 mt-10">
        {items.map((c) => {
          const name = field(c, "name");
          const amount = field(c, "investment_thousand_usd");
          return (
            <button
              key={c.id}
              type="button"
              onClick={(e) => {
                originRef.current = e.currentTarget;
                setOpenId(c.id);
              }}
              className="yv-card yv-card-hover h-full text-left cursor-pointer"
              style={{ display: "block", width: "100%" }}
              aria-haspopup="dialog"
            >
              <div className="yv-card-inner p-6 flex flex-col h-full">
                <SafeImage
                  src={field(c, "image_url")}
                  alt={name}
                  style={{ width: 56, height: 56, borderRadius: 16, objectFit: "contain", background: "var(--warm)" }}
                  fallback={<Monogram text={name} />}
                />
                <h2 className="font-display font-semibold text-lg mt-4" style={{ overflowWrap: "anywhere" }}>
                  {name}
                </h2>
                <p className="text-sm mt-2 line-clamp-3" style={{ color: "var(--n500)" }}>
                  {field(c, "short_description")}
                </p>
                <div
                  className="pt-4 border-t grid grid-cols-2 gap-2 text-sm"
                  style={{ borderColor: "var(--hair)", marginTop: "auto" }}
                >
                  <div>
                    <span className="eyebrow block">{labels.sector}</span>
                    {field(c, "sector")}
                  </div>
                  <div className="text-right">
                    <span className="eyebrow block">{labels.investment}</span>
                    <span style={{ color: "var(--orange)" }} className="font-semibold">{amount}</span>
                  </div>
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {open && <PortfolioDetail record={open} labels={labels} onClose={close} />}
    </>
  );
}

function PortfolioDetail({
  record,
  labels,
  onClose,
}: {
  record: ContentRecord;
  labels: Labels;
  onClose: () => void;
}) {
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
        return;
      }
      if (e.key !== "Tab") return;
      // Keep Tab inside the dialog; without this the next stop is the page
      // behind it, which is unreachable by mouse but still tabbable.
      const panel = panelRef.current;
      if (!panel) return;
      const stops = [...panel.querySelectorAll<HTMLElement>(FOCUSABLE)];
      if (stops.length === 0) return;
      const first = stops[0];
      const last = stops[stops.length - 1];
      const active = document.activeElement;
      const inside = active instanceof Node && panel.contains(active);
      if (e.shiftKey && (!inside || active === first)) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && (!inside || active === last)) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", onKey);

    // The viewport scrolls the <html> element on this site, not <body>:
    // globals.css puts `overflow-x: clip` on <html>, and a root element whose
    // overflow is not visible in both axes stops the UA propagating <body>'s
    // overflow to the viewport. Locking <body> therefore did nothing at all,
    // which is why the page kept scrolling behind the overlay.
    //
    // Only the block axis is touched, so `overflow-x: clip` survives — swapping
    // it for `hidden` would turn <html> into a scrollport and break every
    // `position: sticky` on the site (see the note in globals.css).
    const root = document.documentElement;
    const previousOverflow = root.style.overflowY;
    const previousPadding = root.style.paddingRight;
    // Measured before the lock: where scrollbars take real width, removing one
    // would otherwise shift the whole page sideways as the overlay opens.
    const gutter = window.innerWidth - root.clientWidth;
    root.style.overflowY = "hidden";
    if (gutter > 0) root.style.paddingRight = `${gutter}px`;

    return () => {
      document.removeEventListener("keydown", onKey);
      root.style.overflowY = previousOverflow;
      root.style.paddingRight = previousPadding;
    };
  }, [onClose]);

  const name = field(record, "name");
  const website = field(record, "website_url");
  const short = field(record, "short_description");
  const rawDetail = field(record, "detail_text");
  // Several records repeat the short description verbatim in the long field.
  // Printing both just looks like a rendering bug, so the duplicate is dropped.
  const detail = rawDetail.trim() === short.trim() ? "" : rawDetail;
  const sector = field(record, "sector");
  const amount = field(record, "investment_thousand_usd");

  return (
    <div
      onMouseDown={(e) => {
        // mousedown, not click: a drag that starts inside the panel and ends on
        // the backdrop (selecting text) must not count as clicking away.
        // Primary button only, so a right-click, or grabbing this element's own
        // scrollbar, leaves the dialog open.
        if (e.button === 0 && e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        // flex + `margin: auto` on the panel rather than `place-items: center`:
        // a centred item taller than its scrollport overflows equally at both
        // ends and the top can never be scrolled to. Auto margins collapse to
        // zero once the free space is gone, so a long write-up stays reachable.
        display: "flex",
        overflowY: "auto",
        padding: "clamp(12px,4vw,40px)",
        background: "rgba(20,20,20,.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "yv-fade .18s ease-out",
      }}
    >
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={name}
        style={{
          position: "relative",
          margin: "auto",
          width: "min(680px, 100%)",
          borderRadius: 32,
          background: "var(--card)",
          boxShadow: "var(--elev)",
          // `clip`, not `hidden`, for the same reason globals.css gives for
          // <html>: `hidden` makes this a scroll container, and the decorative
          // glow below sticks out 60px to the right, so focusing the close
          // button on open scrolled the whole panel sideways by 60px. `clip`
          // trims the glow without ever creating a scrollport.
          overflow: "clip",
          animation: "yv-pop .22s cubic-bezier(.2,.8,.3,1)",
        }}
      >
        {/* Warm header band, so the logo reads as a bubble lifted off the card.
            The right padding clears the close button at every width. */}
        <div style={{ position: "relative", background: "var(--warm)", padding: "34px 70px 30px 32px" }}>
          <div
            aria-hidden
            style={{
              position: "absolute",
              right: -60,
              top: -80,
              width: 240,
              height: 240,
              borderRadius: "50%",
              background: "radial-gradient(circle, rgba(255,122,26,.28), transparent 66%)",
            }}
          />
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label={labels.close}
            className="cursor-pointer grid place-items-center"
            style={{
              position: "absolute",
              right: 18,
              top: 18,
              width: 40,
              height: 40,
              borderRadius: 999,
              border: "1px solid var(--hair)",
              background: "var(--card)",
              color: "var(--ink)",
              fontSize: 20,
              lineHeight: 1,
              zIndex: 1,
            }}
          >
            ×
          </button>
          <div className="relative flex items-center gap-4">
            <SafeImage
              src={field(record, "image_url")}
              alt={name}
              loading="eager"
              style={{
                width: 84,
                height: 84,
                borderRadius: 26,
                objectFit: "contain",
                background: "var(--card)",
                boxShadow: "var(--elev-sm)",
                flexShrink: 0,
              }}
              fallback={<Monogram text={name} size={84} />}
            />
            <div style={{ minWidth: 0 }}>
              <h2
                className="font-display"
                style={{
                  fontSize: "clamp(22px,4vw,34px)",
                  fontWeight: 700,
                  letterSpacing: "-0.03em",
                  margin: 0,
                  overflowWrap: "anywhere",
                }}
              >
                {name}
              </h2>
              {sector && (
                <span
                  style={{
                    display: "inline-block",
                    marginTop: 8,
                    padding: "5px 12px",
                    borderRadius: 999,
                    background: "var(--card)",
                    fontSize: 12,
                    letterSpacing: "0.12em",
                    textTransform: "uppercase",
                    fontWeight: 600,
                    color: "var(--n500)",
                  }}
                >
                  {sector}
                </span>
              )}
            </div>
          </div>
        </div>

        <div style={{ padding: "28px 32px 32px" }}>
          {amount && (
            <div style={{ paddingBottom: 22, borderBottom: "1px solid var(--hair)" }}>
              <span className="eyebrow block">{labels.investment}</span>
              <p
                className="font-display"
                style={{ margin: "4px 0 0", fontSize: 38, fontWeight: 700, letterSpacing: "-0.04em", color: "var(--orange)" }}
              >
                {amount}
              </p>
            </div>
          )}

          {(short || detail) && (
            <div style={{ marginTop: 22 }}>
              <span className="eyebrow block">{labels.aboutStartup}</span>
              {short && <p style={{ margin: "10px 0 0", fontSize: 16, lineHeight: 1.7, color: "var(--n700)" }}>{short}</p>}
              {detail && (
                <p style={{ margin: "12px 0 0", fontSize: 15, lineHeight: 1.75, color: "var(--n500)", whiteSpace: "pre-line" }}>
                  {detail}
                </p>
              )}
            </div>
          )}

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-primary"
              style={{ marginTop: 26, maxWidth: "100%" }}
            >
              <span style={{ minWidth: 0, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {labels.visitSite} · {linkKind(website)}
              </span>
              {/* .badge is sized in px but is a flex item here, so it would give
                  up width to a long host name without this. */}
              <span className="badge" style={{ flexShrink: 0 }}>↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
