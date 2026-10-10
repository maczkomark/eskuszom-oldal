// A főoldal statikus, de az ár benne a vezérlőpultból jön.
// Lásd: _kozos.js → statikusArakkal
//
// A fizetett Meta-hirdetésekből érkezőket az /fb/ landolóra küldjük. A
// hirdetések a főoldalra mutatnak (…/?utm_source=facebook&utm_medium=cpc…),
// és egy már futó hirdetés linkjét a Meta nem engedi átírni — új hirdetés
// kellene, ami újraindítja a tanulást. Így a hirdetésekhez nem kell nyúlni.
// Aki nem hirdetésből jön (pl. egy sima megosztásból, csak fbclid-del), az
// továbbra is a főoldalt látja.
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
        headers: { Location: `/fb/${url.search}`, "Cache-Control": "no-store" },
      });
    }
  }
  return statikusArakkal(context);
}
