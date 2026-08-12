import { NextResponse } from "next/server";

import { BodyTooLarge, clientIp, rateLimit, readJsonBody, sanitisePayload } from "@/lib/request-guard";

const FIELDS = ["name", "phone", "telegram", "email", "message", "locale"] as const;

// Contact form intake. Kept as a thin server endpoint so submission wiring
// (email / Telegram / a backend endpoint) can be added in one place without
// touching the client.
//
// NOTE: messages are not yet delivered anywhere. The payload is deliberately NOT
// logged — it carries names, phone numbers and Telegram handles, and container
// stdout is an unmanaged, unbounded store for personal data.
export async function POST(request: Request) {
  const ip = clientIp(request);
  if (!rateLimit(`contact:${ip}`, { limit: 5, windowMs: 60_000 })) {
    return NextResponse.json({ ok: false, error: "rate_limited" }, { status: 429 });
  }

  let raw: unknown;
  try {
    raw = await readJsonBody(request);
  } catch (err) {
    if (err instanceof BodyTooLarge) {
      return NextResponse.json({ ok: false, error: "payload_too_large" }, { status: 413 });
    }
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const body = sanitisePayload(raw, FIELDS, { maxLength: 4000 });
  if (!body.message && !body.name) {
    return NextResponse.json({ ok: false, error: "empty_message" }, { status: 400 });
  }

  // Field names only — enough to confirm a submission arrived and to spot abuse,
  // with none of the contents.
  console.info("[contact] submission received", { fields: Object.keys(body).length });
  return NextResponse.json({ ok: true });
}
