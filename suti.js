// Süti-hozzájárulás és a Google Analytics betöltése.
//
// A saját mérőnk (analitika.js) nem sütizik és nem tárol semmit a látogató
// gépén, ezért az hozzájárulás nélkül is futhat. A Google Analytics viszont
// sütit tesz le, azt pedig előzetes hozzájárulás nélkül nem szabad — ezért
// a gtag KÓDJA IS csak akkor kerül be a lapba, ha a látogató elfogadta.
//
// A döntést a böngésző saját tárolójában őrizzük (nem sütiben), egy évig.
(function () {
  var KULCS = "eskuszom-suti";
  var EV = 365 * 24 * 60 * 60 * 1000;
  var GA = "G-2N1ZZ0YD86";

  function olvas() {
    try {
      var t = JSON.parse(localStorage.getItem(KULCS) || "null");
      if (!t || typeof t.mikor !== "number") return null;
      if (Date.now() - t.mikor > EV) return null;   // egy év után újra kérdezünk
      return t;
    } catch (e) { return null; }
  }

  function ment(elfogadva) {
    try {
      localStorage.setItem(KULCS, JSON.stringify({ elfogadva: elfogadva, mikor: Date.now() }));
    } catch (e) { /* privát ablakban nem tárolható — akkor csak most érvényes */ }
  }

  /** A gtag beemelése. Csak elfogadás után hívjuk. */
  function analitikaBe() {
    if (window.__gaBetoltve) return;
    window.__gaBetoltve = true;

    var s = document.createElement("script");
    s.async = true;
    s.src = "https://www.googletagmanager.com/gtag/js?id=" + GA;
    document.head.appendChild(s);

    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", GA, { anonymize_ip: true });
  }

  function savBe() {
    var sav = document.createElement("div");
    sav.className = "suti-sav";
    sav.setAttribute("role", "dialog");
    sav.setAttribute("aria-label", "Süti-beállítások");
    sav.innerHTML =
      '<div class="suti-szoveg">' +
        '<strong>Sütikről röviden</strong>' +
        '<p>A működéshez szükséges mérésünk nem használ sütit. A Google Analytics ' +
        'viszont igen — ehhez kérjük a hozzájárulásotokat. Bármikor ' +
        'meggondolhatjátok magatokat az <a href="/adatkezeles/">adatkezelési ' +
        'tájékoztatóban</a> leírtak szerint.</p>' +
      '</div>' +
      '<div class="suti-gombok">' +
        '<button type="button" class="gomb gomb-halk" id="suti-nem">Csak a szükséges</button>' +
        '<button type="button" class="gomb gomb-fo" id="suti-igen">Elfogadom</button>' +
      '</div>';
    document.body.appendChild(sav);

    // Egy képkockával később kap osztályt, hogy legyen mit animálni
    requestAnimationFrame(function () { sav.classList.add("lathato"); });

    function zar() {
      sav.classList.remove("lathato");
      setTimeout(function () { sav.remove(); }, 300);
    }
    document.getElementById("suti-igen").addEventListener("click", function () {
      ment(true); analitikaBe(); zar();
    });
    document.getElementById("suti-nem").addEventListener("click", function () {
      ment(false); zar();
    });
  }

  // Az adatkezelési tájékoztató „Meggondoltam magam" gombja ide szól vissza.
  // FONTOS, hogy a lenti korai kilépések ELŐTT álljon: aki már döntött, annak
  // egyébként létre sem jönne — pedig pont ő az, aki módosítani akar.
  window.sutiUjra = function () {
    try { localStorage.removeItem(KULCS); } catch (e) { /* nincs mit törölni */ }
    if (!document.querySelector(".suti-sav")) savBe();
  };

  var dontes = olvas();
  if (dontes && dontes.elfogadva) { analitikaBe(); return; }
  if (dontes) return;                              // nemet mondott, nem kérdezünk újra

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", savBe);
  } else {
    savBe();
  }
})();
