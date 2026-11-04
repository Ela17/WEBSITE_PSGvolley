/**
 * IVL Sync - Partite Italian Volley League (I Sifoni)
 *
 * Usa l'API JSON pubblica di ivl.usacli.it (la stessa che alimenta
 * la pagina "Calendario" del sito IVL):
 * 1. scarica le partite della squadra -> ricava i gironi in cui gioca
 * 2. scarica tutte le partite di quei gironi (servono per la classifica)
 * 3. le converte in ParsedMatch con categoria "league"
 *
 * numero_gara = "<girone_id>-<id partita>" così la classifica può
 * filtrare sul girone più recente (es. dopo le qualificazioni).
 */

import type { ParsedMatch } from "./uisp-sync";

// ============================================
// CONFIGURAZIONE
// ============================================

export const IVL_CONFIG = {
  baseUrl: "https://ivl.usacli.it",
  territorioId: 1, // Piemonte
  squadraId: 1200, // I Sifoni
  inizioStagione: "2026-09-01T00:00:00.000Z",
  fineStagione: "2027-08-31T00:00:00.000Z",
};

/** Link pubblico al calendario della squadra (per la pagina campionato) */
export const IVL_CALENDARIO_URL = `${IVL_CONFIG.baseUrl}/CalendarioView?girone_id=null&territorio_id=${IVL_CONFIG.territorioId}&campionato_id=null&inizio_stagione=${IVL_CONFIG.inizioStagione}&fine_stagione=${IVL_CONFIG.fineStagione}&societa_id=null&squadra_id=${IVL_CONFIG.squadraId}`;

// ============================================
// TIPI (solo i campi che ci servono dell'API)
// ============================================

export interface IVLPartita {
  id: number;
  girone_id: number;
  data_orario: string | null; // "2026-10-29 21:00:00"
  data_orario_rinvio: string | null;
  squadra_casa_name: string;
  squadra_ospite_name: string;
  ris_set_casa: number | null;
  ris_set_ospite: number | null;
  ris_punti1set_casa: number | null;
  ris_punti1set_ospite: number | null;
  ris_punti2set_casa: number | null;
  ris_punti2set_ospite: number | null;
  ris_punti3set_casa: number | null;
  ris_punti3set_ospite: number | null;
  ris_punti4set_casa: number | null;
  ris_punti4set_ospite: number | null;
  ris_punti5set_casa: number | null;
  ris_punti5set_ospite: number | null;
  note_partita: string | null;
  Palestra: string | null;
  Palestra_indirizzo: string | null;
  palestrarinvio_name: string | null;
  palestrarinvio_indirizzo: string | null;
  palestrarinvio_comune: string | null;
  partita_deleted_at?: string | null;
  deleted_at?: string | null;
}

// ============================================
// DOWNLOAD
// ============================================

async function fetchPartite(params: {
  gironeId?: number | null;
  squadraId?: number | null;
}): Promise<IVLPartita[]> {
  const qs = new URLSearchParams({
    girone_id: String(params.gironeId ?? "null"),
    territorio_id: String(IVL_CONFIG.territorioId),
    campionato_id: "null",
    inizio_stagione: IVL_CONFIG.inizioStagione,
    fine_stagione: IVL_CONFIG.fineStagione,
    societa_id: "null",
    squadra_id: String(params.squadraId ?? "null"),
    pubblicato: "1",
    search: "",
    sort: "",
    order: "",
    offset: "0",
    limit: "500",
  });

  const res = await fetch(`${IVL_CONFIG.baseUrl}/PartiteData?${qs}`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Errore download IVL: ${res.status} ${res.statusText}`);
  }

  const json = (await res.json()) as { rows?: IVLPartita[] };
  return (json.rows || []).filter((r) => !r.deleted_at && !r.partita_deleted_at);
}

// ============================================
// PARSING
// ============================================

/** "2026-10-29 21:00:00" -> { data: "2026-10-29", ora: "21:00" } */
function splitDataOrario(value: string | null): {
  data: string | null;
  ora: string | null;
} {
  if (!value) return { data: null, ora: null };
  const m = value.match(/^(\d{4}-\d{2}-\d{2})[ T](\d{2}):(\d{2})/);
  if (!m) return { data: null, ora: null };
  const ora = `${m[2]}:${m[3]}`;
  return { data: m[1], ora: ora === "00:00" ? null : ora };
}

export function parseIVLPartita(p: IVLPartita): ParsedMatch {
  const rinviata = !!p.data_orario_rinvio;
  const { data, ora } = splitDataOrario(p.data_orario_rinvio ?? p.data_orario);

  const palestra = (rinviata && p.palestrarinvio_name) || p.Palestra || null;
  const indirizzo =
    rinviata && p.palestrarinvio_indirizzo
      ? [p.palestrarinvio_indirizzo, p.palestrarinvio_comune]
          .filter(Boolean)
          .join(" ")
      : p.Palestra_indirizzo || null;

  // Risultato: l'API restituisce null se non giocata
  const setA = p.ris_set_casa;
  const setB = p.ris_set_ospite;
  const giocata = setA !== null && setB !== null && setA + setB > 0;

  const punteggi_set: Array<{ pts_a: number; pts_b: number }> = [];
  if (giocata) {
    for (let i = 1; i <= 5; i++) {
      const a = p[`ris_punti${i}set_casa` as keyof IVLPartita] as number | null;
      const b = p[`ris_punti${i}set_ospite` as keyof IVLPartita] as number | null;
      if ((a ?? 0) > 0 || (b ?? 0) > 0) {
        punteggi_set.push({ pts_a: a ?? 0, pts_b: b ?? 0 });
      }
    }
  }

  const note = [rinviata ? "Rinviata" : null, p.note_partita?.trim() || null]
    .filter(Boolean)
    .join(" - ");

  return {
    categoria: "league",
    numero_gara: `${p.girone_id}-${p.id}`,
    data,
    ora,
    squadra_a: p.squadra_casa_name.trim(),
    squadra_b: p.squadra_ospite_name.trim(),
    palestra,
    indirizzo_maps: indirizzo,
    note: note || null,
    set_a_vinti: giocata ? setA : null,
    set_b_vinti: giocata ? setB : null,
    punteggi_set,
  };
}

// ============================================
// FUNZIONE PRINCIPALE
// ============================================

/**
 * Scarica tutte le partite dei gironi in cui gioca la squadra configurata.
 */
export async function fetchIVLMatches(): Promise<ParsedMatch[]> {
  const partiteSquadra = await fetchPartite({
    squadraId: IVL_CONFIG.squadraId,
  });

  const gironi = [...new Set(partiteSquadra.map((p) => p.girone_id))];
  const tutte: IVLPartita[] = [];

  for (const gironeId of gironi) {
    tutte.push(...(await fetchPartite({ gironeId })));
  }

  // Dedup per id (sicurezza)
  const byId = new Map(tutte.map((p) => [p.id, p]));
  return [...byId.values()].map(parseIVLPartita);
}
