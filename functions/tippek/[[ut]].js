// /tippek/ és /tippek/<cikk>/ — a blog oldalai.
//
// Egy fájl kezeli mindkettőt, mert a Cloudflare Pages a záró perjeles és
// perjel nélküli címet is ide irányítja. Ha nincs útvonalrész, a lista jön,
// egyébként a cikk.
import { ALAP, ki, datum, oldal, hibaOldal } from "../_kozos.js";

/** A cikkek listája. */
async function lista() {
  const v = await fetch(`${ALAP}/api/eskuvo/cikkek`, {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (!v.ok) throw new Error("lista " + v.status);
  const j = await v.json();
  return Array.isArray(j?.cikkek) ? j.cikkek : [];
}

function listaOldal(cikkek) {
  const kartyak = cikkek.map((c) => `
      <a class="tipp" href="/tippek/${ki(c.slug)}/">
        ${c.cover_url ? `<img src="${ki(c.cover_url)}" alt="" loading="lazy">` : ""}
        <div class="belso">
          <h2>${ki(c.title)}</h2>
          ${c.lead ? `<p>${ki(c.lead)}</p>` : ""}
          <div class="mikor">${ki(datum(c.created_at))}</div>
        </div>
      </a>`).join("");

  const ures = `<p class="vezeto" style="text-align:center;margin-inline:auto">
      Most írjuk az elsőket. Nézz vissza pár nap múlva.
    </p>`;

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
        datePublished: String(c.created_at ?? "").slice(0, 10),
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
    <div class="tippek-racs">${kartyak || ""}</div>
    ${cikkek.length ? "" : ures}
  </div>
</section>`,
  });
}

/** Egy cikk. */
async function cikket(slug) {
  const v = await fetch(`${ALAP}/api/eskuvo/cikkek?slug=${encodeURIComponent(slug)}`, {
    headers: { Accept: "application/json" },
    cf: { cacheTtl: 300, cacheEverything: true },
  });
  if (v.status === 404) return null;
  if (!v.ok) throw new Error("cikk " + v.status);
  const j = await v.json();
  return j?.cikk ?? null;
}

function cikkOldal(c) {
  const url = `https://eskuszom.hu/tippek/${c.slug}/`;
  const megjelent = String(c.created_at ?? "").slice(0, 10);

  return oldal({
    cim: `${c.title} | Esküszöm`,
    leiras: c.lead || `${c.title} — esküvőszervezési tipp az Esküszömtől.`,
    url,
    fejlecek: `<meta property="og:type" content="article">
<meta property="og:title" content="${ki(c.title)}">
${c.lead ? `<meta property="og:description" content="${ki(c.lead)}">` : ""}
<meta property="og:image" content="${ki(c.cover_url || "https://eskuszom.hu/og-kep.png")}">
<script type="application/ld+json">${JSON.stringify({
      "@context": "https://schema.org",
      "@type": "BlogPosting",
      headline: c.title,
      description: c.lead ?? undefined,
      image: c.cover_url ?? "https://eskuszom.hu/og-kep.png",
      datePublished: megjelent,
      dateModified: String(c.updated_at ?? c.created_at ?? "").slice(0, 10),
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
        <div class="cikk-datum">${ki(datum(c.created_at))}</div>
      </div>

      <div class="cikk-torzs">
        ${c.cover_url ? `<img src="${ki(c.cover_url)}" alt="" style="width:100%">` : ""}
        ${c.body_html}

        <div class="cikk-lab">
          <p class="vezeto" style="margin-inline:auto">
            Az Esküszöm egy helyre teszi az esküvőtök minden szálát:
            vendéglista, meghívó QR-kóddal, ültetésrend, program és fotógaléria.
          </p>
          <p style="margin-top:22px">
            <a href="/#ar" class="gomb gomb-fo">Megnézem, mit tud</a>
            <a href="/tippek/" class="gomb gomb-halk">Több tipp</a>
          </p>
        </div>
      </div>
    </article>
  </div>
</section>`,
  });
}

export async function onRequest({ params }) {
  // Az [[ut]] tömböt ad; üres, ha a /tippek/ címet kérték
  const reszek = (params.ut ?? []).filter(Boolean);

  try {
    if (reszek.length === 0) {
      return new Response(listaOldal(await lista()), {
        headers: {
          "Content-Type": "text/html; charset=utf-8",
          "Cache-Control": "public, max-age=300",
        },
      });
    }

    if (reszek.length > 1) {
      return hibaOldal("Ilyen cím nincs a tippek között.", 404);
    }

    const c = await cikket(reszek[0]);
    if (!c) return hibaOldal("Lehet, hogy elírás csúszott a címbe, vagy levettük.", 404);

    return new Response(cikkOldal(c), {
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "public, max-age=300",
      },
    });
  } catch (e) {
    // Ha a vezérlőpult épp nem elérhető, ne fehér lap fogadja a látogatót
    return hibaOldal("Most nem érjük el a cikkeket. Próbáld meg pár perc múlva.", 503);
  }
}
