// A perjel nélküli /tippek cím a perjelesre megy tovább.
//
// Így csak egyetlen címen létezik a lista — a keresők nem látják két
// külön oldalnak ugyanazt.
export async function onRequest() {
  return Response.redirect("https://eskuszom.hu/tippek/", 301);
}
