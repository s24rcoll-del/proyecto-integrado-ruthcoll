# Centre d'Arts Santa Mònica — Redisseny Web
### Treball de Fi de Grau · Disseny Gràfic · 2026

**Autora:** Ruth Coll Marquès

---

## Sobre el projecte

Aquest projecte és el redisseny complet del lloc web del **Centre d'Arts Santa Mònica**, un centre d'arts públic, gratuït i obert a tothom situat a La Rambla de Barcelona. El Santa Mònica no és un museu convencional: és un espai on la creació artística contemporània, la recerca, la participació i la comunitat es troben.

El repte d'aquest TFG no era simplement fer una web "més maca". Era construir un sistema visual i editorial coherent, contemporani i amb caràcter propi que fos fidel a la identitat i la filosofia del centre: experimental, accessible, institucional sense ser fred.

El projecte ha estat desenvolupat íntegrament amb **HTML, CSS i JavaScript purs**, sense cap framework ni llibreria externa. Tot el sistema —des de la tipografia i el color fins als modals, carousels i animacions— ha estat construït a mà, línia a línia.

---

## Objectius

- Redissenyar el lloc web del Santa Mònica amb una identitat visual clara, coherent i contemporània
- Construir un sistema de disseny escalable en codi pur, sense dependències externes
- Aconseguir una experiència de navegació fluida, accessible i responsive en tots els dispositius
- Reflectir la filosofia editorial i artística del centre en cada decisió de disseny i interacció
- Demostrar que el control absolut del sistema visual és possible sense frameworks

---

## Direcció visual i conceptual

La identitat visual parteix del sistema de la marca real del Santa Mònica:

- **Tipografia:** Neue Haas Grotesk Display Pro — neta, contemporània, amb autoritat tipogràfica
- **Color:** Blau SM (`#0518F5`) com a color principal, combinat amb blanc i negre per crear un sistema fort i llegible
- **Marges:** 50px de padding lateral com a unitat de referència del sistema, alineada amb el logo del nav
- **Ritme editorial:** Jerarquies clares, espais que respiren, composicions que no sobrecarreguen

La web busca un equilibri entre **institucionalitat i experimentalitat**: ha de sentir-se sòlida i fiable com correspon a un equipament públic, però alhora ha de tenir la personalitat d'un centre d'arts que pensa, que proposa i que arrisca.

---

## Tecnologies

```
HTML5     →  Estructura semàntica, landmarks ARIA, accessibilitat
CSS3      →  Sistema visual complet: layout, tipografia, animacions, responsive
JavaScript   →  Interaccions, carousels, modals, formularis, reveals
```

---

## Pàgines

| Fitxer | Descripció |
|---|---|
| `index.html` | Pàgina d'inici — hero vídeo, properes activitats, exposicions destacades, formulari de contacte |
| `santa-monica.html` | El Centre — actualitat, informació, galeria fotogràfica, Qui Som, espais, imatge corporativa |
| `exp-act.html` | Exposicions i Activitats — sistema de panells, filtres, carousels d'activitats i exposicions |
| `exp-xiuxiueigs.html` | Pàgina específica de l'exposició "Xiuxiueigs a la Sala Bar" |
| `visita.html` | Pàgina de Visita |
| `avis-legal.html` | Avís legal — 7 seccions amb índex de navegació intern |
| `accessibilitat.html` | Declaració d'accessibilitat web (WCAG 2.1 AA, RD 1112/2018) |
| `politica-galetes.html` | Política de galetes — taula de cookies, gestió per navegador |

---

## Estructura de carpetes

```
codi-tfg-claude/
│
├── index.html
├── santa-monica.html
├── exp-act.html
├── exp-xiuxiueigs.html
├── visita.html
├── avis-legal.html
├── accessibilitat.html
├── politica-galetes.html
│
├── css/
│   ├── base.css        # Globals: variables, tipografia, nav, footer, reset (~797 línies)
│   ├── pages.css       # Estils específics per pàgina i sistema responsive (~3.200 línies)
│   └── ui.css          # Components UI: modals, carousels, botons, formularis (~1.227 línies)
│
├── js/
│   ├── main.js         # Modal activitat, nav scroll, reveals, acordions, hamburger menu
│   ├── carroussel.js   # Carousel d'activitats (home) + formulari de contacte
│   ├── santa-monica.js # Modals actualitat i espais, carousels de la pàgina El Centre
│   ├── exp-act.js      # Sistema de panells, filtres, carousels d'exposicions i activitats
│   └── xiuxiueigs.js   # Lògica específica de la pàgina de l'exposició
│
└── media/
    ├── logos/          # Logotips SVG (positiu, negatiu, Generalitat)
    ├── icons/          # Icones SVG xarxes socials i UI
    ├── espais-0X.jpg   # Fotografies dels espais del centre
    ├── galeria0X.jpg   # Galeria fotogràfica editorial (El Centre)
    ├── act-*.jpg/png   # Imatges d'activitats
    ├── exp-*.jpg       # Imatges d'exposicions
    ├── obra-*.jpg      # Fotografies d'obres
    ├── video-*.mp4     # Vídeos de fons (heroes)
    └── MANUAL_LOGOTIP_SM.pdf  # Manual d'imatge corporativa (descarregable)
```

---

## Arquitectura CSS

El sistema CSS s'organitza en tres capes amb responsabilitats clares:

**`base.css`** — La base global. Aquí viuen les variables CSS (colors, fonts), els estils del nav amb comportament sticky, el footer, les classes utilitàries i el reset. És l'únic full que s'hauria d'aplicar a totes les pàgines per igual.

**`pages.css`** — El cor del sistema. Estils específics per cada pàgina, scoped amb classes de body (`.page-sm`, `.page-exp-act`, `.page-legal`...), sistema responsive complet en tres breakpoints, i tots els grids editorials. ~3.200 línies de CSS escrit i organitzat a mà.

**`ui.css`** — Els components interactius. Modals, carousels, botons, formularis. Tot el que implica interacció i animació viu aquí, separat de l'estil editorial.

---

## Funcionalitats principals

### Navegació
- Nav sticky amb transició de fons en fer scroll (`> 60px`)
- Adaptació de color per pàgina: negre a `.page-sm`, blanc a les pàgines fosques
- Menú hamburguesa mòbil en overlay amb animació de barres → creu
- Tancament amb `Escape`, clic fora, i auto-tancament en resize a desktop

### Reveals i animacions d'entrada
- `IntersectionObserver` per activar `.sm-reveal` (fade + translateY) en entrar al viewport
- Sistema `.sm-stagger` per animar grids ítem a ítem amb delay encadenat
- Zero impacte de rendiment: no hi ha `scroll` listeners, tot va per observer

### Carousels
Quatre carousels independents, cadascun amb la seva lògica adaptada al context:
- **Activitats (home)** — 4 col. desktop / 2 tablet / 1 mòbil, amb dots i swipe tàctil
- **Actualitat (El Centre)** — 4 col. desktop / 2 tablet / 1 mòbil
- **Espais (El Centre)** — Grid 3×2 desktop / carousel 2 pàg. tablet / 1 pàg. mòbil
- **Activitats i Exposicions (Exp-Act)** — Sistema de panells amb filtres per categoria

### Modals
Tres tipologies de modal, cadascuna dissenyada específicament:
- **Modal d'activitat** — Imatge + informació + contador d'entrades + formulari de reserva + confirmació. Barra de progrés al contingut scrollable
- **Modal de notícia** — Dos columnes (imatge full-bleed / text) amb scroll intern i gradient fade
- **Modal d'espai** — Composició editorial amb número tipogràfic decoratiu gran, metadades estructurades

Tots els modals: bloqueig de scroll del body (patró iOS), tancament per `Escape`, clic a l'overlay i botó ×.

### Sistema de filtres (Exp-Act)
Filtres per categoria que activen/desactiven panells de contingut de forma dinàmica. En mòbil es converteix en un dropdown accessible.

### Galeria fotogràfica editorial
Composició en filmstrip horitzontal (desktop) amb proporcions variades (`flex: 2.2 · 1.1 · 1.6 · 1.4 · 1.9 · 1.0`) per crear ritme visual. Captions amb gradient blau SM, visibles en hover (desktop) i sempre visibles (mòbil tàctil).

### Acordions (Qui Som)
Sistema d'acordió exclusiu: només un ítem obert a la vegada. Animació d'altura amb CSS, rotació de la fletxa per classe.

### Formulari de contacte
Validació en temps real, gestió d'errors accessible, transició fade form → confirmació.

### Documents legals
Tres pàgines legals completes (Avís Legal, Accessibilitat, Política de Galetes) amb índex de navegació intern, taula de cookies, i layout editorial net consistent amb la resta del sistema.

---

## Sistema responsive

Tres breakpoints principals, definits de forma consistent a tot el projecte:

| Breakpoint | Rang | Comportament |
|---|---|---|
| **Desktop** | `> 1100px` | Grids de 3–4 columnes, carousels desactivats, hover effects |
| **Tablet** | `768px – 1100px` | Grids de 2 columnes, carousels actius (2 ítems/pàg.), nav comprimida |
| **Mòbil** | `< 767px` | Columna única, carousels 1 ítem/pàg., hamburger menu, captions sempre visibles |

El sistema de marges és coherent en tots els breakpoints:
- Desktop: `50px` lateral (alineat amb el logo del nav)
- Tablet: `40px` lateral
- Mòbil: `24px` lateral

---

## Com executar el projecte

No hi ha cap procés de build, cap instal·lació, cap dependència.

**Opció 1 — VS Code Live Server (recomanat)**
1. Obrir la carpeta del projecte amb VS Code
2. Instal·lar l'extensió **Live Server** (Ritwick Dey)
3. Clic dret sobre `index.html` → *Open with Live Server*

**Opció 2 — Python (qualsevol terminal)**
```bash
cd ruta/al/projecte
python3 -m http.server 8000
# Obrir: http://localhost:8000
```

**Opció 3 — Obrir directament al navegador**
Doble clic sobre qualsevol `.html`. Funciona per a la majoria de funcionalitats, però els vídeos de fons poden tenir restriccions de CORS en alguns navegadors.

> **Nota:** No obrir des del servidor intern de Claude Code (phnode), ja que no està dissenyat per servir fitxers estàtics i pot generar errors 500 en les peticions de recursos.

---

## Dependències

**Cap dependència externa.**

L'únic recurs extern és la tipografia:

```css
font-family: 'Neue Haas Grotesk Display Pro', sans-serif;
```

Aquesta font forma part del sistema tipogràfic oficial del Santa Mònica i s'hauria de tenir instal·lada al sistema o servir-se localment per veure el resultat òptim. En absència de la font, el navegador cau en la pila sans-serif del sistema.

---

## Decisions UX/UI destacades

**Marges alineats amb el logo** — El sistema de marges (50px desktop) no és arbitrari: coincideix exactament amb el padding del nav, de manera que tots els continguts queden visivament ancorats sota el logo. Coherència sistèmica.

**Reveals per IntersectionObserver** — Evitar `scroll` listeners per a les animacions d'entrada millora el rendiment de forma significativa, especialment en dispositius mòbils.

**Carousels sense llibreries** — Cada carousel utilitza `transform: translateX()` calculat en JS pur. Lleuger, precís, i totalment adaptat al context de cada secció.

**Modals amb fix del body (patró iOS)** — El patró `body.style.top = -scrollY` resol el problema de scroll en obrir modals en Safari/iOS, on `overflow: hidden` al body no sempre funciona correctament.

**Captions sempre visibles en mòbil** — En dispositius tàctils no existeix l'estat hover. Les captions de la galeria canvien d'estratègia i es mostren de forma permanent amb un gradient suau.

**Arquitectura CSS escalable** — Scoping per classe de body (`.page-sm .inst-item`) per evitar col·lisions entre grids de pàgines diferentes. Una lliçó apresa i aplicada: els selectors globals `nth-child` en CSS s'han d'escalar sempre al seu contenidor pare.

---

## Reflexió: experimentalitat vs. usabilitat

Un dels fils conductors del projecte és la tensió entre dos valors que semblen oposats però que en un centre d'arts contemporani han de coexistir: l'**experimentalitat visual** i la **usabilitat real**.

El Santa Mònica és un centre que pensa i que arrisca. La web ha de transmetre-ho. Però una web que ningú entén no serveix a la seva funció comunicativa ni a la institució que representa.

La solució ha estat apostar per una **experimentalitat continguda**: composicions editorials asimètriques però llegibles, microinteraccions suaus però presents, una identitat visual forta però accessible. No és una web de portfolio d'artista, és la web d'un centre públic que rep milers de visites.

El codi pur ha estat, en aquest sentit, un aliat: obliga a entendre exactament el que s'està fent, i fa impossible amagar decisions de disseny darrere d'una llibreria. Cada efecte, cada transició, cada layout ha estat decidit conscientment.

---

## Possibles millores futures

- **CMS o data layer** — Connectar el contingut (activitats, exposicions, notícies) a un fitxer JSON o una API per facilitar l'actualització sense tocar el codi HTML
- **Internacionalització** — Versió en castellà i anglès del lloc web
- **Mode fosc** — Implementació d'un tema fosc respectant les preferències del sistema (`prefers-color-scheme`)
- **Lazy loading avançat** — Combinació de `loading="lazy"` natiu amb un observer personalitzat per als vídeos de fons
- **PWA** — Service Worker per a funcionament offline i millora de rendiment en connexions lentes
- **Tests d'accessibilitat** — Auditoria completa amb eines com axe o Lighthouse per assolir 100% de conformitat WCAG 2.1 AA
- **Optimització d'imatges** — Conversió a formats WebP/AVIF amb fallback per a navegadors antics

---

## Autoria

**Ruth Coll Marquès**
Disseny Gràfic — Treball de Fi de Grau, 2026

Projecte acadèmic de redisseny basat en el lloc web real del Centre d'Arts Santa Mònica (santamonica.cat). Totes les fotografies, logotips i continguts pertanyen al Centre d'Arts Santa Mònica i a la Generalitat de Catalunya. Aquest projecte té finalitat estrictament acadèmica.

---

*~5.200 línies de CSS · ~1.400 línies de JavaScript · 8 pàgines HTML · 0 dependències externes*
