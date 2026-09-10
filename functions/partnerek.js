// A perjel nélküli /partnerek cím a perjelesre megy tovább,
// hogy csak egyetlen címen létezzen az oldal.
export async function onRequest() {
  return Response.redirect("https://eskuszom.hu/partnerek/", 301);
}
