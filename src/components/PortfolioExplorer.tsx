"use client";

import { useCallback, useEffect, useRef, useState, type RefObject } from "react";

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
  const closeRef = useRef<HTMLButtonElement>(null);
  // Focus goes back to the card that opened the overlay, so keyboard users are
  // not dropped at the top of the document on close.
  const originRef = useRef<HTMLButtonElement | null>(null);

  const close = useCallback(() => {
    setOpenId(null);
    originRef.current?.focus();
  }, []);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
    };
    document.addEventListener("keydown", onKey);
    // Lock the page behind the overlay, restoring whatever the document already
    // had rather than assuming it was scrollable.
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close]);

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
                <h2 className="font-display font-semibold text-lg mt-4">{name}</h2>
                <p className="text-sm mt-2 line-clamp-3" style={{ color: "var(--n500)" }}>{field(c, "short_description")}</p>
                <div
                  className="mt-4 pt-4 border-t grid grid-cols-2 gap-2 text-sm"
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

      {open && (
        <PortfolioDetail record={open} labels={labels} onClose={close} closeRef={closeRef} />
      )}
    </>
  );
}

function PortfolioDetail({
  record,
  labels,
  onClose,
  closeRef,
}: {
  record: ContentRecord;
  labels: Labels;
  onClose: () => void;
  closeRef: RefObject<HTMLButtonElement | null>;
}) {
  const name = field(record, "name");
  const website = field(record, "website_url");
  const detail = field(record, "detail_text");
  const short = field(record, "short_description");
  const sector = field(record, "sector");
  const amount = field(record, "investment_thousand_usd");

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onMouseDown={(e) => {
        // mousedown, not click: a click that STARTS inside the panel and ends on
        // the backdrop (text selection dragged outward) should not close it.
        if (e.target === e.currentTarget) onClose();
      }}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 80,
        display: "grid",
        placeItems: "center",
        padding: "clamp(12px,4vw,40px)",
        background: "rgba(20,20,20,.52)",
        backdropFilter: "blur(6px)",
        WebkitBackdropFilter: "blur(6px)",
        animation: "yv-fade .18s ease-out",
        overflowY: "auto",
      }}
    >
      <div
        style={{
          position: "relative",
          width: "min(680px, 100%)",
          borderRadius: 32,
          background: "var(--card)",
          boxShadow: "var(--elev)",
          overflow: "hidden",
          animation: "yv-pop .22s cubic-bezier(.2,.8,.3,1)",
        }}
      >
        {/* Warm header band, so the logo reads as a bubble lifted off the card. */}
        <div style={{ position: "relative", background: "var(--warm)", padding: "34px 32px 30px" }}>
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
            className="cursor-pointer"
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
              fontSize: 18,
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
                style={{ fontSize: "clamp(24px,4vw,34px)", fontWeight: 700, letterSpacing: "-0.03em", margin: 0 }}
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
              style={{ marginTop: 26 }}
            >
              {labels.visitSite} · {linkKind(website)}
              <span className="badge">↗</span>
            </a>
          )}
        </div>
      </div>
    </div>
  );
}
