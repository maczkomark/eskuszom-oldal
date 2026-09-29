// A próbaoldal elindítása a levélben lévő gombbal.
//
// A pár ide érkezik: eskuszom.hu/proba/<kulcs>. Mi megkérjük a
// vezérlőpultot, hogy hozza létre az oldalukat, és rögtön át is küldjük
// őket a belépő linkre — nem kell semmit megnyomniuk, és nem kell
// jelszót kitalálniuk.
//
// Ha valami félremegy, nem hibakódot mutatunk, hanem egy emberi lapot
// elérhetőséggel: aki ide eljutott, az érdeklődő, nem hibaüzenetet érdemel.
import { ALAP, oldal } from "../_kozos.js";

function lap(cim, szoveg, gomb) {
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
    ${gomb ? `<p style="margin-top:28px"><a class="gomb gomb-fo" href="${gomb.url}">${gomb.szoveg}</a></p>` : ""}
    <p style="margin-top:34px;font-size:.9rem;color:var(--tinta-halvany)">
      Ha elakadtatok, írjatok: <a href="mailto:info@mmdigital.hu">info@mmdigital.hu</a>
      · <a href="tel:+36204087765">+36 20 408 7765</a>
    </p>
  </div>
</section>`,
  });
}

export async function onRequest(context) {
  const kulcs = String(context.params?.kulcs ?? "").trim();
  if (!kulcs) return Response.redirect("https://eskuszom.hu/", 302);

  try {
    const v = await fetch(`${ALAP}/api/eskuvo/proba`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ kulcs }),
      signal: AbortSignal.timeout(25000),
    });
    const j = await v.json().catch(() => ({}));

    // Kész: küldjük is be őket a saját oldalukra.
    if (j?.ok && j.belepo) return Response.redirect(j.belepo, 302);

    return new Response(
      lap("Ez a link már nem él",
          j?.hiba
            ? String(j.hiba)
            : "Lehet, hogy lejárt, vagy már elindítottátok korábban. Írjatok nekünk, és egy percen belül rendbe tesszük.",
          { url: "https://eskuszom.hu/", szoveg: "Vissza a főoldalra" }),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
    );
  } catch {
    return new Response(
      lap("Most nem sikerült",
          "A rendszerünk épp nem válaszol. Próbáljátok meg pár perc múlva ugyanezzel a linkkel — a helyetek megvan.",
          null),
      { status: 200, headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
    );
  }
}
