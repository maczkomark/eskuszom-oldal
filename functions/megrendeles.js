// A perjel nélküli /megrendeles cím a perjelesre megy tovább.
export async function onRequest() {
  return Response.redirect("https://eskuszom.hu/megrendeles/", 301);
}
