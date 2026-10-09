// Gépnév-szintű átirányítás.
//
// A www-s cím ugyanarra a Pages-projektre van kötve, ezért ugyanazt
// szolgálná ki — a keresőnek viszont egy oldal egy cím legyen. Ezt a
// _redirects fájl nem tudja: az csak útvonalra illeszt, gépnévre nem.
//
// Minden mást érintetlenül továbbengedünk.
export async function onRequest(context) {
  const url = new URL(context.request.url);
  if (url.hostname === "www.eskuszom.hu") {
    url.hostname = "eskuszom.hu";
    return Response.redirect(url.toString(), 301);
  }
  return context.next();
}
