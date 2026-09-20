// Süti-hozzájárulás, a saját mérés és a Google Analytics betöltése.
//
// Két külön dolog, két külön szabály:
//
//   - A Google Analytics sütit tesz le, ezért a KÓDJA IS csak akkor kerül be
//     a lapba, ha a látogató kifejezetten elfogadta.
//   - A saját mérőnk (analitika.js) nem sütizik, és nem olvas semmit a
//     látogató eszközéről — az azonosítót a szerver számolja a kérés
//     fejléceiből. Ez jogos érdeken elmegy hozzájárulás nélkül is, DE aki a
//     „Csak a szükséges" gombot nyomja, annál ezt sem indítjuk el. Ezért
//     kerül be innen, és nem közvetlenül a HTML-ből: egy beégetett
//     <script> címkét már nem lehetne visszavonni.
//
// A döntést a böngésző saját tárolójában őrizzük (nem sütiben), egy évig.
(function () {
  var KULCS = "eskuszom-suti";
  var EV = 365 * 24 * 60 * 60 * 1000;
  var GA = "G-2N1ZZ0YD86";
  var MERO = "https://adminsite.mmdigital.hu/analitika.js";
  var MERO_KULCS = "Rb3DJSMLP9XD";

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

  /** A saját mérőnk beemelése. Mindenkinél fut, aki nem mondott nemet. */
  function meresBe() {
    if (window.__meresBetoltve) return;
    window.__meresBetoltve = true;

    var s = document.createElement("script");
    s.defer = true;
    s.src = MERO;
    s.setAttribute("data-kulcs", MERO_KULCS);
    document.head.appendChild(s);
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
        '<p>A saját látogatásmérésünk nem használ sütit, és nem olvas semmit ' +
        'a gépetekről — de a „Csak a szükséges” gombbal ezt is kikapcsolhatjátok. ' +
        'A Google Analytics sütizik, ahhoz külön kérjük a hozzájárulásotokat. Bármikor ' +
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
      ment(true); meresBe(); analitikaBe(); zar();
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
  if (dontes && dontes.elfogadva) { meresBe(); analitikaBe(); return; }
  if (dontes) return;                 // „csak a szükséges": semmit nem indítunk

  // Még nem döntött: a saját, sütimentes mérés indulhat, a sávot pedig
  // megmutatjuk. A Google Analytics addig nem kerül a lapba.
  meresBe();

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", savBe);
  } else {
    savBe();
  }
})();
