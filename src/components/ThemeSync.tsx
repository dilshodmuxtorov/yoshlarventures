"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * Keeps <html data-theme> in step with the stored preference across navigation.
 *
 * The boot script in the document head applies the theme before first paint, but
 * a client-side route change — switching locale, most visibly — re-renders the
 * <html> element from the server payload, which carries no data-theme, so React
 * drops the attribute and the page snaps back to light. Re-applying it after each
 * navigation restores it without a reload.
 */
export default function ThemeSync() {
  const pathname = usePathname();

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem("yv-theme");
    } catch {
      // Private mode / storage disabled — fall back to the default.
    }
    const theme = stored === "dark" ? "dark" : "light";
    if (document.documentElement.getAttribute("data-theme") !== theme) {
      document.documentElement.setAttribute("data-theme", theme);
    }
  }, [pathname]);

  return null;
}
