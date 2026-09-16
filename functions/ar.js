// /ar/ — az árak oldala.
//
// Ez az egyetlen oldal, ami NEM statikus: az árakat és a futó akciót a
// vezérlőpultból kérjük le, hogy egy áremeléshez vagy egy nyári akcióhoz
// ne kelljen új verziót telepíteni, és soha ne szerepeljen más összeg a
// hirdetésben, mint a számlán.
//
// Ha a vezérlőpult épp nem elérhető, a beégetett alapárral megyünk tovább:
// egy üres ár oldal rosszabb, mint egy pár perce elavult ár.
import { ALAP, ki, oldal } from "./_kozos.js";

const ALAPARAK = {
  par: { alap: 45000, fizetendo: 45000, akcio: null },
  szervezo: { alap: 40000, fizetendo: 40000, akcio: null },
  emlek: 4900,
  surgos: { nap: 21, felar: 10000 },
  kedvezmeny: 5000,
};

/** 45000 → „45 000" */
function ft(n) {
  return Number(n ?? 0).toLocaleString("hu-HU");
}

async function arakLekeres() {
  try {
    const v = await fetch(`${ALAP}/api/eskuvo/arak`, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!v.ok) return ALAPARAK;
    const j = await v.json();
    return j?.ok ? j : ALAPARAK;
  } catch {
    return ALAPARAK;
  }
}

/* ─────────────────────────────────────────────── darabok ──────── */

const PIPA = `<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>`;

const TETELEK = [
  ["Saját esküvői oldal, saját címen",
   "zsofiesmarci.eskuszom.hu — vagy a saját domainetek, ha van"],
  ["Vendéglista, korlátlan létszámmal",
   "egy helyen, kereshetően; nem tíz Excel-verzióban"],
  ["Meghívó személyre szóló QR-kóddal",
   "mindenki a saját oldalát nyitja meg, nem egy általánosat"],
  ["Visszajelzés, menü, allergiák",
   "a vendég maga tölti ki, nektek nem kell utánatelefonálni"],
  ["Ültetésrend és teremterv",
   "húzod-ejted; látod, ki hol ül és melyik asztal telt be"],
  ["Program és forgatókönyv",
   "a nap idővonala, amit a vendégek és a szolgáltatók is látnak"],
  ["Szolgáltatói hozzáférés",
   "a fotós és a vendéglátós azt látja, ami rá tartozik — és csak azt"],
  ["Nyomdakész meghívók, kártyák és táblák",
   "48 meghívósablon, ültetőkártya, asztalszám, terembeosztás — nyomtatásra kész"],
  ["Közös fotógaléria",
   "a vendégek töltik fel; nem vesznek el a képek a csoportos üzenetekben"],
  ["Segítünk az induláskor",
   "beállítjuk veletek, és utána is elérhetők vagyunk"],
];

/** Akciószalag — csak ha tényleg fut valami, kód nélkül. */
function szalag(akcio) {
  if (!akcio || akcio.kod) return "";
  return `
    <div class="akcio-szalag">
      <strong>${ki(akcio.cimke)}</strong>
      <span>${ki(akcio.leiras || akcio.nev)}</span>
      ${akcio.vege ? `<em>${ki(akcio.vege)}-ig</em>` : ""}
    </div>`;
}

/** Az ár kiírása: ha akciós, mellette az áthúzott eredeti. */
function arSzam(csomag) {
  if (!csomag.akcio || csomag.fizetendo >= csomag.alap) {
    return `<div class="ar-szam">${ft(csomag.alap)} <small>Ft</small></div>`;
  }
  return `
    <div class="ar-szam">
      ${ft(csomag.fizetendo)} <small>Ft</small>
      <span class="ar-regi">${ft(csomag.alap)} Ft</span>
    </div>`;
}

const STILUS = `
  .akcio-szalag { display: flex; flex-wrap: wrap; align-items: baseline; gap: .6rem;
    justify-content: center; margin: 0 auto 26px; max-width: 640px;
    background: var(--mauve); color: #fff; border-radius: 14px;
    padding: .85rem 1.2rem; text-align: center; }
  .akcio-szalag strong { font-size: 1.05rem; }
  .akcio-szalag span { opacity: .92; font-size: .9rem; }
  .akcio-szalag em { font-style: normal; opacity: .75; font-size: .8rem; }
  .ar-regi { font-size: 1.25rem; color: var(--tinta-halvany);
    text-decoration: line-through; margin-left: .5rem; vertical-align: middle; }

  .szolg-doboz { background: var(--feher); border: 1px solid var(--vonal);
    border-radius: 20px; padding: clamp(1.5rem, 4vw, 2.6rem);
    max-width: 780px; margin: 0 auto; }
  .szolg-fej { display: flex; flex-wrap: wrap; align-items: baseline;
    gap: .5rem 1rem; margin-bottom: .4rem; }
  .szolg-fej h2 { font-family: var(--serif); font-weight: 400;
    font-size: clamp(24px, 3.4vw, 32px); }
  .szolg-ar { font-family: var(--serif); font-size: clamp(26px, 4vw, 36px);
    color: var(--mauve); }
  .szolg-ar small { font-size: .5em; color: var(--tinta-lagy); }
  .szolg-pontok { display: grid; gap: 1rem; margin: 1.6rem 0; }
  .szolg-pont strong { display: block; margin-bottom: .2rem; }
  .szolg-pont span { color: var(--tinta-lagy); font-size: .92rem; line-height: 1.65; }
  .szolg-gombok { display: flex; flex-wrap: wrap; gap: .7rem; }

  .mini-urlap { margin-top: 1.8rem; padding-top: 1.6rem;
    border-top: 1px solid var(--vonal); }
  .mini-urlap h3 { font-family: var(--serif); font-weight: 400; font-size: 1.25rem;
    margin-bottom: .3rem; }
  .mini-sor { display: grid; gap: .7rem; grid-template-columns: 1fr 1fr;
    margin-top: 1rem; }
  .mini-urlap label { display: block; font-size: .8rem; color: var(--tinta-lagy);
    margin-bottom: .3rem; }
  .mini-urlap input, .mini-urlap textarea { width: 100%; font: inherit;
    padding: .7rem .85rem; border: 1px solid var(--vonal); border-radius: 11px;
    background: var(--papir); color: var(--tinta); }
  .mini-urlap textarea { min-height: 84px; resize: vertical; }
  .mini-urlap .teljes { grid-column: 1 / -1; }
  .mini-urlap .robotcsapda { position: absolute; left: -9999px; }
  .mini-hiba { color: #b4443c; font-size: .85rem; margin-top: .7rem; min-height: 1.2em; }
  .mini-kesz { background: var(--papir-melyebb); border-radius: 14px;
    padding: 1.4rem; text-align: center; }
  @media (max-width: 560px) { .mini-sor { grid-template-columns: 1fr; } }
`;

/* ──────────────────────────────────────────────── az oldal ────── */

export async function onRequest(context) {
  try {
    const a = await arakLekeres();
    const par = a.par ?? ALAPARAK.par;
    const szerv = a.szervezo ?? ALAPARAK.szervezo;

    const cim = `Az Esküszöm ára – egyszeri ${ft(par.fizetendo)} Ft, havidíj nélkül`;
    const leiras = `Egyszeri ${ft(par.fizetendo)} Ft, és a tiétek az esküvő napjáig. `
      + "Nincs havidíj, nincs vendéglétszám-korlát, nincs utólagos felár. "
      + "Esküvőszervező cégeknek külön ár.";

    const tartalom = `
<section class="melyebb" id="ar">
  <div class="hatar">
    <div class="szakasz-fej kozepre uszo">
      <div class="folcim">Ár</div>
      <h1>Egy ár. Egy alkalom.<br>Nincs havidíj.</h1>
    </div>

    ${szalag(par.akcio)}

    <div class="ar-doboz uszo">
      <div class="folcim" style="margin-bottom:.4rem">Teljes csomag</div>
      ${arSzam(par)}
      <p class="ar-alcim">
        Egyszeri díj, az esküvőtök napjáig a tiétek.<br>
        Nem kell előfizetni, és nincs vendégszám-korlát.
      </p>

      <ul class="ar-lista reszletes">
        ${TETELEK.map(([mi, hogyan]) => `<li>${PIPA}
          <span>
            <strong>${ki(mi)}</strong>
            <span class="ar-tetel-mit">${ki(hogyan)}</span>
          </span>
        </li>`).join("\n        ")}
      </ul>

      <div class="ar-gombok">
        <a href="/megrendeles/" class="gomb gomb-fo">Megrendelem</a>
        <a href="/#kapcsolat" class="gomb gomb-halk">Kérek egy bemutatót</a>
      </div>

      <div class="ar-extra">
        <strong style="color:var(--tinta-lagy)">Amit külön lehet kérni:</strong>
        saját domain (pl. <em>zsofiesmarci.hu</em>) a domain árán ·
        emlékoldal az esküvő után, hogy a képek és az üzenetek megmaradjanak —
        ${ft(a.emlek ?? ALAPARAK.emlek)} Ft/év
        ${(a.surgos?.felar ?? 0) > 0 ? ` · ${a.surgos.nap} napon belüli esküvőnél
          sürgősségi felár: ${ft(a.surgos.felar)} Ft` : ""}
      </div>

      <p class="ar-zaras" style="margin-top:1rem;padding-top:0;border-top:0">
        Egy összeg, egyszer. Nem bontottuk csomagokra, mert nem akartuk, hogy az
        esküvőtök közepén derüljön ki: amire szükségetek van, az épp a drágább
        csomagban lett volna.
      </p>
    </div>

    <!-- ── fizetés ──────────────────────────────────────────────────
         Egyelőre CSAK banki átutalás. A bankkártyás fizetés elő van
         készítve, de szándékosan nincs bekapcsolva: amíg nincs mögötte
         szolgáltatói szerződés, nem ígérünk olyat, amit nem tudunk
         teljesíteni. -->
    <div class="fizetes uszo">
      <h3>Hogyan lehet fizetni?</h3>
      <div class="fizetes-modok">
        <div class="fizetes-mod aktiv">
          <div class="fizetes-ikon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <path d="M3 21h18M4 21V10l8-6 8 6v11M9 21v-6h6v6"/>
            </svg>
          </div>
          <div>
            <strong>Banki átutalás</strong>
            <p>
              Kitöltötök egy rövid megrendelőt, és rögtön megkapjátok a
              számlaszámot meg a közleményt, amivel utalni tudtok. Előleg
              nincs, kötbér nincs. Ha megérkezett az összeg, szólunk, küldjük
              a számlát, és két napon belül él az oldalatok.
            </p>
            <p class="fizetes-lepesek">
              <span>1. Megrendelés</span>
              <span>2. Utalás</span>
              <span>3. Két nap, és kész</span>
            </p>
          </div>
        </div>

        <div class="fizetes-mod hamarosan">
          <div class="fizetes-ikon">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
              <rect x="2" y="5" width="20" height="14" rx="2"/><path d="M2 10h20"/>
            </svg>
          </div>
          <div>
            <strong>Bankkártya <span class="cimke-hamarosan">hamarosan</span></strong>
            <p>
              A kártyás fizetést most készítjük elő. Amint él, itt is
              választható lesz — addig az átutalás marad.
            </p>
          </div>
        </div>
      </div>
      <p class="fizetes-apro">
        Számlát minden esetben adunk. Magánszemélyként és cégként is fizethettek.
      </p>
      <div class="fizetes-gomb">
        <a href="/megrendeles/" class="gomb gomb-fo">Megrendelem</a>
        <span class="fizetes-halk">
          Egyszeri ${ft(par.fizetendo)} Ft · nincs havidíj · két nap alatt kész
        </span>
      </div>
    </div>
  </div>
</section>

<!-- ══════════════════ esküvőszervezőknek, szolgáltatóknak ══════════ -->
<section id="szolgaltatoknak">
  <div class="hatar">
    <div class="szolg-doboz uszo">
      <div class="folcim">Szolgáltatóknak</div>
      <div class="szolg-fej">
        <h2>Esküvőszervező cégeknek</h2>
        <div class="szolg-ar">
          ${szerv.akcio && szerv.fizetendo < szerv.alap
            ? `${ft(szerv.fizetendo)} <small>Ft / esküvő</small>
               <span class="ar-regi">${ft(szerv.alap)} Ft</span>`
            : `${ft(szerv.alap)} <small>Ft / esküvő</small>`}
        </div>
      </div>
      <p style="color:var(--tinta-lagy);line-height:1.7">
        Egyszeri díj esküvőnként, havidíj nélkül. Nem kell hozzá más, csak a
        cég neve — a párok adatait ti viszitek fel, ahogy nektek kényelmes.
      </p>

      ${szalag(szerv.akcio)}

      <div class="szolg-pontok">
        <div class="szolg-pont">
          <strong>Kibérelhetitek</strong>
          <span>
            A rendszert nem adjuk ki senkinek — kibérelhetik. Az esküvőszervező
            cég a saját nevével és színeivel használja, a párok azt látják,
            hogy az ő felületük. A kiszolgálás, a szerver és az adatok viszont
            végig nálunk maradnak, és a hozzáférés bármikor visszavonható.
          </span>
        </div>
        <div class="szolg-pont">
          <strong>Egy felületen az összes esküvőtök</strong>
          <span>
            Nem kell minden párnak külön belépés és külön nyilvántartás. Látjátok,
            melyik esküvőnél hol tart a visszajelzés, az ültetés és a menü.
          </span>
        </div>
        <div class="szolg-pont">
          <strong>Több esküvőre külön megállapodás</strong>
          <span>
            Ha évente sok esküvőt visztek, kérjetek ajánlatot — arra más
            feltételeket tudunk adni, mint egyetlen alkalomra.
          </span>
        </div>
      </div>

      <div class="szolg-gombok">
        <a href="/megrendeles/?tipus=szervezo" class="gomb gomb-fo">
          Megrendelem egy esküvőre
        </a>
        <a href="/eskuvoszervezoknek/" class="gomb gomb-halk">
          Részletek és white label
        </a>
      </div>

      <!-- ── rövid ajánlatkérő ────────────────────────────────────────
           A teljes űrlap az /eskuvoszervezoknek/ oldalon van; ide csak a
           lényeg kerül, hogy ne kelljen elnavigálni az árak mellől. -->
      <div class="mini-urlap" id="ajanlat">
        <h3>Vagy kérjetek ajánlatot</h3>
        <p style="color:var(--tinta-lagy);font-size:.9rem">
          Elég a cég neve és egy elérhetőség. Egy munkanapon belül válaszolunk.
        </p>

        <form id="szolg-urlap" novalidate>
          <div class="mini-sor">
            <div class="teljes">
              <label for="sz-ceg">A cég neve *</label>
              <input id="sz-ceg" name="ceg" required placeholder="Példa Esküvők Kft.">
            </div>
            <div>
              <label for="sz-email">E-mail</label>
              <input id="sz-email" name="email" type="email" placeholder="info@pelda.hu">
            </div>
            <div>
              <label for="sz-telefon">Telefon</label>
              <input id="sz-telefon" name="telefon" type="tel" placeholder="+36 30 123 4567">
            </div>
            <div class="teljes">
              <label for="sz-uzenet">Bármi, amit tudnunk kell</label>
              <textarea id="sz-uzenet" name="uzenet"
                        placeholder="Hány esküvőtök van egy évben? Saját arculattal szeretnétek?"></textarea>
            </div>
          </div>

          <input class="robotcsapda" type="text" name="honeypot" id="sz-mez" tabindex="-1"
                 autocomplete="off" aria-hidden="true">

          <button type="submit" class="gomb gomb-fo" id="sz-kuldes" style="margin-top:1.1rem">
            Kérem az ajánlatot
          </button>
          <div class="mini-hiba" id="sz-hiba"></div>
        </form>

        <div class="mini-kesz" id="sz-kesz" hidden>
          <strong style="font-family:var(--serif);font-size:1.2rem">Megkaptuk, köszönjük!</strong>
          <p style="color:var(--tinta-lagy);margin-top:.4rem">
            Egy munkanapon belül válaszolunk arra az elérhetőségre, amit megadtatok.
          </p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="melyebb">
  <div class="hatar">
    <div class="szakasz-fej kozepre">
      <h2>Nézzétek meg élőben.</h2>
      <p class="vezeto" style="margin-inline:auto">
        Van egy teljes minta esküvőnk, ahol minden működik, ahogy a valóságban is.
        Kattintsatok végig rajta — utána sokkal könnyebb dönteni.
      </p>
      <p style="margin-top:28px">
        <a href="/minta/" class="gomb gomb-fo">Minta esküvői oldal</a>
        <a href="/#kapcsolat" class="gomb gomb-halk">Kérek egy bemutatót</a>
      </p>
    </div>
    <nav class="tovabb-menu">
      <a href="/mit-tud/">Mit tud a rendszer</a>
      <a href="/a-vendegeknek/">A vendégek oldala</a>
      <a href="/hogyan-megy/">Hogyan megy</a>
      <a href="/eskuvoszervezoknek/">Esküvőszervezőknek</a>
      <a href="/kerdesek/">Gyakori kérdések</a>
      <a href="/tippek/">Tippek</a>
    </nav>
  </div>
</section>

<script>
(function () {
  var urlap = document.getElementById("szolg-urlap");
  if (!urlap) return;
  var hiba = document.getElementById("sz-hiba");
  var gomb = document.getElementById("sz-kuldes");

  urlap.addEventListener("submit", async function (e) {
    e.preventDefault();
    hiba.textContent = "";

    var ceg = document.getElementById("sz-ceg").value.trim();
    var email = document.getElementById("sz-email").value.trim();
    var telefon = document.getElementById("sz-telefon").value.trim();

    if (!ceg) { hiba.textContent = "Írjátok be a cég nevét."; return; }
    if (!email && !telefon) {
      hiba.textContent = "Adjatok meg egy e-mailt vagy egy telefonszámot, hogy tudjunk válaszolni.";
      return;
    }

    gomb.disabled = true;
    gomb.textContent = "Küldjük…";
    try {
      var v = await fetch("${ALAP}/api/eskuvo/szervezo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ceg: ceg, email: email, telefon: telefon,
          uzenet: document.getElementById("sz-uzenet").value.trim(),
          honeypot: document.getElementById("sz-mez").value,
          forras: "ar-oldal",
        }),
      });
      var j = await v.json().catch(function () { return {}; });
      if (!v.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült elküldeni.");
      urlap.hidden = true;
      document.getElementById("sz-kesz").hidden = false;
    } catch (err) {
      hiba.textContent = err.message
        + " Írjatok inkább ide: info@mmdigital.hu";
      gomb.disabled = false;
      gomb.textContent = "Kérem az ajánlatot";
    }
  });
})();
</script>
`;

    return new Response(
      oldal({
        cim, leiras,
        fejlecek: `<style>${STILUS}</style>`,
        tartalom,
        url: "https://eskuszom.hu/ar/",
      }),
      {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          // Öt perc: ennyi késéssel látszik egy árváltozás, cserébe a lap
          // a gyorsítótárból jön, nem minden kérésnél a vezérlőpultból
          "Cache-Control": "public, max-age=300",
        },
      },
    );
  } catch (e) {
    // Ide elvi esetben jutunk el (az árlekérésnek saját tartaléka van).
    // Akkor sem hagyjuk üresen a lapot: az ár a legfontosabb oldal.
    return new Response(
      oldal({
        cim: "Az Esküszöm ára",
        leiras: "Egyszeri díj, havidíj nélkül.",
        url: "https://eskuszom.hu/ar/",
        tartalom: `<section class="melyebb"><div class="hatar">
          <div class="szakasz-fej kozepre">
            <h1>Az Esküszöm ára</h1>
            <p class="vezeto" style="margin-inline:auto">
              Egyszeri ${ft(ALAPARAK.par.alap)} Ft, havidíj nélkül. Esküvőszervező
              cégeknek ${ft(ALAPARAK.szervezo.alap)} Ft esküvőnként.
            </p>
            <p style="margin-top:28px">
              <a href="/megrendeles/" class="gomb gomb-fo">Megrendelem</a>
              <a href="/#kapcsolat" class="gomb gomb-halk">Kérek egy bemutatót</a>
            </p>
          </div>
        </div></section>`,
      }),
      { headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" } },
    );
  }
}
