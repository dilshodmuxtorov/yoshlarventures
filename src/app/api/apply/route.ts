import { NextResponse } from "next/server";

import { BodyTooLarge, clientIp, rateLimit, readJsonBody, sanitisePayload } from "@/lib/request-guard";

// Startup application intake. Forwards the public form to the dashboard's public
// endpoint, which appends the submission to the applications Google Sheet.
const API_BASE = (process.env.API_BASE || "http://localhost:8000").replace(/\/$/, "");

// Exactly the fields ApplyForm collects. Anything else is dropped rather than
// relayed: this route is the only path from the internet into a backend that is
// otherwise unreachable, so the body it forwards must be a known shape.
const FIELDS = [
  "startupNomi",
  "startUpYonalishi",
  "startupTavsifi",
  "faylLink",
  "bosqich",
  "investitsiyaMiqdori",
  "valyuta",
  "mablagniSarflash",
  "akseleratsiya",
  "dasturNomi",
  "dasturYili",
  "tanlov",
  "tanlovNomi",
  "tanlovYili",
  "arizachiToliqIsmi",
  "yoshi",
  "roli",
  "jinsi",
  "hududi",
  "hamtasischilarSoni",
  "team",
  "savdoBormi",
  "oylikDaromad",
  "investitsiyaJalbQilganmi",
  "moliyalashtirishManbalari",
  "umumiyMiqdor",
  "telRaqami",
  "email",
  "ijtimoiyTarmoqlar",
  "qayerdanEshitdingiz",
  "locale",
] as const;

export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`apply:${ip}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await readJsonBody(request);
  } catch (err) {
    if (err instanceof BodyTooLarge) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 });
  }

  // The description is the one field where a few paragraphs are reasonable.
  const body = {
    ...sanitisePayload(raw, FIELDS),
    ...sanitisePayload(raw, ["startupTavsifi", "mablagniSarflash", "team"], { maxLength: 5000 }),
  };
  if (!body.arizachiToliqIsmi && !body.email && !body.startupNomi) {
    return NextResponse.json({ ok: false, error: "empty_application" }, { status: 400 });
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/public/apply/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // The backend rate-limits per caller address; without this it only ever
        // sees this container and one attacker would exhaust everyone's quota.
        "X-Forwarded-For": ip,
      },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    // A fixed shape: never reflect backend response fields to the browser.
    return NextResponse.json({ ok: res.ok }, { status: res.ok ? 200 : 502 });
  } catch (err) {
    console.error("[apply] forward failed", err);
    return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 502 });
  }
}
