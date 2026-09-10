// /megrendeles/ és /megrendeles/<token>/ — megrendelés és utalás.
//
// Kártyás fizetés még nincs, ezért az átutalást vezetjük végig rendesen:
// a pár megrendel, kap egy közleményt, elutalja, jelzi, mi igazoljuk.
// A legfontosabb, hogy egy pillanatra se érezze úgy, hogy elküldött egy
// űrlapot a semmibe — ezért van saját állapotlapja, amit bármikor megnyithat.
import { ALAP, ki, oldal, hibaOldal } from "../_kozos.js";

const STILUS = `
  .rendel { max-width: 660px; margin: 0 auto; padding-bottom: 90px; }
  .rendel-fej { text-align: center; padding-bottom: 34px; }
  .rendel-fej h1 { font-family: var(--serif); font-weight: 400;
                   font-size: clamp(30px, 5vw, 46px); line-height: 1.15;
                   margin-bottom: 14px; }
  .rendel-fej .vezeto { max-width: 52ch; margin: 0 auto; }

  .doboz { background: var(--feher); border: 1px solid var(--vonal);
           border-radius: 18px; padding: clamp(1.4rem, 4vw, 2.2rem); }
  .doboz + .doboz { margin-top: 1.1rem; }

  .csoport { margin-bottom: 1.6rem; }
  .csoport:last-child { margin-bottom: 0; }
  .csoport h2 { font-family: var(--serif); font-weight: 400; font-size: 1.35rem;
                margin-bottom: .35rem; }
  .csoport .halk { color: var(--tinta-halvany); font-size: .85rem;
                   margin-bottom: 1.1rem; }

  .mezok { display: grid; gap: .9rem; }
  .mezok.ketto { grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { .mezok.ketto { grid-template-columns: 1fr; } }

  .mezo label { display: block; font-size: .82rem; color: var(--tinta-lagy);
                margin-bottom: .35rem; }
  .mezo input {
    width: 100%; font: inherit; font-size: .95rem;
    padding: .8rem .95rem; border-radius: 11px;
    border: 1px solid var(--vonal); background: var(--papir);
    color: var(--tinta); transition: border-color .2s ease, background .2s ease;
  }
  .mezo input:focus { outline: none; border-color: var(--mauve-vilagos);
                      background: var(--feher); }
  .mezo .sugo { font-size: .76rem; color: var(--tinta-halvany); margin-top: .3rem; }
  .mezcsak-robot { position: absolute; left: -9999px; }

  .ar-sor { display: flex; align-items: baseline; justify-content: space-between;
            gap: 1rem; padding: 1.1rem 0; border-top: 1px solid var(--vonal);
            margin-top: 1.4rem; }
  .ar-sor .osszeg { font-family: var(--serif); font-size: 1.9rem; color: var(--mauve); }

  .kuldes { width: 100%; justify-content: center; margin-top: .4rem; }
  .urlap-hiba { margin-top: .9rem; font-size: .88rem; color: #a4453d;
                background: #fdf1f0; border: 1px solid #f2d5d2;
                border-radius: 10px; padding: .7rem .9rem; }
  .urlap-hiba:empty { display: none; }

  /* ── állapotlap ── */
  .utalas { display: grid; gap: .7rem; margin: 1.2rem 0 0; }
  .utalas-sor { display: flex; align-items: center; gap: .8rem;
                padding: .85rem 1rem; background: var(--papir);
                border: 1px solid var(--vonal); border-radius: 12px; }
  .utalas-sor .cimke { font-size: .78rem; color: var(--tinta-halvany);
                       width: 120px; flex: 0 0 auto; }
  .utalas-sor .ertek { font-size: 1rem; flex: 1; min-width: 0; word-break: break-all; }
  .utalas-sor.kiemelt { border-color: var(--mauve-vilagos); background: #fdf9fa; }
  .utalas-sor.kiemelt .ertek { font-family: var(--serif); font-size: 1.5rem;
                               color: var(--mauve); letter-spacing: .04em; }
  .masol { font: inherit; font-size: .76rem; cursor: pointer;
           border: 1px solid var(--vonal); background: var(--feher);
           color: var(--tinta-lagy); border-radius: 999px;
           padding: .35rem .8rem; flex: 0 0 auto; }
  .masol:hover { border-color: var(--mauve-vilagos); color: var(--mauve); }

  .lepesek { display: grid; gap: 0; margin: 1.6rem 0 0; }
  .lepes { display: flex; gap: .9rem; padding-bottom: 1.4rem; position: relative; }
  .lepes:last-child { padding-bottom: 0; }
  .lepes::before { content: ""; position: absolute; left: 13px; top: 30px; bottom: 0;
                   width: 1px; background: var(--vonal); }
  .lepes:last-child::before { display: none; }
  .lepes .jel { width: 27px; height: 27px; border-radius: 50%; flex: 0 0 auto;
                display: grid; place-items: center; font-size: .8rem;
                background: var(--papir-melyebb); color: var(--tinta-halvany);
                border: 1px solid var(--vonal); position: relative; z-index: 2; }
  .lepes.kesz .jel { background: var(--mauve); color: var(--feher);
                     border-color: var(--mauve); }
  .lepes.most .jel { background: var(--feher); color: var(--mauve);
                     border-color: var(--mauve); }
  .lepes .szoveg strong { display: block; font-weight: 500; font-size: .96rem;
                          margin-bottom: .15rem; }
  .lepes .szoveg p { font-size: .86rem; color: var(--tinta-lagy); line-height: 1.6; }
  .lepes .mikor { font-size: .76rem; color: var(--tinta-halvany); margin-top: .25rem; }

  .allapot-jel { display: inline-flex; align-items: center; gap: .5rem;
                 font-size: .82rem; padding: .4rem .9rem; border-radius: 999px;
                 background: var(--papir-melyebb); color: var(--tinta-lagy); }
  .allapot-jel.kesz { background: #eaf3ec; color: #3f7a4f; }
`;

/* ═══════════════════════════════════════════════ a megrendelő ═══ */

function urlapOldal() {
  return oldal({
    cim: "Megrendelés – Esküszöm esküvői weboldal",
    leiras: "Rendeljétek meg az esküvői weboldalatokat: egyszeri 45 000 Ft, "
          + "banki átutalással. Két nap alatt kész, havidíj nincs.",
    url: "https://eskuszom.hu/megrendeles/",
    fejlecek: `<meta name="robots" content="noindex, follow">
<style>${STILUS}</style>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="rendel">
      <div class="rendel-fej">
        <div class="folcim">Megrendelés</div>
        <h1>Kezdjük el.</h1>
        <p class="vezeto">
          Néhány adat, és küldjük az utalási adatokat. Előleg nincs, kötbér nincs:
          ha megérkezett az összeg, két napon belül él az oldalatok.
        </p>
      </div>

      <form id="rendeles" class="doboz" novalidate>
        <div class="csoport">
          <h2>Rólatok</h2>
          <p class="halk">Ez kerül majd az oldalatokra — később bármit átírhattok.</p>
          <div class="mezok">
            <div class="mezo">
              <label for="couple_names">A nevetek *</label>
              <input id="couple_names" name="couple_names" required
                     placeholder="Zsófi és Marci" autocomplete="off">
            </div>
            <div class="mezok ketto">
              <div class="mezo">
                <label for="wedding_date">Az esküvő napja</label>
                <input id="wedding_date" name="wedding_date" type="date">
                <div class="sugo">Ha még nincs meg, hagyjátok üresen.</div>
              </div>
              <div class="mezo">
                <label for="cim_keres">Milyen címet szeretnétek?</label>
                <input id="cim_keres" name="cim_keres" placeholder="zsofiesmarci">
                <div class="sugo">Így: zsofiesmarci.eskuszom.hu</div>
              </div>
            </div>
          </div>
        </div>

        <div class="csoport">
          <h2>Kivel tartjuk a kapcsolatot?</h2>
          <p class="halk">Ide küldjük az utalási adatokat és a belépőt.</p>
          <div class="mezok">
            <div class="mezok ketto">
              <div class="mezo">
                <label for="contact_name">Név *</label>
                <input id="contact_name" name="contact_name" required
                       autocomplete="name" placeholder="Kovács Zsófia">
              </div>
              <div class="mezo">
                <label for="phone">Telefon</label>
                <input id="phone" name="phone" type="tel" autocomplete="tel"
                       placeholder="+36 30 123 4567">
              </div>
            </div>
            <div class="mezo">
              <label for="email">E-mail *</label>
              <input id="email" name="email" type="email" required
                     autocomplete="email" placeholder="zsofi@pelda.hu">
            </div>
          </div>
        </div>

        <div class="csoport">
          <h2>Számlázás</h2>
          <p class="halk">
            A számlát erre a névre és címre állítjuk ki. Ha nem adjátok meg,
            a fenti nevet használjuk, és utólag kérjük be a többit.
          </p>
          <div class="mezok">
            <div class="mezo">
              <label for="billing_name">Számlázási név</label>
              <input id="billing_name" name="billing_name" autocomplete="off">
            </div>
            <div class="mezok ketto">
              <div class="mezo">
                <label for="billing_zip">Irányítószám</label>
                <input id="billing_zip" name="billing_zip" inputmode="numeric"
                       autocomplete="postal-code" placeholder="9700">
              </div>
              <div class="mezo">
                <label for="billing_city">Város</label>
                <input id="billing_city" name="billing_city"
                       autocomplete="address-level2" placeholder="Szombathely">
              </div>
            </div>
            <div class="mezo">
              <label for="billing_address">Utca, házszám</label>
              <input id="billing_address" name="billing_address"
                     autocomplete="street-address">
            </div>
            <div class="mezo">
              <label for="tax_number">Adószám</label>
              <input id="tax_number" name="tax_number" placeholder="csak ha cégre kéritek">
            </div>
          </div>
        </div>

        <input class="mezcsak-robot" type="text" name="honeypot" tabindex="-1"
               autocomplete="off" aria-hidden="true">

        <div class="ar-sor">
          <div>
            <strong>Esküvői weboldal</strong>
            <div class="sugo">Egyszeri díj · nincs havidíj · nincs létszámkorlát</div>
          </div>
          <div class="osszeg">45 000 Ft</div>
        </div>

        <button type="submit" class="gomb gomb-fo kuldes" id="kuldes">
          Megrendelem
        </button>
        <div class="urlap-hiba" id="hiba"></div>

        <p class="sugo" style="margin-top:1rem;text-align:center">
          A megrendeléssel nem vonunk le semmit — a következő lépésben megkapjátok
          a számlaszámot és a közleményt, amivel utalni tudtok.
        </p>
      </form>
    </div>
  </div>
</section>

<script>
(function () {
  var urlap = document.getElementById("rendeles");
  var gomb = document.getElementById("kuldes");
  var hiba = document.getElementById("hiba");

  urlap.addEventListener("submit", async function (e) {
    e.preventDefault();
    hiba.textContent = "";
    gomb.disabled = true;
    gomb.textContent = "Küldjük…";

    var adat = {};
    new FormData(urlap).forEach(function (ertek, kulcs) { adat[kulcs] = ertek; });

    try {
      var valasz = await fetch("${ALAP}/api/eskuvo/megrendeles", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(adat),
      });
      var j = await valasz.json();
      if (!valasz.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült elküldeni.");
      window.location.href = "/megrendeles/" + j.token + "/";
    } catch (err) {
      hiba.textContent = String(err.message || err);
      gomb.disabled = false;
      gomb.textContent = "Megrendelem";
    }
  });
})();
</script>`,
  });
}

/* ═══════════════════════════════════════════════ az állapotlap ══ */

function sor(cimke, ertek, kiemelt) {
  return `<div class="utalas-sor${kiemelt ? " kiemelt" : ""}">
        <span class="cimke">${ki(cimke)}</span>
        <span class="ertek" id="m-${ki(cimke.toLowerCase().replace(/[^a-z]/g, ""))}">${ki(ertek)}</span>
        <button type="button" class="masol" data-ertek="${ki(ertek)}">Másolom</button>
      </div>`;
}

function allapotOldal(m, token) {
  const osszeg = Number(m.osszeg).toLocaleString("hu-HU") + " Ft";
  const fizetve = m.allapot === "fizetve";
  const jelezte = m.allapot === "jelezte" || fizetve;

  const lepes = (kesz, most, cim, szoveg, mikor) => `
        <div class="lepes${kesz ? " kesz" : most ? " most" : ""}">
          <span class="jel">${kesz ? "✓" : "•"}</span>
          <div class="szoveg">
            <strong>${ki(cim)}</strong>
            <p>${szoveg}</p>
            ${mikor ? `<div class="mikor">${ki(String(mikor).slice(0, 16))}</div>` : ""}
          </div>
        </div>`;

  return oldal({
    cim: "A megrendelésetek — Esküszöm",
    leiras: "A megrendelésetek állapota és az utalási adatok.",
    url: `https://eskuszom.hu/megrendeles/${token}/`,
    fejlecek: `<meta name="robots" content="noindex, nofollow">
<style>${STILUS}</style>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="rendel">
      <div class="rendel-fej">
        <div class="folcim">${ki(m.par)}</div>
        <h1>${fizetve ? "Megérkezett. Köszönjük!" : "Már csak egy utalás."}</h1>
        <p class="vezeto">
          ${fizetve
            ? "Nálunk a labda: elkészítjük az oldalatokat, és két napon belül jelentkezünk a saját címetekkel meg egy belépővel."
            : "Ezekkel az adatokkal tudtok utalni. A közlemény a legfontosabb — abból tudjuk, hogy a ti esküvőtökről van szó."}
        </p>
      </div>

      ${fizetve ? "" : `
      <div class="doboz">
        <div class="csoport" style="margin-bottom:0">
          <h2>Utalási adatok</h2>
          <p class="halk">Bármelyiket egy kattintással másolhatjátok.</p>
          <div class="utalas">
            ${sor("Kedvezményezett", m.bank.nev)}
            ${sor("Bank", m.bank.bank)}
            ${sor("Számlaszám", m.bank.szamla)}
            ${sor("Összeg", osszeg)}
            ${sor("Közlemény", m.ref, true)}
          </div>

          ${jelezte ? `
          <p style="margin-top:1.4rem">
            <span class="allapot-jel">Megkaptuk a jelzéseteket — nézzük a bankot.</span>
          </p>
          <p class="sugo" style="margin-top:.7rem">
            A jóváírás általában egy munkanap, hétvégén hosszabb is lehet.
            Amint megérkezett, e-mailben szólunk. Nektek addig nincs teendőtök.
          </p>` : `
          <button type="button" class="gomb gomb-fo kuldes" id="utaltam"
                  style="margin-top:1.6rem">
            Elutaltam
          </button>
          <p class="sugo" style="margin-top:.7rem;text-align:center">
            Nyomjátok meg, ha elindítottátok az utalást — így tudjuk, hogy számítsunk rá.
          </p>
          <div class="urlap-hiba" id="hiba"></div>`}
        </div>
      </div>`}

      <div class="doboz">
        <div class="lepesek">
          ${lepes(true, false, "Megrendeltétek",
                  "Az adataitok megvannak, a helyetek foglalva.", m.letrehozva)}
          ${lepes(jelezte, !jelezte, "Elutaljátok",
                  jelezte ? "Jeleztétek, hogy elindítottátok az utalást."
                          : `Utaljátok el a ${osszeg}-ot a fenti számlára, a közleménnyel.`,
                  m.jelezte)}
          ${lepes(fizetve, jelezte && !fizetve, "Megérkezik hozzánk",
                  fizetve ? "Megvan. Küldjük a számlát külön levélben."
                          : "Ellenőrizzük a jóváírást, és e-mailben visszaigazoljuk.",
                  m.fizetve)}
          ${lepes(false, fizetve, "Elkészítjük az oldalatokat",
                  "Két napon belül küldjük a saját címeteket és a belépőt.", null)}
        </div>
      </div>

      <p class="sugo" style="margin-top:1.4rem;text-align:center">
        Tegyétek el ezt a címet — bármikor megnézhetitek rajta, hol tart a dolog.
        Kérdés esetén elég válaszolni a visszaigazoló levelünkre.
      </p>
    </div>
  </div>
</section>

<script>
(function () {
  document.querySelectorAll(".masol").forEach(function (g) {
    g.addEventListener("click", function () {
      navigator.clipboard.writeText(g.dataset.ertek).then(function () {
        var elozo = g.textContent;
        g.textContent = "Másolva";
        setTimeout(function () { g.textContent = elozo; }, 1600);
      });
    });
  });

  var gomb = document.getElementById("utaltam");
  if (!gomb) return;
  var hiba = document.getElementById("hiba");

  gomb.addEventListener("click", async function () {
    gomb.disabled = true;
    gomb.textContent = "Rögzítjük…";
    try {
      var valasz = await fetch(
        "${ALAP}/api/eskuvo/megrendeles?utaltam=1&token=" + encodeURIComponent("${token}"),
        { method: "POST" });
      var j = await valasz.json();
      if (!valasz.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült.");
      window.location.reload();
    } catch (err) {
      hiba.textContent = String(err.message || err);
      gomb.disabled = false;
      gomb.textContent = "Elutaltam";
    }
  });
})();
</script>`,
  });
}

/* ══════════════════════════════════════════════════ útvonalak ══ */

export async function onRequest({ params }) {
  const reszek = (params.ut ?? []).filter(Boolean);

  // A megrendelő űrlap
  if (reszek.length === 0) {
    return new Response(urlapOldal(), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
  if (reszek.length > 1) return hibaOldal("Ilyen cím nincs.", 404);

  const token = reszek[0];
  try {
    const v = await fetch(
      `${ALAP}/api/eskuvo/megrendeles?token=${encodeURIComponent(token)}`,
      { headers: { Accept: "application/json" } },
    );
    if (v.status === 404) {
      return hibaOldal("Ez a megrendelés nincs meg. Lehet, hogy elírás csúszott a címbe.", 404);
    }
    if (!v.ok) throw new Error(String(v.status));
    const j = await v.json();
    if (!j?.megrendeles) throw new Error("ures");

    return new Response(allapotOldal(j.megrendeles, token), {
      headers: { "Content-Type": "text/html; charset=utf-8", "Cache-Control": "no-store" },
    });
  } catch {
    return hibaOldal("Most nem érjük el a megrendelést. Próbáljátok pár perc múlva.", 503);
  }
}
