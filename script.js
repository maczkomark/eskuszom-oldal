/* ══════════════════════════════════════════════════════════════════════
   Esküszöm — hirdető oldal
   Kevés JavaScript, minden nélküle is működik: a menü linkek, az űrlap
   mezői és a kérdések lenyitása natív HTML.
   ══════════════════════════════════════════════════════════════════════ */

// A megkeresések ide futnak be — a Web Managerbe, az „Esküvő → Megkeresések"
// menübe. Éles domainre állítva ezt kell átírni.
const API = "https://adminsite.mmdigital.hu/api/eskuvo/megkereses";

/* ── AI asszisztens ────────────────────────────────────────────────────
   Előkészítve, de kikapcsolva. Bekapcsolás: írd be a `szkript` mezőbe a
   szolgáltatótól kapott beágyazó szkript címét, és állítsd `bekapcsolva`-t
   igazra. Semmi mást nem kell módosítani az oldalon.

   Ha a szolgáltató nem szkriptet ad, hanem egy beágyazható oldalt, akkor a
   `keret` mezőbe írd annak a címét — akkor egy lebegő gomb nyitja meg.

   Miért így? Mert a hirdető oldal statikus, és nem akarjuk, hogy egy külső
   szolgáltató hibája megakassza a betöltést vagy elrontsa az űrlapot. */
const ASSZISZTENS = {
  bekapcsolva: false,
  szkript: "",          // pl. "https://valamelyik-ai.hu/widget.js"
  keret: "",            // vagy egy beágyazható oldal címe
  gombSzoveg: "Kérdezz bátran",
  udvozles: "Szia! Segítek eldönteni, hogy nektek való-e az Esküszöm. Mit szeretnétek tudni?",
};

// ── fejléc árnyéka görgetéskor ────────────────────────────────────────
const fejlec = document.getElementById("fejlec");
const fejlecFigyelo = () => fejlec.classList.toggle("uszik", window.scrollY > 12);
fejlecFigyelo();
window.addEventListener("scroll", fejlecFigyelo, { passive: true });

// ── mobil menü ────────────────────────────────────────────────────────
const menuGomb = document.getElementById("menu-gomb");
const menu = document.getElementById("menu");
menuGomb.addEventListener("click", () => {
  const nyitva = menu.classList.toggle("nyitva");
  menuGomb.setAttribute("aria-expanded", String(nyitva));
});
menu.addEventListener("click", (e) => {
  if (e.target.tagName === "A") {
    menu.classList.remove("nyitva");
    menuGomb.setAttribute("aria-expanded", "false");
  }
});

// ── beúszás görgetésre ────────────────────────────────────────────────
// Ha a böngésző nem tudja, minden azonnal látszik — semmi nem tűnik el.
const uszok = document.querySelectorAll(".uszo");
if ("IntersectionObserver" in window) {
  const figyelo = new IntersectionObserver((elemek) => {
    elemek.forEach((e, i) => {
      if (!e.isIntersecting) return;
      // Kis késleltetés elemenként, hogy egymás után jelenjenek meg
      setTimeout(() => e.target.classList.add("lathato"), i * 70);
      figyelo.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -60px 0px" });
  uszok.forEach((u) => figyelo.observe(u));
} else {
  uszok.forEach((u) => u.classList.add("lathato"));
}

// ── évszám a láblécben ────────────────────────────────────────────────
document.getElementById("ev").textContent = String(new Date().getFullYear());

// ── űrlap ─────────────────────────────────────────────────────────────
const urlap = document.getElementById("urlap");
const kuldes = document.getElementById("kuldes");
const uzenetDoboz = document.getElementById("urlap-uzenet");

function uzenet(szoveg, tipus) {
  uzenetDoboz.textContent = szoveg;
  uzenetDoboz.className = "urlap-uzenet " + tipus;
}

urlap.addEventListener("submit", async (e) => {
  e.preventDefault();

  const adat = Object.fromEntries(new FormData(urlap).entries());

  // Saját ellenőrzés, hogy magyar üzenetet kapjanak, ne böngésző-szöveget
  if (!String(adat.couple_names || "").trim()) {
    uzenet("Írjátok be a neveteket, hogy tudjam, kinek válaszolok.", "hiba");
    document.getElementById("par").focus();
    return;
  }
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(String(adat.email || "").trim())) {
    uzenet("Az e-mail cím nem tűnik jónak — enélkül nem tudok válaszolni.", "hiba");
    document.getElementById("email").focus();
    return;
  }

  kuldes.disabled = true;
  const eredetiSzoveg = kuldes.textContent;
  kuldes.textContent = "Küldés…";
  uzenetDoboz.className = "urlap-uzenet";

  try {
    const valasz = await fetch(API, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(adat),
    });
    const eredmeny = await valasz.json().catch(() => ({}));

    if (valasz.ok && eredmeny.ok !== false) {
      urlap.reset();
      uzenet(
        "Köszönjük! Megkaptam a levelet, és egy napon belül válaszolok. " +
        "Ha sürgős, hívjatok nyugodtan.",
        "siker"
      );
    } else {
      uzenet(
        eredmeny.hiba || "Valami elakadt a küldésnél. Írjatok inkább e-mailt: info@mmdigital.hu",
        "hiba"
      );
    }
  } catch {
    // Hálózati hiba: ne vesszen el a szándék, adjunk másik utat
    uzenet(
      "Nem sikerült elküldeni — lehet, hogy a kapcsolat akadt meg. " +
      "Írjatok e-mailt az info@mmdigital.hu címre, és ugyanúgy jelentkezem.",
      "hiba"
    );
  } finally {
    kuldes.disabled = false;
    kuldes.textContent = eredetiSzoveg;
  }
});

/* ══════════════════════════════════════════════════════════════════════
   AI asszisztens beindítása.

   Három eset:
     1. nincs bekapcsolva  -> nem történik semmi, az oldal ugyanolyan
     2. `szkript` van      -> a szolgáltató saját buborékját töltjük be
     3. `keret` van        -> saját lebegő gomb, ami egy beágyazott
                              oldalt nyit meg — így a megjelenés a miénk

   A betöltés késleltetve indul, hogy ne lassítsa a nyitóképet, és hibára
   csendben elhallgat: egy chat-buborék soha nem akaszthatja meg az oldalt.
   ══════════════════════════════════════════════════════════════════════ */
function inditAsszisztens() {
  if (!ASSZISZTENS.bekapcsolva) return;
  const helye = document.getElementById("asszisztens-helye");
  if (!helye) return;

  // 2. eset: a szolgáltató saját szkriptje
  if (ASSZISZTENS.szkript) {
    const s = document.createElement("script");
    s.src = ASSZISZTENS.szkript;
    s.async = true;
    s.onerror = () => console.warn("Az asszisztens nem töltődött be — az oldal ettől még működik.");
    document.body.appendChild(s);
    return;
  }

  // 3. eset: saját gomb + beágyazott oldal
  if (!ASSZISZTENS.keret) return;

  const gomb = document.createElement("button");
  gomb.type = "button";
  gomb.className = "asszisztens-gomb";
  gomb.setAttribute("aria-expanded", "false");
  gomb.innerHTML =
    '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" ' +
    'stroke-width="1.8"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>' +
    "<span>" + ASSZISZTENS.gombSzoveg + "</span>";

  const doboz = document.createElement("div");
  doboz.className = "asszisztens-doboz";
  doboz.hidden = true;

  let betoltve = false;
  gomb.addEventListener("click", () => {
    const nyitva = doboz.hidden;
    doboz.hidden = !nyitva;
    gomb.setAttribute("aria-expanded", String(nyitva));

    // A keretet csak az első nyitáskor töltjük be — addig nem terheli az oldalt.
    if (nyitva && !betoltve) {
      const keret = document.createElement("iframe");
      keret.src = ASSZISZTENS.keret;
      keret.title = "Esküszöm asszisztens";
      keret.loading = "lazy";
      doboz.appendChild(keret);
      betoltve = true;
    }
  });

  helye.appendChild(doboz);
  helye.appendChild(gomb);
}

// Ne a betöltés kritikus útjában induljon.
if ("requestIdleCallback" in window) {
  requestIdleCallback(inditAsszisztens, { timeout: 4000 });
} else {
  setTimeout(inditAsszisztens, 2500);
}
