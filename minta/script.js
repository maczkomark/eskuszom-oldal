/* ══════════════════════════════════════════════════════════════════════
   Zsófi & Marci — minta esküvői oldal
   Ez a fájl mind a négy oldalon fut. Ami az adott oldalon nincs, azt
   csendben átugorja, így nem kell külön szkript minden nézethez.
   ══════════════════════════════════════════════════════════════════════ */

// ── fejléc árnyéka görgetéskor ────────────────────────────────────────
const fejlec = document.getElementById("fejlec");
if (fejlec) {
  const figyel = () => fejlec.classList.toggle("uszik", window.scrollY > 10);
  figyel();
  window.addEventListener("scroll", figyel, { passive: true });
}

// ── beúszás ───────────────────────────────────────────────────────────
const uszok = document.querySelectorAll(".uszo");
if (uszok.length && "IntersectionObserver" in window) {
  const figyelo = new IntersectionObserver((elemek) => {
    elemek.forEach((e, i) => {
      if (!e.isIntersecting) return;
      setTimeout(() => e.target.classList.add("lathato"), i * 70);
      figyelo.unobserve(e.target);
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -50px 0px" });
  uszok.forEach((u) => figyelo.observe(u));
} else {
  uszok.forEach((u) => u.classList.add("lathato"));
}

// ── visszaszámláló ────────────────────────────────────────────────────
const szamlalo = document.getElementById("szamlalo");
if (szamlalo) {
  const nap = new Date("2027-06-12T16:00:00+02:00");
  const ir = (kulcs, ertek) => {
    const el = szamlalo.querySelector(`[data-${kulcs}]`);
    if (el) el.textContent = String(ertek).padStart(2, "0");
  };
  const frissit = () => {
    const mp = Math.max(0, Math.floor((nap - new Date()) / 1000));
    ir("nap", Math.floor(mp / 86400));
    ir("ora", Math.floor(mp / 3600) % 24);
    ir("perc", Math.floor(mp / 60) % 60);
    ir("mp", mp % 60);
  };
  frissit();
  setInterval(frissit, 1000);
}

// ── visszajelző űrlap (a mintában nem küld sehova) ───────────────────
const urlap = document.getElementById("urlap") || document.getElementById("vendegkonyv");
const uzenetDoboz = document.getElementById("urlap-uzenet");

function mutatUzenet(szoveg, siker) {
  if (!uzenetDoboz) return;
  uzenetDoboz.textContent = szoveg;
  uzenetDoboz.style.display = "block";
  uzenetDoboz.style.background = siker ? "rgba(125,138,111,.12)" : "rgba(190,90,90,.1)";
  uzenetDoboz.style.color = siker ? "#4f5c43" : "#a04a4a";
  uzenetDoboz.style.border = "1px solid " + (siker ? "rgba(125,138,111,.32)" : "rgba(190,90,90,.28)");
}

if (urlap) {
  urlap.addEventListener("submit", (e) => {
    e.preventDefault();
    // Éles oldalon ez a pár rendszerébe menne. A mintában csak visszajelzünk,
    // hogy látni lehessen, mit tapasztal a vendég.
    mutatUzenet(
      "Köszönjük, megkaptuk! (Ez egy minta oldal, ezért most nem ment el sehova — " +
      "éles esküvőn a pár azonnal látná.)",
      true
    );
    urlap.reset();
  });
}

// ── galéria: szűrés ───────────────────────────────────────────────────
const szurok = document.querySelectorAll(".szuro");
if (szurok.length) {
  szurok.forEach((gomb) => {
    gomb.addEventListener("click", () => {
      szurok.forEach((g) => g.classList.remove("aktiv"));
      gomb.classList.add("aktiv");
      const mit = gomb.dataset.szuro;
      document.querySelectorAll("#galeria .foto").forEach((f) => {
        f.style.display = (mit === "mind" || f.dataset.tipus === mit) ? "" : "none";
      });
    });
  });
}

// ── galéria: nagyító ──────────────────────────────────────────────────
const nagyito = document.getElementById("nagyito");
if (nagyito) {
  const nagyFoto = document.getElementById("nagy-foto");
  const nagyFelirat = document.getElementById("nagy-felirat");

  const bezar = () => {
    nagyito.classList.remove("nyitva");
    document.body.style.overflow = "";
  };

  document.querySelectorAll("#galeria .foto").forEach((f) => {
    f.addEventListener("click", () => {
      // A színfoltot ugyanazzal az osztállyal vesszük át, hogy nagyban is stimmeljen
      nagyFoto.className = "foto " + [...f.classList].filter((c) => c.startsWith("b")).join(" ");
      nagyFoto.dataset.cimke = "";
      nagyFelirat.textContent = f.dataset.cimke || "";
      nagyito.classList.add("nyitva");
      document.body.style.overflow = "hidden";
    });
  });

  document.getElementById("bezar")?.addEventListener("click", bezar);
  nagyito.addEventListener("click", (e) => { if (e.target === nagyito) bezar(); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") bezar(); });
}

// ── galéria: feltöltés és letöltés (mintában csak jelzés) ────────────
document.getElementById("feltolto")?.addEventListener("click", () => {
  alert("Éles oldalon itt nyílna meg a telefon képtára, és a kiválasztott képek " +
        "feltöltődnének a pár galériájába.\n\nEz egy minta oldal.");
});
document.getElementById("letoltes")?.addEventListener("click", () => {
  alert("Éles oldalon itt indulna a teljes album letöltése egy tömörített fájlban.\n\nEz egy minta oldal.");
});
document.getElementById("megosztas")?.addEventListener("click", async () => {
  const adat = { title: "Zsófi & Marci esküvője", text: "Itt vannak a képek!", url: location.href };
  if (navigator.share) {
    try { await navigator.share(adat); return; } catch { /* megszakította */ }
  }
  try {
    await navigator.clipboard.writeText(location.href);
    alert("A link a vágólapra került — most már be tudod illeszteni bárhova.");
  } catch {
    alert("Másold ki a címsorból a linket, és küldd el a vendégeknek.");
  }
});
