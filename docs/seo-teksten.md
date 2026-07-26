# SEO-teksten Morgen

Werkbestand voor de teksten die Google ziet. **Pas hieronder aan wat je wil, laat de rest staan.** Ik neem de wijzigingen daarna over in de code (7 bundles + `wereld/index.html`) en controleer of alles consistent staat.

Vuistregels: title tot ~60 tekens (anders knipt Google af), description 120 tot 155 tekens, geen em-dashes, elke pagina een eigen kop en beschrijving.

Stand: 2026-07-26. Sinds deze ronde claimt alleen /consultancy/ de term "AI-implementatie";
/academy/ staat op training en /technology/ op maatwerk en AI-oplossingen. Die drie titles
vochten om dezelfde zoekterm, waardoor Google geen pagina koos (positie 95, nul clicks).

---

## 1. Homepage (de wereld, `/`)

Dit is je sterkste pagina qua autoriteit maar had de minste tekst. Het blok onder de propositie is nieuw en staat in de HTML zelf, zodat Google het meeneemt.

| Veld | Tekst | Lengte |
|---|---|---|
| Title | AI-training, implementatie en maatwerk \| MORGEN | 47 |
| Description | Morgen helpt organisaties AI toepassen in werk en processen met praktische trainingen, implementatiebegeleiding en maatwerksoftware. | 132 |
| H1 | Maak AI onderdeel van het dagelijkse werk. | |
| Subtitel | Met trainingen, implementatie en maatwerksoftware voor organisaties. | |

**Nieuwe alinea (aanpasbaar):**

> Morgen leert teams werken met AI, helpt de keuzes landen in processen en werkafspraken, en bouwt maatwerk dat past op het werk dat er al is.

**De zes links eronder.** De ankertekst is hier het SEO-werk: dit is hoe Google leest waar je pagina's over gaan.

| Ankertekst | Gaat naar |
|---|---|
| AI-trainingen | /academy/ |
| Implementatie en begeleiding | /consultancy/ |
| Maatwerk en automatisering | /technology/ |
| Projecten | /projecten/ |
| Keynotes, podcast en boek | /inspiratie/ |
| Snel overzicht | /organisatie/ |

---

## 2. Per pagina

De H1 is de zichtbare hero-kop. Verander je die hier, dan verandert de kop op de pagina zelf mee.

### /academy/
| Veld | Tekst | Lengte |
|---|---|---|
| Title | MORGEN: AI-trainingen op maat voor teams | 40 |
| Description | AI-trainingen, implementaties en integraties voor teams die slimmer willen werken met technologie, automatisering en AI. | 119 |
| H1 | Klein beginnen. Groot doorpakken. | |

### /consultancy/
| Veld | Tekst | Lengte |
|---|---|---|
| Title | AI-implementatie voor organisaties \| Morgen Company | 51 |
| Description | AI-implementatie van strategie tot uitvoering: Morgen helpt organisaties de keuzes maken en laat AI landen in processen en dagelijks werk. | 137 |
| H1 | Digitalisering die landt in het werk. | |

### /technology/
| Veld | Tekst | Lengte |
|---|---|---|
| Title | AI-oplossingen en maatwerksoftware \| Morgen Company | 51 |
| Description | Morgen Company bouwt AI-assistenten, automatiseringen en digitale oplossingen die aansluiten op je werkprocessen en dagelijks gebruik. | 134 |
| H1 nu | Werk slimmer georganiseerd. | |

**Openstaand: jij wil hier een duidelijkere H1.** De hero heeft drie regels (wit / omlijnd / geel-groen), dus een voorstel moet in drie stukken te breken zijn. Opties:

1. Maatwerk / AI-oplossingen / die werken. → dekt "maatwerk" en "AI-oplossingen", verliest "slimmer werken"
2. AI-oplossingen / op maat / voor jouw processen. → sterker op zoekwoord, iets langer
3. Maatwerk / die past / op jouw werk. → dichter bij de huidige toon, zwakker op zoekwoord
4. Werk slimmer / georganiseerd / met AI op maat. → houdt de huidige kop, voegt zoekwoord toe

Kies er een of schrijf je eigen versie:

> H1 gewenst: ......................................................

### /projecten/
| Veld | Tekst | Lengte |
|---|---|---|
| Title | AI-assistenten en praktijkvoorbeelden \| Morgen Company | 54 |
| Description | Bekijk AI-assistenten, automatiseringen en klantcases die laten zien hoe technologie concreet werk uit handen neemt in echte organisaties. | 138 |
| H1 | Zij gingen je voor. | |

### /inspiratie/
| Veld | Tekst | Lengte |
|---|---|---|
| Title | Inspiratie, keynotes en programma's \| Morgen Company | 52 |
| Description | Inspiratie, keynotes en programma's over AI, technologie, adoptie en de impact op werk, leiderschap en organisaties. | 116 |
| H1 | Technologie verandert hoe we werken en leven. | |

### /about/
| Veld | Tekst | Lengte |
|---|---|---|
| Title | Over Morgen Company \| Team en aanpak | 36 |
| Description | Maak kennis met Morgen Company, het team en onze aanpak voor technologie, AI-adoptie en digitale verandering die blijft werken. | 127 |
| H1 | Over Morgen. | |

### /organisatie/ (het snelle overzicht, de oude homepage)
| Veld | Tekst | Lengte |
|---|---|---|
| Title | MORGEN: Technologiepartner voor bedrijven | 41 |
| Description | Morgencompany.com - maak AI onderdeel van je bedrijf met trainingen, strategie en maatwerk automatisering. | 120 |
| H1 nu | GoedeMORGEN. | |

**Openstaand:** deze pagina draagt al je content (bijna 48.000 tekens) maar heeft als H1 de begroeting. Dat zegt Google niets. Een beschrijvende H1 zou hier het meeste opleveren. De begroeting is wel een bewuste merkkeuze, dus dit is aan jou:

> H1 gewenst: ......................................................

---

## 3. Waar het in de code staat

Drie plekken, en ze moeten met elkaar kloppen:

1. **Statische `<head>` per bundel** (`index.html`, `academy/index.html`, ...) — dit is wat Google leest bij de eerste crawl. Per bestand anders, dat hoort zo.
2. **`routeMeta` in de JS van elke bundel** — hiermee wisselt de title bij intern klikken. Deze map staat in álle 7 bundles en moet daar identiek zijn.
3. **`wereld/index.html`** — de homepage: statische head plus het tekstblok onder de propositie.

Stand 2026-07-26: `routeMeta` staat in alle 7 bundles gelijk, gecontroleerd op de home-,
academy-, consultancy- en technology-titles. De eerder gemelde drift is opgelost.

---

## 4. Nog te beslissen (groter)

- **De homepage blijft dun.** Nu 54 woorden plus zes links. Wil je dat `/` zelf gaat ranken, dan is een echte tekstsectie onder de wereld nodig (350 tot 500 woorden, per pilaar een kop en een paar zinnen). Dat vraagt dat de pagina in hub-state mag scrollen.
- **Elke URL is 224 KB** omdat elk bestand alle pagina's bevat. Splitsen per pagina maakt de site sneller en haalt de dubbele content weg, maar raakt de routing.
