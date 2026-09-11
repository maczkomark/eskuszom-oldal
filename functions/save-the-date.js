// Ingyenes „save the date" készítő.
//
// MIÉRT: a dátumjelző az első dolog, amit egy pár kiküld — hónapokkal a
// meghívó előtt. Aki ezt keresi, még a legelején tart, és épp akkor
// találkozik velünk, amikor a döntéseit hozza.
//
// Teljesen ingyenes és regisztráció nélküli. A kész képet a böngésző
// rajzolja meg és tölti le — semmi nem megy át a szerverünkön, hacsak a
// pár maga nem kéri, hogy elmentsük.
import { ALAP, ki, oldal } from "./_kozos.js";

const STILUS = `
  .std { max-width: 980px; margin: 0 auto; padding-bottom: 90px; }
  .std-fej { text-align: center; padding-bottom: 34px; }
  .std-fej h1 { font-family: var(--serif); font-weight: 400;
                font-size: clamp(30px, 5vw, 46px); line-height: 1.15;
                margin-bottom: 14px; }
  .std-fej .vezeto { max-width: 54ch; margin: 0 auto; }

  .std-racs { display: grid; gap: 1.4rem; grid-template-columns: 330px 1fr;
              align-items: start; }
  @media (max-width: 820px) { .std-racs { grid-template-columns: 1fr; } }

  .std-doboz { background: var(--feher); border: 1px solid var(--vonal);
               border-radius: 16px; padding: 1.3rem; }
  .std-doboz label { display: block; font-size: .82rem; color: var(--tinta-lagy);
                     margin-top: .9rem; margin-bottom: .3rem; }
  .std-doboz label:first-of-type { margin-top: 0; }
  .std input, .std select {
    width: 100%; font: inherit; font-size: .92rem;
    padding: .6rem .8rem; border-radius: 10px;
    border: 1px solid var(--vonal); background: var(--papir); color: var(--tinta);
  }
  .std input:focus { outline: none; border-color: var(--mauve-vilagos);
                     background: var(--feher); }

  .stilusok { display: grid; grid-template-columns: repeat(3, 1fr); gap: .5rem;
              margin-top: .4rem; }
  .stilus-gomb { font: inherit; font-size: .78rem; cursor: pointer;
                 padding: .5rem .3rem; border-radius: 10px;
                 border: 1px solid var(--vonal); background: var(--papir);
                 color: var(--tinta-lagy); }
  .stilus-gomb.aktiv { border-color: var(--mauve); background: #fdf9fa;
                       color: var(--mauve); }

  .std-elonezet { display: flex; flex-direction: column; align-items: center;
                  gap: 1rem; }
  #vaszon { max-width: 100%; height: auto; border-radius: 12px;
            box-shadow: 0 14px 40px rgba(60,40,50,.14); }

  .std-gombsor { display: flex; flex-wrap: wrap; gap: .6rem; justify-content: center; }
  .std-hiba { font-size: .85rem; color: #a4453d; text-align: center; }
  .std-hiba:empty { display: none; }

  .mentes-doboz { margin-top: 1.8rem; background: var(--papir-melyebb);
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
    cim: "Ingyenes save the date készítő – Esküszöm",
    leiras: "Készíts dátumjelzőt az esküvődre pár másodperc alatt, ingyen. "
          + "Írd be a neveteket és a dátumot, töltsd le a képet, küldd el.",
    url: "https://eskuszom.hu/save-the-date/",
    fejlecek: `<style>${STILUS}</style>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="std">
      <div class="std-fej">
        <div class="folcim">Ingyenes eszköz</div>
        <h1>Save the date</h1>
        <p class="vezeto">
          Jelezzétek előre a dátumot, hogy mindenki be tudja írni a naptárba.
          Írjátok be a neveteket, válasszatok stílust, és töltsétek le a képet —
          ingyen, regisztráció nélkül.
        </p>
      </div>

      <div class="std-racs">
        <div class="std-doboz">
          <label for="nevek">A nevetek</label>
          <input id="nevek" value="Zsófi &amp; Marci" maxlength="60">

          <label for="datum">A dátum</label>
          <input id="datum" type="date">

          <label for="helyszin">Helyszín (nem kötelező)</label>
          <input id="helyszin" placeholder="Szombathely" maxlength="60">

          <label for="alcim">Alsó sor</label>
          <input id="alcim" value="A meghívó hamarosan érkezik" maxlength="60">

          <label>Stílus</label>
          <div class="stilusok" id="stilusok">
            <button type="button" class="stilus-gomb aktiv" data-stilus="meleg">Meleg</button>
            <button type="button" class="stilus-gomb" data-stilus="sotet">Sötét</button>
            <button type="button" class="stilus-gomb" data-stilus="zold">Zöld</button>
          </div>

          <label>Forma</label>
          <div class="stilusok" id="formak">
            <button type="button" class="stilus-gomb aktiv" data-forma="negyzet">Négyzet</button>
            <button type="button" class="stilus-gomb" data-forma="story">Story</button>
            <button type="button" class="stilus-gomb" data-forma="fekvo">Fekvő</button>
          </div>
        </div>

        <div class="std-elonezet">
          <canvas id="vaszon" width="1080" height="1080"></canvas>
          <div class="std-gombsor">
            <button type="button" class="gomb gomb-fo" id="letolt">Letöltöm a képet</button>
            <button type="button" class="gomb gomb-halk" id="masol">Másolom</button>
          </div>
          <div class="std-hiba" id="hiba"></div>
        </div>
      </div>

      <div class="mentes-doboz">
        <h2>Küldjük e-mailben is?</h2>
        <p>
          Ha megadod a címed, elküldjük magunknak, és szólunk, amikor eljön a
          meghívók ideje — plusz egy rövid listát arról, mi szokott ilyenkor
          kimaradni. Reklámot nem küldünk, és bármikor szólhatsz, hogy ne írjunk.
        </p>
        <form class="mentes-urlap" id="mentes">
          <input type="email" id="mentes-email" placeholder="az e-mail címed" required>
          <input class="rejtve" type="text" id="mez" tabindex="-1" autocomplete="off"
                 aria-hidden="true">
          <button type="submit" class="gomb gomb-fo">Kérem</button>
        </form>
        <div class="mentes-kesz" id="mentes-kesz" hidden>
          Megvan, köszönjük.
        </div>
      </div>

      <div class="atvezeto">
        <p class="vezeto" style="margin-inline:auto">
          A dátumjelző után jön a nehezebb rész: vendéglista, visszajelzések,
          ültetésrend. Arra való az Esküszöm.
        </p>
        <p style="margin-top:20px">
          <a href="/" class="gomb gomb-fo">Megnézem, mit tud</a>
          <a href="/ultetesrend-tervezo/" class="gomb gomb-halk">Ültetésrend-tervező</a>
        </p>
      </div>
    </div>
  </div>
</section>

<script>
(function () {
  var vaszon = document.getElementById("vaszon");
  var ctx = vaszon.getContext("2d");
  var stilus = "meleg";
  var forma = "negyzet";

  var SZINEK = {
    meleg: { hatter: "#faf7f5", fo: "#8c6b74", tinta: "#2f2a33", halk: "#9a8f95" },
    sotet: { hatter: "#2f2a33", fo: "#c9aeb4", tinta: "#faf7f5", halk: "#9a8f95" },
    zold:  { hatter: "#f4f6f2", fo: "#7d8a6f", tinta: "#2f3a2c", halk: "#8d9a86" },
  };
  var FORMAK = {
    negyzet: [1080, 1080],
    story:   [1080, 1920],
    fekvo:   [1600, 900],
  };

  var HONAP = ["január","február","március","április","május","június",
               "július","augusztus","szeptember","október","november","december"];

  function datumSzoveg() {
    var v = document.getElementById("datum").value;
    if (!v) return "";
    var r = v.split("-");
    if (r.length !== 3) return "";
    return r[0] + ". " + HONAP[Number(r[1]) - 1] + " " + Number(r[2]) + ".";
  }

  /** Szöveg tördelése, hogy ne lógjon ki a képből. */
  function tordel(szoveg, maxSzelesseg) {
    var szavak = String(szoveg).split(/\\s+/);
    var sorok = [];
    var sor = "";
    szavak.forEach(function (sz) {
      var proba = sor ? sor + " " + sz : sz;
      if (ctx.measureText(proba).width > maxSzelesseg && sor) {
        sorok.push(sor);
        sor = sz;
      } else {
        sor = proba;
      }
    });
    if (sor) sorok.push(sor);
    return sorok;
  }

  function rajzol() {
    var m = FORMAK[forma];
    vaszon.width = m[0];
    vaszon.height = m[1];
    var sz = SZINEK[stilus];
    var W = vaszon.width, H = vaszon.height;
    var kicsi = Math.min(W, H);

    ctx.fillStyle = sz.hatter;
    ctx.fillRect(0, 0, W, H);

    // finom keret
    ctx.strokeStyle = sz.fo;
    ctx.globalAlpha = .45;
    ctx.lineWidth = Math.max(2, kicsi * .003);
    var b = kicsi * .055;
    ctx.strokeRect(b, b, W - b * 2, H - b * 2);
    ctx.globalAlpha = 1;

    ctx.textAlign = "center";

    // felső felirat
    ctx.fillStyle = sz.fo;
    ctx.font = (kicsi * .028) + "px 'Inter', system-ui, sans-serif";
    var felirat = "S A V E   T H E   D A T E";
    ctx.fillText(felirat, W / 2, H * .22);

    // nevek
    ctx.fillStyle = sz.fo;
    var nevMeret = kicsi * .115;
    ctx.font = nevMeret + "px 'Cormorant Garamond', Georgia, serif";
    var nevek = document.getElementById("nevek").value || " ";
    var sorok = tordel(nevek, W * .78);
    // ha két sorba tört, kisebb betű kell, hogy ne lógjon egymásba
    if (sorok.length > 1) {
      nevMeret = kicsi * .085;
      ctx.font = nevMeret + "px 'Cormorant Garamond', Georgia, serif";
      sorok = tordel(nevek, W * .78);
    }
    var y = H * .38;
    sorok.forEach(function (s) {
      ctx.fillText(s, W / 2, y);
      y += nevMeret * 1.05;
    });

    // vonal
    ctx.strokeStyle = sz.fo;
    ctx.globalAlpha = .5;
    ctx.lineWidth = Math.max(1, kicsi * .0018);
    ctx.beginPath();
    ctx.moveTo(W * .38, y + kicsi * .015);
    ctx.lineTo(W * .62, y + kicsi * .015);
    ctx.stroke();
    ctx.globalAlpha = 1;

    // dátum
    ctx.fillStyle = sz.tinta;
    ctx.font = (kicsi * .05) + "px 'Cormorant Garamond', Georgia, serif";
    var d = datumSzoveg();
    if (d) ctx.fillText(d, W / 2, y + kicsi * .09);

    // helyszín
    var hely = document.getElementById("helyszin").value.trim();
    if (hely) {
      ctx.fillStyle = sz.halk;
      ctx.font = (kicsi * .028) + "px 'Inter', system-ui, sans-serif";
      ctx.fillText(hely, W / 2, y + kicsi * .145);
    }

    // alsó sor
    var alcim = document.getElementById("alcim").value.trim();
    if (alcim) {
      ctx.fillStyle = sz.halk;
      ctx.font = (kicsi * .026) + "px 'Inter', system-ui, sans-serif";
      ctx.fillText(alcim, W / 2, H * .86);
    }
  }

  ["nevek", "datum", "helyszin", "alcim"].forEach(function (id) {
    document.getElementById(id).addEventListener("input", rajzol);
  });
  document.getElementById("stilusok").addEventListener("click", function (e) {
    var g = e.target.closest("[data-stilus]");
    if (!g) return;
    stilus = g.dataset.stilus;
    [].forEach.call(this.children, function (x) { x.classList.toggle("aktiv", x === g); });
    rajzol();
  });
  document.getElementById("formak").addEventListener("click", function (e) {
    var g = e.target.closest("[data-forma]");
    if (!g) return;
    forma = g.dataset.forma;
    [].forEach.call(this.children, function (x) { x.classList.toggle("aktiv", x === g); });
    rajzol();
  });

  document.getElementById("letolt").addEventListener("click", function () {
    var a = document.createElement("a");
    a.download = "save-the-date.png";
    a.href = vaszon.toDataURL("image/png");
    a.click();
  });

  document.getElementById("masol").addEventListener("click", function () {
    var gomb = this;
    vaszon.toBlob(async function (b) {
      try {
        await navigator.clipboard.write([new ClipboardItem({ "image/png": b })]);
        var e = gomb.textContent;
        gomb.textContent = "Kimásolva";
        setTimeout(function () { gomb.textContent = e; }, 1800);
      } catch (err) {
        document.getElementById("hiba").textContent =
          "A másolás ebben a böngészőben nem megy — töltsd le inkább.";
      }
    });
  });

  document.getElementById("mentes").addEventListener("submit", async function (e) {
    e.preventDefault();
    var gomb = e.target.querySelector("button");
    gomb.disabled = true;
    gomb.textContent = "Küldjük…";
    try {
      var v = await fetch("${ALAP}/api/eskuvo/erdeklodo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: document.getElementById("mentes-email").value,
          nev: document.getElementById("nevek").value,
          datum: document.getElementById("datum").value,
          forras: "savethedate",
          honeypot: document.getElementById("mez").value,
        }),
      });
      var j = await v.json();
      if (!v.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült.");
      document.getElementById("mentes").hidden = true;
      document.getElementById("mentes-kesz").hidden = false;
    } catch (err) {
      document.getElementById("hiba").textContent = String(err.message || err);
      gomb.disabled = false;
      gomb.textContent = "Kérem";
    }
  });

  // A betűtípusok betöltése után újrarajzolunk, különben tartalék betűvel készül
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(rajzol);
  }
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
