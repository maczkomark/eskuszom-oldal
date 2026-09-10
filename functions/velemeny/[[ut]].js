// /velemeny/<token>/ — itt írja meg a pár, hogy sikerült.
//
// A linket levélben kapják, az esküvő után pár héttel. Rövidnek kell
// lennie: öt csillag, egy szövegdoboz, egy gomb. Aki hosszú űrlapot lát,
// bezárja.
import { ALAP, ki, oldal, hibaOldal } from "../_kozos.js";

const STILUS = `
  .vel { max-width: 560px; margin: 0 auto; padding-bottom: 90px; }
  .vel-fej { text-align: center; padding-bottom: 32px; }
  .vel-fej h1 { font-family: var(--serif); font-weight: 400;
                font-size: clamp(28px, 5vw, 42px); line-height: 1.15;
                margin-bottom: 14px; }
  .vel-doboz { background: var(--feher); border: 1px solid var(--vonal);
               border-radius: 18px; padding: clamp(1.4rem, 4vw, 2.2rem); }

  .csillagok { display: flex; justify-content: center; gap: .4rem;
               margin: 0 0 1.4rem; }
  .csillag { background: none; border: 0; cursor: pointer; padding: .2rem;
             color: var(--vonal); transition: color .15s ease, transform .15s ease; }
  .csillag svg { display: block; }
  .csillag:hover { transform: scale(1.12); }
  .csillag.aktiv { color: #d9a441; }

  .vel-doboz label { display: block; font-size: .84rem; color: var(--tinta-lagy);
                     margin-bottom: .4rem; }
  .vel-doboz textarea, .vel-doboz input {
    width: 100%; font: inherit; font-size: .95rem;
    padding: .85rem 1rem; border-radius: 12px;
    border: 1px solid var(--vonal); background: var(--papir); color: var(--tinta);
  }
  .vel-doboz textarea { min-height: 150px; resize: vertical; line-height: 1.6; }
  .vel-doboz textarea:focus, .vel-doboz input:focus {
    outline: none; border-color: var(--mauve-vilagos); background: var(--feher);
  }
  .vel-mezo + .vel-mezo { margin-top: 1.1rem; }
  .sugo { font-size: .78rem; color: var(--tinta-halvany); margin-top: .35rem; }

  .kuldes { width: 100%; justify-content: center; margin-top: 1.4rem; }
  .vel-hiba { margin-top: .9rem; font-size: .88rem; color: #a4453d;
              background: #fdf1f0; border: 1px solid #f2d5d2;
              border-radius: 10px; padding: .7rem .9rem; }
  .vel-hiba:empty { display: none; }

  .kesz { text-align: center; padding: 2rem 0; }
  .kesz .pipa { width: 56px; height: 56px; border-radius: 50%;
                background: #eaf3ec; color: #3f7a4f; display: grid;
                place-items: center; margin: 0 auto 1.2rem; }
`;

const CSILLAG_SVG = '<svg width="30" height="30" viewBox="0 0 24 24" fill="currentColor">'
  + '<path d="M12 2l2.9 6.3 6.6.8-4.9 4.6 1.3 6.6L12 17l-5.9 3.3 1.3-6.6L2.5 9.1l6.6-.8z"/></svg>';

function urlapOldal(v, token) {
  const megirtak = v.megirtak;

  return oldal({
    cim: "Írjatok pár mondatot — Esküszöm",
    leiras: "Hogy sikerült? Pár mondat sokat segít azoknak, akik most keresgélnek.",
    url: `https://eskuszom.hu/velemeny/${token}/`,
    robots: "noindex, nofollow",
    fejlecek: `<style>${STILUS}</style>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="vel">
      <div class="vel-fej">
        <div class="folcim">${ki(v.par)}</div>
        <h1>${megirtak ? "Köszönjük!" : "Hogy sikerült?"}</h1>
        <p class="vezeto">
          ${megirtak
            ? "Megkaptuk, amit írtatok. Mielőtt kikerülne az oldalra, átnézzük — ha közben meggondolnátok magatokat, elég szólnotok."
            : "Két-három mondat is sokat segít azoknak, akik most keresgélnek. Azt is megírhatjátok, ami nem tetszett — abból mi tanulunk."}
        </p>
      </div>

      ${megirtak ? `
      <div class="vel-doboz kesz">
        <div class="pipa">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
               stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>
        </div>
        <p style="color:var(--tinta-lagy);line-height:1.7">
          ${v.szoveg ? `„${ki(v.szoveg)}"` : "Megvan."}
        </p>
        ${v.kint ? '<p class="sugo" style="margin-top:1rem">Ez már kint van az oldalunkon. Köszönjük!</p>' : ""}
      </div>` : `
      <form id="vel-urlap" class="vel-doboz">
        <div class="csillagok" id="csillagok">
          ${[1, 2, 3, 4, 5].map((i) =>
            `<button type="button" class="csillag" data-ertek="${i}"
                     aria-label="${i} csillag">${CSILLAG_SVG}</button>`).join("\n          ")}
        </div>

        <div class="vel-mezo">
          <label for="szoveg">Mit írnátok róla?</label>
          <textarea id="szoveg" name="szoveg" required
                    placeholder="Például: mi volt a legnagyobb segítség, mit szóltak a vendégek, mit csinálnátok másképp…"></textarea>
          <div class="sugo">Legalább egy-két mondat.</div>
        </div>

        <div class="vel-mezo">
          <label for="nev">Hogy jelenjen meg a nevetek?</label>
          <input id="nev" name="nev" value="${ki(v.par)}" autocomplete="off">
          <div class="sugo">Ha csak keresztnevet szeretnétek, írjátok át.</div>
        </div>

        <button type="submit" class="gomb gomb-fo kuldes" id="kuldes">Elküldöm</button>
        <div class="vel-hiba" id="hiba"></div>

        <p class="sugo" style="margin-top:1rem;text-align:center">
          Semmi nem kerül ki azonnal — előbb átnézzük.
        </p>
      </form>`}
    </div>
  </div>
</section>

${megirtak ? "" : `
<script>
(function () {
  var urlap = document.getElementById("vel-urlap");
  var gomb = document.getElementById("kuldes");
  var hiba = document.getElementById("hiba");
  var csillagok = [].slice.call(document.querySelectorAll(".csillag"));
  var ertek = 0;

  function rajzol(n) {
    csillagok.forEach(function (cs, i) {
      cs.classList.toggle("aktiv", i < n);
    });
  }
  csillagok.forEach(function (cs) {
    cs.addEventListener("click", function () {
      ertek = Number(cs.dataset.ertek);
      rajzol(ertek);
    });
    cs.addEventListener("mouseenter", function () { rajzol(Number(cs.dataset.ertek)); });
    cs.addEventListener("mouseleave", function () { rajzol(ertek); });
  });

  urlap.addEventListener("submit", async function (e) {
    e.preventDefault();
    hiba.textContent = "";
    var szoveg = document.getElementById("szoveg").value.trim();
    if (szoveg.length < 15) {
      hiba.textContent = "Írjatok legalább egy-két mondatot.";
      return;
    }
    gomb.disabled = true;
    gomb.textContent = "Küldjük…";
    try {
      var v = await fetch("${ALAP}/api/eskuvo/velemeny?token=" + encodeURIComponent("${token}"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          szoveg: szoveg,
          csillag: ertek || null,
          nev: document.getElementById("nev").value.trim(),
        }),
      });
      var j = await v.json();
      if (!v.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült elküldeni.");
      window.location.reload();
    } catch (err) {
      hiba.textContent = String(err.message || err);
      gomb.disabled = false;
      gomb.textContent = "Elküldöm";
    }
  });
})();
</script>`}`,
  });
}

export async function onRequest({ params }) {
  const reszek = (params.ut ?? []).filter(Boolean);
  if (reszek.length !== 1) {
    return hibaOldal("Ehhez az oldalhoz a levélben küldött link kell.", 404);
  }
  const token = reszek[0];

  try {
    const v = await fetch(
      `${ALAP}/api/eskuvo/velemeny?token=${encodeURIComponent(token)}`,
      { headers: { Accept: "application/json" } },
    );
    if (v.status === 404) {
      return hibaOldal("Ez a link nem érvényes. Lehet, hogy elírás csúszott bele.", 404);
    }
    if (!v.ok) throw new Error(String(v.status));
    const j = await v.json();
    if (!j?.velemeny) throw new Error("ures");

    return new Response(urlapOldal(j.velemeny, token), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return hibaOldal("Most nem érjük el az oldalt. Próbáljátok pár perc múlva.", 503);
  }
}
