// Meta Pixel.
//
// Külön fájlban, és nem a lapba égetve — ugyanaz az elv, mint a Google
// Analyticsnél a suti.js-ben: a hozzájárulás visszavonható, egy beégetett
// kódot pedig már nem lehetne kikapcsolni.
//
// FONTOS: elfogadás ELŐTT a Meta fbevents.js-e sem töltődik be, tehát a
// Meta felé semmilyen kérés nem megy ki. A `consent revoke` önmagában
// kevés lenne: az csak az események küldését állítja le, a szkriptet
// viszont már letöltötte volna a connect.facebook.net-ről, és az is
// adatátadás.
//
// Ezért betöltéskor NINCS `consent revoke` — és nem is lehet. A hívások
// a szkript letöltése előtt sorba kerülnek; az fbevents.js a sorban álló
// revoke-nál megáll, és a sor többi részét (a sorban álló grant-ot is!)
// visszatartja egy újabb, KÖZVETLEN grant hívásig. Ez sosem jönne, így a
// pixel örökre némán állna — 2026-09-21-én pontosan ez történt, egyetlen
// esemény sem jutott el a Metához. A revoke/grant csak a betöltés UTÁN
// kell: ha valaki meggondolja magát, azzal állítjuk le és indítjuk újra.
//
// A hozzájárulás forrása a suti.js EGYETLEN döntése (localStorage,
// "eskuszom-suti"). Nem kérdezünk rá külön, és nem tárolunk mellé semmit.
(function () {
  var PIXEL = "2257907238108800";
  var SUTI_KULCS = "eskuszom-suti";
  var EV = 365 * 24 * 60 * 60 * 1000;

  // A csomag ára. Nem a lapból szedjük ki, mert az ár a vezérlőpultból jön
  // és oldalanként máshogy jelenik meg — ez itt a konverzió értéke, egy
  // helyen állítva. Ha az ár változik, ezt is léptetni kell.
  var ERTEK = 49990;
  var PENZNEM = "HUF";

  var betoltve = false;

  /* ── hozzájárulás ────────────────────────────────────────────────── */

  /** Ugyanaz az olvasás, mint a suti.js-ben — egy év után lejár. */
  function elfogadta() {
    try {
      var t = JSON.parse(localStorage.getItem(SUTI_KULCS) || "null");
      if (!t || typeof t.mikor !== "number") return false;
      if (Date.now() - t.mikor > EV) return false;
      return t.elfogadva === true;
    } catch (e) {
      // Privát ablak vagy letiltott tároló: nincs bizonyítható hozzájárulás.
      return false;
    }
  }

  /* ── segédek ─────────────────────────────────────────────────────── */

  /** Eseményazonosító. Csak a Metánál kell az ismétlődések kiszűréséhez. */
  function azonosito() {
    try {
      if (window.crypto && typeof crypto.randomUUID === "function") {
        return crypto.randomUUID();
      }
    } catch (e) { /* régi böngésző */ }
    return "e-" + Date.now().toString(36) + "-" + Math.random().toString(36).slice(2, 10);
  }

  /** Útvonal záró perjel nélkül: "/ar/" és "/ar" is ugyanaz. */
  function ut() {
    return location.pathname.replace(/\/+$/, "") || "/";
  }

  /* ── a Meta alapkódja ────────────────────────────────────────────── */

  function alapkod() {
    /* A Meta hivatalos betöltője, változatlanul. */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () {
        n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments);
      };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = "2.0";
      n.queue = []; t = b.createElement(e); t.async = !0; t.src = v;
      s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
  }

  function betolt() {
    if (betoltve) {
      // Már fut, csak közben visszavonta — most újra engedi.
      if (window.fbq) fbq("consent", "grant");
      return;
    }
    betoltve = true;
    alapkod();

    // Az automatikus mezőbeolvasást KI KELL kapcsolni, mielőtt bármi indul.
    // Enélkül a Pixel magától kiolvasná a kapcsolati űrlap e-mail- és
    // telefonmezőjét, és elküldené a Metának — pont azt, amit nem akarunk.
    // Ezért nincs sem nyers, sem hashelt személyes adat a hívásokban.
    fbq("set", "autoConfig", false, PIXEL);
    fbq("init", PIXEL);

    oldalEsemenyek();
  }

  /* ── események ───────────────────────────────────────────────────── */

  function esemeny(nev, adat) {
    if (!betoltve || !window.fbq) return;
    fbq("track", nev, adat || {}, { eventID: azonosito() });
  }

  /** Amit az oldal megnyitása kivált. Hozzájárulás után fut le. */
  function oldalEsemenyek() {
    esemeny("PageView");

    var u = ut();
    if (u === "/ar") {
      esemeny("ViewContent", {
        content_name: "arak", value: ERTEK, currency: PENZNEM,
      });
    }
    if (u === "/megrendeles") {
      esemeny("InitiateCheckout", { value: ERTEK, currency: PENZNEM });
    }
  }

  // Kapcsolatfelvétel: telefon- és e-mail-hivatkozásra kattintva. A címet
  // magát NEM adjuk át, csak azt, melyik csatornát választotta.
  document.addEventListener("click", function (e) {
    var cel = e.target;
    if (!cel || typeof cel.closest !== "function") return;
    var a = cel.closest('a[href^="tel:"], a[href^="mailto:"]');
    if (!a) return;
    var tel = a.getAttribute("href").slice(0, 4).toLowerCase() === "tel:";
    esemeny("Contact", { content_name: tel ? "telefon" : "email" });
  }, true);

  // Az érdeklődés akkor konverzió, ha a megkeresés tényleg megérkezett.
  // A script.js szól, amikor a válasz sikeres — nem a gombnyomásra.
  window.addEventListener("eskuszom:lead", function () {
    esemeny("Lead", {
      content_name: "eskuvoi_megkereses", value: ERTEK, currency: PENZNEM,
    });
  });

  /* ── indulás és a döntés követése ────────────────────────────────── */

  // A suti.js szól, ha a látogató most dönt. Elfogadásnál itt indul el
  // minden; visszavonásnál a már betöltött Pixelt némítjuk el.
  window.addEventListener("eskuszom:suti", function (e) {
    var ok = e && e.detail && e.detail.elfogadva === true;
    if (ok) { betolt(); return; }
    if (betoltve && window.fbq) fbq("consent", "revoke");
  });

  // Aki korábban már elfogadta, annál azonnal indulhat.
  if (elfogadta()) betolt();
})();
