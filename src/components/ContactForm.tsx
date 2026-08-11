"use client";

import { useState } from "react";

const inputCls = "w-full rounded-xl border px-4 h-12 text-sm";
const inputStyle = { background: "var(--surface)", borderColor: "var(--hair)", color: "var(--fg)" } as const;

export default function ContactForm({ locale }: { locale: string }) {
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setBusy(true);
    const form = e.currentTarget;
    const data = Object.fromEntries(new FormData(form).entries());
    try {
      await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, locale }),
      });
    } catch {
      // best-effort; still show success to the user
    } finally {
      setBusy(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="yv-card"><div className="yv-card-inner p-8 text-center">
        <p className="font-display font-bold text-xl">Xabaringiz yuborildi</p>
        <p className="mt-2 text-sm" style={{ color: "var(--n500)" }}>Rahmat! Jamoamiz Telegram yoki telefon orqali bogʻlanadi.</p>
      </div></div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="yv-card"><div className="yv-card-inner p-6 space-y-4">
      <div>
        <label className="text-sm font-medium block mb-1.5">Ism</label>
        <input name="name" required className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Telefon yoki Telegram</label>
        <input name="contact" required placeholder="+998 90 000 00 00 / @username" className={inputCls} style={inputStyle} />
      </div>
      <div>
        <label className="text-sm font-medium block mb-1.5">Xabar</label>
        <textarea name="message" rows={4} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={inputStyle} />
      </div>
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-60">
        {busy ? "Yuborilmoqda…" : "Yuborish"}
        <span className="badge">↗</span>
      </button>
    </div></form>
  );
}
