# 🏐 ASD Patrocinio San Giuseppe - Sezione Pallavolo

Sito web della **sezione pallavolo** dell'Associazione Sportiva Dilettantistica Patrocinio San Giuseppe. 

Le nostre squadre di pallavolo mista competono nei campionati UISP di Torino nelle categorie **MASTER 4+2** e **OPEN 3×3**.

## 📋 Indice

- [Panoramica](#-panoramica)
- [🚧 In Aggiornamento: Migrazione a Supabase](#-in-aggiornamento-migrazione-a-supabase)
- [Caratteristiche Principali](#-caratteristiche-principali)
- [Tecnologie](#-tecnologie)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Installazione e Sviluppo](#-installazione-e-sviluppo)
- [Gestione dei Contenuti](#-gestione-dei-contenuti)
- [Funzionalità Implementate](#-funzionalità-implementate)
- [Roadmap](#-roadmap)
- [Crediti](#-crediti)

## 🎯 Panoramica

Questo progetto è stato sviluppato per fornire alla sezione pallavolo del PSG una presenza web funzionale e coinvolgente. Attualmente è un **progetto interno** hostato su Vercel, pensato per giocatori, famiglie e appassionati della squadra, che serve anche come dimostrazione di competenze nello sviluppo web moderno.

### Architettura Attuale

- **Hosting**: [Vercel](https://vercel.com/) con deploy automatico da Git
- **Database**: [Supabase](https://supabase.com/) (PostgreSQL)
- **Contenuti**: Database-driven con backup file-based (Markdown + CSV)
- **Dominio**: Interno (vercel.app) - dominio personalizzato previsto per versione ufficiale futura

### Obiettivi del Progetto

- **Informazione**: Fornire informazioni aggiornate su partite, classifiche e risultati
- **Comunicazione**: Mantenere la community informata attraverso "Il Gazzettino" (magazine digitale)
- **Engagement**: Promuovere eventi, tornei e attività sociali della squadra
- **Portfolio**: Dimostrare competenze in sviluppo web con tecnologie moderne e best practices

---

## 🚧 In Aggiornamento: Migrazione a Supabase

Il progetto è migrato da un'architettura completamente file-based a un **database Supabase** per permettere aggiornamenti dinamici senza rebuild.

### Stato della Migrazione

| Componente | File-based | Database | Stato |
|------------|:----------:|:--------:|:-----:|
| Gazzettino | `content/gazzettino/*.md` | `gazzettino_articles` | ✅ Completato |
| Eventi | `content/eventi/**/*.md` | `eventi` | ✅ Completato |
| Partite | `content/campionati/*.csv` | `matches` | ✅ Completato |

### Schema Database

```sql
-- Articoli Gazzettino
CREATE TABLE gazzettino_articles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  week INTEGER NOT NULL,
  season TEXT NOT NULL,
  excerpt TEXT,
  cover_image TEXT,
  category TEXT,
  author TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Eventi
-- Nota: la distinzione futuro/passato si basa sulla data dell'evento (date >= oggi = futuro)
CREATE TABLE eventi (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  location TEXT,
  location_link TEXT,
  description TEXT NOT NULL,
  cover_image TEXT,
  type TEXT NOT NULL CHECK (type IN ('torneo', 'amichevole', 'evento-sociale', 'altro')),
  category TEXT,
  images TEXT[] DEFAULT '{}',
  images_folder TEXT,
  registration_link TEXT,
  registration_deadline DATE,
  fee TEXT,
  tags TEXT[] DEFAULT '{}',
  content TEXT NOT NULL,
  locandina TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Partite Campionato
CREATE TABLE matches (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  categoria TEXT NOT NULL CHECK (categoria IN ('master', 'open')),
  numero_gara TEXT NOT NULL,
  data DATE NOT NULL,
  ora TEXT,
  squadra_a TEXT NOT NULL,
  squadra_b TEXT NOT NULL,
  palestra TEXT,
  note TEXT,
  set_a_vinti INTEGER,
  set_b_vinti INTEGER,
  punteggi_set JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Variabili d'Ambiente Richieste

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

### Script di Migrazione

Gli script per migrare i contenuti sono in `scripts/`:

```bash
# Migra articoli Gazzettino
npm run migrate:gazzettino

# Migra eventi
npm run migrate:eventi

# Migra partite da CSV
npm run migrate:matches

# Migra tutto
npm run migrate:all
```

---

## ✨ Caratteristiche Principali

### 🏆 Gestione Campionati
- **Classifiche in tempo reale** calcolate automaticamente dai risultati
- **Calendario partite** con vista mensile e filtri per categoria
- **Dettagli partite** con informazioni su orari, palestre e risultati
- **Integrazione Google Maps** per indicazioni stradali alle palestre
- **Link a classifiche ufficiali UISP**

### 📰 Il Gazzettino PSG
- Magazine digitale con cronache delle partite
- Articoli organizzati per giornata di campionato
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

### Database & Backend
- **[Supabase](https://supabase.com/)** - Database PostgreSQL + Auth + API
- **[@supabase/supabase-js](https://github.com/supabase/supabase-js)** - Client JavaScript

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
- **[dotenv](https://github.com/motdotla/dotenv)** - Gestione variabili d'ambiente

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
│   │   └── [slug]/              # Articoli dinamici
│   ├── eventi/                  # Eventi
│   │   └── [slug]/              # Dettaglio evento
│   ├── admin/                   # Area amministrazione
│   │   └── login/               # Login admin
│   └── api/                     # API Routes
│       └── auth/                # Autenticazione
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
│   ├── supabase.ts              # Client Supabase
│   ├── campionato.ts            # Gestione dati campionati
│   ├── campionato-types.ts      # Type definitions campionati
│   ├── gazzettino.ts            # Gestione contenuti Gazzettino
│   ├── eventi.ts                # Gestione eventi
│   ├── calendar-utils.ts        # Utility calendario
│   ├── session.ts               # Gestione sessioni admin
│   ├── env.ts                   # Variabili d'ambiente
│   └── utils.ts                 # Utility generali
├── scripts/                      # Script di utilità
│   ├── migrate-gazzettino.ts    # Migrazione articoli → DB
│   ├── migrate-eventi.ts        # Migrazione eventi → DB
│   └── migrate-matches.ts       # Migrazione partite → DB
├── content/                      # Contenuti (Git-tracked, backup)
│   ├── campionati/              # Dati CSV campionati
│   │   ├── master.csv           # Partite MASTER 4+2
│   │   └── open.csv             # Partite OPEN 3×3
│   ├── gazzettino/              # Articoli markdown
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
- **Account Supabase** (per il database)

### Setup Locale

```bash
# Clona il repository
git clone https://github.com/Ela17/WEBSITE_PSGvolley.git
cd pallavolo-sito

# Installa le dipendenze
npm install
# oppure
pnpm install

# Configura le variabili d'ambiente
cp .env.example .env.local
# Modifica .env.local con le tue credenziali

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

### Script Disponibili

```bash
npm run dev              # Avvia dev server
npm run build            # Build produzione
npm run start            # Avvia produzione
npm run lint             # Linting
npm run migrate:gazzettino  # Migra articoli a DB
npm run migrate:eventi      # Migra eventi a DB
npm run migrate:matches     # Migra partite a DB
npm run migrate:all         # Migra tutto
```

## 🚀 Deployment

### Vercel (Attuale)

Il sito è attualmente hostato su Vercel con deploy automatico:

- **Branch principale**: `main` → deploy in produzione automatico
- **Build command**: `npm run build`
- **Output directory**: `.next`
- **Node version**: 20.x

**Variabili d'ambiente su Vercel:**
Configurare in Project Settings → Environment Variables:
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SESSION_SECRET`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD_HASH_BASE64`

## 📝 Gestione dei Contenuti

### Database (Principale)

I contenuti sono gestiti nel database Supabase:
- **gazzettino_articles**: Articoli del Gazzettino
- **eventi**: Eventi (futuri e passati, distinti automaticamente dalla data)
- **matches**: Partite dei campionati

### File Markdown (Backup)

I file markdown in `content/` sono mantenuti come backup e per gli script di migrazione.

**Frontmatter Gazzettino:**
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
```

**Frontmatter Eventi:**
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
tags: [torneo, open, primavera]
---
```

## 🎨 Funzionalità Implementate

### Homepage
- ✅ Hero section con logo e titolo
- ✅ Ultimi articoli del Gazzettino
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
- ✅ Lista articoli cronologica
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

### Admin
- ✅ Sistema autenticazione con iron-session
- ✅ Login protetto
- ✅ Dashboard admin
- ✅ CRUD Gazzettino
- ✅ CRUD Eventi
- ✅ Gestione risultati partite
- ✅ Upload immagini su Supabase Storage
- ✅ Editor WYSIWYG con Tiptap

### UI/UX
- ✅ Navbar sticky con indicatore pagina attiva
- ✅ Footer con sponsor e social
- ✅ Scroll-to-top button (icona razzo 🚀)
- ✅ Componenti shadcn/ui consistenti
- ✅ Dark mode support (colori definiti)
- ✅ Animazioni e transizioni

## 🗺 Roadmap

### Prossimi Passi
- 📝 Miglioramenti UX admin panel
- 📝 Ottimizzazioni performance

### Evoluzione Futura
- 🌐 **Dominio personalizzato**
- 🐳 **Containerizzazione con Docker**
- 👥 Pagine profilo giocatori

## 👨‍💻 Crediti

**Sviluppo e Design:**  
Elena Derosas ([GitHub: @Ela17](https://github.com/Ela17))

**Per:**  
Sezione Pallavolo - ASD Patrocinio San Giuseppe, Torino

## 📄 Licenza

**Codice sorgente**: © 2025 Elena Derosas. Tutti i diritti riservati.

**Contenuti** (testi, fotografie, loghi, grafiche): © 2025 ASD Patrocinio San Giuseppe - Sezione Pallavolo. Tutti i diritti riservati.

## 🔗 Link Utili

- 🌐 **Sito Web**: [https://asd-psg-volley.vercel.app/](https://asd-psg-volley.vercel.app/)
- 📱 **Instagram**: [@asd_patrocinosgiuseppe](https://www.instagram.com/asd_patrociniosgiuseppe/)
- 📍 **Sede**: [Via Pietro Baiardi 4, Torino](https://www.google.com/search?q=maps+via+pietro+baiardi+4+torino)
- 🏐 **UISP Torino**: [Classifiche e Regolamenti](https://sites.google.com/view/uisppallavolopiemonte/home-page)