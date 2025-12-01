# 🏐 ASD Patrocinio San Giuseppe - Sezione Pallavolo

Sito web della **sezione pallavolo** dell'Associazione Sportiva Dilettantistica Patrocinio San Giuseppe. 

Le nostre squadre di pallavolo mista competono nei campionati UISP di Torino nelle categorie **MASTER 4+2** e **OPEN 3×3**.

## 📋 Indice

- [Panoramica](#-panoramica)
- [Caratteristiche Principali](#-caratteristiche-principali)
- [Tecnologie](#-tecnologie)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Installazione e Sviluppo](#-installazione-e-sviluppo)
- [Gestione dei Contenuti](#-gestione-dei-contenuti)
- [Funzionalità Implementate](#-funzionalità-implementate)
- [Roadmap](#-roadmap)
- [Crediti](#-crediti)

## 🎯 Panoramica

Questo progetto è stato sviluppato per fornire alla sezione pallavolo del PSG una presenza web funzionale e coinvolgente. Attualmente è un **progetto interno** hostato su Netlify, pensato per giocatori, famiglie e appassionati della squadra, che serve anche come dimostrazione di competenze nello sviluppo web moderno.

### Architettura Attuale

- **Hosting**: [Netlify](https://www.netlify.com/) con deploy automatico da Git
- **Contenuti**: File-based (Markdown + CSV), versionati su Git
- **Database**: Nessuno - architettura statica con generazione al build time
- **Dominio**: Interno (netlify.app) - dominio personalizzato previsto per versione ufficiale futura

### Obiettivi del Progetto

- **Informazione**: Fornire informazioni aggiornate su partite, classifiche e risultati
- **Comunicazione**: Mantenere la community informata attraverso "Il Gazzettino" (magazine digitale)
- **Engagement**: Promuovere eventi, tornei e attività sociali della squadra
- **Portfolio**: Dimostrare competenze in sviluppo web con tecnologie moderne e best practices

## ✨ Caratteristiche Principali

### 🏆 Gestione Campionati
- **Classifiche in tempo reale** calcolate automaticamente dai risultati
- **Calendario partite** con vista mensile e filtri per categoria
- **Dettagli partite** con informazioni su orari, palestre e risultati
- **Integrazione Google Maps** per indicazioni stradali alle palestre
- **Link a classifiche ufficiali UISP**

### 📰 Il Gazzettino PSG
- Magazine digitale con cronache delle partite
- Articoli organizzati per squadra (Master/Open) e giornata
- Valutazioni giocatori e commenti divertenti
- Sistema di tag e categorie
- Design editoriale professionale

### 🎉 Sistema Eventi
- **Eventi Futuri**: Tornei e amichevoli in programma con iscrizioni
- **Eventi Passati**: Resoconti dettagliati con gallerie fotografiche
- Carosello immagini con modalità fullscreen
- Informazioni su quota, scadenze e link di registrazione
- Integrazione con Google Drive per gallerie complete

### 📱 Design Responsive
- Layout ottimizzato per desktop, tablet e mobile
- Tabelle adattive con visualizzazioni semplificate su mobile
- Navigazione intuitiva con menu hamburger
- Componenti UI moderni da shadcn/ui

### 🎨 Identità Visiva
- Colori sociali: Bianco, Blu e Rosso
- Logo e branding coerente
- Sezione sponsor (Patago)
- Footer con informazioni di contatto e social media

## 🛠 Tecnologie

### Core
- **[Next.js 16](https://nextjs.org/)** - Framework React con App Router
- **[React 19](https://react.dev/)** - Libreria UI
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling utility-first

### UI Components
- **[shadcn/ui](https://ui.shadcn.com/)** - Componenti accessibili e personalizzabili
- **[Radix UI](https://www.radix-ui.com/)** - Primitives UI
- **[Lucide React](https://lucide.dev/)** - Icone
- **[React Icons](https://react-icons.github.io/react-icons/)** - Set icone aggiuntive

### Gestione Contenuti
- **[gray-matter](https://github.com/jonschlinkert/gray-matter)** - Parsing frontmatter
- **[remark](https://github.com/remarkjs/remark)** - Markdown processor
- **[remark-html](https://github.com/remarkjs/remark-html)** - Conversione MD → HTML
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown
- **[csv-parse](https://csv.js.org/parse/)** - Parsing CSV per dati campionati

### Utilities
- **[date-fns](https://date-fns.org/)** - Manipolazione date con localizzazione italiana
- **[embla-carousel-react](https://www.embla-carousel.com/)** - Caroselli immagini
- **[clsx](https://github.com/lukeed/clsx)** & **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Utility per classi CSS

## 📁 Struttura del Progetto

```
pallavolo-sito/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout principale
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Stili globali
│   ├── chi-siamo/               # Chi Siamo
│   ├── campionato/              # Classifiche e calendario
│   ├── gazzettino/              # Magazine
│   │   └── [squadra]/[slug]/   # Articoli dinamici
│   └── eventi/                  # Eventi
│       └── [slug]/              # Dettaglio evento
├── components/                   # Componenti React
│   ├── ui/                      # shadcn/ui components
│   ├── Navbar.tsx               # Navigazione
│   ├── Footer.tsx               # Footer
│   ├── CalendarView.tsx         # Calendario partite
│   ├── RankingTable.tsx         # Tabelle classifiche
│   ├── NextMatchCard.tsx        # Card prossima partita
│   ├── ImagesCarousel.tsx       # Carosello immagini
│   ├── ScrollToTop.tsx          # Bottone scroll-to-top
│   └── Breadcrumbs.tsx          # Breadcrumbs navigazione
├── lib/                          # Utilities e logica
│   ├── campionato.ts            # Gestione dati campionati
│   ├── campionato-types.ts      # Type definitions campionati
│   ├── markdown.ts              # Gestione contenuti Gazzettino
│   ├── eventi.ts                # Gestione eventi
│   ├── calendar-utils.ts        # Utility calendario
│   └── utils.ts                 # Utility generali
├── content/                      # Contenuti (Git-tracked)
│   ├── campionati/              # Dati CSV campionati
│   │   ├── master.csv           # Partite MASTER 4+2
│   │   └── open.csv             # Partite OPEN 3×3
│   ├── gazzettino/              # Articoli markdown
│   │   ├── master/              # Articoli squadra Master
│   │   └── open/                # Articoli squadra Open
│   └── eventi/                  # Eventi markdown
│       ├── futuri/              # Eventi in programma
│       └── passati/             # Eventi conclusi
└── public/                       # Assets statici
    └── images/                  # Immagini e loghi
        ├── logos/               # Loghi squadra e sponsor
        └── eventi/              # Foto eventi

```

## 🚀 Installazione e Sviluppo

### Prerequisiti

- **Node.js** 20.x o superiore
- **npm** o **pnpm** (raccomandato)

### Setup Locale

```bash
# Clona il repository
git clone https://github.com/Ela17/WEBSITE_PSGvolley.git
cd pallavolo-sito

# Installa le dipendenze
npm install
# oppure
pnpm install

# Avvia il server di sviluppo
npm run dev
# oppure
pnpm dev
```

Il sito sarà disponibile su [http://localhost:3000](http://localhost:3000)

### Build di Produzione

```bash
# Build ottimizzato
npm run build

# Avvia il server di produzione
npm start
```

### Linting

```bash
npm run lint
```

## 🚀 Deployment

### Netlify (Attuale)

Il sito è attualmente hostato su Netlify con deploy automatico:

- **Branch principale**: `main` → deploy in produzione automatico
- **Build command**: `npm run build`
- **Publish directory**: `.next`
- **Node version**: 20.x

**Vantaggi architettura statica:**
- ✅ Zero costi di hosting (piano gratuito Netlify)
- ✅ Deploy automatico ad ogni push
- ✅ Preview deployment per pull request
- ✅ CDN globale e HTTPS automatico
- ✅ Nessuna gestione server o database

**Limitazioni:**
- ❌ Aggiornamenti contenuti richiedono commit + push
- ❌ Nessuna gestione utenti o autenticazione
- ❌ Scalabilità limitata per grandi volumi di contenuti

### Deploy Manuale

Per deployare manualmente su altre piattaforme (Vercel, Cloudflare Pages, ecc.):

```bash
# Build di produzione
npm run build

# La cartella .next/ contiene il sito ottimizzato
# Carica il contenuto sulla piattaforma di hosting
```

## 📝 Gestione dei Contenuti

> **Nota**: Tutti i contenuti sono gestiti tramite **file statici** (Markdown e CSV) versionati su Git. Non c'è un database: ogni modifica richiede un commit e un push per essere pubblicata. La zona admin futura semplificherà questo processo.

### Campionati (CSV)

I dati delle partite sono gestiti tramite file CSV in `content/campionati/`:

**Struttura CSV:**
```csv
CAT,N. Gara,Data,Ora,Squadra A,Separatore,Squadra B,PALESTRA,NOTE,SetA_Vinti,SetB_Vinti,1_SET_PTS_A,1_SET_PTS_B,...
```

- **Calcolo automatico classifiche**: Punti, set vinti/persi, quoziente set
- **Parsing date italiane**: Formato `gg/mm/aa`
- **Normalizzazione categorie**: MASTER 4+2, OPEN 3×3

### Il Gazzettino (Markdown)

Articoli in `content/gazzettino/[master|open]/`:

**Frontmatter esempio:**
```yaml
---
title: "Titolo articolo"
date: "2025-01-15"
week: 10
season: "2024-2025"
excerpt: "Breve descrizione"
coverImage: "/images/gazzettino/cover.jpg"
category: "Cronaca"
author: "Nome Autore"
tags: [vittoria, rimonta, derby]
---

Contenuto markdown dell'articolo...
```

### Eventi (Markdown)

Eventi in `content/eventi/[futuri|passati]/`:

**Frontmatter esempio (Futuro):**
```yaml
---
title: "Nome Torneo"
date: "2025-02-20"
location: "Palestra XYZ"
locationLink: "https://maps.google.com/..."
description: "Descrizione breve"
coverImage: "/images/eventi/cover.jpg"
type: torneo  # torneo | amichevole | evento-sociale | altro
category: "Master"
registrationLink: "https://..."
registrationDeadline: "2025-02-15"
fee: "15€ a persona"
tags: [torneo, open, primavera]
---

Dettagli evento in markdown...
```

**Frontmatter esempio (Passato):**
```yaml
---
title: "Nome Torneo"
date: "2024-12-15"
location: "Palestra XYZ"
description: "Descrizione breve"
coverImage: "/images/eventi/cover.jpg"
type: torneo
category: "Master"
images:
  - /images/eventi/torneo2024/foto1.jpg
  - /images/eventi/torneo2024/foto2.jpg
imagesFolder: "eventi/torneo2024"
tags: [torneo, vittoria]
---

Resoconto evento in markdown...
```

## 🎨 Funzionalità Implementate

### Homepage
- ✅ Hero section con logo e titolo
- ✅ Ultimi articoli del Gazzettino (Master e Open)
- ✅ Prossime partite per entrambe le categorie
- ✅ Design responsive

### Chi Siamo
- ✅ Storia e valori dell'associazione
- ✅ Loghi polisportiva e 40 anni
- ✅ Finalità e attività

### Campionato
- ✅ Classifiche live con calcolo automatico
- ✅ Link alle classifiche ufficiali UISP
- ✅ Calendario mensile interattivo
- ✅ Vista mobile ottimizzata (lista cronologica)
- ✅ Dettagli partita con risultati
- ✅ Google Maps per indicazioni palestre
- ✅ Badge categoria (Master/Open)
- ✅ Link a regolamento UISP

### Il Gazzettino
- ✅ Tab separate per Master e Open
- ✅ Card articoli con cover image
- ✅ Tag e categorie
- ✅ Pagine articolo con styling markdown
- ✅ Metadati (autore, data, giornata)

### Eventi
- ✅ Tab "Prossimi Eventi" e "Eventi Passati"
- ✅ Card eventi con informazioni
- ✅ Pagine dettaglio evento
- ✅ Carosello immagini per eventi passati
- ✅ Modalità fullscreen per foto
- ✅ Link Google Drive per gallery complete

### UI/UX
- ✅ Navbar sticky con indicatore pagina attiva
- ✅ Footer con sponsor e social
- ✅ Scroll-to-top button (icona razzo 🚀)
- ✅ Componenti shadcn/ui consistenti
- ✅ Dark mode support (colori definiti)
- ✅ Animazioni e transizioni

## 🗺 Roadmap

### In Sviluppo
- 🚧 **Zona Admin** per gestione contenuti
  - Dashboard amministrativa
  - Upload/modifica/eliminazione articoli Gazzettino
  - Gestione eventi (creazione, editing, upload foto)
  - Aggiornamento CSV campionati
  - Autenticazione sicura

### Evoluzione Versione Ufficiale
- 🌐 **Dominio personalizzato**
- 🗄️ **Migrazione a Database** 
  - Sistema CMS per gestione contenuti
  - Database per articoli, eventi, partite
  - API backend per operazioni CRUD
  - Backup e versioning automatico
- 🐳 **Containerizzazione con Docker**
  - Dockerfile per ambiente consistente
  - Docker Compose per stack completo (app + DB)
  - Deployment semplificato su qualsiasi server
  - Sviluppo locale isolato

### Funzionalità Future
- 👥 Pagine profilo giocatori

## 👨‍💻 Crediti

**Sviluppo e Design:**  
Elena Derosas ([GitHub: @Ela17](https://github.com/Ela17))

**Per:**  
Sezione Pallavolo - ASD Patrocinio San Giuseppe, Torino

**Sponsor:**  
[Patago](https://www.patago.it/)

## 📄 Licenza

Questo progetto è sviluppato come progetto interno per la sezione pallavolo dell'ASD Patrocinio San Giuseppe.  
© 2025 ASD Patrocinio San Giuseppe - Sezione Pallavolo. Tutti i diritti riservati.

## 🔗 Link Utili

- 🌐 **Sito Web**: [Progetto interno su Netlify](https://asdpatrociniosangiuseppe-volley.netlify.app/)
- 📱 **Instagram**: [@asd_patrocinosgiuseppe](https://www.instagram.com/asd_patrocinosgiuseppe)
- 📍 **Sede**: [Via Pietro Baiardi 4, Torino](https://www.google.com/search?q=maps+via+pietro+baiardi+4+torino)
- 🏐 **UISP Torino**: [Classifiche e Regolamenti](https://torino.uisp.it/)
