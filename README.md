# 🏐 ASD Patrocinio San Giuseppe - Sezione Pallavolo

Sito web della **sezione pallavolo** dell'Associazione Sportiva Dilettantistica Patrocinio San Giuseppe.

Le nostre squadre di pallavolo mista competono nei campionati UISP di Torino nelle categorie **MASTER 4+2** e **OPEN 3×3**, e nell'**Italian Volley League** (Misto Classic) con la squadra **I Sifoni**.

**Stagione corrente: 2026/27**

🌐 **Sito Live**: [https://asd-psg-volley.vercel.app](https://asd-psg-volley.vercel.app)

## 📋 Indice

- [Panoramica](#-panoramica)
- [Caratteristiche Principali](#-caratteristiche-principali)
- [Tecnologie](#-tecnologie)
- [Architettura](#-architettura)
- [Struttura del Progetto](#-struttura-del-progetto)
- [Installazione e Sviluppo](#-installazione-e-sviluppo)
- [Gestione dei Contenuti](#-gestione-dei-contenuti)
- [Cambio Stagione](#-cambio-stagione)
- [Sistema Admin](#-sistema-admin)
- [Deployment](#-deployment)
- [Roadmap](#-roadmap)
- [Crediti](#-crediti)

## 🎯 Panoramica

Questo progetto fornisce alla sezione pallavolo del PSG una presenza web funzionale e coinvolgente, hostato su **Vercel** con database **Supabase PostgreSQL**.

### Obiettivi del Progetto

- **Informazione**: Classifiche, risultati e calendario partite aggiornati automaticamente
- **Comunicazione**: "Il Gazzettino" - magazine digitale con cronache e valutazioni (_sezione nascosta dalla stagione 2026/27, riattivabile_)
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

Tre campionati gestiti in parallelo:

| Categoria (`matches.categoria`) | Campionato                           | Squadra PSG                 | Fonte dati                        |
| ------------------------------- | ------------------------------------ | --------------------------- | --------------------------------- |
| `master`                        | UISP Master 4+2 Misto, girone unico  | ASD Patrocinio San Giuseppe | Google Sheet UISP (CSV)           |
| `open`                          | UISP Open 3×3 Misto, girone B        | ASD Patrocinio San Giuseppe | Google Sheet UISP (CSV)           |
| `league`                        | Italian Volley League, Misto Classic | I Sifoni                    | API JSON pubblica `ivl.usacli.it` |

- **Classifiche in tempo reale** calcolate automaticamente dai risultati, con le regole di spareggio di ciascun campionato
- **Calendario mensile interattivo** con le partite di tutte le squadre PSG
- **Prossima partita** di ogni squadra in homepage
- **Ricerca partite** con filtri per squadra e categoria (4+2 / 3×3 / IVL)
- **Sincronizzazione automatica** da UISP e Volley League con un click
- **Dettagli completi** per ogni partita (orari, palestre, risultati, punteggi set)
- **Google Maps integration** per indicazioni stradali
- **Export calendario** `.ics` e link Google Calendar
- **Link a classifiche ufficiali** UISP, calendario IVL e regolamenti

**Classifiche e spareggi** (`lib/campionato.ts` → `calculateRanking`):

- Punti: 3-0 / 3-1 → 3 punti alla vincente; 3-2 → 2 alla vincente e 1 alla perdente (uguale per UISP e IVL)
- **UISP** (Master, Open): a parità di punti → quoziente set → quoziente punti
- **Volley League** (regolamento IVL Piemonte Open 26/27, art. 10): a parità di punti → partite vinte → quoziente set → quoziente punti → scontri diretti
- Volley League: viene mostrato solo il girone più recente (es. dopo le qualificazioni passa da solo al nuovo girone)

**Squadre PSG** (`lib/campionato-types.ts` → `PSG_TEAM_BY_CATEGORIA`, `isPSGTeam`): le squadre vengono riconosciute per sottostringa (`"San Giuseppe"` per UISP, `"Sifoni"` per IVL), così funzionano anche se il nome nei fogli cambia leggermente tra stagioni.

**Feature highlight**: TeamSearch component con:

- Ricerca real-time per nome squadra
- Toggle categoria opzionale (Tutte / 4+2 / 3×3 / IVL)
- Risultati mostrati solo durante la ricerca attiva
- Badge categoria colorati (blu Master, arancio Open, viola Volley League)

### 📰 Il Gazzettino PSG

> **Attualmente nascosto** (stagione 2026/27): menu, pagine pubbliche e card admin sono disattivati tramite `FEATURES.gazzettino = false` in `lib/features.ts`. Il codice e le tabelle restano: per riattivarlo basta mettere `true` e fare deploy.

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
- **CRUD Gazzettino**: Editor WYSIWYG con Tiptap (_nascosto, vedi sopra_)
- **CRUD Eventi**: Gestione completa con upload immagini
- **Gestione Campionato**:
  - Inserimento/modifica risultati partite
  - Modifica date, orari e palestre
  - Punteggi set dettagliati
  - **Sincronizzazione UISP + Volley League** con un click
- **Upload immagini** drag & drop su Supabase Storage
- **Responsive**: su telefono partite ed eventi sono mostrati come schede al posto delle tabelle

### 📊 Sync Campionati (UISP + Volley League)

Sistema automatico di sincronizzazione dati, eseguibile dall'admin panel:

**UISP** (`lib/uisp-sync.ts`):

- Download CSV dai Google Sheets pubblici UISP (export `?format=csv&gid=...`)
- Le colonne di risultato e parziali vengono **ricavate dalla riga di intestazione** ("N. Gara", "Risultato", "1° SET"), quindi il parser regge anche se la UISP aggiunge o sposta colonne; senza intestazione usa il formato 26/27
- Partite con risultato `0 - 0` o celle vuote = **non giocate**
- Gestione date italiane/inglesi (`mer 04/11/26`, `Wed 04 /11/ 26`), orari `ore 21.30`, righe `RIPOSO`
- Filtri per categoria (colonna CAT) e per prefisso numero gara

**Volley League** (`lib/ivl-sync.ts`):

- Usa l'API JSON pubblica di `ivl.usacli.it` (`/PartiteData`), la stessa del calendario del sito IVL
- Parte dalle partite della squadra (`squadraId`), ricava i gironi in cui gioca e scarica tutte le partite di quei gironi
- Gestisce rinvii (data e palestra di rinvio) e note partita
- `numero_gara` = `<girone_id>-<id partita>` (serve alla classifica per filtrare il girone più recente)
- Un errore IVL non blocca la sync UISP (e viceversa per i report)

**Comune**:

- Confronto con il DB: inserisce solo le nuove e aggiorna solo quelle cambiate
- Report dettagliato (nuove / aggiornate / invariate) per categoria

### 📱 Design & UX

- **Fully responsive** (desktop, tablet, mobile)
- Tabelle adattive: su mobile classifiche ridotte (Pt, PG, PV) e schede al posto delle tabelle nell'admin
- Nessuno scorrimento orizzontale delle pagine su telefono
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
  categoria TEXT NOT NULL CHECK (categoria IN ('master', 'open', 'league')),
  numero_gara TEXT NOT NULL,          -- UISP: "74101" / "752101"; IVL: "818-36221"
  data DATE,                          -- NULL = data da definire (partita rinviata)
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

- **Cartelle organizzate**: `/eventi`, `/eventi-gallery` (`/gazzettino` svuotata con la pulizia stagione 2025/26)
- **Upload gestito**: Via admin panel con drag & drop
- **URL pubblici**: Generati automaticamente
- **File naming**: Timestamp + nome sanitizzato

### Autenticazione

- **iron-session**: Cookie-based sessioni sicure
- **bcrypt**: Password hashing con Base64 encoding
- **Environment variables**: Username e hash password
- **proxy.ts**: Protezione route `/admin/**` server-side (Next.js 16 proxy)

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
│       │   │   └── sync/        # Sincronizzazione UISP + Volley League
│       │   └── upload/          # Upload Supabase Storage
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
│   ├── WysiwygEditor.tsx        # Editor WYSIWYG
│   ├── UISPSyncButton.tsx       # Button "Sincronizza campionati" + report
│   ├── ImageUploader.tsx        # Upload drag & drop
│   ├── ScrollToTop.tsx          # Scroll-to-top button
│   └── Breadcrumbs.tsx          # Breadcrumbs navigazione
├── lib/                          # Utilities e logica business
│   ├── supabase.ts              # Client Supabase (public + admin)
│   ├── campionato.ts            # Gestione dati campionati e classifiche
│   ├── campionato-types.ts      # Types, categorie (CATEGORIA_INFO), squadre PSG
│   ├── gazzettino.ts            # Gestione Gazzettino
│   ├── eventi.ts                # Gestione Eventi
│   ├── calendar-utils.ts        # Utility calendario
│   ├── uisp-sync.ts             # Sincronizzazione UISP (+ orchestrazione sync)
│   ├── ivl-sync.ts              # Sincronizzazione Italian Volley League
│   ├── features.ts              # Interruttori sezioni (es. Gazzettino)
│   ├── social.ts                # Link Instagram e Facebook
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
   - **Eventi**: Gestisci eventi con upload immagini
   - **Campionato**: Inserisci risultati e sincronizza i campionati

### Sincronizzazione Campionati

1. Vai in `/admin/campionato`
2. Click su **"Sincronizza campionati"**
3. Il sistema scarica i dati da UISP (Master, Open) e Volley League, li confronta con il DB e mostra il report per categoria

Consigliato: una volta a settimana o dopo ogni giornata. Il DB è unico per locale e produzione, quindi una sync fatta in locale vale anche per il sito online.

**Configurazione attuale (2026/27)**:

| Categoria | Dove                                       | Valori                                                                               |
| --------- | ------------------------------------------ | ------------------------------------------------------------------------------------ |
| Master    | `UISP_SHEETS.master` in `lib/uisp-sync.ts` | foglio `1sNELIWvG3DkCs9S2wg7vZIwYrUO4UBhT`, gid `1144088727`, CAT `4+2 MMS`          |
| Open      | `UISP_SHEETS.open` in `lib/uisp-sync.ts`   | foglio `1_YV3W9SB6Xv4p-vjLuHUDiEVyQ8WDCxQ`, gid `792185880`, gare `752xxx`           |
| League    | `IVL_CONFIG` in `lib/ivl-sync.ts`          | territorio `1` (Piemonte), squadra `1200` (I Sifoni), stagione 01/09/2026–31/08/2027 |

## 🔄 Cambio Stagione

Checklist da seguire a inizio stagione (o quando cambia fase, es. playoff):

1. **Nuovi fogli UISP**: in `lib/uisp-sync.ts` aggiorna `UISP_SHEETS` (ID foglio + `gid`, `categoryIdentifier` = valore della colonna CAT, `garaPrefix` = prefisso dei numeri gara oppure `null`).
   - Il `gid` si trova aprendo il file con **Apri con → Fogli Google** e leggendo `#gid=...` nell'URL.
   - Verifica col terminale che il CSV arrivi:
     ```bash
     curl -sL "https://docs.google.com/spreadsheets/d/<ID>/export?format=csv&gid=<GID>" | head -5
     ```
   - Attenzione al `garaPrefix`: deve coprire **tutti** i numeri gara (es. il Master 26/27 va da 74101 a 74232, quindi un prefisso `741` ne taglierebbe una parte).
2. **Link pubblici**: aggiorna i link ai fogli in `app/campionato/page.tsx` (classifiche e "Link Utili").
3. **Volley League**: in `lib/ivl-sync.ts` aggiorna `inizioStagione` / `fineStagione` (e `squadraId` se cambia squadra). I cambi di girone durante la stagione sono automatici.
4. **Testi**: "Stagione XXXX/YY" in `app/page.tsx` e placeholder stagione nell'admin.
5. **Database** (Supabase → SQL Editor), **dopo il backup CSV** della tabella:
   ```sql
   DELETE FROM matches;  -- svuota le partite della stagione precedente
   ```
6. **Sync**: lancia "Sincronizza campionati" e controlla che i totali corrispondano ai fogli ufficiali.
7. **Nome squadra**: se nei fogli il nome PSG non contiene più "San Giuseppe" (o "Sifoni" per IVL), aggiorna `PSG_TEAM_BY_CATEGORIA` in `lib/campionato-types.ts`.

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

**Gazzettino** (`/admin/gazzettino`, _nascosto dalla dashboard, vedi `lib/features.ts`_):

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

- Lista eventi (tabella su desktop, schede su mobile)
- Upload cover e gallery immagini
- Gestione info registrazione
- Link Google Drive

**Campionato** (`/admin/campionato`):

- Tab per categoria: Master 4+2, Open 3×3, Volley League
- Lista partite (tabella su desktop, schede su mobile)
- Ricerca per squadra/numero gara
- Inserimento risultati con punteggi set
- Modifica date/orari/palestre
- **Sync UISP + Volley League** con report dettagliato

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
- ✅ Stagione 2026/27: nuovi fogli UISP, parser robusto alle colonne
- ✅ Integrazione Italian Volley League (I Sifoni) con spareggi IVL
- ✅ Feature flag per sezioni (Gazzettino nascosto)
- ✅ Link Facebook in footer e Chi Siamo
- ✅ Layout mobile senza scorrimento orizzontale, schede nell'admin

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
- 📘 **Facebook**: [Pagina Facebook](https://www.facebook.com/share/1CLBsPhy7s/)
- 📍 **Sede**: [Via Pietro Baiardi 4, Torino](https://www.google.com/maps/search/?api=1&query=Via+Pietro+Baiardi+4,+Torino)
- 🏐 **UISP Torino**: [Pallavolo Piemonte](https://sites.google.com/view/uisppallavolopiemonte/home-page)
- 📊 **Master 4+2 Misto 26/27**: [Calendario e risultati](https://docs.google.com/spreadsheets/d/1sNELIWvG3DkCs9S2wg7vZIwYrUO4UBhT/edit?gid=1144088727#gid=1144088727)
- 📊 **Open 3×3 Misto 26/27 (girone B)**: [Calendario e risultati](https://drive.google.com/file/d/1_YV3W9SB6Xv4p-vjLuHUDiEVyQ8WDCxQ/view)
- 🏐 **Italian Volley League – I Sifoni**: [Calendario squadra](https://ivl.usacli.it/CalendarioView?girone_id=null&territorio_id=1&campionato_id=null&inizio_stagione=2026-09-01T00:00:00.000Z&fine_stagione=2027-08-31T00:00:00.000Z&societa_id=null&squadra_id=1200) · [Regolamenti IVL Piemonte](https://ivl.usacli.it/regolamentiterritorio/1)

---

**Made with ❤️ for PSG Volleyball Team** 🏐
