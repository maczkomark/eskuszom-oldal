// A próbaoldal elindítása a levélben lévő gombbal.
//
// A pár ide érkezik: eskuszom.hu/proba/<kulcs>.
//
// FONTOS, hogy a megnyitás (GET) önmagában NE indítson el semmit. A
// leveleket sorra végigjárják a gépek: a levelezőszolgáltatók
// vírus- és linkellenőrzői, a biztonsági szűrők, az előnézetkészítők.
// Ha a GET aktiválna, akkor
//   - a próba olyan párnál is elindulna, aki el sem olvasta a levelet,
//   - és a hozzá tartozó, EGYSZER használatos belépőt is elhasználnák,
//     mire a pár rákattint — ők már csak egy „lejárt a belépő" lapot
//     látnának.
//
// Ezért a GET csak megmutat egy lapot egy gombbal, és a tényleges
// indítás POST-ra történik. Gép nem POST-ol.
import { ALAP, oldal } from "../_kozos.js";

function lap({ cim, szoveg, urlap, kulcs, gomb }) {
  return oldal({
    url: "https://eskuszom.hu/proba/",
    cim: `${cim} — Esküszöm`,
    leiras: szoveg,
    robots: "noindex, nofollow",
    tartalom: `
<section class="vilagos">
  <div class="hatar" style="max-width:620px;text-align:center;padding-block:clamp(60px,12vh,120px)">
    <h1 style="font-family:var(--serif);font-weight:400;font-size:clamp(28px,5vw,42px);line-height:1.15">${cim}</h1>
    <p class="vezeto" style="margin:18px auto 0">${szoveg}</p>
    ${urlap ? `
    <form method="POST" action="/proba/${kulcs}" style="margin-top:28px">
      <button type="submit" class="gomb gomb-fo">Elindítom az oldalunkat</button>
    </form>
    <p style="margin-top:14px;font-size:.85rem;color:var(--tinta-halvany)">
      Egy percen belül kész, és rögtön be is léptetünk.
    </p>` : ""}
    ${gomb ? `<p style="margin-top:28px"><a class="gomb gomb-fo" href="${gomb.url}">${gomb.szoveg}</a></p>` : ""}
    <p style="margin-top:34px;font-size:.9rem;color:var(--tinta-halvany)">
      Ha elakadtatok, írjatok: <a href="mailto:info@mmdigital.hu">info@mmdigital.hu</a>
      · <a href="tel:+36204087765">+36 20 408 7765</a>
    </p>
  </div>
</section>`,
  });
}

const HTML = { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" };

export async function onRequest(context) {
  const kulcs = String(context.params?.kulcs ?? "").trim();
  if (!kulcs) return Response.redirect("https://eskuszom.hu/", 302);

  // Megnyitás: csak megmutatjuk. Semmi nem jön létre.
  if (context.request.method !== "POST") {
    return new Response(
      lap({
        cim: "Készen álltok?",
        szoveg: "Egy kattintás, és elkészítjük az esküvői oldalatokat a saját "
              + "neveitekkel. Egy hétig ingyen a tiétek, és nem kell hozzá "
              + "megadnotok semmit.",
        urlap: true, kulcs,
      }),
      { status: 200, headers: HTML },
    );
  }

  try {
    const v = await fetch(`${ALAP}/api/eskuvo/proba`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kulcs }),
      signal: AbortSignal.timeout(25000),
    });
    const j = await v.json().catch(() => ({}));

    // Kész: küldjük is be őket a saját oldalukra.
    if (j?.ok && j.belepo) return Response.redirect(j.belepo, 303);

    return new Response(
      lap({
        cim: "Ez a link már nem él",
        szoveg: j?.hiba
          ? String(j.hiba)
          : "Lehet, hogy már elindítottátok korábban. Írjatok nekünk, és egy percen belül rendbe tesszük.",
        gomb: { url: "https://eskuszom.hu/", szoveg: "Vissza a főoldalra" },
      }),
      { status: 200, headers: HTML },
    );
  } catch {
    return new Response(
      lap({
        cim: "Most nem sikerült",
        szoveg: "A rendszerünk épp nem válaszol. Próbáljátok meg pár perc múlva "
              + "ugyanezzel a linkkel — a helyetek megvan.",
        urlap: true, kulcs,
      }),
      { status: 200, headers: HTML },
    );
  }
}
