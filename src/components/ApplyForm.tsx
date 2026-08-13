"use client";

import { useState } from "react";

import { UI, type Locale } from "@/lib/i18n";

// Option lists. Region names are places and stay as written; only the generic
// entries and the label sets are translated.
const REGIONS: Record<Locale, string[]> = {
  uz: ["Toshkent shahri", "Toshkent viloyati", "Andijon", "Buxoro", "Fargʻona", "Jizzax", "Qashqadaryo", "Navoiy", "Namangan", "Samarqand", "Sirdaryo", "Surxondaryo", "Xorazm viloyati", "Qoraqalpogʻiston Respublikasi", "Boshqa hudud"],
  ru: ["город Ташкент", "Ташкентская область", "Андижан", "Бухара", "Фергана", "Джизак", "Кашкадарья", "Навои", "Наманган", "Самарканд", "Сырдарья", "Сурхандарья", "Хорезмская область", "Республика Каракалпакстан", "Другой регион"],
  en: ["Tashkent city", "Tashkent region", "Andijan", "Bukhara", "Fergana", "Jizzakh", "Kashkadarya", "Navoiy", "Namangan", "Samarkand", "Sirdaryo", "Surkhandarya", "Khorezm region", "Republic of Karakalpakstan", "Other region"],
};

const SOURCES: Record<Locale, string[]> = {
  uz: ["Yoshlar Ventures tadbirlari", "Ijtimoiy tarmoqlar", "Televizor / Radio", "Oila / Doʻstlar"],
  ru: ["Мероприятия Yoshlar Ventures", "Соцсети", "Телевидение / Радио", "Семья / Друзья"],
  en: ["Yoshlar Ventures events", "Social media", "TV / Radio", "Family / Friends"],
};

const FUNDING: Record<Locale, string[]> = {
  uz: ["Venchur kapital", "Angel investor", "Grantlar", "Shaxsiy mablagʻlar", "Boshqalar"],
  ru: ["Венчурный капитал", "Бизнес-ангел", "Гранты", "Личные средства", "Другое"],
  en: ["Venture capital", "Angel investor", "Grants", "Personal funds", "Other"],
};

const SOCIALS = ["Telegram", "Instagram", "LinkedIn", "Facebook", "X", "YouTube", "Veb-sayt"];

const inputStyle = { background: "var(--surface)", borderColor: "var(--hair)", color: "var(--fg)" } as const;
const ic = "w-full rounded-xl border px-4 h-12 text-sm";

// Fields answered by picking rather than typing, so the message reads "choose"
// instead of "fill in"; the two multi-selects ask for at least one.
const CHOICE_KEYS = new Set(["bosqich", "akseleratsiya", "tanlov", "savdoBormi", "investitsiyaJalbQilganmi", "jinsi", "hududi", "qayerdanEshitdingiz"]);
const MULTI_KEYS = new Set(["moliyalashtirishManbalari", "ijtimoiyTarmoqlar"]);

/** Every field the given step asks for. Follow-up questions only count while
 * they are on screen — answering "no" to "have you raised before?" must not
 * leave the reader stuck behind fields they cannot see. */
function requiredFor(step: number, get: (k: string) => string): string[] {
  switch (step) {
    case 1:
      return ["startupNomi", "startUpYonalishi", "startupTavsifi", "faylLink"];
    case 2:
      return [
        "bosqich", "investitsiyaMiqdori", "mablagniSarflash", "akseleratsiya",
        ...(get("akseleratsiya") === "Ha" ? ["dasturNomi", "dasturYili"] : []),
        "tanlov",
        ...(get("tanlov") === "Ha" ? ["tanlovNomi", "tanlovYili"] : []),
      ];
    case 3:
      return [
        "arizachiToliqIsmi", "yoshi", "roli", "jinsi", "hududi", "hamtasischilarSoni", "team", "savdoBormi",
        ...(get("savdoBormi") === "Ha" ? ["oylikDaromad"] : []),
        "investitsiyaJalbQilganmi",
        ...(get("investitsiyaJalbQilganmi") === "Ha" ? ["moliyalashtirishManbalari", "umumiyMiqdor"] : []),
      ];
    default:
      return ["telRaqami", "email", "ijtimoiyTarmoqlar", "qayerdanEshitdingiz"];
  }
}

function Field({ label, error, name, children }: { label: string; error?: string; name?: string; children: React.ReactNode }) {
  return (
    <label className="block" data-field={name}>
      <span className="text-sm font-medium block mb-1.5">{label}</span>
      {children}
      {error && <span className="text-xs mt-1.5 block" style={{ color: "var(--danger)" }}>{error}</span>}
    </label>
  );
}

// Yes/no is stored as a stable token rather than the visible word, so the answer
// means the same thing to the backend in every language. Declared at module level
// — a component created during render is a different type on each pass, so React
// would remount it and the field would lose focus.
function YesNo({ value, onChange, yes, no }: { value: string; onChange: (v: string) => void; yes: string; no: string }) {
  return (
    <div className="flex gap-2">
      {[["Ha", yes], ["Yoʻq", no]].map(([token, label]) => (
        <button
          key={token}
          type="button"
          onClick={() => onChange(token)}
          className="px-4 h-11 rounded-xl border text-sm font-medium flex-1"
          style={value === token ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}
        >
          {label}
        </button>
      ))}
    </div>
  );
}

type State = Record<string, string | string[]>;

export default function ApplyForm({ locale }: { locale: Locale }) {
  const t = UI[locale].apply;
  const [step, setStep] = useState(1);
  const [f, setF] = useState<State>({ valyuta: "UZS" });
  const [invalid, setInvalid] = useState<string[]>([]);
  const [sent, setSent] = useState(false);
  const [busy, setBusy] = useState(false);

  const g = (k: string) => (typeof f[k] === "string" ? (f[k] as string) : "");
  const arr = (k: string) => (Array.isArray(f[k]) ? (f[k] as string[]) : []);
  // Answering a flagged field clears its own error immediately, so the form
  // stops shouting as it is filled in rather than only on the next attempt.
  const set = (k: string, v: string | string[]) => {
    setF((p) => ({ ...p, [k]: v }));
    setInvalid((cur) => (cur.includes(k) ? cur.filter((x) => x !== k) : cur));
  };
  const toggle = (k: string, v: string) => {
    const cur = arr(k);
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };

  const filled = (k: string) => {
    const v = f[k];
    if (Array.isArray(v)) return v.length > 0;
    // trim, not truthiness: "0" co-founders is an answer, "  " is not.
    return typeof v === "string" && v.trim() !== "";
  };

  const err = (k: string) => {
    if (!invalid.includes(k)) return undefined;
    if (MULTI_KEYS.has(k)) return t.requiredAny;
    return CHOICE_KEYS.has(k) ? t.requiredChoice : t.required;
  };
  // Inputs turn red only once they have been flagged, never while still untouched.
  const st = (k: string) => (invalid.includes(k) ? { ...inputStyle, borderColor: "var(--danger)" } : inputStyle);
  // Button groups have no border of their own to recolour.
  const ring = (k: string) => (invalid.includes(k) ? { outline: "1px solid var(--danger)", outlineOffset: 6, borderRadius: 12 } : undefined);

  /** Returns true when the step is complete; otherwise flags what is missing and
   * takes the reader to the first of them. */
  const check = () => {
    const missing = requiredFor(step, g).filter((k) => !filled(k));
    setInvalid(missing);
    if (missing.length === 0) return true;
    const el = document.querySelector<HTMLElement>(`[data-field="${missing[0]}"]`);
    el?.scrollIntoView({ block: "center" });
    el?.querySelector<HTMLElement>("input, textarea, select, button")?.focus({ preventScroll: true });
    return false;
  };

  const submit = async () => {
    if (!check()) return;
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
        <p className="font-display font-bold text-2xl">{t.sentTitle}</p>
        <p className="mt-3" style={{ color: "var(--n500)" }}>{t.sentBody}</p>
      </div></div>
    );
  }

  const progress = Math.round((step / 4) * 100);
  const regions = REGIONS[locale];
  const sources = SOURCES[locale];
  const funding = FUNDING[locale];

  return (
    <div className="yv-card"><div className="yv-card-inner p-6 md:p-8">
      <div className="flex items-center justify-between mb-2 text-sm">
        <span className="font-semibold">{t.step} {step} {t.of} 4</span>
        <span style={{ color: "var(--n500)" }}>{progress}%</span>
      </div>
      <div className="h-2 rounded-full mb-4" style={{ background: "var(--shell)" }}>
        <div className="h-2 rounded-full transition-all" style={{ width: `${progress}%`, background: "var(--orange)" }} />
      </div>
      {/* Said once here rather than with an asterisk on all thirty labels. */}
      <p className="text-xs mb-6" style={{ color: "var(--n500)" }}>{t.allRequired}</p>

      {step === 1 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">{t.s1}</h2>
          <Field label={t.startupName} name="startupNomi" error={err("startupNomi")}><input className={ic} style={st("startupNomi")} value={g("startupNomi")} onChange={(e) => set("startupNomi", e.target.value)} placeholder={t.startupNamePh} /></Field>
          <Field label={t.sector} name="startUpYonalishi" error={err("startUpYonalishi")}><input className={ic} style={st("startUpYonalishi")} value={g("startUpYonalishi")} onChange={(e) => set("startUpYonalishi", e.target.value)} placeholder={t.sectorPh} /></Field>
          <Field label={t.description} name="startupTavsifi" error={err("startupTavsifi")}><textarea rows={4} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={st("startupTavsifi")} value={g("startupTavsifi")} onChange={(e) => set("startupTavsifi", e.target.value)} placeholder={t.descriptionPh} /></Field>
          <Field label={t.deckLink} name="faylLink" error={err("faylLink")}><input type="url" className={ic} style={st("faylLink")} value={g("faylLink")} onChange={(e) => set("faylLink", e.target.value)} placeholder="https://…" /></Field>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">{t.s2}</h2>
          <Field label={t.stage} name="bosqich" error={err("bosqich")}>
            <div className="flex flex-wrap gap-2" style={ring("bosqich")}>
              {[["Gʻoya", t.stageIdea], ["MVP ishlab chiqilmoqda", t.stageMvp], ["Post MVP", t.stagePost]].map(([token, label]) => (
                <button key={token} type="button" onClick={() => set("bosqich", token)} className="px-4 h-11 rounded-xl border text-sm" style={g("bosqich") === token ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>{label}</button>
              ))}
            </div>
          </Field>
          <div className="grid grid-cols-1 sm:grid-cols-[1fr_auto] gap-3 sm:items-start">
            <Field label={t.amount} name="investitsiyaMiqdori" error={err("investitsiyaMiqdori")}><input inputMode="numeric" className={ic} style={st("investitsiyaMiqdori")} value={g("investitsiyaMiqdori")} onChange={(e) => set("investitsiyaMiqdori", e.target.value)} placeholder={t.amountPh} /></Field>
            <Field label={t.currency}>
              <div className="flex gap-2">
                {[["UZS", t.uzs], ["USD", t.usd]].map(([token, label]) => (
                  <button key={token} type="button" onClick={() => set("valyuta", token)} className="px-4 h-12 rounded-xl border text-sm font-medium"
                    style={(g("valyuta") || "UZS") === token ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>
                    {label}
                  </button>
                ))}
              </div>
            </Field>
          </div>
          <Field label={t.spendPlan} name="mablagniSarflash" error={err("mablagniSarflash")}><textarea rows={3} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={st("mablagniSarflash")} value={g("mablagniSarflash")} onChange={(e) => set("mablagniSarflash", e.target.value)} /></Field>
          <Field label={t.hasAccel} name="akseleratsiya" error={err("akseleratsiya")}>
            <div style={ring("akseleratsiya")}><YesNo value={g("akseleratsiya")} onChange={(v) => set("akseleratsiya", v)} yes={t.yes} no={t.no} /></div>
          </Field>
          {g("akseleratsiya") === "Ha" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t.programName} name="dasturNomi" error={err("dasturNomi")}><input className={ic} style={st("dasturNomi")} value={g("dasturNomi")} onChange={(e) => set("dasturNomi", e.target.value)} /></Field>
              <Field label={t.programYear} name="dasturYili" error={err("dasturYili")}><input className={ic} style={st("dasturYili")} value={g("dasturYili")} onChange={(e) => set("dasturYili", e.target.value)} /></Field>
            </div>
          )}
          <Field label={t.hasCompetition} name="tanlov" error={err("tanlov")}>
            <div style={ring("tanlov")}><YesNo value={g("tanlov")} onChange={(v) => set("tanlov", v)} yes={t.yes} no={t.no} /></div>
          </Field>
          {g("tanlov") === "Ha" && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Field label={t.competitionName} name="tanlovNomi" error={err("tanlovNomi")}><input className={ic} style={st("tanlovNomi")} value={g("tanlovNomi")} onChange={(e) => set("tanlovNomi", e.target.value)} /></Field>
              <Field label={t.competitionYear} name="tanlovYili" error={err("tanlovYili")}><input className={ic} style={st("tanlovYili")} value={g("tanlovYili")} onChange={(e) => set("tanlovYili", e.target.value)} /></Field>
            </div>
          )}
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">{t.s3}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t.fullName} name="arizachiToliqIsmi" error={err("arizachiToliqIsmi")}><input className={ic} style={st("arizachiToliqIsmi")} value={g("arizachiToliqIsmi")} onChange={(e) => set("arizachiToliqIsmi", e.target.value)} /></Field>
            <Field label={t.age} name="yoshi" error={err("yoshi")}><input type="number" className={ic} style={st("yoshi")} value={g("yoshi")} onChange={(e) => set("yoshi", e.target.value)} /></Field>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t.role} name="roli" error={err("roli")}><input className={ic} style={st("roli")} value={g("roli")} onChange={(e) => set("roli", e.target.value)} placeholder={t.rolePh} /></Field>
            <Field label={t.gender} name="jinsi" error={err("jinsi")}>
              <select className={ic} style={st("jinsi")} value={g("jinsi")} onChange={(e) => set("jinsi", e.target.value)}>
                <option value="">{t.choose}</option>
                <option value="Erkak">{t.male}</option>
                <option value="Ayol">{t.female}</option>
              </select>
            </Field>
          </div>
          <Field label={t.region} name="hududi" error={err("hududi")}>
            <select className={ic} style={st("hududi")} value={g("hududi")} onChange={(e) => set("hududi", e.target.value)}>
              <option value="">{t.choose}</option>
              {regions.map((r, i) => <option key={r} value={REGIONS.uz[i]}>{r}</option>)}
            </select>
          </Field>
          <Field label={t.cofounders} name="hamtasischilarSoni" error={err("hamtasischilarSoni")}><input type="number" min={0} max={8} className={ic} style={st("hamtasischilarSoni")} value={g("hamtasischilarSoni")} onChange={(e) => set("hamtasischilarSoni", e.target.value)} /></Field>
          <Field label={t.team} name="team" error={err("team")}><textarea rows={3} className="w-full rounded-xl border px-4 py-3 text-sm resize-y" style={st("team")} value={g("team")} onChange={(e) => set("team", e.target.value)} /></Field>
          <Field label={t.hasRevenue} name="savdoBormi" error={err("savdoBormi")}>
            <div style={ring("savdoBormi")}><YesNo value={g("savdoBormi")} onChange={(v) => set("savdoBormi", v)} yes={t.yes} no={t.no} /></div>
          </Field>
          {g("savdoBormi") === "Ha" && (
            <Field label={t.monthlyRevenue} name="oylikDaromad" error={err("oylikDaromad")}><input className={ic} style={st("oylikDaromad")} value={g("oylikDaromad")} onChange={(e) => set("oylikDaromad", e.target.value)} /></Field>
          )}
          <Field label={t.raisedBefore} name="investitsiyaJalbQilganmi" error={err("investitsiyaJalbQilganmi")}>
            <div style={ring("investitsiyaJalbQilganmi")}><YesNo value={g("investitsiyaJalbQilganmi")} onChange={(v) => set("investitsiyaJalbQilganmi", v)} yes={t.yes} no={t.no} /></div>
          </Field>
          {g("investitsiyaJalbQilganmi") === "Ha" && (
            <>
              <Field label={t.fundingSources} name="moliyalashtirishManbalari" error={err("moliyalashtirishManbalari")}>
                <div className="flex flex-wrap gap-2" style={ring("moliyalashtirishManbalari")}>
                  {funding.map((label, i) => {
                    const token = FUNDING.uz[i];
                    return (
                      <button key={token} type="button" onClick={() => toggle("moliyalashtirishManbalari", token)} className="px-3 h-10 rounded-xl border text-sm" style={arr("moliyalashtirishManbalari").includes(token) ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>{label}</button>
                    );
                  })}
                </div>
              </Field>
              <Field label={t.totalRaised} name="umumiyMiqdor" error={err("umumiyMiqdor")}><input className={ic} style={st("umumiyMiqdor")} value={g("umumiyMiqdor")} onChange={(e) => set("umumiyMiqdor", e.target.value)} /></Field>
            </>
          )}
        </div>
      )}

      {step === 4 && (
        <div className="space-y-4">
          <h2 className="font-display font-semibold text-lg">{t.s4}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Field label={t.phone} name="telRaqami" error={err("telRaqami")}><input type="tel" className={ic} style={st("telRaqami")} value={g("telRaqami")} onChange={(e) => set("telRaqami", e.target.value)} /></Field>
            <Field label={t.email} name="email" error={err("email")}><input type="email" className={ic} style={st("email")} value={g("email")} onChange={(e) => set("email", e.target.value)} /></Field>
          </div>
          <Field label={t.socials} name="ijtimoiyTarmoqlar" error={err("ijtimoiyTarmoqlar")}>
            <div className="flex flex-wrap gap-2" style={ring("ijtimoiyTarmoqlar")}>
              {SOCIALS.map((o) => (
                <button key={o} type="button" onClick={() => toggle("ijtimoiyTarmoqlar", o)} className="px-3 h-10 rounded-xl border text-sm" style={arr("ijtimoiyTarmoqlar").includes(o) ? { background: "var(--ink)", color: "var(--surface)", borderColor: "var(--ink)" } : inputStyle}>{o}</button>
              ))}
            </div>
          </Field>
          <Field label={t.heardFrom} name="qayerdanEshitdingiz" error={err("qayerdanEshitdingiz")}>
            <select className={ic} style={st("qayerdanEshitdingiz")} value={g("qayerdanEshitdingiz")} onChange={(e) => set("qayerdanEshitdingiz", e.target.value)}>
              <option value="">{t.choose}</option>
              {sources.map((r, i) => <option key={r} value={SOURCES.uz[i]}>{r}</option>)}
            </select>
          </Field>
          <p className="text-xs rounded-xl p-3" style={{ background: "var(--warm)", color: "var(--warm-ink)" }}>{t.disclaimer}</p>
        </div>
      )}

      {/* The button stays live and explains itself when pressed. A disabled one
          would give a reader with an empty field nothing to act on. */}
      {invalid.length > 0 && (
        <p role="alert" className="text-sm mt-6" style={{ color: "var(--danger)" }}>{t.fixErrors}</p>
      )}

      <div className="flex items-center gap-3 mt-6 pt-5 border-t" style={{ borderColor: "var(--hair)" }}>
        {step > 1 && <button type="button" onClick={() => { setInvalid([]); setStep((s) => s - 1); }} className="btn-outline !min-h-11">{t.back}</button>}
        {step < 4 && <button type="button" onClick={() => { if (check()) setStep((s) => s + 1); }} className="btn-primary !min-h-11 ml-auto">{t.next}</button>}
        {step === 4 && <button type="button" onClick={submit} disabled={busy} className="btn-primary !min-h-11 ml-auto disabled:opacity-60">{busy ? t.sending : t.submit}<span className="badge">↗</span></button>}
      </div>
    </div></div>
  );
}
