// A cikkek külön oldaltérképe.
//
// A statikus sitemap.xml az állandó oldalakat sorolja fel; a cikkek
// naponta változhatnak, ezért azok innen jönnek, mindig frissen — a
// Soróból és a vezérlőpultból is.
import { ALAP, ki, soroLista } from "./_kozos.js";

async function sajat() {
  try {
    const v = await fetch(`${ALAP}/api/eskuvo/cikkek`, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (!v.ok) return [];
    const j = await v.json();
    return (Array.isArray(j?.cikkek) ? j.cikkek : [])
      .map((c) => ({ slug: c.slug, mikor: String(c.created_at ?? "").slice(0, 10) }));
  } catch { return []; }
}

export async function onRequest() {
  const [a, b] = await Promise.all([
    sajat(),
    soroLista().then((l) => l.map((x) => ({ slug: x.slug, mikor: String(x.isoDate ?? "").slice(0, 10) }))),
  ]);

  const latott = new Set();
  const cikkek = [...a, ...b].filter((c) => {
    if (!c.slug || latott.has(c.slug)) return false;
    latott.add(c.slug);
    return true;
  });

  const sorok = cikkek.map((c) => `  <url>
    <loc>https://eskuszom.hu/tippek/${ki(c.slug)}/</loc>${c.mikor ? `
    <lastmod>${ki(c.mikor)}</lastmod>` : ""}
    <changefreq>monthly</changefreq>
    <priority>0.7</priority>
  </url>`).join("\n");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://eskuszom.hu/tippek/</loc>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
${sorok}
</urlset>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, max-age=600",
    },
  });
}
