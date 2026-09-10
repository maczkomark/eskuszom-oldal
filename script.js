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
const evDoboz = document.getElementById("ev");
if (evDoboz) evDoboz.textContent = String(new Date().getFullYear());

// ── űrlap ─────────────────────────────────────────────────────────────
const urlap = document.getElementById("urlap");
const kuldes = document.getElementById("kuldes");
const uzenetDoboz = document.getElementById("urlap-uzenet");

function uzenet(szoveg, tipus) {
  if (!uzenetDoboz) return;
  uzenetDoboz.textContent = szoveg;
  uzenetDoboz.className = "urlap-uzenet " + tipus;
}

urlap?.addEventListener("submit", async (e) => {
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

/* ══════════════════════════════════════════════════════════════════════
   Partnerek betöltése.

   A listát a vezérlőpult adja (Esküvő → Szolgáltatók), így ha egy partner
   bekerül vagy kikerül, ez az oldal magától követi — nem kell HTML-t írni.
   Ha a végpont nem elérhető, a szakasz csendben eltűnik: egy üres doboz
   rosszabb, mint ha ott sem lenne.
   ══════════════════════════════════════════════════════════════════════ */
const PARTNER_API = "https://adminsite.mmdigital.hu/api/eskuvo/partnerek";

const SZAKMA_NEV = {
  fotos: "Fotós", videos: "Videós", dj: "DJ", zenekar: "Zenekar",
  dekoracio: "Dekoráció", vendeglatas: "Vendéglátás", vofely: "Vőfély",
  ceremoniamester: "Ceremóniamester", torta: "Torta", ruha: "Ruha",
  smink: "Smink / fodrász", helyszin: "Helyszín", egyeb: "Egyéb",
};

function forint(n) {
  if (n == null) return "";
  return new Intl.NumberFormat("hu-HU").format(n) + " Ft-tól";
}

function csillagok(pont) {
  const egesz = Math.round(pont);
  return "★".repeat(egesz) + "☆".repeat(5 - egesz);
}

function biztonsagos(t) {
  const d = document.createElement("div");
  d.textContent = String(t ?? "");
  return d.innerHTML;
}

/** Csak http/https címet engedünk — nehogy egy elgépelt mező kárt okozzon. */
function tisztaLink(cim) {
  if (!cim) return null;
  const teljes = /^https?:\/\//i.test(cim) ? cim : "https://" + cim;
  try {
    const u = new URL(teljes);
    return u.protocol === "http:" || u.protocol === "https:" ? u.href : null;
  } catch { return null; }
}

async function partnereketBetolt() {
  const doboz = document.getElementById("partnerek-lista");
  const szakasz = document.getElementById("partnerek");
  if (!doboz || !szakasz) return;

  try {
    const valasz = await fetch(PARTNER_API, { signal: AbortSignal.timeout(8000) });
    if (!valasz.ok) throw new Error(String(valasz.status));
    const e = await valasz.json();
    const lista = Array.isArray(e.partnerek) ? e.partnerek : [];

    // Ha még nincs egy partner sem, ne mutassunk üres szakaszt.
    if (lista.length === 0) { szakasz.remove(); return; }

    doboz.innerHTML = lista.map((p) => {
      const honlap = tisztaLink(p.website);
      const insta = p.instagram
        ? tisztaLink(p.instagram.startsWith("@")
            ? "instagram.com/" + p.instagram.slice(1)
            : p.instagram)
        : null;
      const kep = tisztaLink(p.logo_url);

      return `
        <article class="partner uszo lathato">
          <div class="partner-fej">
            ${kep
              ? `<img class="partner-jel" src="${biztonsagos(kep)}" alt="" loading="lazy">`
              : `<span class="partner-jel">${biztonsagos((p.name || "?").charAt(0))}</span>`}
            <div>
              <div class="partner-szakma">${biztonsagos(SZAKMA_NEV[p.category] || p.category)}</div>
              <div class="partner-nev">${biztonsagos(p.name)}</div>
              <div class="partner-hol">
                ${biztonsagos(p.city || "")}${p.city && p.price_from ? " · " : ""}${forint(p.price_from)}
              </div>
            </div>
          </div>
          ${p.description ? `<p class="partner-leiras">${biztonsagos(p.description)}</p>` : ""}
          ${(honlap || insta || (p.parok_ertekelese && p.ertekelesek_szama))
            ? `<div class="partner-also">
                 ${p.parok_ertekelese && p.ertekelesek_szama
                   ? `<span class="partner-csillag" title="${p.ertekelesek_szama} pár értékelése">
                        ${csillagok(p.parok_ertekelese)}</span>`
                   : ""}
                 ${honlap ? `<a href="${biztonsagos(honlap)}" target="_blank" rel="noreferrer noopener">weboldal</a>` : ""}
                 ${insta ? `<a href="${biztonsagos(insta)}" target="_blank" rel="noreferrer noopener">Instagram</a>` : ""}
               </div>`
            : ""}
        </article>`;
    }).join("");
  } catch {
    // Nem érhető el a lista — inkább nincs szakasz, mint egy hibaüzenet.
    szakasz.remove();
  }
}

partnereketBetolt();
