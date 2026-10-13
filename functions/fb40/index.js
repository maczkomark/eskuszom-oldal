// Az új (40%-os) Meta-hirdetések landolója. Az ár a vezérlőpultból jön
// (_kozos.js → statikusArakkal).
//
// A villogó kupon-jelvénybe a VALÓDI maradék kerül a Stripe-ból, ha a
// Pages-projektben be van állítva a STRIPE_OLVASO_KULCS (korlátozott kulcs,
// csak „Promotion codes: Read"). Kulcs nélkül, vagy ha a Stripe nem válaszol,
// a generált szöveg marad („Csak 10 kupon — az első 10 pár kapja meg").
// Kitalált számot soha nem írunk ki: a hamis szűkösség („már csak pár
// maradt", amikor nem igaz) tiltott kereskedelmi gyakorlat.
import { statikusArakkal } from "../_kozos.js";

/** ESKUSZOM40 promóciós kód a Stripe-ban (max. 10 beváltás). */
const PROMO = "promo_1UPzmP2K8elZQgholIDI2bUM";
const JELVENY = /(<span class="fb-kupon" data-kupon>)[^<]*(<\/span>)/;
const TAROLAS_MP = 300;

async function kuponAllas(env) {
  const kulcs = env?.STRIPE_OLVASO_KULCS;
  if (!kulcs) return null;

  // 5 percig tároljuk, hogy ne minden látogató kérdezze a Stripe-ot
  const tar = typeof caches !== "undefined" ? caches.default : null;
  const tarCim = new Request("https://eskuszom.hu/_belso/kupon-allas-40");
  if (tar) {
    const meglevo = await tar.match(tarCim);
    if (meglevo) return meglevo.json();
  }

  const v = await fetch(`https://api.stripe.com/v1/promotion_codes/${PROMO}`, {
    headers: { Authorization: `Bearer ${kulcs}` },
  });
  if (!v.ok) return null;
  const p = await v.json();
  if (!p.max_redemptions) return null;
  const allas = {
    maradt: p.active ? Math.max(0, p.max_redemptions - (p.times_redeemed ?? 0)) : 0,
    osszes: p.max_redemptions,
  };
  if (tar) {
    await tar.put(tarCim, new Response(JSON.stringify(allas), {
      headers: { "Content-Type": "application/json", "Cache-Control": `max-age=${TAROLAS_MP}` },
    }));
  }
  return allas;
}

export async function onRequest(context) {
  const valasz = await statikusArakkal(context);
  if (context.request.method !== "GET") return valasz;
  if (!(valasz.headers.get("content-type") ?? "").includes("text/html")) return valasz;

  let allas = null;
  try { allas = await kuponAllas(context.env); } catch { allas = null; }
  // Ha mind megvan, az alapszöveg igaz („Csak 10 kupon …") — azt hagyjuk
  if (!allas || allas.maradt >= allas.osszes) return valasz;

  const szoveg = allas.maradt > 0
    ? `Már csak ${allas.maradt} kupon maradt a ${allas.osszes}-ből`
    : `Elfogyott mind a ${allas.osszes} kupon`;
  const html = (await valasz.text()).replace(JELVENY, `$1${szoveg}$2`);
  const fejlec = new Headers(valasz.headers);
  fejlec.delete("content-length");
  return new Response(html, { status: valasz.status, headers: fejlec });
}
