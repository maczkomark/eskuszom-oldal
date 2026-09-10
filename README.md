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

Egyelőre **csak banki átutalás**. A bankkártyás rész az oldalon látszik,
de „hamarosan" jelöléssel — nem ígérünk olyat, ami még nincs mögötte.
Bekapcsoláshoz az `index.html`-ben a `fizetes-mod hamarosan` osztályt kell
`fizetes-mod aktiv`-ra cserélni, és megírni a fizetési folyamatot.

## Ami nem itt van

Maga a rendszer (a párok tervezője, a vendégoldalak, a szolgáltatói portál)
külön alkalmazás, a VPS-en fut, és a `*.eskuszom.hu` aldomaineken érhető el.
Ez a repó csak a hirdető oldal.
