// Per-partner logo scaling. Most logos sit right at the shared logo height, but a
// couple of uploaded PNGs carry so much transparent padding (or an off aspect)
// that they render visually smaller than the rest. We nudge only those up by name
// so the row stays balanced — every other logo keeps its exact current size.
//
//  - "Plug and Play" is a 500x500 square with heavy transparent margins, so the
//    mark inside reads tiny at the shared height; ~1.6x brings it in line.
//  - "Aloqa Ventures" reads a touch small; ~1.2x balances it.
//
// Applied as a bigger height (and a matching max-width cap so a wide logo is not
// re-clipped) — no transform: scale(), so nothing overlaps its neighbours.
export function partnerLogoScale(name: string | null | undefined): number {
  const n = (name ?? "").toLowerCase();
  if (n.includes("plug and play")) return 1.6;
  if (n.includes("aloqa")) return 1.2;
  return 1;
}
