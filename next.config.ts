import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Emits .next/standalone: a self-contained server with only the packages the
  // app actually imports, so the runtime image carries no node_modules tree and
  // no build toolchain.
  output: "standalone",
  poweredByHeader: false,
};

export default nextConfig;
