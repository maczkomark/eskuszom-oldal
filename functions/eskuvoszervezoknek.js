// Esküvőszervező cégeknek szóló oldal.
//
// Más a közönség, más a beszéd. Egy jegyespárnak arról kell mesélni, hogy
// ne legyen ideges a nagy nap előtt. Egy szervezőcégnek arról, hogy több
// esküvőt tud egyszerre vinni, és jobban néz ki a szemükben.
//
// FONTOS A KERETEZÉS: a rendszert nem adjuk ki senkinek — kibérelhetik.
// A cég a saját nevével és színeivel használja, de a kiszolgálás, a szerver
// és az adatok végig nálunk maradnak. Ez nem szőrszálhasogatás: ez a
// különbség aközött, hogy van egy terméked, vagy eladtad.
import { ALAP, ki, oldal } from "./_kozos.js";

const STILUS = `
  .szerv { max-width: 900px; margin: 0 auto; }
  .szerv-fej { text-align: center; padding-bottom: 40px; }
  .szerv-fej h1 { font-family: var(--serif); font-weight: 400;
                  font-size: clamp(32px, 5.5vw, 52px); line-height: 1.12;
                  margin-bottom: 16px; }
  .szerv-fej .vezeto { max-width: 56ch; margin: 0 auto; }

  .szerv-ar { display: flex; flex-wrap: wrap; align-items: baseline;
              justify-content: center; gap: .6rem 1.2rem;
              background: var(--feher); border: 1px solid var(--vonal);
              border-radius: 18px; padding: 1.6rem;
              text-align: center; margin-bottom: 2rem; }
  .szerv-ar .osszeg { font-family: var(--serif); font-size: clamp(2.2rem, 6vw, 3rem);
                      color: var(--mauve); line-height: 1; }
  .szerv-ar .mellette { font-size: .92rem; color: var(--tinta-lagy);
                        text-align: left; max-width: 30ch; }

  .szerv-pontok { display: grid; gap: 1rem;
                  grid-template-columns: repeat(auto-fit, minmax(260px, 1fr));
                  margin-bottom: 2.4rem; }
  .szerv-pont { background: var(--feher); border: 1px solid var(--vonal);
                border-radius: 16px; padding: 1.4rem; }
  .szerv-pont h3 { font-family: var(--serif); font-weight: 400; font-size: 1.2rem;
                   margin-bottom: .5rem; }
  .szerv-pont p { font-size: .9rem; line-height: 1.65; color: var(--tinta-lagy); }

  .berles { background: var(--papir-melyebb); border-radius: 18px;
            padding: clamp(1.4rem, 4vw, 2.2rem); margin-bottom: 2.4rem; }
  .berles h2 { font-family: var(--serif); font-weight: 400;
               font-size: clamp(22px, 3.4vw, 30px); margin-bottom: .8rem; }
  .berles p { font-size: .96rem; line-height: 1.75; color: var(--tinta-lagy); }
  .berles p + p { margin-top: .9rem; }
  .berles strong { color: var(--tinta); font-weight: 500; }

  .urlap-doboz { background: var(--feher); border: 1px solid var(--vonal);
                 border-radius: 18px; padding: clamp(1.4rem, 4vw, 2.2rem); }
  .urlap-doboz h2 { font-family: var(--serif); font-weight: 400;
                    font-size: clamp(22px, 3.4vw, 30px); margin-bottom: .4rem; }
  .urlap-doboz .halk { font-size: .88rem; color: var(--tinta-halvany);
                       margin-bottom: 1.4rem; }

  .szerv-mezok { display: grid; gap: .9rem; }
  .szerv-mezok.ketto { grid-template-columns: 1fr 1fr; }
  @media (max-width: 560px) { .szerv-mezok.ketto { grid-template-columns: 1fr; } }
  .szerv-mezo label { display: block; font-size: .82rem; color: var(--tinta-lagy);
                      margin-bottom: .35rem; }
  .szerv-mezo input, .szerv-mezo select, .szerv-mezo textarea {
    width: 100%; font: inherit; font-size: .95rem;
    padding: .8rem .95rem; border-radius: 11px;
    border: 1px solid var(--vonal); background: var(--papir); color: var(--tinta);
  }
  .szerv-mezo textarea { min-height: 110px; resize: vertical; line-height: 1.55; }
  .szerv-mezo input:focus, .szerv-mezo textarea:focus, .szerv-mezo select:focus {
    outline: none; border-color: var(--mauve-vilagos); background: var(--feher);
  }
  .szerv-mezo .sugo { font-size: .76rem; color: var(--tinta-halvany); margin-top: .3rem; }

  .valaszto-sor { display: flex; align-items: flex-start; gap: .7rem;
                  padding: .9rem 1rem; border: 1px solid var(--vonal);
                  border-radius: 12px; cursor: pointer; background: var(--papir); }
  .valaszto-sor input { width: auto; margin-top: .25rem; }
  .valaszto-sor strong { display: block; font-weight: 500; font-size: .93rem; }
  .valaszto-sor span { font-size: .82rem; color: var(--tinta-halvany);
                       line-height: 1.5; }

  .mezcsak-robot { position: absolute; left: -9999px; }
  .kuldes { width: 100%; justify-content: center; margin-top: .4rem; }
  .urlap-hiba { margin-top: .9rem; font-size: .88rem; color: #a4453d;
                background: #fdf1f0; border: 1px solid #f2d5d2;
                border-radius: 10px; padding: .7rem .9rem; }
  .urlap-hiba:empty { display: none; }
  .kesz-doboz { text-align: center; padding: 2rem 0; }
  .kesz-doboz .pipa { width: 56px; height: 56px; border-radius: 50%;
                      background: #eaf3ec; color: #3f7a4f; display: grid;
                      place-items: center; margin: 0 auto 1.2rem; }
`;

function lap() {
  return oldal({
    cim: "Esküvőszervezőknek – Esküszöm",
    leiras: "Esküvőszervező cégeknek: esküvőnként egyszeri 40 000 Ft, a saját "
          + "nevetekkel és színeitekkel. A rendszert nem adjuk ki — kibérelhetitek.",
    url: "https://eskuszom.hu/eskuvoszervezoknek/",
    fejlecek: `<style>${STILUS}</style>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="szerv">
      <div class="szerv-fej">
        <div class="folcim">Esküvőszervezőknek</div>
        <h1>Ti szervezitek.<br>Mi adjuk hozzá a rendszert.</h1>
        <p class="vezeto">
          Ha egy évben tíz-húsz esküvőt visztek, nem tíz külön Excelre van
          szükségetek, hanem egy felületre, ahol mindegyik ott van — és amit
          a párok a ti nevetek alatt látnak.
        </p>
      </div>

      <div class="szerv-ar">
        <div class="osszeg">40 000 Ft</div>
        <div class="mellette">
          esküvőnként, egyszeri díj. Nincs havidíj, nincs belépési költség,
          és nem kell előre megvenni egy csomagot.
        </div>
      </div>

      <div class="szerv-pontok">
        <div class="szerv-pont">
          <h3>Minden esküvő egy helyen</h3>
          <p>
            Nem kell váltogatni a fájlok között: látjátok, melyik esküvőnél
            hány visszajelzés hiányzik, hol nincs még ültetésrend, és kinél
            közeleg a létszámleadás.
          </p>
        </div>
        <div class="szerv-pont">
          <h3>A párok nektek dolgoznak</h3>
          <p>
            A vendéglista, a visszajelzések és a menüválasztás magától áll
            össze — nem nektek kell utánatelefonálni. Ami eddig két nap volt
            esküvőnként, az most nulla.
          </p>
        </div>
        <div class="szerv-pont">
          <h3>A ti nevetekkel</h3>
          <p>
            A pár a ti arculatotokat látja: a ti nevetek, a ti színeitek.
            Nekik ez a ti felületetek — mert a munkát ti végzitek rajta.
          </p>
        </div>
        <div class="szerv-pont">
          <h3>A szolgáltatóitok is látják</h3>
          <p>
            A fotós, a vendéglátós és a DJ külön hozzáférést kap, és azt
            látja, ami rá tartozik. Nem kell nekik továbbítgatni semmit.
          </p>
        </div>
      </div>

      <div class="berles">
        <h2>Hogy értsük ugyanazt</h2>
        <p>
          <strong>A rendszert nem adjuk ki senkinek — kibérelhetitek.</strong>
        </p>
        <p>
          Az esküvőszervező cég a saját nevével és színeivel használja, a párok
          azt látják, hogy az ő felületük. A kiszolgálás, a szerver és az adatok
          viszont végig nálunk maradnak, és a hozzáférés bármikor visszavonható.
        </p>
        <p>
          Ez nem szőrszálhasogatás. Azt jelenti, hogy nem kell szervert
          üzemeltetnetek, nem kell fejlesztőt tartanotok, és ha valami elromlik,
          nem a ti telefonotok csörög — cserébe a rendszer a miénk marad.
        </p>
      </div>

      <div class="urlap-doboz" id="ajanlat">
        <h2>Kérjetek ajánlatot</h2>
        <p class="halk">
          Elég a cég neve és egy elérhetőség. A többit megbeszéljük — és ha
          több esküvőről van szó, arra külön ajánlatot adunk.
        </p>

        <form id="szerv-urlap">
          <div class="szerv-mezok">
            <div class="szerv-mezo">
              <label for="ceg">A cég neve *</label>
              <input id="ceg" name="ceg" required placeholder="Példa Esküvők Kft.">
            </div>

            <div class="szerv-mezok ketto">
              <div class="szerv-mezo">
                <label for="email">E-mail</label>
                <input id="email" name="email" type="email" placeholder="info@pelda.hu">
              </div>
              <div class="szerv-mezo">
                <label for="telefon">Telefon</label>
                <input id="telefon" name="telefon" type="tel" placeholder="+36 30 123 4567">
              </div>
            </div>
            <div class="szerv-mezo" style="margin-top:-.5rem">
              <div class="sugo">Legalább az egyiket írjátok be, hogy tudjunk válaszolni.</div>
            </div>

            <div class="szerv-mezok ketto">
              <div class="szerv-mezo">
                <label for="kapcsolat">Kivel beszéljünk?</label>
                <input id="kapcsolat" name="kapcsolat" placeholder="a nevetek">
              </div>
              <div class="szerv-mezo">
                <label for="eskuvok">Hány esküvő egy évben?</label>
                <select id="eskuvok" name="eskuvok">
                  <option value="">Válasszatok</option>
                  <option value="1-5">1–5</option>
                  <option value="6-15">6–15</option>
                  <option value="16-30">16–30</option>
                  <option value="30+">30 fölött</option>
                </select>
              </div>
            </div>

            <label class="valaszto-sor">
              <input type="checkbox" id="arculat" name="arculat" checked>
              <span>
                <strong>A saját arculatunkkal szeretnénk</strong>
                <span>
                  A párok a ti neveteket és színeiteket látják. A rendszer
                  nálunk fut, ti a munkát végzitek rajta.
                </span>
              </span>
            </label>

            <label class="valaszto-sor">
              <input type="checkbox" id="domain" name="domain">
              <span>
                <strong>Saját domainen is</strong>
                <span>
                  Például eskuvoink.pelda.hu. A domain díja rajtatok,
                  a beállítást mi intézzük.
                </span>
              </span>
            </label>

            <div class="szerv-mezo">
              <label for="uzenet">Bármi, amit tudnunk kell</label>
              <textarea id="uzenet" name="uzenet"
                        placeholder="Hogyan dolgoztok most? Mi a legnagyobb nyűg benne?"></textarea>
            </div>
          </div>

          <input class="mezcsak-robot" type="text" name="honeypot" id="mez" tabindex="-1"
                 autocomplete="off" aria-hidden="true">

          <button type="submit" class="gomb gomb-fo kuldes" id="kuldes">
            Kérem az ajánlatot
          </button>
          <div class="urlap-hiba" id="hiba"></div>

          <p class="sugo" style="margin-top:1rem;text-align:center">
            Nem küldünk hírlevelet, és nem adjuk tovább az adataitokat.
            Egy munkanapon belül válaszolunk.
          </p>
        </form>

        <div class="kesz-doboz" id="kesz" hidden>
          <div class="pipa">
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none"
                 stroke="currentColor" stroke-width="2.4"><path d="M20 6L9 17l-5-5"/></svg>
          </div>
          <h2>Megvan, köszönjük</h2>
          <p class="halk" style="margin:0">
            Egy munkanapon belül jelentkezünk. Ha sürgős, hívjatok:
            <a href="tel:+36204087765" style="color:var(--mauve)">+36 20 408 7765</a>
          </p>
        </div>
      </div>

      <p class="sugo" style="text-align:center;margin-top:2rem;color:var(--tinta-halvany)">
        Egyetlen esküvőt szerveztek, magatoknak?
        <a href="/ar/" style="color:var(--mauve)">Akkor ez a lap való nektek.</a>
      </p>
    </div>
  </div>
</section>

<script>
(function () {
  var urlap = document.getElementById("szerv-urlap");
  var gomb = document.getElementById("kuldes");
  var hiba = document.getElementById("hiba");

  urlap.addEventListener("submit", async function (e) {
    e.preventDefault();
    hiba.textContent = "";

    var ceg = document.getElementById("ceg").value.trim();
    var email = document.getElementById("email").value.trim();
    var telefon = document.getElementById("telefon").value.trim();
    if (!ceg) { hiba.textContent = "Írjátok be a cég nevét."; return; }
    if (!email && !telefon) {
      hiba.textContent = "Adjatok meg egy e-mail címet vagy telefonszámot, hogy válaszolni tudjunk.";
      return;
    }

    gomb.disabled = true;
    gomb.textContent = "Küldjük…";
    try {
      var v = await fetch("${ALAP}/api/eskuvo/szervezo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ceg: ceg,
          email: email,
          telefon: telefon,
          kapcsolat: document.getElementById("kapcsolat").value,
          eskuvok: document.getElementById("eskuvok").value,
          arculat: document.getElementById("arculat").checked,
          domain: document.getElementById("domain").checked,
          uzenet: document.getElementById("uzenet").value,
          honeypot: document.getElementById("mez").value,
        }),
      });
      var j = await v.json();
      if (!v.ok || !j.ok) throw new Error(j.hiba || "Most nem sikerült elküldeni.");
      urlap.hidden = true;
      document.getElementById("kesz").hidden = false;
    } catch (err) {
      hiba.textContent = String(err.message || err);
      gomb.disabled = false;
      gomb.textContent = "Kérem az ajánlatot";
    }
  });
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
