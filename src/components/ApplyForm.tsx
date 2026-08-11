"use client";

import { useState } from "react";

const REGIONS = ["Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Fargʻona", "Jizzax", "Qashqadaryo", "Navoiy", "Namangan", "Samarqand", "Sirdaryo", "Surxondaryo", "Xorazm viloyati", "Qoraqalpogʻiston Respublikasi", "Boshqa hudud"];
const SOURCES = ["Yoshlar Ventures tadbirlari", "Ijtimoiy tarmoqlar", "Televizor / Radio", "Oila / Doʻstlar"];
const SOCIALS = ["Telegram", "Instagram", "LinkedIn", "Facebook", "X", "YouTube", "Veb-sayt"];
const FUNDING = ["Venchur kapital", "Angel investor", "Grantlar", "Shaxsiy mablagʻlar", "Boshqalar"];

const inputStyle = { background: "var(--surface)", borderColor: "var(--hair)", color: "var(--fg)" } as const;
const ic = "w-full rounded-xl border px-4 h-12 text-sm";

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function YesNo({ name, value, onChange }: { name: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="flex gap-2">
      {["Ha", "Yoʻq"].map((o) => (
        <button key={o} type="button" onClick={() => onChange(o)} className="px-4 h-11 rounded-xl border text-sm font-medium flex-1"
          style={value === o ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>
          {o}
        </button>
      ))}
    </div>
  );
}

type State = Record<string, string | string[]>;

export default function ApplyForm({ locale }: { locale: string }) {
  const [step, setStep] = useState(1);
  const [f, setF] = useState<State>({ valyuta: "UZS" });
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const set = (k: string, v: string | string[]) => setF((p) => ({ ...p, [k]: v }));
  const g = (k: string) => (typeof f[k] === "string" ? (f[k] as string) : "");
  const arr = (k: string) => (Array.isArray(f[k]) ? (f[k] as string[]) : []);
  const toggle = (k: string, v: string) => {
    const cur = arr(k);
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };

  const submit = async () => {
    setBusy(true);
    try {
      await fetch("/api/apply", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ ...f, locale }) });
    } catch {
      /* best-effort */
    } finally {
      setBusy(false);
      setSent(true);
    }
  };

  if (sent) {
    return (
      <div className="yv-card"><div className="yv-card-inner p-8 text-center">
        <p className="font-display font-bold text-2xl">Arizangiz qabul qilindi</p>
        <p className="mt-3" style={{ color: "var(--n500)" }}>Rahmat! Arizangizni koʻrib chiqamiz va Telegram yoki telefon orqali bogʻlanamiz.</p>
      </div></div>
    );
  }

  const progress = Math.round((step / 4) * 100);

  return (
    <div className="yv-card"><div className="yv-card-inner p-6 md:p-8">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="font-semibold">Bosqich {step} / 4</span>
        <span style={{ color: "var(--n500)" }}>{progress}%</span>
      </div>
      <div className="h-2 rounded-full mb-6" style={{ background: "var(--shell)" }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--orange)" }} />
      </div>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Startap haqida</h2>
          <Field label="Startup nomi"><input className={ic} style={inputStyle} value={g("startupNomi")} onChange={(e) => set("startupNomi", e.target.value)} placeholder="Masalan, Educoin" /></Field>
          <Field label="Startup yoʻnalishi"><input className={ic} style={inputStyle} value={g("startUpYonalishi")} onChange={(e) => set("startUpYonalishi", e.target.value)} placeholder="Masalan, EdTech" /></Field>
          <Field label="Startup tavsifi"><textarea rows={4} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={inputStyle} value={g("startupTavsifi")} onChange={(e) => set("startupTavsifi", e.target.value)} placeholder="Maksimum 500 ta belgi" /></Field>
          <Field label="Taqdimot / biznes reja fayliga havola"><input type="url" className={ic} style={inputStyle} value={g("faylLink")} onChange={(e) => set("faylLink", e.target.value)} placeholder="https://…" /></Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Bosqich va investitsiya</h2>
          <Field label="Startupingiz hozir qaysi bosqichda?">
            <div className="flex flex-wrap gap-2">
              {["Gʻoya", "MVP ishlab chiqilmoqda", "Post MVP"].map((o) => (
                <button key={o} type="button" onClick={() => set("bosqich", o)} className="px-4 h-11 rounded-xl border text-sm" style={g("bosqich") === o ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>{o}</button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-[1fr_auto] gap-3 items-end">
            <Field label="Qancha investitsiya soʻrayapsiz?"><input inputMode="numeric" className={ic} style={inputStyle} value={g("investitsiyaMiqdori")} onChange={(e) => set("investitsiyaMiqdori", e.target.value)} placeholder="Masalan, 500 000 000" /></Field>
            <Field label="Valyuta">
              <div className="flex gap-2">
                {["UZS", "USD"].map((o) => (
                  <button key={o} type="button" onClick={() => set("valyuta", o)} className="px-4 h-12 rounded-xl border text-sm font-medium"
                    style={(g("valyuta") || "UZS") === o ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>
                    {o === "UZS" ? "soʻm" : "$"}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <p className="text-xs" style={{ color: "var(--n500)", marginTop: -8 }}>Valyuta barcha summa maydonlariga tegishli (investitsiya, oylik daromad, oldingi investitsiya). UZS tanlansa, USD kursida saqlanadi.</p>
          <Field label="Mablagʻni sarflash rejasi"><textarea rows={3} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={inputStyle} value={g("mablagniSarflash")} onChange={(e) => set("mablagniSarflash", e.target.value)} /></Field>
          <Field label="Akseleratsiya/inkubatsiya guvohnomasi bormi?"><YesNo name="aks" value={g("akseleratsiya")} onChange={(v) => set("akseleratsiya", v)} /></Field>
          {g("akseleratsiya") === "Ha" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Dastur nomi"><input className={ic} style={inputStyle} value={g("dasturNomi")} onChange={(e) => set("dasturNomi", e.target.value)} /></Field>
              <Field label="Dastur yili"><input className={ic} style={inputStyle} value={g("dasturYili")} onChange={(e) => set("dasturYili", e.target.value)} /></Field>
            </div>
          )}
          <Field label="Startap tanlovlarida qatnashganmisiz?"><YesNo name="tan" value={g("tanlov")} onChange={(v) => set("tanlov", v)} /></Field>
          {g("tanlov") === "Ha" && (
            <div className="grid grid-cols-2 gap-3">
              <Field label="Tanlov nomi"><input className={ic} style={inputStyle} value={g("tanlovNomi")} onChange={(e) => set("tanlovNomi", e.target.value)} /></Field>
              <Field label="Tanlov yili"><input className={ic} style={inputStyle} value={g("tanlovYili")} onChange={(e) => set("tanlovYili", e.target.value)} /></Field>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Jamoa haqida</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Toʻliq ism"><input className={ic} style={inputStyle} value={g("arizachiToliqIsmi")} onChange={(e) => set("arizachiToliqIsmi", e.target.value)} /></Field>
            <Field label="Yoshi"><input type="number" className={ic} style={inputStyle} value={g("yoshi")} onChange={(e) => set("yoshi", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Roli"><input className={ic} style={inputStyle} value={g("roli")} onChange={(e) => set("roli", e.target.value)} placeholder="CEO" /></Field>
            <Field label="Jinsi">
              <select className={ic} style={inputStyle} value={g("jinsi")} onChange={(e) => set("jinsi", e.target.value)}>
                <option value="">—</option><option>Erkak</option><option>Ayol</option>
              </select>
            </Field>
          </div>
          <Field label="Hudud">
            <select className={ic} style={inputStyle} value={g("hududi")} onChange={(e) => set("hududi", e.target.value)}>
              <option value="">—</option>{REGIONS.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <Field label="Hamtasischilar soni"><input type="number" min={0} max={8} className={ic} style={inputStyle} value={g("hamtasischilarSoni")} onChange={(e) => set("hamtasischilarSoni", e.target.value)} /></Field>
          <Field label="Jamoa haqida (ismi, yoshi, vazifasi)"><textarea rows={3} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={inputStyle} value={g("team")} onChange={(e) => set("team", e.target.value)} /></Field>
          <Field label="Hozirda savdo bormi?"><YesNo name="sav" value={g("savdoBormi")} onChange={(v) => set("savdoBormi", v)} /></Field>
          {g("savdoBormi") === "Ha" && (
            <Field label="Oʻrtacha oylik daromad"><input className={ic} style={inputStyle} value={g("oylikDaromad")} onChange={(e) => set("oylikDaromad", e.target.value)} /></Field>
          )}
          <Field label="Oldin investitsiya jalb qilganmisiz?"><YesNo name="inv" value={g("investitsiyaJalbQilganmi")} onChange={(v) => set("investitsiyaJalbQilganmi", v)} /></Field>
          {g("investitsiyaJalbQilganmi") === "Ha" && (
            <>
              <Field label="Moliyalashtirish manbalari">
                <div className="flex flex-wrap gap-2">
                  {FUNDING.map((o) => (
                    <button key={o} type="button" onClick={() => toggle("moliyalashtirishManbalari", o)} className="px-3 h-10 rounded-xl border text-sm" style={arr("moliyalashtirishManbalari").includes(o) ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>{o}</button>
                  ))}
                </div>
              </Field>
              <Field label="Umumiy miqdor"><input className={ic} style={inputStyle} value={g("umumiyMiqdor")} onChange={(e) => set("umumiyMiqdor", e.target.value)} /></Field>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">Aloqa maʼlumotlari</h2>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Telefon raqami"><input type="tel" className={ic} style={inputStyle} value={g("telRaqami")} onChange={(e) => set("telRaqami", e.target.value)} /></Field>
            <Field label="Email"><input type="email" className={ic} style={inputStyle} value={g("email")} onChange={(e) => set("email", e.target.value)} /></Field>
          </div>
          <Field label="Qaysi ijtimoiy tarmoqlarda faolsiz?">
            <div className="flex flex-wrap gap-2">
              {SOCIALS.map((o) => (
                <button key={o} type="button" onClick={() => toggle("ijtimoiyTarmoqlar", o)} className="px-3 h-10 rounded-xl border text-sm" style={arr("ijtimoiyTarmoqlar").includes(o) ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>{o}</button>
              ))}
            </div>
          </Field>
          <Field label="Biz haqimizda qayerdan eshitdingiz?">
            <select className={ic} style={inputStyle} value={g("qayerdanEshitdingiz")} onChange={(e) => set("qayerdanEshitdingiz", e.target.value)}>
              <option value="">—</option>{SOURCES.map((r) => <option key={r}>{r}</option>)}
            </select>
          </Field>
          <p className="text-xs rounded-xl p-3" style={{ background: "var(--warm)", color: "var(--warm-ink)" }}>
            Eslatma. Ushbu arizani yuborish investitsiyani kafolatlamaydi. Yoshlar Ventures barcha maʼlumotlarni maxfiy saqlaydi.
          </p>
        </div>
      )}

      <div className="flex items-center gap-3 mt-8 pt-5 border-t" style={{ borderColor: "var(--hair)" }}>
        {step > 1 && <button type="button" onClick={() => setStep((s) => s - 1)} className="btn-outline !min-h-11">Orqaga</button>}
        {step < 4 && <button type="button" onClick={() => setStep((s) => s + 1)} className="btn-primary !min-h-11 ml-auto">Davom etish →</button>}
        {step === 4 && <button type="button" onClick={submit} disabled={busy} className="btn-primary !min-h-11 ml-auto disabled:opacity-60">{busy ? "Yuborilmoqda…" : "Ariza yuborish"}<span className="badge">↗</span></button>}
      </div>
    </div></div>
  );
}
