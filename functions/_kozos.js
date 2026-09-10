// Közös részek a /tippek/ oldalakhoz.
//
// A cikkeket a vezérlőpult tárolja (oda küldi a Soro), és ez a réteg
// szerveroldalon HTML-lé alakítja őket. Azért így, és nem böngészőből
// betöltve: a keresők és főleg az MI-robotok nem futtatnak JavaScriptet,
// tehát amit szkript rajzol ki, azt nem látják.

export const ALAP = "https://adminsite.mmdigital.hu";

/** Szöveg HTML-be — a cikkek címe kívülről jön, nem bízunk benne. */
export function ki(s) {
  return String(s ?? "")
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/** 2026-09-10 → 2026. szeptember 10. */
const HONAP = ["január", "február", "március", "április", "május", "június",
               "július", "augusztus", "szeptember", "október", "november", "december"];
export function datum(iso) {
  const d = String(iso ?? "").slice(0, 10).split("-");
  if (d.length !== 3) return "";
  return `${d[0]}. ${HONAP[Number(d[1]) - 1] ?? ""} ${Number(d[2])}.`;
}

/** A cikkek betűtípusa és elrendezése — a hirdető oldal stílusára épül. */
const STILUS = `
  .cikk-fej { padding: 120px 0 40px; text-align: center; }
  .cikk-fej .folcim { margin-bottom: 14px; }
  .cikk-fej h1 { font-family: var(--serif); font-weight: 400;
                 font-size: clamp(30px, 5vw, 50px); line-height: 1.15;
                 max-width: 20ch; margin: 0 auto 16px; }
  .cikk-fej .vezeto { max-width: 58ch; margin: 0 auto; }
  .cikk-datum { color: var(--tinta-halvany); font-size: .82rem; margin-top: 18px; }

  .cikk-torzs { max-width: 68ch; margin: 0 auto; padding-bottom: 90px; }
  .cikk-torzs > * + * { margin-top: 1.15rem; }
  .cikk-torzs h2 { font-family: var(--serif); font-weight: 400;
                   font-size: clamp(23px, 3.2vw, 31px); margin-top: 2.6rem; }
  .cikk-torzs h3 { font-family: var(--serif); font-weight: 400;
                   font-size: clamp(19px, 2.6vw, 24px); margin-top: 2rem; }
  .cikk-torzs h4 { font-weight: 600; font-size: 1rem; margin-top: 1.7rem; }
  .cikk-torzs p, .cikk-torzs li { line-height: 1.75; color: var(--tinta-lagy); }
  .cikk-torzs ul, .cikk-torzs ol { padding-left: 1.3rem; }
  .cikk-torzs li + li { margin-top: .45rem; }
  .cikk-torzs a { color: var(--mauve); text-decoration: underline;
                  text-underline-offset: 3px; }
  .cikk-torzs img { border-radius: 14px; display: block; }
  .cikk-torzs blockquote { border-left: 2px solid var(--mauve-vilagos);
                           padding-left: 1.1rem; font-style: italic; }
  .cikk-torzs table { width: 100%; border-collapse: collapse; font-size: .92rem; }
  .cikk-torzs th, .cikk-torzs td { border: 1px solid var(--vonal);
                                   padding: .55rem .7rem; text-align: left; }
  .cikk-torzs pre { background: var(--papir-melyebb); padding: 1rem; border-radius: 12px;
                    overflow-x: auto; font-size: .85rem; }

  .cikk-lab { border-top: 1px solid var(--vonal); margin-top: 3rem; padding-top: 2rem;
              text-align: center; }

  .tippek-racs { display: grid; gap: 1.1rem; padding-bottom: 90px;
                 grid-template-columns: repeat(auto-fit, minmax(260px, 340px));
                 justify-content: center; }
  .tipp { display: block; background: var(--feher); border: 1px solid var(--vonal);
          border-radius: 16px; overflow: hidden; color: inherit; text-decoration: none;
          transition: transform .28s ease, box-shadow .28s ease; }
  .tipp:hover { transform: translateY(-3px); box-shadow: 0 14px 34px rgba(0,0,0,.07); }
  .tipp img { width: 100%; height: 168px; object-fit: cover; display: block; }
  .tipp .belso { padding: 1.3rem; }
  .tipp h2 { font-family: var(--serif); font-weight: 400; font-size: 1.22rem;
             line-height: 1.3; margin-bottom: .5rem; }
  .tipp p { color: var(--tinta-lagy); font-size: .88rem; line-height: 1.6; }
  .tipp .mikor { color: var(--tinta-halvany); font-size: .76rem; margin-top: .8rem; }
`;

/**
 * A teljes oldal köré ugyanaz a keret, mint a hirdető oldalon: azonos
 * fejléc, betűk és lábléc, hogy ne érződjön külön világnak.
 */
export function oldal({ cim, leiras, fejlecek, tartalom, url }) {
  return `<!doctype html>
<html lang="hu">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${ki(cim)}</title>
<meta name="description" content="${ki(leiras)}">
<meta name="theme-color" content="#8c6b74">
<link rel="canonical" href="${ki(url)}">
<meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large">
<meta property="og:site_name" content="Esküszöm">
<meta property="og:locale" content="hu_HU">
<meta property="og:url" content="${ki(url)}">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,400;0,500;0,600;1,400;1,500&family=Inter:wght@400;500;600&display=swap" rel="stylesheet">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="stylesheet" href="/stilus.css">
<style>${STILUS}</style>
${fejlecek ?? ""}
</head>
<body>

<header class="fejlec" id="fejlec">
  <div class="hatar fejlec-sor">
    <a href="/" class="logo">Esk<em>ü</em>szöm</a>
    <nav class="menu" id="menu">
      <a href="/mit-tud/">Mit tud</a>
      <a href="/a-vendegeknek/">A vendégeknek</a>
      <a href="/hogyan-megy/">Hogyan megy</a>
      <a href="/partnerek/">Partnerek</a>
      <a href="/tippek/">Tippek</a>
      <a href="/ar/">Ár</a>
      <a href="/kerdesek/">Kérdések</a>
    </nav>
    <a href="/#kapcsolat" class="gomb gomb-fo">Kérek egy bemutatót</a>
    <button class="menu-gomb" id="menu-gomb" aria-label="Menü" aria-expanded="false">
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6">
        <path d="M3 6h18M3 12h18M3 18h18"/>
      </svg>
    </button>
  </div>
</header>

<main>
${tartalom}
</main>

<footer class="lablec">
  <div class="hatar">
    <div class="lablec-sor">
      <a href="/" class="logo">Esk<em>ü</em>szöm</a>
      <nav class="lablec-menu">
        <a href="/mit-tud/">Mit tud</a>
        <a href="/a-vendegeknek/">A vendégeknek</a>
        <a href="/hogyan-megy/">Hogyan megy</a>
        <a href="/partnerek/">Partnerek</a>
        <a href="/tippek/">Tippek</a>
        <a href="/ar/">Ár</a>
        <a href="/kerdesek/">Kérdések</a>
        <a href="/minta/">Minta oldal</a>
        <a href="/#kapcsolat">Kapcsolat</a>
      </nav>
    </div>
    <div class="lablec-also">
      <span>&copy; ${new Date().getFullYear()} Esküszöm — minden jog fenntartva</span>
      <span>Az esküvőtök, egy helyen.</span>
    </div>
  </div>
</footer>

<script src="/script.js"></script>
<script defer src="https://adminsite.mmdigital.hu/analitika.js" data-kulcs="Rb3DJSMLP9XD"></script>
</body>
</html>`;
}

/** Hibaoldal ugyanabban a köntösben. */
export function hibaOldal(uzenet, kod) {
  return new Response(
    oldal({
      cim: "Ez a cikk nincs meg — Esküszöm",
      leiras: uzenet,
      fejlecek: '<meta name="robots" content="noindex, follow">',
      url: "https://eskuszom.hu/tippek/",
      tartalom: `<section class="vilagos"><div class="hatar">
        <div class="cikk-fej">
          <h1>Ez a cikk nincs meg.</h1>
          <p class="vezeto">${ki(uzenet)}</p>
          <p style="margin-top:28px"><a href="/tippek/" class="gomb gomb-fo">Összes tipp</a></p>
        </div>
      </div></section>`,
    }),
    { status: kod, headers: { "Content-Type": "text/html; charset=utf-8" } },
  );
}
