// eskuszom.hu/leiratkozas/<kulcs> — leiratkozás az ajánlat- és emlékeztető
// levelekről (2026-11-17).
//
// Két út:
//  - a levelező „Leiratkozás” gombja (RFC 8058, List-Unsubscribe-Post): a
//    levelező maga POST-ol ide `List-Unsubscribe=One-Click` törzzsel — ilyenkor
//    rögtön leiratkoztatjuk, lapot nem kell mutatni;
//  - a levél alján lévő link: a GET csak egy gombot mutat (a linkellenőrzők ne
//    iratkoztassanak le senkit), a gomb POST-ja iratkoztat le.
import { HTML, lap, hivas, urlapMezok } from "../_levelek.js";
import { ki } from "../_kozos.js";

const UT = "leiratkozas";

export async function onRequest(context) {
  const kulcs = String(context.params?.kulcs ?? "").trim();
  if (!kulcs) return Response.redirect("https://eskuszom.hu/", 302);
  const req = context.request;

  if (req.method === "POST") {
    const mezok = await urlapMezok(req.clone());
    const egykattintas = String(mezok["List-Unsubscribe"] ?? "") === "One-Click";
    const v = await hivas(kulcs, "leiratkozas");
    if (egykattintas) {
      return new Response(v?.ok ? "ok" : "hiba", { status: v?.ok ? 200 : 400, headers: { "Cache-Control": "no-store" } });
    }
    return new Response(lap({
      ut: UT,
      cim: v?.ok ? "Leiratkoztatok" : "Most nem sikerült",
      szoveg: v?.ok
        ? "Több ajánlatot és emlékeztetőt nem küldünk. Ha van futó próbaoldalatok, arról még szólunk (például a lejárata előtt) — ezek nem hirdetések."
        : (v?.hiba ?? "Próbáljátok meg pár perc múlva."),
      gomb: { url: "https://eskuszom.hu/", szoveg: "Az Esküszöm főoldala" },
    }), { status: 200, headers: HTML });
  }

  const info = await hivas(kulcs, "info");
  if (!info?.ok) {
    return new Response(lap({
      ut: UT, cim: info?.elerhetetlen ? "Most nem sikerült" : "Ez a link nem érvényes",
      szoveg: info?.hiba ?? "Írjatok nekünk, és leiratkoztatunk.",
      gomb: { url: "https://eskuszom.hu/", szoveg: "Az Esküszöm főoldala" },
    }), { status: 200, headers: HTML });
  }
  if (info.leiratkozva) {
    return new Response(lap({
      ut: UT, cim: "Már leiratkoztatok",
      szoveg: "Ajánlatot és emlékeztetőt nem küldünk nektek.",
      gomb: { url: "https://eskuszom.hu/", szoveg: "Az Esküszöm főoldala" },
    }), { status: 200, headers: HTML });
  }
  return new Response(lap({
    ut: UT,
    cim: "Leiratkoztok?",
    szoveg: "Ha leiratkoztok, nem küldünk több ajánlatot és emlékeztetőt.",
    tartalom: `
    <form method="POST" action="/${UT}/${ki(kulcs)}" style="margin-top:28px">
      <button type="submit" class="gomb gomb-fo">Leiratkozom</button>
    </form>`,
  }), { status: 200, headers: HTML });
}
