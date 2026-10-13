// A régi /fb/ cím: az új hirdetések (B7–B10) ide mutatnak, és a Meta a futó
// hirdetés linkjét nem engedi átírni. A 40%-os landolóra visszük, a
// hirdetés címkéivel (utm_*, fbclid) együtt.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  return new Response(null, {
    status: 302,
    headers: { Location: `/fb40/${url.search}`, "Cache-Control": "no-store" },
  });
}
