# eskuszom.hu — hirdető oldal

Az **Esküszöm** esküvői rendszer hirdető oldala. Statikus: nincs build lépés,
nincs függősége, bármelyik tárhelyre feltölthető. Cloudflare Pages szolgálja ki.

```
index.html      a hirdető oldal
stilus.css      az arculat
script.js       menü, űrlap, AI-asszisztens becsatlakozási pont
favicon.svg     böngészőfül ikon
minta/          minta esküvői oldal (Zsófi & Marci) — négy képernyő
```

## Hova mennek a megkeresések

A kapcsolati űrlap a Web Manager végpontjára küld:

```
https://adminsite.mmdigital.hu/api/eskuvo/megkereses
```

Onnan az **Esküvő → Megkeresések** menübe kerül, és megy róla egy értesítő
levél az `info@mmdigital.hu` címre. A címet a `script.js` tetején, az `API`
állandóban lehet átírni.

## Az AI asszisztens

Elő van készítve, de kikapcsolva. A `script.js` tetején:

```js
const ASSZISZTENS = {
  bekapcsolva: false,
  szkript: "",   // a szolgáltató beágyazó szkriptje
  keret: "",     // vagy egy beágyazható oldal címe
};
```

Ha `szkript` van megadva, azt töltjük be. Ha `keret`, akkor saját arculatú
lebegő gombot kap, ami egy beágyazott oldalt nyit. Késleltetve indul, és ha
a külső szolgáltató elszáll, az oldal attól még hibátlanul működik.

## Fizetés

Két út, mindkettő a `/megrendeles/` oldalon indul (`functions/megrendeles/[[ut]].js`):

- **Kártya (Stripe fizetési link)** — az elsődleges. Előtte a mi oldalunkon
  kell bepipálni az ÁSZF-et és az azonnali kezdés kérését; ezt egy
  véletlen azonosítóval elküldjük a vezérlőpultnak, és ugyanez az azonosító
  megy a Stripe-nak is (`client_reference_id`). A link és a hirdetési kód
  (`ESKUSZOM20`) a `functions/_kozos.js` → `STRIPE` alatt van.
  **A kártyás ár a Stripe-ban van beállítva**, nem a vezérlőpultban: ha ott
  árat változtatsz, a Stripe-ban is át kell írni.
- **Banki átutalás** — változatlan: megrendelő, közlemény, állapotlap.

Sikeres kártyás fizetés után a Stripe a `/koszonjuk/` oldalra visz.

## Ami nem itt van

Maga a rendszer (a párok tervezője, a vendégoldalak, a szolgáltatói portál)
külön alkalmazás, a VPS-en fut, és a `*.eskuszom.hu` aldomaineken érhető el.
Ez a repó csak a hirdető oldal.
