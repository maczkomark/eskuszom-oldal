// /partnerek/ — a partnerkatalógus saját oldala.
//
// A főoldalon a lista JavaScripttel töltődik be; ez az oldal viszont
// szerveroldalon rendereli, mert a keresők és az MI-robotok itt keresik
// majd, hogy "esküvői fotós Szombathely" — és amit szkript rajzol ki,
// azt nem látják.
import { ALAP, ki, oldal, hibaOldal } from "../_kozos.js";

const SZAKMA_CIMKE = {
  fotos: "Fotós", videos: "Videós", zene: "Zene, DJ", dj: "DJ",
  dekor: "Dekoráció", virag: "Virág", vendeglatas: "Vendéglátás",
  helyszin: "Helyszín", ceremonia: "Szertartás", vofely: "Vőfély",
  smink: "Smink, haj", torta: "Torta", ruha: "Ruha", egyeb: "Egyéb",
};

function csillagok(atlag, db) {
  if (!atlag) return "";
  const tele = Math.round(Number(atlag));
  return `<div class="partner-ertekeles" aria-label="${ki(atlag)} csillag ötből">
        <span class="csillagok">${"★".repeat(tele)}${"☆".repeat(Math.max(0, 5 - tele))}</span>
        <span class="ertekeles-db">${ki(atlag)} · ${ki(db)} pártól</span>
      </div>`;
}

function kartya(p) {
  const szakma = SZAKMA_CIMKE[String(p.category ?? "").toLowerCase()] ?? p.category ?? "";
  const hely = [p.city, p.county].filter(Boolean).join(", ");
  const ar = p.price_from ? `${Number(p.price_from).toLocaleString("hu-HU")} Ft-tól` : "";

  return `
      <article class="partner">
        <div class="partner-fej">
          <div class="partner-jel" aria-hidden="true">${ki(String(p.name ?? "?").trim().charAt(0))}</div>
          <div class="partner-nev">
            <div class="folcim">${ki(szakma)}</div>
            <h2>${ki(p.name)}</h2>
            <div class="partner-hol">${[hely, ar].filter(Boolean).map(ki).join(" · ")}</div>
          </div>
        </div>
        ${p.description ? `<p class="partner-leiras">${ki(p.description)}</p>` : ""}
        ${csillagok(p.parok_ertekelese, p.ertekelesek_szama)}
      </article>`;
}

const STILUS = `
  .partnerek-lista { display: grid; gap: 1.1rem; padding-bottom: 40px;
    grid-template-columns: repeat(auto-fit, minmax(280px, 380px));
    justify-content: center; }
  .partner-fej { display: flex; gap: .9rem; align-items: flex-start; }
  .partner-jel { width: 44px; height: 44px; border-radius: 12px; flex: 0 0 auto;
    background: var(--papir-melyebb); color: var(--mauve);
    display: grid; place-items: center;
    font-family: var(--serif); font-size: 1.3rem; }
  .partner-nev h2 { font-family: var(--serif); font-weight: 400; font-size: 1.25rem;
    line-height: 1.25; margin: .1rem 0 .3rem; }
  .partner-hol { color: var(--tinta-halvany); font-size: .82rem; }
  .partner-leiras { margin-top: .9rem; color: var(--tinta-lagy);
    font-size: .9rem; line-height: 1.65; }
  .partner-ertekeles { margin-top: .9rem; display: flex; align-items: center; gap: .5rem; }
  .csillagok { color: var(--arany); letter-spacing: 1px; font-size: .95rem; }
  .ertekeles-db { color: var(--tinta-halvany); font-size: .78rem; }
  .szakmak { display: flex; flex-wrap: wrap; justify-content: center;
    gap: .5rem; margin-bottom: clamp(2rem, 4vw, 3rem); }
  .szakmak span { font-size: .82rem; color: var(--tinta-lagy);
    border: 1px solid var(--vonal); border-radius: 999px; padding: .35rem .85rem; }
`;

export async function onRequest({ params }) {
  if ((params.ut ?? []).filter(Boolean).length > 0) {
    return hibaOldal("Ilyen cím nincs a partnerek között.", 404);
  }

  let partnerek = [];
  try {
    const v = await fetch(`${ALAP}/api/eskuvo/partnerek`, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 600, cacheEverything: true },
    });
    if (v.ok) {
      const j = await v.json();
      partnerek = Array.isArray(j?.partnerek) ? j.partnerek : [];
    }
  } catch {
    // Üres lista jobb, mint hibaoldal: az oldal többi része így is ér valamit
  }

  const szakmak = [...new Set(partnerek.map((p) => SZAKMA_CIMKE[String(p.category ?? "").toLowerCase()] ?? p.category).filter(Boolean))];

  const html = oldal({
    cim: "Esküvői szolgáltatók, akiket ajánlunk | Esküszöm",
    leiras: "Fotósok, zenészek, dekorosok és vendéglátósok, akikkel már dolgoztunk. "
          + "Nem hirdetés: olyanokat ajánlunk, akiket magunk is hívnánk — és a párok "
          + "értékelése is ott van mellettük.",
    url: "https://eskuszom.hu/partnerek/",
    fejlecek: `<meta property="og:type" content="website">
<meta property="og:title" content="Esküvői szolgáltatók, akiket ajánlunk — Esküszöm">
<meta property="og:image" content="https://eskuszom.hu/og-kep.png">
<style>${STILUS}</style>
<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Főoldal", item: "https://eskuszom.hu/" },
        { "@type": "ListItem", position: 2, name: "Partnereink", item: "https://eskuszom.hu/partnerek/" },
      ],
    })}</script>
${partnerek.length ? `<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "ItemList",
      name: "Ajánlott esküvői szolgáltatók",
      itemListElement: partnerek.map((p, i) => ({
        "@type": "ListItem",
        position: i + 1,
        item: {
          "@type": "LocalBusiness",
          name: p.name,
          ...(p.city ? { address: { "@type": "PostalAddress", addressLocality: p.city, addressCountry: "HU" } } : {}),
          ...(p.description ? { description: p.description } : {}),
          ...(p.parok_ertekelese ? {
            aggregateRating: {
              "@type": "AggregateRating",
              ratingValue: p.parok_ertekelese,
              reviewCount: p.ertekelesek_szama,
            },
          } : {}),
        },
      })),
    })}</script>` : ""}`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="szakasz-fej kozepre">
      <div class="folcim">Partnereink</div>
      <h1>Nem egyedül kell mindenkit megtalálnotok.</h1>
      <p class="vezeto" style="margin-inline:auto">
        Ezek azok a fotósok, zenészek, dekorosok és vendéglátósok, akikkel már
        dolgoztunk. Nem hirdetés: olyanokat ajánlunk, akiket magunk is hívnánk.
        A rendszerben egy kattintással hozzáadhatjátok őket az esküvőtökhöz,
        és utána értékelhetitek is őket — a következő párnak.
      </p>
    </div>

    ${szakmak.length ? `<div class="szakmak">${szakmak.map((sz) => `<span>${ki(sz)}</span>`).join("")}</div>` : ""}

    <div class="partnerek-lista">${partnerek.map(kartya).join("")}</div>

    ${partnerek.length === 0 ? `<p class="vezeto" style="text-align:center;margin-inline:auto">
      Most állítjuk össze a listát. Ha szolgáltató vagy és szeretnél rajta lenni,
      <a href="/#kapcsolat">írj nekünk</a>.
    </p>` : `<p class="vezeto" style="text-align:center;margin-inline:auto;margin-top:2.5rem">
      Szolgáltató vagy és szeretnél a listán lenni?
      <a href="/#kapcsolat">Írj nekünk</a> — a párok ajánlásként látják, nem hirdetésként.
    </p>`}
  </div>
</section>`,
  });

  return new Response(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
