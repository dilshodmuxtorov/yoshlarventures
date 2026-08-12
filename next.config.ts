import type { NextConfig } from "next";

// Applied to every response. nginx terminates TLS and owns HSTS; these are the
// application-level headers, kept here so they travel with the code rather than
// depending on a server config that is edited by hand.
const securityHeaders = [
  // The page is never a legitimate frame target, and the apply CTA is exactly
  // what a clickjacking overlay would aim at.
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  // Send only the origin off-site, so full URLs don't leak to CMS-linked hosts.
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(), payment=()" },
  {
    // Backstops the JSON-LD and theme scripts: even if a CMS value were to break
    // out of one, script execution is confined to this origin, and nothing can
    // be exfiltrated to another host. 'unsafe-inline' is still required because
    // the theme boot script must run before paint, and Next injects inline
    // bootstrap; both are static and same-origin.
    key: "Content-Security-Policy",
    value: [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: https:",
      "font-src 'self' data:",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "object-src 'none'",
    ].join("; "),
  },
];

const nextConfig: NextConfig = {
  // Emits .next/standalone: a self-contained server with only the packages the
  // app actually imports, so the runtime image carries no node_modules tree and
  // no build toolchain.
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default nextConfig;
