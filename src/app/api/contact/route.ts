import { NextResponse } from "next/server";

// Contact form intake. Kept as a thin server endpoint so submission wiring
// (email / Telegram / a backend endpoint) can be added in one place without
// touching the client. Today it accepts and acknowledges the message.
export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log("[contact]", JSON.stringify(body).slice(0, 500));
    // TODO: forward to backend / notify Telegram once the intake endpoint exists.
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
}
