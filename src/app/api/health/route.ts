import { NextResponse } from "next/server";

// Liveness probe for the container healthcheck, nginx and uptime monitoring.
// Deliberately static: it answers as long as the Node process can serve a
// request, so a failing CMS never makes the site look down. Never cached —
// a cached 200 would keep reporting healthy after the process stopped serving.
export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(
    {
      status: "ok",
      // Set at build time by CI so a deployed container can be traced back to a
      // commit without shelling into it. Unset in local development.
      commit: process.env.BUILD_COMMIT || "dev",
      builtAt: process.env.BUILD_TIME || null,
    },
    { headers: { "Cache-Control": "no-store" } },
  );
}
