// eskuszom.hu/emlekezteto/<kulcs> — emlékeztetők kérése az esküvő hónapjához
// igazítva (2026-11-17). Ez a kifejezett hozzájárulás: csak az kap ilyen
// levelet, aki itt maga kéri. A GET csak a lapot mutatja, a mentés POST.
import { HTML, lap, hivas, honapNev, honapok, urlapMezok } from "../_levelek.js";
import { ki } from "../_kozos.js";

const UT = "emlekezteto";

function urlap(kulcs, info, hiba) {
  const valasztott = info.honap || "";
  const opciok = honapok(30)
    .map((h) => `<option value="${h}"${h === valasztott ? " selected" : ""}>${honapNev(h)}</option>`)
    .join("");
  return `
    <form method="POST" action="/${UT}/${ki(kulcs)}" style="margin:28px auto 0;max-width:380px;text-align:left">
      <label for="honap" style="display:block;font-weight:600;margin-bottom:8px">Melyik hónapban lesz az esküvő?</label>
      <select id="honap" name="honap" required
              style="width:100%;padding:12px 14px;border-radius:12px;border:1px solid var(--vonal, #ddd);font:inherit;background:#fff">
        <option value=""${valasztott ? "" : " selected"} disabled>Válasszatok hónapot</option>
        ${opciok}
      </select>
      ${hiba ? `<p role="alert" style="color:#a33;margin-top:10px">${ki(hiba)}</p>` : ""}
      <p style="margin-top:14px;font-size:.92rem;color:var(--tinta-halvany);line-height:1.55">
        Legfeljebb 5 rövid levelet küldünk: 12, 9, 6, 4 és 2 hónappal az esküvő előtt, mindig azzal,
        ami épp aktuális. Bármelyik levél aljáról egy kattintással leiratkozhattok.
      </p>
      <p style="margin-top:20px;text-align:center">
        <button type="submit" class="gomb gomb-fo">Kérem az emlékeztetőket</button>
      </p>
    </form>`;
}

export async function onRequest(context) {
  const kulcs = String(context.params?.kulcs ?? "").trim();
  if (!kulcs) return Response.redirect("https://eskuszom.hu/", 302);

  const info = await hivas(kulcs, "info");
  if (!info?.ok) {
    return new Response(lap({
      ut: UT, cim: info?.elerhetetlen ? "Most nem sikerült" : "Ez a link nem érvényes",
      szoveg: info?.hiba ?? "Írjatok nekünk, és rendbe tesszük.",
      gomb: { url: "https://eskuszom.hu/", szoveg: "Az Esküszöm főoldala" },
    }), { status: 200, headers: HTML });
  }

  if (context.request.method !== "POST") {
    return new Response(lap({
      ut: UT,
      cim: info.gondozas ? "Átírjátok a dátumot?" : "Emlékeztessünk az esküvő előtt?",
      szoveg: info.gondozas
        ? `Most ${honapNev(info.honap)} esküvőhöz igazítva írunk. Ha változott, válasszátok ki az újat.`
        : "Ha most még korai, nem baj: szólunk, amikor épp aktuális lesz — a helyszín, a meghívók, a visszajelzések és az ültetésrend idején.",
      tartalom: urlap(kulcs, info),
    }), { status: 200, headers: HTML });
  }

  const mezok = await urlapMezok(context.request);
  const v = await hivas(kulcs, "emlekezteto", { honap: String(mezok.honap ?? "") });
  if (!v?.ok) {
    return new Response(lap({
      ut: UT, cim: "Még egy lépés", szoveg: "Nem sikerült elmenteni.",
      tartalom: urlap(kulcs, info, v?.hiba ?? "Próbáljátok újra."),
    }), { status: 200, headers: HTML });
  }
  return new Response(lap({
    ut: UT,
    cim: "Rendben, szólunk!",
    szoveg: `${honapNev(v.honap)} esküvőhöz igazítva írunk, legfeljebb 5 rövid levelet. Ha addig kérdésetek van, válaszoljatok bármelyik levelünkre.`,
    gomb: { url: "https://eskuszom.hu/", szoveg: "Az Esküszöm főoldala" },
  }), { status: 200, headers: HTML });
}
