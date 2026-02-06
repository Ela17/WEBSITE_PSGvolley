export interface MatchResult {
  CAT: string;
  "N. Gara": string;
  Data: string;
  Ora: string;
  "Squadra A": string;
  Separatore: string;
  "Squadra B": string;
  PALESTRA: string;
  NOTE: string;
  SetA_Vinti: string;
  SetB_Vinti: string;
  "1_SET_PTS_A": string;
  "1_SET_PTS_B": string;
  "2_SET_PTS_A": string;
  "2_SET_PTS_B": string;
  "3_SET_PTS_A": string;
  "3_SET_PTS_B": string;
  "4_SET_PTS_A": string;
  "4_SET_PTS_B": string;
  "5_SET_PTS_A": string;
  "5_SET_PTS_B": string;
}

export interface Ranking {
  squadra: string;
  punti: number;
  partiteGiocate: number;
  setVinti: number;
  setPersi: number;
  quozienteSet: number;
}

export interface CalendarEvent {
  id: string;
  data: string;
  ora: string;
  squadraA: string;
  squadraB: string;
  palestra: string;
  indirizzo_maps?: string;
  note: string;
  categoria: "master" | "open";
  categoriaOriginale: string;
  risultato?: {
    setA: number;
    setB: number;
    punteggiSet: Array<{ ptsA: number; ptsB: number }>;
  };
}

export function getCategoriaLabel(categoria: "master" | "open"): string {
  return categoria === "master" ? "MASTER 4+2" : "OPEN 3×3";
}

/**
 * Parsa una data in vari formati:
 * - ISO: "2025-01-15" o "2025-01-15T00:00:00.000Z"
 * - Italiano con prefisso: "mer 12 /11/ 25"
 * - Italiano semplice: "12/11/25"
 */
export function parseItalianDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === "") return new Date();

  const trimmed = dateStr.trim();

  // Prova prima formato ISO (YYYY-MM-DD)
  if (trimmed.includes("-") && !trimmed.includes("/")) {
    const isoDate = new Date(trimmed);
    if (!isNaN(isoDate.getTime())) {
      return isoDate;
    }
  }

  // Rimuovi prefisso giorno settimana (es: "mer ", "gio ")
  const cleanDate = trimmed.replace(/^[a-z]{3}\s+/i, "").trim();

  // Rimuovi spazi attorno agli slash (es: "12 /11/ 25" -> "12/11/25")
  const normalizedDate = cleanDate.replace(/\s*\/\s*/g, "/");

  const parts = normalizedDate.split("/");

  if (parts.length !== 3) {
    // Fallback: prova parsing nativo
    const fallback = new Date(trimmed);
    return isNaN(fallback.getTime()) ? new Date() : fallback;
  }

  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  let year = parseInt(parts[2], 10);

  // Se anno è a 2 cifre, aggiungi 2000
  if (year < 100) {
    year += 2000;
  }

  return new Date(year, month, day);
}

/**
 * Formatta una data per visualizzazione nel calendario
 */
export function formatDateForDisplay(dateStr: string): string {
  const date = parseItalianDate(dateStr);
  return date.toLocaleDateString("it-IT", {
    weekday: "short",
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

/**
 * Formatta una data in formato gg/mm/aaaa
 */
export function formatDateItalian(dateStr: string): string {
  const date = parseItalianDate(dateStr);
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
}

/**
 * Formatta una data in formato "Lun 22/01/2026" (giorno settimana abbreviato + data)
 */
export function formatDateWithWeekday(dateStr: string): string {
  if (!dateStr) return "Da definire";

  const date = parseItalianDate(dateStr);
  if (isNaN(date.getTime())) return "Da definire";
  
  const weekdays = ["Dom", "Lun", "Mar", "Mer", "Gio", "Ven", "Sab"];
  const weekday = weekdays[date.getDay()];
  const day = date.getDate().toString().padStart(2, "0");
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const year = date.getFullYear();
  return `${weekday} ${day}/${month}/${year}`;
}

/**
 * Formatta un orario in formato hh:mm
 * Gestisce formati: "21.00", "21:00", "ore 21.00", "21"
 */
export function formatTimeItalian(timeStr: string | null | undefined): string {
  if (!timeStr) return "";

  // Rimuovi prefissi come "ore "
  let cleaned = timeStr.replace(/^ore\s*/i, "").trim();

  // Sostituisci punto con due punti
  cleaned = cleaned.replace(".", ":");

  // Se non ha i minuti, aggiungili
  if (!cleaned.includes(":")) {
    cleaned = `${cleaned}:00`;
  }

  // Assicurati che sia nel formato hh:mm
  const parts = cleaned.split(":");
  if (parts.length >= 2) {
    const hours = parts[0].padStart(2, "0");
    const minutes = parts[1].padStart(2, "0");
    return `${hours}:${minutes}`;
  }

  return cleaned;
}
