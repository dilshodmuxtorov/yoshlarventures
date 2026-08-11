import { NextResponse } from "next/server";

// Startup application intake. Forwards the public form to the dashboard's public
// endpoint, which appends the submission to the applications Google Sheet the
// dashboard already syncs from. Best-effort: the visitor always gets a clean
// acknowledgement even if the sheet is briefly unavailable (the backend logs it).
const API_BASE = (process.env.API_BASE || "http://localhost:8000").replace(/\/$/, "");

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }
  try {
    const res = await fetch(`${API_BASE}/api/v1/public/apply/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
    });
    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ ok: res.ok, ...data }, { status: res.ok ? 200 : res.status });
  } catch (err) {
    console.error("[apply] forward failed", err);
    return NextResponse.json({ ok: false, error: "forward_failed" }, { status: 502 });
  }
}
