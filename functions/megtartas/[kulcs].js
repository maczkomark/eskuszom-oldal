// eskuszom.hu/megtartas/<kulcs> — a lejárt próbaoldal adatainak megőrzése fél
// évig, a pár kérésére (2026-11-17). A GET csak megmutatja, a gomb POST-ja ment.
import { HTML, lap, hivas, datumIg } from "../_levelek.js";
import { ki } from "../_kozos.js";

const UT = "megtartas";

export async function onRequest(context) {
  const kulcs = String(context.params?.kulcs ?? "").trim();
  if (!kulcs) return Response.redirect("https://eskuszom.hu/", 302);

  if (context.request.method === "POST") {
    const v = await hivas(kulcs, "megtartas");
    return new Response(lap({
      ut: UT,
      cim: v?.ok ? "Rendben, megőrizzük" : "Most nem sikerült",
      szoveg: v?.ok
        ? `Amit beírtatok, ${datumIg(v.meddig)} megmarad. Ha közben megrendelitek, egy gombnyomással visszakapcsoljuk az oldalt, és ott folytatjátok, ahol abbahagytátok.`
        : (v?.hiba ?? "Próbáljátok meg pár perc múlva."),
      gomb: v?.ok ? { url: "https://eskuszom.hu/megrendeles/", szoveg: "Megrendelem" } : undefined,
    }), { status: 200, headers: HTML });
  }

  const info = await hivas(kulcs, "info");
  if (!info?.ok || !info.megtarthato) {
    return new Response(lap({
      ut: UT,
      cim: info?.elerhetetlen ? "Most nem sikerült" : "Nem találjuk a próbaoldalatokat",
      szoveg: info?.hiba ?? "Lehet, hogy már törlődött, vagy már megrendeltétek. Írjatok nekünk, és utánanézünk.",
      gomb: { url: "https://eskuszom.hu/", szoveg: "Az Esküszöm főoldala" },
    }), { status: 200, headers: HTML });
  }
  return new Response(lap({
    ut: UT,
    cim: "Megtartsuk az adataitokat?",
    szoveg: `${info.torles ? `Most ${datumIg(info.torles)} őrizzük. ` : ""}Egy kattintással kérhetitek, hogy fél évig megmaradjon, amit a próbaoldalon beírtatok — ingyen, kötelezettség nélkül.`,
    tartalom: `
    <form method="POST" action="/${UT}/${ki(kulcs)}" style="margin-top:28px">
      <button type="submit" class="gomb gomb-fo">Megtartjuk az adatainkat</button>
    </form>`,
  }), { status: 200, headers: HTML });
}
