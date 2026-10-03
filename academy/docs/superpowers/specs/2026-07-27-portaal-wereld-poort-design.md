# Poort naar de wereld in het klantportaal

Datum: 2026-07-27
Status: goedgekeurd, klaar voor implementatie

## Aanleiding

Het klantportaal (`morgenacademy.nl/portal/<klant>`) is voor deelnemers vaak het
enige contactmoment met Morgen na een training. Ze halen hun materiaal op en zijn
weg. Onderaan staan nu twee vlakke tekstkaartjes ("Online Academy", "Incompany
training") die niets laten zien van wat Morgen verder doet.

## Doel

Twee dingen, in deze volgorde:

1. De deelnemer klikt door naar morgencompany.com en gaat daar rondkijken.
2. Daar komt een vervolgvraag uit de organisatie uit (incompany, implementatie,
   maatwerk).

De primaire taak van het portaal blijft ongewijzigd: materiaal ophalen. De poort
staat onder de materialen, niet ervoor.

## Scope

Alleen de academy-repo. De company-site verandert niet. Voor elke klant hetzelfde
blok, geen personalisatie per portaal en geen databasewerk.

## Ontwerp

### Component

Nieuw: `src/components/portal/PortalWereldPoort.tsx`. Geen props, geen data-
afhankelijkheid, geen state. Het rendert altijd, ook voor wie niets downloadt.

`PortalDashboard.tsx` rendert het op de plek van de huidige `offerLinks`-grid.
De constante `offerLinks` en de bijbehorende `GraduationCap`/`Users`/`ArrowRight`-
imports vervallen.

### Beeld

Een stilstaand plaatje van een wereld die op de site juist beweegt, leest als een
screenshot. Daarom de intro-video van de wereld, die in zes seconden de camera
terugtrekt van de brug naar het hele plein en exact op de hub-still eindigt.
Daarna lichten de vijf punten op.

| Scherm | Video | Poster | Verhouding |
|---|---|---|---|
| >= 640px | `vid/intro.mp4` (5,1 MB) | `intro-poster.jpg` (130 kB) | 1112x834 |
| < 640px | `vid/intro-m.mp4` (1,3 MB) | `intro-poster-m.jpg` (53 kB) | 468x832 |

Alles rechtstreeks van de company-site, niet gekopieerd naar deze repo: wijzigt de
wereld daar, dan volgt het portaal.

De video staat op `preload="none"` en krijgt pas een `src` als een
IntersectionObserver meldt dat het blok in beeld komt (rootMargin 200px). De poort
staat onder de materialen, dus wie nooit doorscrollt betaalt niets.

Weigert de browser autoplay, of faalt de video, dan blijft de poster staan en
verschijnen de punten alsnog. Bij `prefers-reduced-motion: reduce` vervalt de
video en tonen we de still (`hub.webp` / `hub-m.webp`) met de punten er direct op.

### Hotspots

Vijf links, posities overgenomen uit `wereld/index.html` van de company-repo zodat
ze op de illustratie kloppen:

| Label | Bestemming | left/top |
|---|---|---|
| Trainingen | `/#train` | 22% / 34% |
| Implementatie | `/#implement` | 44% / 24% |
| AI-oplossingen | `/#build` | 69% / 26% |
| Inspiratie | `/#inspire` | 77% / 55% |
| Projecten | `/#projecten` | 27% / 51% |
| Over Morgen. | `/#over-morgen` | 70% / 67% |
| Wegwijzer | `/#wegwijzer` | 52% / 47% |

Alle zeven punten van de wereld, zodat de kaart in het portaal dezelfde kaart is.
Projecten en Over Morgen krijgen net als op de wereld de secundaire behandeling
(`is-sub` daar): kleinere stip, gedempt label. De vier pilaren en het Kompas
blijven daarmee voorop.

Dit zijn de hash-routes van de wereld zelf (`ROUTE_BY_GEBOUW` plus `wegwijzer` in
`wereld.js`). `pasWereldRouteToe()` opent daarmee het bijbehorende gebouw of het
Kompas-vak, ook bij koud openen zonder de wereld eerst te doorlopen.

Bewust niet `/academy/`, `/consultancy/` en zo. Dan verlaat de bezoeker meteen de
wereld waar dit blok hem net naartoe lokte, en dat is precies wat we wilden
bereiken. Elk gebouw heeft binnen de wereld een eigen CTA naar de marketingpagina,
dus de route naar het aanbod blijft bestaan, alleen een stap later.

De wereld linkte zelf naar `/organisatie/#trainingwijzer-app`. Dat pad activeert de
home-sectie terwijl het Kompas in de academy-sectie staat, dus het anker wees naar
een onzichtbaar element. Rechtgezet in PR #46 en #47 van de company-repo.

De Wegwijzer krijgt het geel-groene accent: dat is de route naar het Kompas en
daarmee de plek waar doel 2 ontstaat.

Onder de illustratie een kop, een korte tekst en een primaire knop naar
`morgencompany.com`. Daaronder een stille tekstlink naar de Online Academy, zodat
die conversieroute niet verdwijnt met de oude kaartjes.

### Copy

- Kop: "Er ligt meer achter deze training"
- Body: "Een training is vaak het begin. Daarna komt het echte werken met AI:
  implementeren in de organisatie, laten landen in het dagelijkse werk, en
  maatwerk bouwen waar dat nodig is."
- Knop: "De wereld van Morgen in"

Geen em-dashes, conform de huisstijl. De copy noemt bewust geen "slides": er hangt
vaak ook ander materiaal onder een portaal.

### Mobiel

Onder 640px schakelt het blok naar de staande uitsnede. De hotspots houden hun
absolute plek, maar op de mobiele coordinaten (`xm`/`ym`) die ook in `wereld.js`
staan. Geen aparte chips-weergave dus: hetzelfde gedrag op elk formaat, net als op
de wereld zelf.

### Meten

Alle uitgaande links krijgen:

```
?utm_source=portal&utm_medium=referral&utm_campaign=wereld-poort
```

GA4 (`G-5F0ELV239K`) draait al op morgencompany.com en pikt dit op. Zonder deze
parameters blijft doel 1 een aanname.

### Toegankelijkheid

Elke hotspot is een `<a>` met een beschrijvend `aria-label`, gelijk aan de
company-site. De illustratie krijgt een lege `alt` (decoratief, alle betekenis zit
in de links). Geen JS nodig om het blok te tonen.

## Testen

`src/components/portal/PortalWereldPoort.test.tsx` met vitest en Testing Library:

1. Rendert vijf hotspot-links met de juiste bestemmingen.
2. Elke uitgaande link draagt de utm-parameters.

Daarnaast visueel nakijken in de dev-preview, desktop en mobiel.

## Bewust niet

- **Onthullen na download.** Overwogen, laten vallen: wie alleen komt kijken en
  niets downloadt zou de poort dan nooit zien.
- **De scroll-wereld embedden.** `scrub-engine.js` kaapt de scroll en botst met de
  portaalpagina, kost video-assets op mobiel en moet in twee repo's onderhouden.
- **Personalisatie per klant.** Handmatig instelbaar per portaal is scherper, maar
  verwatert zodra het invullen wordt vergeten.
