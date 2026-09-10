// A cikkek külön oldaltérképe.
//
// A statikus sitemap.xml az állandó oldalakat sorolja fel; a cikkek
// naponta változhatnak, ezért azok innen jönnek, mindig frissen.
import { ALAP, ki } from "./_kozos.js";

export async function onRequest() {
  let cikkek = [];
  try {
    const v = await fetch(`${ALAP}/api/eskuvo/cikkek`, {
      headers: { Accept: "application/json" },
      cf: { cacheTtl: 300, cacheEverything: true },
    });
    if (v.ok) {
      const j = await v.json();
      cikkek = Array.isArray(j?.cikkek) ? j.cikkek : [];
    }
  } catch {
    // Üres oldaltérkép jobb, mint hibaüzenet a keresőnek
  }

  const sorok = cikkek.map((c) => `  <url>
    <loc>https://eskuszom.hu/tippek/${ki(c.slug)}/</loc>
    <lastmod>${String(c.created_at ?? "").slice(0, 10)}</lastmod>
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
