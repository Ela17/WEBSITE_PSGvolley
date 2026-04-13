# 🏐 ASD Patrocinio San Giuseppe - Sezione Pallavolo

Sito web della **sezione pallavolo** dell'Associazione Sportiva Dilettantistica Patrocinio San Giuseppe.

Le nostre squadre di pallavolo mista competono nei campionati UISP di Torino nelle categorie **MASTER 4+2** e **OPEN 3×3**.

🌐 **Sito Live**: [https://asd-psg-volley.vercel.app](https://asd-psg-volley.vercel.app)

## 📋 Indice

- [Panoramica](#-panoramica)
- [Caratteristiche Principali](#-caratteristiche-principali)
- [Tecnologie](#-tecnologie)
- [Architettura](#-architettura)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Installazione e Sviluppo](#-installazione-e-sviluppo)
- [Gestione dei Contenuti](#-gestione-dei-contenuti)
- [Sistema Admin](#-sistema-admin)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Crediti](#-crediti)

## 🎯 Panoramica

Questo progetto fornisce alla sezione pallavolo del PSG una presenza web funzionale e coinvolgente, hostato su **Vercel** con database **Supabase PostgreSQL**.

### Obiettivi del Progetto

- **Informazione**: Classifiche, risultati e calendario partite aggiornati automaticamente
- **Comunicazione**: "Il Gazzettino" - magazine digitale con cronache e valutazioni
- **Engagement**: Sistema eventi per tornei, amichevoli e attività sociali
- **Gestione**: Admin panel completo per aggiornamenti senza rebuild
- **Portfolio**: Dimostrazione di competenze in sviluppo web moderno

### Migrazione Completata

Il progetto è stato **completamente migrato** da un'architettura file-based a database-driven:

| Componente | Prima            | Dopo                  | Stato         |
| ---------- | ---------------- | --------------------- | ------------- |
| Gazzettino | `.md` files      | `gazzettino_articles` | ✅ Completato |
| Eventi     | `.md` files      | `eventi`              | ✅ Completato |
| Partite    | `.csv` files     | `matches`             | ✅ Completato |
| Immagini   | `/public/images` | **Supabase Storage**  | ✅ Completato |

## ✨ Caratteristiche Principali

### 🏆 Gestione Campionati

- **Classifiche in tempo reale** calcolate automaticamente dai risultati
- **Calendario mensile interattivo** con vista desktop e mobile ottimizzata
- **Ricerca partite** con filtri per squadra e categoria (4+2/3×3)
- **Sincronizzazione automatica UISP** da Google Sheets ufficiali
- **Dettagli completi** per ogni partita (orari, palestre, risultati, punteggi set)
- **Google Maps integration** per indicazioni stradali
- **Link a classifiche ufficiali** UISP e regolamenti

**Feature highlight**: TeamSearch component con:

- Ricerca real-time per nome squadra
- Toggle categoria opzionale (Tutte / 4+2 / 3×3)
- Risultati mostrati solo durante la ricerca attiva
- Badge categoria colorati (blu Master, verde Open)

### 📰 Il Gazzettino PSG

Magazine digitale con:

- Cronache complete delle partite
- Valutazioni giocatori e commenti
- Sistema tag e categorie
- Cover image e design editoriale
- Organizzazione per giornata e stagione

### 🎉 Sistema Eventi

- **Eventi Futuri**: Info, iscrizioni, quote e scadenze
- **Eventi Passati**: Resoconti e gallerie fotografiche
- Carosello immagini con modalità fullscreen
- Link Google Drive per gallerie complete
- Filtro automatico basato su data

### 🔐 Admin Panel Completo

Sistema di gestione contenuti con:

- **Autenticazione sicura** (iron-session + bcrypt)
- **CRUD Gazzettino**: Editor WYSIWYG con Tiptap
- **CRUD Eventi**: Gestione completa con upload immagini
- **Gestione Campionato**:
  - Inserimento/modifica risultati partite
  - Modifica date, orari e palestre
  - Punteggi set dettagliati
  - **Sincronizzazione UISP** con un click
- **Upload immagini** drag & drop su Supabase Storage
- **Responsive** e mobile-friendly

### 📊 UISP Sync System

Sistema automatico di sincronizzazione dati:

- Download CSV da Google Sheets pubblici UISP
- Parsing intelligente con gestione inconsistenze
- Confronto intelligente dei dati (evita duplicati)
- Report dettagliato modifiche (nuovi/aggiornati/invariati)
- Preserva dati inseriti manualmente
- Eseguibile da admin panel con feedback real-time

### 📱 Design & UX

- **Fully responsive** (desktop, tablet, mobile)
- Tabelle adattive con visualizzazioni ottimizzate
- Navigazione intuitiva con breadcrumbs
- Componenti accessibili (shadcn/ui + Radix)
- Scroll-to-top button animato (🚀)
- Dark mode ready
- Loading states e feedback utente

## 🛠 Tecnologie

### Core Stack

- **[Next.js 16](https://nextjs.org/)** - App Router, React Server Components
- **[React 19](https://react.dev/)** - Libreria UI
- **[TypeScript](https://www.typescriptlang.org/)** - Type safety
- **[Tailwind CSS v4](https://tailwindcss.com/)** - Styling utility-first

### Database & Backend

- **[Supabase](https://supabase.com/)** - PostgreSQL + Storage + Auth
- **[@supabase/supabase-js](https://github.com/supabase/supabase-js)** - Client JavaScript
- **[iron-session](https://github.com/vvo/iron-session)** - Session management
- **[bcrypt](https://github.com/kelektiv/node.bcrypt.js)** - Password hashing

### UI & Editor

- **[shadcn/ui](https://ui.shadcn.com/)** - Componenti React accessibili
- **[Radix UI](https://www.radix-ui.com/)** - Primitives UI
- **[Lucide React](https://lucide.dev/)** - Icon library
- **[Tiptap](https://tiptap.dev/)** - WYSIWYG editor
  - `@tiptap/react`, `@tiptap/starter-kit`
  - `@tiptap/extension-table`, `@tiptap/extension-link`
  - Editor personalizzato con toolbar completa

### Content & Data

- **[csv-parse](https://csv.js.org/parse/)** - Parsing CSV UISP
- **[date-fns](https://date-fns.org/)** - Date manipulation + i18n italiano
- **[gray-matter](https://github.com/jonschlinkert/gray-matter)** - Markdown frontmatter (legacy/backup)

### Utilities

- **[embla-carousel-react](https://www.embla-carousel.com/)** - Caroselli immagini
- **[clsx](https://github.com/lukeed/clsx)** + **[tailwind-merge](https://github.com/dcastil/tailwind-merge)** - Class utilities
- **[react-dropzone](https://react-dropzone.js.org/)** - Drag & drop upload

## 🏗 Architettura

### Database Schema (Supabase PostgreSQL)

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

-- Eventi (futuro/passato basato su date >= oggi)
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
  google_drive_link TEXT,
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
  indirizzo_maps TEXT,
  note TEXT,
  set_a_vinti INTEGER,
  set_b_vinti INTEGER,
  punteggi_set JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(numero_gara, categoria)
);
```

### Supabase Storage

Bucket: `psg-volley-images`

- **Cartelle organizzate**: `/gazzettino`, `/eventi`, `/eventi-gallery`
- **Upload gestito**: Via admin panel con drag & drop
- **URL pubblici**: Generati automaticamente
- **File naming**: Timestamp + nome sanitizzato

### Autenticazione

- **iron-session**: Cookie-based sessioni sicure
- **bcrypt**: Password hashing con Base64 encoding
- **Environment variables**: Username e hash password
- **Middleware**: Protezione route admin

## 📁 Struttura del Progetto

```
psg-volley/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Layout principale
│   ├── page.tsx                 # Homepage
│   ├── globals.css              # Stili globali Tailwind
│   ├── chi-siamo/               # Chi Siamo
│   ├── campionato/              # Classifiche e calendario
│   │   └── page.tsx             # Server component con classifiche
│   ├── gazzettino/              # Magazine
│   │   ├── page.tsx             # Lista articoli
│   │   └── [slug]/              # Articolo dettaglio
│   ├── eventi/                  # Eventi
│   │   ├── page.tsx             # Lista eventi (futuri/passati tabs)
│   │   └── [slug]/              # Evento dettaglio
│   ├── admin/                   # Area amministrazione
│   │   ├── page.tsx             # Dashboard
│   │   ├── login/               # Login page
│   │   ├── gazzettino/          # CRUD Gazzettino
│   │   ├── eventi/              # CRUD Eventi
│   │   └── campionato/          # Gestione Campionato
│   └── api/                     # API Routes
│       ├── auth/                # Login/Logout/Session
│       ├── admin/               # CRUD endpoints
│       │   ├── gazzettino/
│       │   ├── eventi/
│       │   ├── campionato/
│       │   ├── upload/          # Upload Supabase Storage
│       │   └── uisp-sync/       # Sincronizzazione UISP
│       └── [...]/
├── components/                   # Componenti React
│   ├── ui/                      # shadcn/ui components
│   ├── Navbar.tsx               # Navigazione sticky
│   ├── Footer.tsx               # Footer con sponsor
│   ├── CalendarView.tsx         # Calendario partite mensile
│   ├── RankingTable.tsx         # Tabelle classifiche
│   ├── TeamSearch.tsx           # Ricerca squadre con filtri
│   ├── NextMatchCard.tsx        # Card prossima partita
│   ├── ImagesCarousel.tsx       # Carosello fullscreen
│   ├── TiptapEditor.tsx         # Editor WYSIWYG
│   ├── UISPSyncButton.tsx       # Button sync UISP
│   ├── ImageUpload.tsx          # Upload drag & drop
│   ├── ScrollToTop.tsx          # Scroll-to-top button
│   └── Breadcrumbs.tsx          # Breadcrumbs navigazione
├── lib/                          # Utilities e logica business
│   ├── supabase.ts              # Client Supabase (public + admin)
│   ├── campionato.ts            # Gestione dati campionati
│   ├── campionato-types.ts      # TypeScript types
│   ├── gazzettino.ts            # Gestione Gazzettino
│   ├── eventi.ts                # Gestione Eventi
│   ├── calendar-utils.ts        # Utility calendario
│   ├── uisp-sync.ts             # Sistema sincronizzazione UISP
│   ├── session.ts               # Gestione sessioni admin
│   ├── env.ts                   # Env variables validation
│   └── utils.ts                 # Utility generali (cn, etc)
├── scripts/                      # Script di utilità
│   ├── migrate-gazzettino.ts    # Migrazione articoli → DB
│   ├── migrate-eventi.ts        # Migrazione eventi → DB
│   └── migrate-matches.ts       # Migrazione partite → DB
├── content/                      # Backup contenuti (legacy)
│   ├── campionati/              # CSV backup
│   ├── gazzettino/              # Markdown backup
│   └── eventi/                  # Markdown backup
└── public/                       # Assets statici
    └── images/
        └── logos/               # Loghi squadra e sponsor
```

## 🚀 Installazione e Sviluppo

### Prerequisiti

- **Node.js** 20.x o superiore (LTS consigliato)
- **npm** o **pnpm** (raccomandato)
- **Account Supabase** con progetto configurato

### Setup Locale

```bash
# 1. Clona il repository
git clone https://github.com/Ela17/WEBSITE_PSGvolley.git
cd psg-volley

# 2. Installa le dipendenze
npm install
# oppure
pnpm install

# 3. Configura variabili d'ambiente
cp .env.example .env.local
```

### Variabili d'Ambiente

Crea `.env.local` con:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Admin Authentication
SESSION_SECRET=your-secret-minimum-32-chars
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH_BASE64=your-bcrypt-hash-base64-encoded
```

**Generare password hash:**

```bash
# In Node.js REPL o script
const bcrypt = require('bcrypt');
const hash = bcrypt.hashSync('your-password', 10);
const base64 = Buffer.from(hash).toString('base64');
console.log(base64);  # Usa questo valore
```

### Avvio Sviluppo

```bash
# Dev server con hot reload
npm run dev
# → http://localhost:3000

# Build produzione
npm run build

# Avvia produzione
npm start
```

### Script Disponibili

```bash
npm run dev                  # Dev server
npm run build                # Build produzione
npm run start                # Server produzione
npm run lint                 # Linting
npm run migrate:gazzettino   # Migra articoli a DB
npm run migrate:eventi       # Migra eventi a DB
npm run migrate:matches      # Migra partite a DB
npm run migrate:all          # Migra tutto
```

## 📝 Gestione dei Contenuti

### Via Admin Panel (Raccomandato)

1. Accedi: `/admin/login`
2. Usa gli editor per:
   - **Gazzettino**: Crea/modifica articoli con Tiptap editor
   - **Eventi**: Gestisci eventi con upload immagini
   - **Campionato**: Inserisci risultati e sincronizza UISP

### Sincronizzazione UISP

Il sistema sync automatizza l'import dai Google Sheets ufficiali UISP:

1. Vai in `/admin/campionato`
2. Click su "Sincronizza UISP"
3. Il sistema:
   - Scarica CSV da Google Sheets
   - Confronta con DB esistente
   - Aggiorna solo le modifiche
   - Mostra report dettagliato

**Configurazione** (`lib/uisp-sync.ts`):

- **Master 4+2**: Tutte le partite
- **Open 3×3**: Limitato a giornata 13 (742191)

### File Backup (Legacy)

I file markdown in `content/` sono mantenuti come backup:

- `/content/gazzettino/*.md`
- `/content/eventi/**/*.md`
- `/content/campionati/*.csv`

## 🔐 Sistema Admin

### Funzionalità

**Dashboard** (`/admin`):

- Overview statistiche
- Quick actions
- Link rapidi alle sezioni

**Gazzettino** (`/admin/gazzettino`):

- Lista articoli con search
- Crea/Modifica/Elimina
- Editor Tiptap con:
  - Formattazione testo (bold, italic, etc)
  - Heading levels
  - Liste (bullet, numbered)
  - Tabelle complete
  - Link
  - Emoji picker personalizzato (⚽🏐🔥👏💪...)

**Eventi** (`/admin/eventi`):

- Lista eventi
- Upload cover e gallery immagini
- Gestione info registrazione
- Link Google Drive

**Campionato** (`/admin/campionato`):

- Lista partite con filtri
- Ricerca per squadra/numero gara
- Inserimento risultati con punteggi set
- Modifica date/orari/palestre
- **UISP Sync** con report dettagliato

### Upload Immagini

Sistema drag & drop integrato:

- Formati: JPG, PNG, WebP
- Max size: 5MB
- Auto-resize e ottimizzazione
- Naming: timestamp + nome sanitizzato
- Storage: Supabase bucket `psg-volley-images`

## 🌐 Deployment

### Vercel (Attuale)

Configurazione:

- **Branch**: `main` → deploy automatico
- **Build command**: `npm run build`
- **Output directory**: `.next`
- **Node version**: 20.x

**Environment Variables** (Vercel Dashboard):

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY
SESSION_SECRET
ADMIN_USERNAME
ADMIN_PASSWORD_HASH_BASE64
```

### Supabase Setup

1. Crea progetto su [supabase.com](https://supabase.com)
2. Esegui SQL schema (vedi [Architettura](#-architettura))
3. Crea storage bucket `psg-volley-images` (public)
4. Copia API keys nel dashboard
5. Configura RLS policies se necessario

## 🗺 Roadmap

### Completato ✅

- ✅ Migrazione completa a Supabase (DB + Storage)
- ✅ Admin panel completo con CRUD
- ✅ UISP Sync automatico
- ✅ TeamSearch con filtri categoria
- ✅ Editor Tiptap con toolbar completa
- ✅ Upload immagini su Supabase Storage
- ✅ Responsive design mobile-first
- ✅ Calendario interattivo con Google Maps

### In Sviluppo 🚧

- 📝 Ottimizzazioni performance (caching, lazy loading)
- 📝 Miglioramenti UX admin panel
- 📝 Analytics e statistiche

### Futuro 🔮

- 🌐 **Dominio personalizzato** (es: psgvolley.it)
- 👥 **Pagine profilo giocatori** con statistiche individuali
- 📊 **Dashboard statistiche avanzate** (top scorer, MVP, etc)
- 🐳 **Containerizzazione** con Docker
- 📱 **PWA** (Progressive Web App)
- 🔔 **Notifiche push** per partite e risultati
- 🎮 **Gamification** (badge, achievement)

## 👨‍💻 Crediti

**Sviluppo e Design:**  
Elena Derosas ([GitHub: @Ela17](https://github.com/Ela17))

**Per:**  
Sezione Pallavolo - ASD Patrocinio San Giuseppe, Torino

## 📄 Licenza

**Codice sorgente**: © 2025 Elena Derosas. Tutti i diritti riservati.

**Contenuti** (testi, fotografie, loghi, grafiche): © 2025 ASD Patrocinio San Giuseppe - Sezione Pallavolo. Tutti i diritti riservati.

## 🔗 Link Utili

- 🌐 **Sito Web**: [https://asd-psg-volley.vercel.app](https://asd-psg-volley.vercel.app)
- 📱 **Instagram**: [@asd_patrociniosgiuseppe](https://www.instagram.com/asd_patrociniosgiuseppe/)
- 📍 **Sede**: [Via Pietro Baiardi 4, Torino](https://www.google.com/maps/search/?api=1&query=Via+Pietro+Baiardi+4,+Torino)
- 🏐 **UISP Torino**: [Pallavolo Piemonte](https://sites.google.com/view/uisppallavolopiemonte/home-page)
- 📊 **Classifica Master 4+2 Prima Fase**: [Google Sheets](https://docs.google.com/spreadsheets/d/1Qv6MMun296lM_X_Bm3g9U8uy9zsjly3C/edit?gid=1144088727)
- - 📊 **Classifica Master 4+2 Play-Off**: [Google Sheets](https://docs.google.com/spreadsheets/d/11JQaxlU4oQEbbMHyBguQMCOoKlsFOqwq/edit?gid=705532696#gid=705532696)
- 📊 **Classifica Open 3×3 Prima Fase**: [Google Sheets](https://docs.google.com/spreadsheets/d/17hDPCNtiHUIJ-zQ4FyDCoJFfjy9j5U8g/edit?gid=792185880)
- - 📊 **Classifica Open 3×3 Coppa Primavera A**: [Google Sheets](https://docs.google.com/spreadsheets/d/1GLyeE0FYMDywz-4zp6HaHAN_0yDQXLEX/edit?gid=1047000272#gid=1047000272)

---

**Made with ❤️ for PSG Volleyball Team** 🏐
