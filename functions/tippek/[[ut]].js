// /tippek/ és /tippek/<cikk>/ — a blog oldalai.
//
// Két forrásból dolgozik:
//   • a Soro (trysoro.com), ami magától ír és publikál,
//   • a vezérlőpult, ha saját cikket teszünk ki.
// Ha az egyik nem elérhető, a másik akkor is megjelenik.
//
// Mindkettőt SZERVEROLDALON rendereljük. A Soro beágyazó kódja böngészőben
// rajzolna, `?post=slug` címekre — az MI-robotok nem futtatnak JavaScriptet,
// a lekérdezőjeles cím pedig a keresőnek egyetlen oldal. Így viszont minden
// cikk saját címen, kész HTML-ként áll ott.
import {
  ALAP, ki, datum, oldal, hibaOldal, soroLista, soroTartalom, tisztit,
} from "../_kozos.js";

/* ─────────────────────────────────────────────── a két forrás ─── */

/** A vezérlőpultban tárolt saját cikkek. */
async function sajatLista() {
  try {
    const v = await fetch(`${ALAP}/api/eskuvo/cikkek`, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!v.ok) return [];
    const j = await v.json();
    return (Array.isArray(j?.cikkek) ? j.cikkek : []).map((c) => ({
      forras: "sajat",
      slug: c.slug,
      title: c.title,
      lead: c.lead,
      kep: c.cover_url,
      mikor: String(c.created_at ?? "").slice(0, 10),
    }));
  } catch {
    return [];
  }
}

/** A Soro cikkei. */
async function soroCikkek() {
  return (await soroLista()).map((a) => ({
    forras: "soro",
    id: a.id,
    slug: a.slug,
    title: a.title,
    lead: a.excerpt ?? null,
    kep: a.image ?? null,
    mikor: String(a.isoDate ?? "").slice(0, 10),
    nyers: a,
  }));
}

/** Mindkét forrás, legfrissebbel elöl. Azonos cím esetén a saját nyer. */
async function mindenCikk() {
  const [sajat, soro] = await Promise.all([sajatLista(), soroCikkek()]);
  const cimek = new Set(sajat.map((c) => c.slug));
  return [...sajat, ...soro.filter((c) => !cimek.has(c.slug))]
    .sort((a, b) => String(b.mikor).localeCompare(String(a.mikor)));
}

/* ──────────────────────────────────────────────── a lista ─────── */

function listaOldal(cikkek) {
  const kartyak = cikkek.map((c) => `
      <a class="tipp" href="/tippek/${ki(c.slug)}/">
        ${c.kep ? `<img src="${ki(c.kep)}" alt="" loading="lazy">` : ""}
        <div class="belso">
          <h2>${ki(c.title)}</h2>
          ${c.lead ? `<p>${ki(c.lead)}</p>` : ""}
          <div class="mikor">${ki(datum(c.mikor))}</div>
        </div>
      </a>`).join("");

  return oldal({
    cim: "Esküvőszervezési tippek pároknak | Esküszöm",
    leiras: "Gyakorlati tippek esküvőszervezéshez: vendéglista, meghívó, "
          + "ültetésrend, program és időzítés — abból, amit valódi esküvőkön láttunk.",
    url: "https://eskuszom.hu/tippek/",
    fejlecek: `<meta property="og:type" content="website">
<meta property="og:title" content="Esküvőszervezési tippek — Esküszöm">
<meta property="og:image" content="https://eskuszom.hu/og-kep.png">
<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "Blog",
      "@id": "https://eskuszom.hu/tippek/#blog",
      url: "https://eskuszom.hu/tippek/",
      name: "Esküvőszervezési tippek",
      inLanguage: "hu-HU",
      isPartOf: { "@id": "https://eskuszom.hu/#webhely" },
      blogPost: cikkek.slice(0, 30).map((c) => ({
        "@type": "BlogPosting",
        headline: c.title,
        url: `https://eskuszom.hu/tippek/${c.slug}/`,
        datePublished: c.mikor,
      })),
    })}</script>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <div class="cikk-fej">
      <div class="folcim">Tippek</div>
      <h1>Amit érdemes tudni, mielőtt belevágtok.</h1>
      <p class="vezeto">
        Rövid, gyakorlati írások esküvőszervezésről — vendéglistáról,
        meghívóról, ültetésrendről és időzítésről.
      </p>
    </div>
    ${cikkek.length
      ? `<div class="tippek-racs">${kartyak}</div>`
      : `<p class="vezeto" style="text-align:center;margin-inline:auto">
           Most írjuk az elsőket. Nézz vissza pár nap múlva.
         </p>`}
  </div>
</section>`,
  });
}

/* ─────────────────────────────────────────────── egy cikk ─────── */

/** A törzs a forrásától függően jön — de mindkettő átmegy a tisztítón. */
async function torzset(c) {
  if (c.forras === "soro") return tisztit(await soroTartalom(c.nyers));

  const v = await fetch(`${ALAP}/api/eskuvo/cikkek?slug=${encodeURIComponent(c.slug)}`, {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!v.ok) return "";
  const j = await v.json();
  // A vezérlőpult már tisztán tárolja, de a kétszeri szűrés nem árt
  return tisztit(String(j?.cikk?.body_html ?? ""));
}

function cikkOldal(c, torzs) {
  const url = `https://eskuszom.hu/tippek/${c.slug}/`;

  return oldal({
    cim: `${c.title} | Esküszöm`,
    leiras: c.lead || `${c.title} — esküvőszervezési tipp az Esküszömtől.`,
    url,
    fejlecek: `<meta property="og:type" content="article">
<meta property="og:title" content="${ki(c.title)}">
${c.lead ? `<meta property="og:description" content="${ki(c.lead)}">` : ""}
<meta property="og:image" content="${ki(c.kep || "https://eskuszom.hu/og-kep.png")}">
<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: c.title,
      ...(c.lead ? { description: c.lead } : {}),
      image: c.kep ?? "https://eskuszom.hu/og-kep.png",
      datePublished: c.mikor,
      inLanguage: "hu-HU",
      mainEntityOfPage: url,
      isPartOf: { "@id": "https://eskuszom.hu/tippek/#blog" },
      publisher: { "@id": "https://eskuszom.hu/#szervezet" },
      author: { "@type": "Organization", name: "Esküszöm", url: "https://eskuszom.hu/" },
    })}</script>
<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Főoldal", item: "https://eskuszom.hu/" },
        { "@type": "ListItem", position: 2, name: "Tippek", item: "https://eskuszom.hu/tippek/" },
        { "@type": "ListItem", position: 3, name: c.title, item: url },
      ],
    })}</script>`,
    tartalom: `
<section class="vilagos">
  <div class="hatar">
    <article>
      <div class="cikk-fej">
        <div class="folcim"><a href="/tippek/" style="color:inherit">Tippek</a></div>
        <h1>${ki(c.title)}</h1>
        ${c.lead ? `<p class="vezeto">${ki(c.lead)}</p>` : ""}
        <div class="cikk-datum">${ki(datum(c.mikor))}</div>
      </div>

      <div class="cikk-torzs">
        ${c.kep ? `<img src="${ki(c.kep)}" alt="" style="width:100%">` : ""}
        ${torzs}

        <div class="cikk-lab">
          <p class="vezeto" style="margin-inline:auto">
            Az Esküszöm egy helyre teszi az esküvőtök minden szálát:
            vendéglista, meghívó QR-kóddal, ültetésrend, program és fotógaléria.
          </p>
          <p style="margin-top:22px">
            <a href="/ar/" class="gomb gomb-fo">Megnézem, mit tud</a>
            <a href="/tippek/" class="gomb gomb-halk">Több tipp</a>
          </p>
        </div>
      </div>
    </article>
  </div>
</section>`,
  });
}

/* ──────────────────────────────────────────────── útvonalak ─── */

export async function onRequest({ params }) {
  const reszek = (params.ut ?? []).filter(Boolean);

  try {
    const cikkek = await mindenCikk();

    if (reszek.length === 0) {
      return new Response(listaOldal(cikkek), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }
    if (reszek.length > 1) {
      return hibaOldal("Ilyen cím nincs a tippek között.", 404);
    }

    const c = cikkek.find((x) => x.slug === reszek[0]);
    if (!c) return hibaOldal("Lehet, hogy elírás csúszott a címbe, vagy levettük.", 404);

    const torzs = await torzset(c);
    if (!torzs) return hibaOldal("A cikk törzsét most nem érjük el. Próbáld pár perc múlva.", 503);

    return new Response(cikkOldal(c, torzs), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch {
    return hibaOldal("Most nem érjük el a cikkeket. Próbáld meg pár perc múlva.", 503);
  }
}
