// A főoldal statikus, de az ár benne a vezérlőpultból jön.
// Lásd: _kozos.js → statikusArakkal
//
// A fizetett Meta-hirdetésekből érkezőket a /fb20/ landolóra küldjük. A
// hirdetések a főoldalra mutatnak (…/?utm_source=facebook&utm_medium=cpc…),
// és egy már futó hirdetés linkjét a Meta nem engedi átírni — új hirdetés
// kellene, ami újraindítja a tanulást. Így a hirdetésekhez nem kell nyúlni.
// Aki nem hirdetésből jön (pl. egy sima megosztásból, csak fbclid-del), az
// továbbra is a főoldalt látja. A főoldalra a régi, 20%-ot ígérő hirdetések
// mutatnak (B2, B3, B5, B6), ezért a /fb20/; az újak (B7–B10) a /fb/-re,
// onnan a /fb40/-re mennek.
import { statikusArakkal } from "./_kozos.js";

const FORRAS = ["facebook", "fb", "instagram", "ig", "meta"];
const FIZETETT = ["cpc", "ppc", "paid", "paid_social", "paidsocial"];

export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (context.request.method === "GET" && url.pathname === "/") {
    const forras = (url.searchParams.get("utm_source") ?? "").toLowerCase();
    const mod = (url.searchParams.get("utm_medium") ?? "").toLowerCase();
    if (FORRAS.includes(forras) && FIZETETT.includes(mod)) {
      return new Response(null, {
        status: 302,
        headers: { Location: `/fb20/${url.search}`, "Cache-Control": "no-store" },
      });
    }
  }
  return statikusArakkal(context);
}
