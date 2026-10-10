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
// "eskuszom-suti"). Nem kérdezünk rá külön, és hozzájárulás nélkül nem
// tárolunk mellé semmit.
//
// Események:
//   PageView          minden lapon
//   ViewContent       az /ar megnyitásakor, és kattintásra a minta oldalra
//                     (az a minta.eskuszom.hu-n fut, ott nincs pixel)
//   InitiateCheckout  amikor a /megrendeles lapról elindul a kártyás fizetés
//   Purchase          a /koszonjuk lapon, fizetésenként egyszer
//   StartTrial        az önkiszolgáló próba sikeres kérésekor (érték: 0)
//   Lead              a kapcsolati űrlap sikeres elküldésekor
//   Contact           telefon- vagy e-mail-linkre kattintáskor
// Személyes adat (név, e-mail, telefon) egyikben sincs, se nyersen, se hashelve.
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
    // Az InitiateCheckout 2026-10-10 óta NEM a /megrendeles megnyitásakor
    // megy, hanem amikor tényleg elindul a kártyás fizetés (lent).
    if (u === "/koszonjuk") vasarlas();
  }

  /* ── vásárlás ────────────────────────────────────────────────────── */

  var FIZETES_KULCS = "eskuszom-fizetes";     // a Stripe-ra indulás jele
  var VASARLAS_KULCS = "eskuszom-vasarlas";   // a már jelentett vásárlások
  var NAP = 24 * 60 * 60 * 1000;

  function olvas(kulcs) {
    try { return JSON.parse(localStorage.getItem(kulcs) || "null"); } catch (e) { return null; }
  }
  function ir(kulcs, ertek) {
    try {
      if (ertek === null) localStorage.removeItem(kulcs);
      else localStorage.setItem(kulcs, JSON.stringify(ertek));
    } catch (e) { /* privát ablak */ }
  }

  /**
   * Purchase a köszönőoldalon — egyszer, nem minden újratöltéskor.
   *
   * Akkor jelentjük, ha tudjuk, hogy fizetésből jött: vagy a Stripe tette a
   * címbe a session_id-t (a fizetési link beállítása:
   * /koszonjuk/?session_id={CHECKOUT_SESSION_ID}), vagy mi jegyeztük fel,
   * hogy innen indult a kártyás fizetés. Aki csak beírja a címet, annál
   * nincs vásárlás. Az azonosító lesz az eventID is, és fel is jegyezzük,
   * hogy egy újratöltés ne számolja kétszer.
   */
  function vasarlas() {
    var sid = "";
    try { sid = new URLSearchParams(location.search).get("session_id") || ""; } catch (e) { /* régi böngésző */ }
    if (sid && !/^cs_[A-Za-z0-9_]+$/.test(sid)) sid = "";   // a ki nem cserélt {CHECKOUT_SESSION_ID} se számítson

    var jel = olvas(FIZETES_KULCS);
    if (jel && (typeof jel.mikor !== "number" || Date.now() - jel.mikor > 2 * NAP)) jel = null;
    if (!sid && !jel) return;

    var kulcs = sid || jel.azon;
    var volt = olvas(VASARLAS_KULCS) || [];
    if (volt.indexOf(kulcs) >= 0) return;

    fbq("track", "Purchase", {
      content_name: "eskuvoi_weboldal",
      value: jel && typeof jel.ertek === "number" ? jel.ertek : ERTEK,
      currency: PENZNEM,
    }, { eventID: kulcs });

    volt.push(kulcs);
    ir(VASARLAS_KULCS, volt.slice(-20));
    ir(FIZETES_KULCS, null);

    // A címből is kivesszük: egy újratöltés vagy továbbküldött link se
    // hozza vissza (privát ablakban a feljegyzés nem marad meg).
    try {
      var c = new URL(location.href);
      c.searchParams.delete("session_id");
      history.replaceState(null, "", c.pathname + c.search + c.hash);
    } catch (e) { /* régi böngésző */ }
  }

  // A kártyás fizetés indulása (functions/megrendeles: a két jelölés után,
  // közvetlenül a Stripe előtt). Az összeg a kódos vagy a teljes ár.
  window.addEventListener("eskuszom:fizetes", function (e) {
    if (!betoltve) return;                      // nincs hozzájárulás: nem mérünk, nem jegyzünk
    var d = (e && e.detail) || {};
    var ertek = typeof d.ertek === "number" ? d.ertek : ERTEK;
    if (window.fbq) {
      fbq("track", "InitiateCheckout", { value: ertek, currency: PENZNEM },
          { eventID: d.azon || azonosito() });
    }
    ir(FIZETES_KULCS, { azon: d.azon || azonosito(), ertek: ertek, mikor: Date.now() });
  });

  // Önkiszolgáló próba: a vezérlőpult elfogadta, a levél elment.
  window.addEventListener("eskuszom:proba", function () {
    esemeny("StartTrial", { value: 0, currency: PENZNEM });
  });

  // A minta oldal másik címen fut (minta.eskuszom.hu), ott nincs pixel —
  // ezért a megnyitására kattintást mérjük itt.
  document.addEventListener("click", function (e) {
    var cel = e.target;
    if (!cel || typeof cel.closest !== "function") return;
    var a = cel.closest('a[href*="minta.eskuszom.hu"], a[href="/minta/"], a[href="/minta"]');
    if (!a) return;
    esemeny("ViewContent", { content_name: "minta" });

    // Az oldal azonnal továbbmegy, és a böngésző elvághatja a még úton
    // lévő kérést. Ha mértünk, egy negyed másodpercet várunk — de csak
    // sima kattintásnál: új lapon nyitásba nem szólunk bele.
    if (!betoltve || !window.fbq) return;
    if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
    if (a.target && a.target !== "_self") return;
    e.preventDefault();
    var cim = a.href;
    setTimeout(function () { location.href = cim; }, 250);
  }, true);

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
