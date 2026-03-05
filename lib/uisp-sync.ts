/**
 * UISP Sync - Sincronizzazione dati campionato da Google Sheets UISP
 *
 * Questo modulo gestisce:
 * - Download CSV dai Google Sheets pubblici UISP
 * - Parsing dei dati con gestione delle inconsistenze
 * - Sincronizzazione con il database Supabase
 * - Report delle modifiche effettuate
 */

import { createAdminClient } from "./supabase";

// ============================================
// CONFIGURAZIONE
// ============================================

// URL per export CSV da Google Sheets
// Formato: https://docs.google.com/spreadsheets/d/{ID}/export?format=csv&gid={GID}
const UISP_SHEETS = {
  master: {
    url: "https://docs.google.com/spreadsheets/d/1Qv6MMun296lM_X_Bm3g9U8uy9zsjly3C/export?format=csv&gid=1144088727",
    categoria: "master" as const,
    categoryIdentifier: "4+2",
    maxNumeroGara: null, // Nessun limite
  },
  open: {
    url: "https://docs.google.com/spreadsheets/d/1GLyeE0FYMDywz-4zp6HaHAN_0yDQXLEX/export?format=csv&gid=190893738",
    categoria: "open" as const,
    categoryIdentifier: "CPA OPMS",
    maxNumeroGara: null,
  },
};

// ============================================
// TIPI
// ============================================

export interface ParsedMatch {
  categoria: "master" | "open";
  numero_gara: string;
  data: string | null; // YYYY-MM-DD o null se indefinita
  ora: string | null;
  squadra_a: string;
  squadra_b: string;
  palestra: string | null;
  indirizzo_maps: string | null; // Indirizzo pulito per Google Maps
  note: string | null;
  set_a_vinti: number | null;
  set_b_vinti: number | null;
  punteggi_set: Array<{ pts_a: number; pts_b: number }>;
}

export interface SyncChange {
  numero_gara: string;
  categoria: "master" | "open";
  partita: string;
  tipo: "nuovo" | "aggiornato" | "invariato";
  modifiche?: string[];
}

export interface SyncReport {
  success: boolean;
  timestamp: string;
  master: {
    totale: number;
    nuovi: number;
    aggiornati: number;
    invariati: number;
    errori: number;
  };
  open: {
    totale: number;
    nuovi: number;
    aggiornati: number;
    invariati: number;
    errori: number;
  };
  changes: SyncChange[];
  errors: string[];
}

// ============================================
// UTILITY PARSING
// ============================================

/**
 * Parsa una data UISP nei vari formati possibili
 * Formati gestiti:
 * - "mer 12/11/25" (standard)
 * - "gio 26 /03/ 26" (con spazi extra)
 * - "" o invalido → null
 *
 * @returns Data in formato YYYY-MM-DD o null
 */
function parseUISPDate(dateStr: string | undefined): string | null {
  if (!dateStr || dateStr.trim() === "") {
    return null;
  }

  const cleaned = dateStr.trim();

  // Rimuovi prefisso giorno settimana (es: "mer ", "gio ", "sab ")
  const withoutDay = cleaned.replace(/^[a-z]{3}[\s\/]+/i, "").trim();
  // Rimuovi spazi attorno agli slash (es: "26 /03/ 26" → "26/03/26")
  const normalized = withoutDay.replace(/\s*\/\s*/g, "/");

  // Verifica formato gg/mm/aa
  const parts = normalized.split("/");
  if (parts.length !== 3) {
    console.warn(`[UISP Sync] Data non valida: "${dateStr}"`);
    return null;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10);
  let year = parseInt(parts[2], 10);

  // Validazione base
  if (isNaN(day) || isNaN(month) || isNaN(year)) {
    console.warn(`[UISP Sync] Data non parsabile: "${dateStr}"`);
    return null;
  }

  // Anno a 2 cifre → aggiungi 2000
  if (year < 100) {
    year += 2000;
  }

  // Formato ISO YYYY-MM-DD
  return `${year}-${month.toString().padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
}

/**
 * Parsa un orario UISP
 * Formati gestiti:
 * - "21.00"
 * - "ore 21.00"
 * - "21:00"
 * - "" → null
 *
 * @returns Orario in formato HH:MM o null
 */
function parseUISPTime(timeStr: string | undefined): string | null {
  if (!timeStr || timeStr.trim() === "") {
    return null;
  }

  let cleaned = timeStr.trim();

  // Rimuovi prefisso "ore " (case insensitive)
  cleaned = cleaned.replace(/^ore\s+/i, "");

  // Sostituisci punto con due punti
  cleaned = cleaned.replace(".", ":");

  // Verifica formato HH:MM
  const match = cleaned.match(/^(\d{1,2}):(\d{2})$/);
  if (!match) {
    // Prova formato solo ore (es: "21")
    const hoursOnly = cleaned.match(/^(\d{1,2})$/);
    if (hoursOnly) {
      return `${hoursOnly[1].padStart(2, "0")}:00`;
    }
    return null;
  }

  const hours = match[1].padStart(2, "0");
  const minutes = match[2];

  return `${hours}:${minutes}`;
}

/**
 * Parsa un numero intero o restituisce null
 */
function parseIntOrNull(value: string | undefined): number | null {
  if (!value || value.trim() === "") {
    return null;
  }
  const parsed = parseInt(value.trim(), 10);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Pulisce l'indirizzo palestra UISP per renderlo compatibile con Google Maps
 *
 * Pattern UISP tipici:
 * - "Pal. Nievo - C-so Moncalieri, 43 – TO - MAX 3Sp / Squadra"
 * - "Pal. Com. - Piazza della Concordia Givoletto TO ingresso retro pal."
 *
 * Output: "Corso Moncalieri 43, Torino"
 */
function cleanPalestra(raw: string | null | undefined): string | null {
  if (!raw || raw.trim() === "") {
    return null;
  }

  const original = raw.trim();

  // Skip casi speciali
  if (original === "RIPOSO" || original.length < 5) {
    return original;
  }

  // Mappa abbreviazioni → forma estesa
  const abbreviazioni: [RegExp, string][] = [
    [/\bC-so\b/gi, "Corso"],
    [/\bC\.so\b/gi, "Corso"],
    [/\bV-le\b/gi, "Viale"],
    [/\bV\.le\b/gi, "Viale"],
    [/\bP-za\b/gi, "Piazza"],
    [/\bP\.za\b/gi, "Piazza"],
    [/\bP\.zza\b/gi, "Piazza"],
    [/\bP-tta\b/gi, "Piazzetta"],
    [/\bStr\.\b/gi, "Strada"],
    [/\bL-go\b/gi, "Largo"],
    [/\bL\.go\b/gi, "Largo"],
    [/\bC\.se\b/gi, "Canavese"],
  ];

  // Mappa sigle provincia → nome completo (fallback quando la città non è in whitelist)
  const sigleCitta: Record<string, string> = {
    TO: "Torino",
    MI: "Milano",
    CN: "Cuneo",
    AT: "Asti",
    AL: "Alessandria",
    VC: "Vercelli",
    BI: "Biella",
  };

  // Whitelist città note nei campionati UISP Piemonte.
  // Estendere man mano che compaiono nuove sedi.
  // NOTA: l'ordine conta — le voci più lunghe/specifiche vanno prima per evitare match parziali.
  const cittaWhitelist: string[] = [
    "Borgofranco d'Ivrea",
    "San Benigno Canavese",
    "Castagnole Piemonte",
    "Vauda Canavese",
    "Moncalieri",
    "Collegno",
    "Chieri",
    "Givoletto",
    "Caselette",
    "Volpiano",
    "Santena",
    "Feletto",
    "Torino",
    // Aggiungere altre città UISP qui
  ];

  // Pattern che indicano l'inizio di un indirizzo
  const patternIndirizzo =
    /\b(Via|Viale|Corso|Piazza|Piazzetta|Strada|Largo|C-so|V-le|P-za|P\.za|Str\.)\s+/i;

  try {
    let text = original;

    // 0. Estrai la città PRIMA di modificare il testo.
    //    Espande le abbreviazioni su una copia temporanea così "Vauda C.se" → "Vauda Canavese".
    let cittaTrovata = "";
    const textExpanded = abbreviazioni.reduce(
      (t, [re, rep]) => t.replace(re, rep),
      text,
    );

    // 0a. Whitelist città note (ricerca ovunque nel testo, anche prima dell'indirizzo).
    //     Risolve casi come "Santena", "Vauda Canavese", "Castagnole Piemonte", ecc.
    for (const città of cittaWhitelist) {
      const escaped = città.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      if (new RegExp(`\\b${escaped}\\b`, "i").test(textExpanded)) {
        cittaTrovata = città;
        break;
      }
    }

    // 0b. Fallback: sigle provincia (es. "TO", "MI") — meno preciso
    if (!cittaTrovata) {
      for (const [sigla, nome] of Object.entries(sigleCitta)) {
        if (new RegExp(`\\b${sigla}\\b`).test(text)) {
          cittaTrovata = nome;
          break;
        }
      }
    }

    // 1. Espandi abbreviazioni
    for (const [regex, replacement] of abbreviazioni) {
      text = text.replace(regex, replacement);
    }

    // 2. Cerca dove inizia l'indirizzo vero
    const match = text.match(patternIndirizzo);
    if (match && match.index !== undefined) {
      text = text.substring(match.index);
    }

    // 3. Rimuovi note comuni alla fine
    text = text.replace(
      /\s+(ingresso|H\s*\d|MAX|ultimo|retro|cancello).*$/i,
      "",
    );

    // 4. Rimuovi testo dopo " - " se sembra una nota
    const parts = text.split(/\s+[-–]\s+/);
    if (parts.length > 1) {
      const validParts = parts.filter(
        (p) =>
          /\d/.test(p) ||
          patternIndirizzo.test(p) ||
          /^[A-Z]{2}$/.test(p.trim()),
      );
      if (validParts.length > 0) {
        text = validParts.join(" ");
      } else {
        text = parts[0];
      }
    }

    // 5. Rimuovi sigla città (sarà aggiunta alla fine)
    for (const sigla of Object.keys(sigleCitta)) {
      const regex = new RegExp(`\\s*\\b${sigla}\\b\\s*`, "g");
      text = text.replace(regex, " ");
    }

    // 6. Normalizza il case di Via, Corso, etc.
    text = text.replace(
      /\b(via|corso|viale|piazza|piazzetta|strada|largo)\b/gi,
      (match) => match.charAt(0).toUpperCase() + match.slice(1).toLowerCase(),
    );

    // 7. Pulizia finale
    text = text
      .replace(/,\s*(\d)/g, " $1") // virgola prima di cifra → spazio
      .replace(/,\s*,/g, ",") // doppia virgola → singola
      .replace(/\s+/g, " ")
      .replace(/\s*[-–]\s*$/, "")
      .replace(/[.,\s]+$/, "") // trailing virgola/punto/spazio
      .trim();

    // 8. Aggiungi città se trovata e non già presente
    if (
      cittaTrovata &&
      !text.toLowerCase().includes(cittaTrovata.toLowerCase())
    ) {
      text = `${text}, ${cittaTrovata}`;
    }

    if (text.length < 5) {
      return original;
    }

    return text;
  } catch {
    console.warn(`[cleanPalestra] Errore parsing: "${original}"`);
    return original;
  }
}

/**
 * Parsa il CSV grezzo in array di righe
 * Gestisce correttamente i campi con virgole e newline tra virgolette
 */
function parseCSV(csvText: string): string[][] {
  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentField = "";
  let inQuotes = false;

  for (let i = 0; i < csvText.length; i++) {
    const char = csvText[i];
    const nextChar = csvText[i + 1];

    if (char === '"') {
      if (inQuotes && nextChar === '"') {
        // Escaped quote ("") -> singola virgoletta
        currentField += '"';
        i++; // Salta la prossima virgoletta
      } else {
        // Toggle quote mode
        inQuotes = !inQuotes;
      }
    } else if (char === "," && !inQuotes) {
      // Fine campo
      currentRow.push(currentField.trim());
      currentField = "";
    } else if (
      (char === "\n" || (char === "\r" && nextChar === "\n")) &&
      !inQuotes
    ) {
      // Fine riga (gestisce sia \n che \r\n)
      if (char === "\r") i++; // Salta \n dopo \r

      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else if (char === "\r" && !inQuotes) {
      // Solo \r come fine riga (raro ma possibile)
      currentRow.push(currentField.trim());
      if (currentRow.some((cell) => cell !== "")) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentField = "";
    } else if (char === "\n" && inQuotes) {
      // Newline dentro campo quotato -> sostituisci con spazio
      currentField += " ";
    } else {
      currentField += char;
    }
  }

  // Ultima riga (se non termina con newline)
  if (currentField || currentRow.length > 0) {
    currentRow.push(currentField.trim());
    if (currentRow.some((cell) => cell !== "")) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// ============================================
// PARSING PARTITE
// ============================================

/**
 * Verifica se una riga è valida (non intestazione, non giornata, non riposo)
 */
function isValidMatchRow(row: string[], categoryIdentifier: string): boolean {
  if (row.length < 8) return false;

  const category = row[0]?.trim();

  // Deve iniziare con l'identificatore categoria corretto
  if (category !== categoryIdentifier) return false;

  // Deve avere un numero gara valido
  const numeroGara = row[1]?.trim();
  if (!numeroGara || !numeroGara.match(/^\d+/)) return false;

  // Salta righe RIPOSO
  const squadraA = row[4]?.trim() || "";
  const squadraB = row[6]?.trim() || "";
  if (squadraA === "RIPOSO" || squadraB === "RIPOSO") return false;

  return true;
}

/**
 * Parsa una singola riga CSV in un oggetto ParsedMatch
 *
 * Struttura colonne (0-indexed):
 * 0: Categoria (OPMSB / 4+2)
 * 1: Numero Gara
 * 2: Data
 * 3: Ora
 * 4: Squadra A
 * 5: Separatore (-)
 * 6: Squadra B
 * 7: Palestra
 * 8: Note
 * 9: Set A vinti
 * 10: Set B vinti
 * 11-20: Parziali set (1°A, 1°B, 2°A, 2°B, ... 5°A, 5°B)
 */
function parseMatchRow(
  row: string[],
  categoria: "master" | "open",
): ParsedMatch {
  // Punteggi set
  const punteggiSet: Array<{ pts_a: number; pts_b: number }> = [];

  for (let i = 0; i < 5; i++) {
    const ptsAIndex = 11 + i * 2;
    const ptsBIndex = 12 + i * 2;

    const ptsA = parseIntOrNull(row[ptsAIndex]);
    const ptsB = parseIntOrNull(row[ptsBIndex]);

    // Aggiungi solo set con almeno un punteggio
    if (ptsA !== null || ptsB !== null) {
      punteggiSet.push({
        pts_a: ptsA ?? 0,
        pts_b: ptsB ?? 0,
      });
    }
  }

  const palestraRaw = row[7]?.trim() || null;

  return {
    categoria,
    numero_gara: row[1]?.trim() || "",
    data: parseUISPDate(row[2]),
    ora: parseUISPTime(row[3]),
    squadra_a: row[4]?.trim() || "",
    squadra_b: row[6]?.trim() || "",
    palestra: palestraRaw,
    indirizzo_maps: cleanPalestra(palestraRaw),
    note: row[8]?.trim() || null,
    set_a_vinti: parseIntOrNull(row[9]),
    set_b_vinti: parseIntOrNull(row[10]),
    punteggi_set: punteggiSet,
  };
}

/**
 * Parsa tutto il CSV e restituisce le partite valide
 */
function parseUISPCSV(
  csvText: string,
  categoria: "master" | "open",
  categoryIdentifier: string,
  maxNumeroGara: number | null = null,
): ParsedMatch[] {
  const rows = parseCSV(csvText);
  const matches: ParsedMatch[] = [];

  for (const row of rows) {
    if (isValidMatchRow(row, categoryIdentifier)) {
      const match = parseMatchRow(row, categoria);

      // Filtro per numero gara massimo
      if (maxNumeroGara !== null) {
        const numeroGaraInt = parseInt(match.numero_gara, 10);
        if (numeroGaraInt > maxNumeroGara) continue;
      }

      if (match.numero_gara && match.squadra_a && match.squadra_b) {
        matches.push(match);
      }
    }
  }

  return matches;
}

// ============================================
// DOWNLOAD CSV
// ============================================

/**
 * Scarica il CSV da un Google Sheet pubblico
 */
async function downloadCSV(url: string): Promise<string> {
  const response = await fetch(url, {
    headers: {
      "User-Agent": "PSG-Volley-Sync/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(
      `Errore download CSV: ${response.status} ${response.statusText}`,
    );
  }

  return response.text();
}

// ============================================
// SINCRONIZZAZIONE DATABASE
// ============================================

/**
 * Confronta due partite e restituisce le differenze
 */
function compareMatches(
  dbMatch: ParsedMatch | null,
  uispMatch: ParsedMatch,
): { isDifferent: boolean; changes: string[] } {
  if (!dbMatch) {
    return { isDifferent: true, changes: ["Nuova partita"] };
  }

  const changes: string[] = [];

  // Confronta data (gestendo null)
  if (dbMatch.data !== uispMatch.data) {
    changes.push(`Data: ${dbMatch.data || "N/D"} → ${uispMatch.data || "N/D"}`);
  }

  // Confronta ora
  if (dbMatch.ora !== uispMatch.ora) {
    changes.push(`Ora: ${dbMatch.ora || "N/D"} → ${uispMatch.ora || "N/D"}`);
  }

  // Confronta palestra
  if (dbMatch.palestra !== uispMatch.palestra) {
    changes.push(
      `Palestra: ${dbMatch.palestra || "N/D"} → ${uispMatch.palestra || "N/D"}`,
    );
  }

  // Confronta indirizzo_maps
  if (dbMatch.indirizzo_maps !== uispMatch.indirizzo_maps) {
    changes.push(
      `Indirizzo Maps: ${dbMatch.indirizzo_maps || "N/D"} → ${uispMatch.indirizzo_maps || "N/D"}`,
    );
  }

  // Confronta risultato
  if (
    dbMatch.set_a_vinti !== uispMatch.set_a_vinti ||
    dbMatch.set_b_vinti !== uispMatch.set_b_vinti
  ) {
    const oldResult =
      dbMatch.set_a_vinti !== null
        ? `${dbMatch.set_a_vinti}-${dbMatch.set_b_vinti}`
        : "N/D";
    const newResult =
      uispMatch.set_a_vinti !== null
        ? `${uispMatch.set_a_vinti}-${uispMatch.set_b_vinti}`
        : "N/D";
    changes.push(`Risultato: ${oldResult} → ${newResult}`);
  }

  // Confronta punteggi set (semplificato)
  const dbSetCount = dbMatch.punteggi_set?.length || 0;
  const uispSetCount = uispMatch.punteggi_set?.length || 0;
  if (dbSetCount !== uispSetCount) {
    changes.push(`Parziali set: ${dbSetCount} → ${uispSetCount} set`);
  }

  return {
    isDifferent: changes.length > 0,
    changes,
  };
}

/**
 * Sincronizza le partite di una categoria con il database
 */
async function syncCategoria(
  categoria: "master" | "open",
  matches: ParsedMatch[],
): Promise<{
  nuovi: number;
  aggiornati: number;
  invariati: number;
  errori: number;
  changes: SyncChange[];
  errors: string[];
}> {
  const supabase = createAdminClient();
  const changes: SyncChange[] = [];
  const errors: string[] = [];

  let nuovi = 0;
  let aggiornati = 0;
  let invariati = 0;
  let errori = 0;

  // Carica partite esistenti dal DB
  const { data: existingMatches, error: fetchError } = await supabase
    .from("matches")
    .select("*")
    .eq("categoria", categoria);

  if (fetchError) {
    errors.push(
      `Errore caricamento partite ${categoria}: ${fetchError.message}`,
    );
    return {
      nuovi,
      aggiornati,
      invariati,
      errori: matches.length,
      changes,
      errors,
    };
  }

  // Crea mappa per lookup veloce
  const existingMap = new Map<string, ParsedMatch>();
  for (const m of existingMatches || []) {
    existingMap.set(m.numero_gara, {
      categoria: m.categoria,
      numero_gara: m.numero_gara,
      data: m.data,
      ora: m.ora,
      squadra_a: m.squadra_a,
      squadra_b: m.squadra_b,
      palestra: m.palestra,
      indirizzo_maps: m.indirizzo_maps,
      note: m.note,
      set_a_vinti: m.set_a_vinti,
      set_b_vinti: m.set_b_vinti,
      punteggi_set: m.punteggi_set || [],
    });
  }

  // Processa ogni partita UISP
  for (const match of matches) {
    const existing = existingMap.get(match.numero_gara) ?? null;
    const comparison = compareMatches(existing, match);

    if (!comparison.isDifferent) {
      invariati++;
      changes.push({
        numero_gara: match.numero_gara,
        categoria,
        partita: `${match.squadra_a} vs ${match.squadra_b}`,
        tipo: "invariato",
      });
      continue;
    }

    // Prepara dati per upsert
    const upsertData = {
      categoria: match.categoria,
      numero_gara: match.numero_gara,
      data: match.data,
      ora: match.ora,
      squadra_a: match.squadra_a,
      squadra_b: match.squadra_b,
      palestra: match.palestra,
      indirizzo_maps: match.indirizzo_maps,
      note: match.note,
      set_a_vinti: match.set_a_vinti,
      set_b_vinti: match.set_b_vinti,
      punteggi_set: match.punteggi_set,
      updated_at: new Date().toISOString(),
    };

    // Upsert (insert o update)
    const { error: upsertError } = await supabase
      .from("matches")
      .upsert(upsertData, {
        onConflict: "numero_gara,categoria",
      });

    if (upsertError) {
      errori++;
      errors.push(
        `Errore sync gara ${match.numero_gara}: ${upsertError.message}`,
      );
      continue;
    }

    if (existing) {
      aggiornati++;
      changes.push({
        numero_gara: match.numero_gara,
        categoria,
        partita: `${match.squadra_a} vs ${match.squadra_b}`,
        tipo: "aggiornato",
        modifiche: comparison.changes,
      });
    } else {
      nuovi++;
      changes.push({
        numero_gara: match.numero_gara,
        categoria,
        partita: `${match.squadra_a} vs ${match.squadra_b}`,
        tipo: "nuovo",
      });
    }
  }

  return { nuovi, aggiornati, invariati, errori, changes, errors };
}

// ============================================
// FUNZIONE PRINCIPALE
// ============================================

/**
 * Esegue la sincronizzazione completa da UISP
 */
export async function syncFromUISP(): Promise<SyncReport> {
  const report: SyncReport = {
    success: false,
    timestamp: new Date().toISOString(),
    master: { totale: 0, nuovi: 0, aggiornati: 0, invariati: 0, errori: 0 },
    open: { totale: 0, nuovi: 0, aggiornati: 0, invariati: 0, errori: 0 },
    changes: [],
    errors: [],
  };

  try {
    // === MASTER ===
    console.log("[UISP Sync] Download CSV Master...");
    const masterCSV = await downloadCSV(UISP_SHEETS.master.url);
    const masterMatches = parseUISPCSV(
      masterCSV,
      UISP_SHEETS.master.categoria,
      UISP_SHEETS.master.categoryIdentifier,
      UISP_SHEETS.master.maxNumeroGara,
    );

    console.log(`[UISP Sync] Master: ${masterMatches.length} partite trovate`);

    report.master.totale = masterMatches.length;

    const masterResult = await syncCategoria("master", masterMatches);
    report.master.nuovi = masterResult.nuovi;
    report.master.aggiornati = masterResult.aggiornati;
    report.master.invariati = masterResult.invariati;
    report.master.errori = masterResult.errori;
    report.changes.push(...masterResult.changes);
    report.errors.push(...masterResult.errors);

    // === OPEN ===
    console.log("[UISP Sync] Download CSV Open...");
    const openCSV = await downloadCSV(UISP_SHEETS.open.url);
    const openMatches = parseUISPCSV(
      openCSV,
      UISP_SHEETS.open.categoria,
      UISP_SHEETS.open.categoryIdentifier,
      UISP_SHEETS.open.maxNumeroGara,
    );
    console.log(`[UISP Sync] Open: ${openMatches.length} partite trovate`);

    report.open.totale = openMatches.length;

    const openResult = await syncCategoria("open", openMatches);
    report.open.nuovi = openResult.nuovi;
    report.open.aggiornati = openResult.aggiornati;
    report.open.invariati = openResult.invariati;
    report.open.errori = openResult.errori;
    report.changes.push(...openResult.changes);
    report.errors.push(...openResult.errors);

    // Successo se non ci sono errori critici
    report.success = report.errors.length === 0;

    console.log("[UISP Sync] Sincronizzazione completata");
    console.log(
      `  Master: ${report.master.nuovi} nuovi, ${report.master.aggiornati} aggiornati`,
    );
    console.log(
      `  Open: ${report.open.nuovi} nuovi, ${report.open.aggiornati} aggiornati`,
    );

    return report;
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : "Errore sconosciuto";
    report.errors.push(`Errore critico: ${errorMessage}`);
    console.error("[UISP Sync] Errore critico:", error);
    return report;
  }
}

/**
 * Esegue solo il parsing (senza salvare) per preview
 */
export async function previewSync(): Promise<{
  master: ParsedMatch[];
  open: ParsedMatch[];
  errors: string[];
}> {
  const errors: string[] = [];
  let master: ParsedMatch[] = [];
  let open: ParsedMatch[] = [];

  try {
    const masterCSV = await downloadCSV(UISP_SHEETS.master.url);
    master = parseUISPCSV(
      masterCSV,
      UISP_SHEETS.master.categoria,
      UISP_SHEETS.master.categoryIdentifier,
      UISP_SHEETS.master.maxNumeroGara,
    );
  } catch (error) {
    errors.push(
      `Errore download Master: ${error instanceof Error ? error.message : "sconosciuto"}`,
    );
  }

  try {
    const openCSV = await downloadCSV(UISP_SHEETS.open.url);
    open = parseUISPCSV(
      openCSV,
      UISP_SHEETS.open.categoria,
      UISP_SHEETS.open.categoryIdentifier,
      UISP_SHEETS.open.maxNumeroGara,
    );
  } catch (error) {
    errors.push(
      `Errore download Open: ${error instanceof Error ? error.message : "sconosciuto"}`,
    );
  }

  return { master, open, errors };
}
