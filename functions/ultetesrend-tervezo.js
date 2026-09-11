// Ingyenes ültetésrend-tervező — regisztráció nélkül.
//
// MIÉRT: az „ültetésrend tervező" az egyik legtöbbet keresett kifejezés
// esküvő körül, és erre ma nincs jó magyar eszköz. Aki idetalál, az épp
// most szervez esküvőt — pontosan az, akit keresünk.
//
// A használathoz semmi nem kell: se fiók, se e-mail. A munka a böngészőben
// marad. Csak akkor kérünk e-mailt, ha el akarja menteni — és akkor is
// megmondjuk, miért.
import { ALAP, ki, oldal } from "./_kozos.js";

const STILUS = `
  .eszk { max-width: 1100px; margin: 0 auto; padding-bottom: 90px; }
  .eszk-fej { text-align: center; padding-bottom: 34px; }
  .eszk-fej h1 { font-family: var(--serif); font-weight: 400;
                 font-size: clamp(30px, 5vw, 46px); line-height: 1.15;
                 margin-bottom: 14px; }
  .eszk-fej .vezeto { max-width: 56ch; margin: 0 auto; }

  .eszk-racs { display: grid; gap: 1.2rem; grid-template-columns: 300px 1fr; }
  @media (max-width: 820px) { .eszk-racs { grid-template-columns: 1fr; } }

  .doboz { background: var(--feher); border: 1px solid var(--vonal);
           border-radius: 16px; padding: 1.3rem; }
  .doboz h2 { font-family: var(--serif); font-weight: 400; font-size: 1.2rem;
              margin-bottom: .3rem; }
  .doboz .halk { font-size: .8rem; color: var(--tinta-halvany); margin-bottom: .9rem; }

  .mezo-sor { display: flex; gap: .5rem; }
  .eszk input, .eszk textarea, .eszk select {
    width: 100%; font: inherit; font-size: .9rem;
    padding: .6rem .8rem; border-radius: 10px;
    border: 1px solid var(--vonal); background: var(--papir); color: var(--tinta);
  }
  .eszk input:focus, .eszk textarea:focus { outline: none;
    border-color: var(--mauve-vilagos); background: var(--feher); }
  .eszk textarea { min-height: 120px; resize: vertical; line-height: 1.5; }

  .vendeg-kupac { display: flex; flex-wrap: wrap; gap: .4rem; margin-top: .9rem;
                  min-height: 40px; }
  .vendeg {
    font-size: .8rem; padding: .35rem .7rem; border-radius: 999px;
    background: var(--papir-melyebb); border: 1px solid var(--vonal);
    cursor: grab; user-select: none; transition: border-color .15s ease;
  }
  .vendeg:hover { border-color: var(--mauve-vilagos); }
  .vendeg.fogott { opacity: .4; }
  .vendeg.kijelolt { border-color: var(--mauve); background: #fdf9fa; color: var(--mauve); }

  .asztalok { display: grid; gap: 1rem;
              grid-template-columns: repeat(auto-fill, minmax(210px, 1fr)); }
  .asztal { background: var(--feher); border: 1px solid var(--vonal);
            border-radius: 14px; padding: 1rem; min-height: 150px;
            transition: border-color .15s ease, background .15s ease; }
  .asztal.celzott { border-color: var(--mauve); background: #fdf9fa; }
  .asztal-fej { display: flex; justify-content: space-between; align-items: baseline;
                margin-bottom: .6rem; }
  .asztal-nev { font-family: var(--serif); font-size: 1.05rem; }
  .asztal-szam { font-size: .74rem; color: var(--tinta-halvany); }
  .asztal.telt .asztal-szam { color: #a4453d; }
  .asztal-torol { background: none; border: 0; cursor: pointer; color: var(--vonal);
                  font-size: 1rem; padding: 0 .2rem; }
  .asztal-torol:hover { color: #a4453d; }

  .eszk-gombsor { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1.2rem; }
  .eszk-hiba { margin-top: .8rem; font-size: .85rem; color: #a4453d; }
  .eszk-hiba:empty { display: none; }

  .mentes-doboz { margin-top: 1.6rem; background: var(--papir-melyebb);
                  border-radius: 16px; padding: 1.4rem; }
  .mentes-doboz h2 { font-family: var(--serif); font-weight: 400; font-size: 1.3rem;
                     margin-bottom: .4rem; }
  .mentes-doboz p { font-size: .88rem; color: var(--tinta-lagy); line-height: 1.6; }
  .mentes-urlap { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: 1rem; }
  .mentes-urlap input { flex: 1 1 220px; }
  .mentes-kesz { color: #3f7a4f; font-size: .9rem; margin-top: .8rem; }
  .rejtve { position: absolute; left: -9999px; }

  .atvezeto { margin-top: 2.4rem; text-align: center; }
`;

function lap() {
  return oldal({
    cim: "Ingyenes ültetésrend-tervező esküvőre – Esküszöm",
    leiras: "Rakd ki az esküvői ültetésrendet böngészőben, ingyen és regisztráció "
          + "nélkül. Húzd a vendégeket az asztalokhoz, és nézd, hol van még hely.",
    url: "https://eskuszom.hu/ultetesrend-tervezo/",
    fejlecek: `<style>${STILUS}</style>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="eszk">
      <div class="eszk-fej">
        <div class="folcim">Ingyenes eszköz</div>
        <h1>Ültetésrend-tervező</h1>
        <p class="vezeto">
          Írd be a neveket, csinálj asztalokat, és húzd a helyükre a vendégeket.
          Nem kell regisztrálni, és nem kérünk semmit — a munka a böngésződben
          marad, amíg el nem mented.
        </p>
      </div>

      <div class="eszk-racs">
        <div>
          <div class="doboz">
            <h2>Vendégek</h2>
            <p class="halk">Soronként egy név. Bemásolhatod egy táblázatból is.</p>
            <textarea id="nevek" placeholder="Kovács Anna&#10;Nagy Péter&#10;Szabó Éva"></textarea>
            <button type="button" class="gomb gomb-fo" id="betolt"
                    style="width:100%;justify-content:center;margin-top:.7rem">
              Beolvasom a neveket
            </button>
            <div class="vendeg-kupac" id="kupac"></div>
            <p class="halk" id="kupac-info" style="margin:.8rem 0 0"></p>
          </div>

          <div class="doboz" style="margin-top:1rem">
            <h2>Asztalok</h2>
            <p class="halk">Hány fő fér el egy asztalnál?</p>
            <div class="mezo-sor">
              <input id="uj-asztal-nev" placeholder="1. asztal">
              <input id="uj-asztal-fo" type="number" min="1" max="30" value="8"
                     style="max-width:80px">
            </div>
            <button type="button" class="gomb gomb-halk" id="asztal-hozzaad"
                    style="width:100%;justify-content:center;margin-top:.7rem">
              Hozzáadom
            </button>
          </div>
        </div>

        <div>
          <div class="asztalok" id="asztalok"></div>
          <p class="halk" id="ures-info" style="text-align:center;margin-top:2rem">
            Adj hozzá egy asztalt, és kezdheted.
          </p>
        </div>
      </div>

      <div class="eszk-gombsor">
        <button type="button" class="gomb gomb-halk" id="nyomtat">Nyomtatom</button>
        <button type="button" class="gomb gomb-halk" id="urit">Kezdem elölről</button>
      </div>
      <div class="eszk-hiba" id="hiba"></div>

      <div class="mentes-doboz">
        <h2>Elmentenéd?</h2>
        <p>
          A böngésződ megjegyzi, amit csináltál, de egy másik gépen már nem
          lesz meg. Ha megadod az e-mail címed, elküldjük magunknak is — és ha
          később kértek tőlünk esküvői oldalt, ez a beosztás már készen vár
          benne. Mást nem kezdünk vele, és nem küldünk reklámot.
        </p>
        <form class="mentes-urlap" id="mentes">
          <input type="email" id="mentes-email" placeholder="az e-mail címed" required>
          <input type="text" id="mentes-nev" placeholder="a nevetek (nem kötelező)">
          <input class="rejtve" type="text" id="mez" tabindex="-1" autocomplete="off"
                 aria-hidden="true">
          <button type="submit" class="gomb gomb-fo">Elmentem</button>
        </form>
        <div class="mentes-kesz" id="mentes-kesz" hidden>
          Megvan, köszönjük. Ha kérdésed van, írj: info@mmdigital.hu
        </div>
      </div>

      <div class="atvezeto">
        <p class="vezeto" style="margin-inline:auto">
          Ha azt szeretnétek, hogy a vendégek maguk jelezzenek vissza, és az
          ültetésrend magától kövesse — arra való az Esküszöm.
        </p>
        <p style="margin-top:20px">
          <a href="/" class="gomb gomb-fo">Megnézem, mit tud</a>
          <a href="/minta/" class="gomb gomb-halk">Minta esküvői oldal</a>
        </p>
      </div>
    </div>
  </div>
</section>

<script>
(function () {
  var KULCS = "eskuszom-ultetes";
  var allapot = { vendegek: [], asztalok: [] };
  var kijelolt = null;

  var kupac = document.getElementById("kupac");
  var asztalokDoboz = document.getElementById("asztalok");
  var uresInfo = document.getElementById("ures-info");
  var kupacInfo = document.getElementById("kupac-info");
  var hiba = document.getElementById("hiba");

  /* ── tárolás ── */
  function ment() {
    try { localStorage.setItem(KULCS, JSON.stringify(allapot)); } catch (e) {}
  }
  function betolt() {
    try {
      var t = JSON.parse(localStorage.getItem(KULCS) || "null");
      if (t && Array.isArray(t.vendegek) && Array.isArray(t.asztalok)) allapot = t;
    } catch (e) {}
  }

  function biztonsagos(sz) {
    var d = document.createElement("div");
    d.textContent = String(sz == null ? "" : sz);
    return d.innerHTML;
  }

  /* ── kirajzolás ── */
  function rajzol() {
    var ulok = [];
    allapot.asztalok.forEach(function (a) { ulok = ulok.concat(a.kik); });
    var szabad = allapot.vendegek.filter(function (v) { return ulok.indexOf(v) < 0; });

    kupac.innerHTML = szabad.map(function (v) {
      return '<span class="vendeg' + (kijelolt === v ? " kijelolt" : "") +
             '" draggable="true" data-nev="' + biztonsagos(v) + '">' + biztonsagos(v) + "</span>";
    }).join("");

    kupacInfo.textContent = allapot.vendegek.length === 0
      ? ""
      : szabad.length === 0
        ? "Mindenkinek van helye."
        : szabad.length + " vendégnek még nincs helye. Koppints rá, aztán az asztalra.";

    asztalokDoboz.innerHTML = allapot.asztalok.map(function (a, i) {
      var telt = a.kik.length >= a.fo;
      return '<div class="asztal' + (telt ? " telt" : "") + '" data-i="' + i + '">' +
        '<div class="asztal-fej">' +
          '<span class="asztal-nev">' + biztonsagos(a.nev) + "</span>" +
          '<span><span class="asztal-szam">' + a.kik.length + "/" + a.fo + "</span> " +
          '<button type="button" class="asztal-torol" data-torol="' + i + '" ' +
          'aria-label="Asztal törlése">×</button></span>' +
        "</div>" +
        a.kik.map(function (v) {
          return '<span class="vendeg" draggable="true" data-nev="' + biztonsagos(v) +
                 '" data-asztal="' + i + '">' + biztonsagos(v) + "</span>";
        }).join(" ") +
      "</div>";
    }).join("");

    uresInfo.hidden = allapot.asztalok.length > 0;
    ment();
  }

  /* ── vendégek beolvasása ── */
  document.getElementById("betolt").addEventListener("click", function () {
    var sorok = document.getElementById("nevek").value
      .split(/[\\n;]+/).map(function (s) { return s.trim(); })
      .filter(function (s) { return s.length > 0 && s.length < 80; });
    // Az azonos neveket megkülönböztetjük, hogy ne tűnjön el a második
    var latott = {};
    allapot.vendegek = sorok.map(function (n) {
      latott[n] = (latott[n] || 0) + 1;
      return latott[n] > 1 ? n + " (" + latott[n] + ")" : n;
    });
    // A már leültetett, de törölt neveket kivesszük az asztalokból
    allapot.asztalok.forEach(function (a) {
      a.kik = a.kik.filter(function (v) { return allapot.vendegek.indexOf(v) >= 0; });
    });
    rajzol();
  });

  /* ── asztal hozzáadása ── */
  document.getElementById("asztal-hozzaad").addEventListener("click", function () {
    var nev = document.getElementById("uj-asztal-nev").value.trim()
           || (allapot.asztalok.length + 1) + ". asztal";
    var fo = Math.max(1, Math.min(30, Number(document.getElementById("uj-asztal-fo").value) || 8));
    allapot.asztalok.push({ nev: nev.slice(0, 40), fo: fo, kik: [] });
    document.getElementById("uj-asztal-nev").value = "";
    rajzol();
  });

  /* ── ültetés: koppintással és húzással is ── */
  function ultet(nev, asztalIndex) {
    hiba.textContent = "";
    allapot.asztalok.forEach(function (a) {
      a.kik = a.kik.filter(function (v) { return v !== nev; });
    });
    if (asztalIndex !== null) {
      var a = allapot.asztalok[asztalIndex];
      if (a.kik.length >= a.fo) {
        hiba.textContent = "Ez az asztal megtelt. Vegyél el valakit, vagy növeld a létszámot.";
        rajzol();
        return;
      }
      a.kik.push(nev);
    }
    kijelolt = null;
    rajzol();
  }

  document.addEventListener("click", function (e) {
    var torol = e.target.closest("[data-torol]");
    if (torol) {
      var i = Number(torol.dataset.torol);
      allapot.asztalok.splice(i, 1);
      rajzol();
      return;
    }
    var v = e.target.closest(".vendeg");
    if (v) {
      // Ha asztalnál ül, koppintásra visszakerül a kupacba
      if (v.dataset.asztal !== undefined) { ultet(v.dataset.nev, null); return; }
      kijelolt = kijelolt === v.dataset.nev ? null : v.dataset.nev;
      rajzol();
      return;
    }
    var a = e.target.closest(".asztal");
    if (a && kijelolt) { ultet(kijelolt, Number(a.dataset.i)); }
  });

  document.addEventListener("dragstart", function (e) {
    var v = e.target.closest(".vendeg");
    if (!v) return;
    e.dataTransfer.setData("text/plain", v.dataset.nev);
    v.classList.add("fogott");
  });
  document.addEventListener("dragend", function (e) {
    var v = e.target.closest(".vendeg");
    if (v) v.classList.remove("fogott");
  });
  document.addEventListener("dragover", function (e) {
    var a = e.target.closest(".asztal");
    if (a) { e.preventDefault(); a.classList.add("celzott"); }
  });
  document.addEventListener("dragleave", function (e) {
    var a = e.target.closest(".asztal");
    if (a) a.classList.remove("celzott");
  });
  document.addEventListener("drop", function (e) {
    var a = e.target.closest(".asztal");
    if (!a) return;
    e.preventDefault();
    a.classList.remove("celzott");
    ultet(e.dataTransfer.getData("text/plain"), Number(a.dataset.i));
  });

  document.getElementById("nyomtat").addEventListener("click", function () { window.print(); });
  document.getElementById("urit").addEventListener("click", function () {
    allapot = { vendegek: [], asztalok: [] };
    document.getElementById("nevek").value = "";
    rajzol();
  });

  /* ── mentés e-maillel ── */
  document.getElementById("mentes").addEventListener("submit", async function (e) {
    e.preventDefault();
    hiba.textContent = "";
    var gomb = e.target.querySelector("button");
    gomb.disabled = true;
    gomb.textContent = "Mentjük…";
    try {
      var v = await fetch("${ALAP}/api/eskuvo/erdeklodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("mentes-email").value,
          nev: document.getElementById("mentes-nev").value,
          forras: "ultetes",
          adat: allapot,
          honeypot: document.getElementById("mez").value,
        }),
      });
      var j = await v.json();
      if (!v.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült.");
      document.getElementById("mentes").hidden = true;
      document.getElementById("mentes-kesz").hidden = false;
    } catch (err) {
      hiba.textContent = String(err.message || err);
      gomb.disabled = false;
      gomb.textContent = "Elmentem";
    }
  });

  betolt();
  rajzol();
})();
</script>`,
  });
}

export async function onRequest() {
  return new Response(lap(), {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
