"use client";

import { useSyncExternalStore } from "react";

/** Read the theme the inline boot script wrote onto <html data-theme>.
 *
 * The attribute is set before hydration, so it cannot be read during the server
 * render; reading it in an effect and mirroring it into state would trigger a
 * second render pass on every mount. useSyncExternalStore reads the live value
 * instead, with "light" as the server snapshot to match the boot default. */
function subscribeToTheme(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

export function useTheme(): "light" | "dark" {
  return useSyncExternalStore(
    subscribeToTheme,
    () => (document.documentElement.getAttribute("data-theme") === "dark" ? "dark" : "light"),
    () => "light",
  );
}
