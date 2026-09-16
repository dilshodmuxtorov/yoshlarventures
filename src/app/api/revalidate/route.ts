import { revalidateTag } from "next/cache";
import { NextResponse } from "next/server";

// The dashboard calls this whenever CMS content changes so the edit shows up
// immediately instead of waiting out the pages' revalidate window. Every CMS
// fetch is tagged "cms" (see src/lib/api.ts), so one purge refreshes them all.
export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expected = process.env.REVALIDATE_SECRET;
  if (!expected) {
    // Fail closed: without a configured secret, refuse rather than expose an
    // open cache-purge endpoint to the internet.
    return NextResponse.json({ error: "revalidation not configured" }, { status: 503 });
  }

  const provided =
    request.headers.get("x-revalidate-secret") ??
    new URL(request.url).searchParams.get("secret");
  if (provided !== expected) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  // expire: 0 hard-expires the tagged cache now, so the very next request fetches
  // fresh content (blocking) instead of the stale-while-revalidate that profile
  // "max" would give — the editor sees the change on their first refresh.
  revalidateTag("cms", { expire: 0 });
  return NextResponse.json({ revalidated: true, at: Date.now() });
}
