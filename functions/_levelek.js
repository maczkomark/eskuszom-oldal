// A levelekben lévő linkek közös lapja (2026-11-17): emlékeztető, leiratkozás,
// megtartás. Ugyanaz a minta, mint a /proba/<kulcs>: a megnyitás (GET) csak
// megmutat egy lapot, a művelet POST-ra történik — a levelezők linkellenőrzői
// végigjárják a linkeket, és egy GET-re végrehajtott művelet magától lefutna.
import { ALAP, oldal, ki } from "./_kozos.js";

export const HTML = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };

export function lap({ ut, cim, szoveg, tartalom = "", gomb }) {
  return oldal({
    url: `https://eskuszom.hu/${ut}/`,
    cim: `${cim} — Esküszöm`,
    leiras: szoveg,
    robots: "noindex, nofollow",
    tartalom: `
<section class="vilagos">
  <div class="hatar" style="max-width:620px;text-align:center;padding-block:clamp(60px,12vh,120px)">
    <h1 style="font-family:var(--serif);font-weight:400;font-size:clamp(28px,5vw,42px);line-height:1.15">${ki(cim)}</h1>
    <p class="vezeto" style="margin:18px auto 0">${ki(szoveg)}</p>
    ${tartalom}
    ${gomb ? `<p style="margin-top:28px"><a class="gomb gomb-fo" href="${ki(gomb.url)}">${ki(gomb.szoveg)}</a></p>` : ""}
    <p style="margin-top:34px;font-size:.9rem;color:var(--tinta-halvany)">
      Kérdésetek van? <a href="mailto:info@mmdigital.hu">info@mmdigital.hu</a>
      · <a href="tel:+36204087765">+36 20 408 7765</a>
    </p>
  </div>
</section>`,
  });
}

/** A menedzser hívása szerverről. Hibánál { ok:false, hiba, elerhetetlen:true }. */
export async function hivas(kulcs, muvelet, extra = {}) {
  try {
    const v = await fetch(`${ALAP}/api/eskuvo/levelek`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kulcs, muvelet, ...extra }),
      signal: AbortSignal.timeout(20000),
    });
    return await v.json().catch(() => ({ ok: false, hiba: "Váratlan válasz." }));
  } catch {
    return { ok: false, elerhetetlen: true, hiba: "A rendszerünk épp nem válaszol. Próbáljátok meg pár perc múlva ugyanezzel a linkkel." };
  }
}

const HONAPOK = ["január", "február", "március", "április", "május", "június",
                 "július", "augusztus", "szeptember", "október", "november", "december"];

/** '2027-06' → „2027. június” */
export function honapNev(h) {
  const [y, m] = String(h ?? "").split("-").map(Number);
  return y && m ? `${y}. ${HONAPOK[m - 1]}` : "";
}

/** A következő `db` hónap 'YYYY-MM' alakban, a mostanival kezdve. */
export function honapok(db = 30) {
  const most = new Date();
  const lista = [];
  for (let i = 0; i < db; i++) {
    const d = new Date(Date.UTC(most.getUTCFullYear(), most.getUTCMonth() + i, 1));
    lista.push(`${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}`);
  }
  return lista;
}

/** „december 1-jéig”, „november 30-áig” — ugyanaz a szabály, mint a levelekben. */
export function datumIg(iso) {
  const d = new Date(String(iso) + "T12:00:00Z");
  if (isNaN(d)) return "";
  const nap = d.getUTCDate();
  const a = [2, 3, 6, 8, 13, 16, 18, 20, 23, 26, 28, 30].includes(nap);
  const veg = nap === 1 ? "jéig" : a ? "áig" : "éig";
  return `${d.getUTCFullYear()}. ${HONAPOK[d.getUTCMonth()]} ${nap}-${veg}`;
}

/** A POST-ban küldött űrlapmezők (urlencoded vagy multipart). */
export async function urlapMezok(request) {
  try {
    const f = await request.formData();
    return Object.fromEntries(f.entries());
  } catch {
    return {};
  }
}
