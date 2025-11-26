# Sito Web Squadra di Pallavolo Patrocinio San Giuseppe Torino

Sito web ufficiale della squadra di pallavolo - Campionato UISP 4+2 e 3x3

## 🏐 Descrizione

Questo progetto è un sito web moderno e responsive per la gestione delle informazioni della squadra di pallavolo, con sezioni dedicate a notizie, calendario partite, gallery e informazioni sul campionato.

## 🛠️ Tecnologie Utilizzate

- **Next.js 16** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **shadcn/ui** - Componenti UI accessibili e personalizzabili
- **Markdown** per la gestione dei contenuti (Gazzettino)
- **gray-matter** e **remark** per il parsing dei file markdown

## 📦 Installazione

```bash
# Clona il repository
git clone [url-repository]

# Entra nella cartella del progetto
cd pallavolo-sito

# Installa le dipendenze
npm install

# Avvia il server di sviluppo
npm run dev
```

Il sito sarà disponibile su `http://localhost:3000`

## 🗂️ Struttura del Progetto

```
pallavolo-sito/
├── app/                    # Pagine Next.js (App Router)
├── components/             # Componenti React
│   ├── ui/                # Componenti shadcn/ui
│   ├── Navbar.tsx         # Barra di navigazione
│   └── Footer.tsx         # Footer del sito
├── content/               # Contenuti in markdown/JSON
│   ├── gazzettino/       # Articoli del gazzettino (.md)
│   └── partite/          # Calendario partite (.json)
├── lib/                   # Utility e funzioni helper
│   └── markdown.ts       # Funzioni per leggere i markdown
├── public/               # File statici
│   └── images/
│       ├── logos/        # Loghi squadra e sponsor
│       ├── news/         # Immagini notizie
│       └── gallery/      # Foto gallery
└── README.md
```

## ✍️ Gestione Contenuti

### Aggiungere una nuova notizia

1. Crea un file `.md` in `content/gazzettino/`
2. Usa questo formato:

```markdown
---
title: "Titolo della notizia"
date: "YYYY-MM-DD"
excerpt: "Breve descrizione"
image: "/images/news/immagine.jpg"
---

Contenuto della notizia in markdown...
```

### Aggiornare le partite

Modifica il file `content/partite/partite-2024-25.json`

## 🚀 Deploy

```bash
# Build per produzione
npm run build

# Avvia in produzione
npm start
```

Il sito può essere facilmente deployato su **Vercel**, **Netlify** o altre piattaforme.

## 📝 TODO

- [ ] Completare pagina "Chi Siamo"
- [ ] Implementare Gallery con lightbox
- [ ] Aggiungere classifica campionato
- [ ] Sistema CMS per aggiornare contenuti senza modificare codice

## 👩‍💻 Sviluppato con

Progetto realizzato come esercizio per imparare lo sviluppo web moderno con Next.js e TypeScript.

## 📄 Licenza

Uso personale
