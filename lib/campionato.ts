import { supabase, DBMatch } from "./supabase";

// Re-export tipi esistenti per compatibilità
export type { Ranking, CalendarEvent } from "./campionato-types";
export { parseItalianDate, getCategoriaLabel } from "./campionato-types";

import type { Ranking, CalendarEvent } from "./campionato-types";
import { parseItalianDate } from "./campionato-types";

// Interfaccia per match dal DB (compatibile con MatchResult legacy)
export interface MatchResult {
  CAT: string;
  "N. Gara": string;
  Data: string;
  Ora: string;
  "Squadra A": string;
  Separatore: string;
  "Squadra B": string;
  PALESTRA: string;
  INDIRIZZO_MAPS: string | null;
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

// Converte da formato DB a formato legacy MatchResult
function dbToMatchResult(match: DBMatch): MatchResult {
  const punteggi = match.punteggi_set || [];

  return {
    CAT: match.categoria === "master" ? "4+2" : "OPMSB",
    "N. Gara": match.numero_gara,
    Data: match.data,
    Ora: match.ora || "",
    "Squadra A": match.squadra_a,
    Separatore: "-",
    "Squadra B": match.squadra_b,
    PALESTRA: match.palestra || "",
    INDIRIZZO_MAPS: match.indirizzo_maps || null,
    NOTE: match.note || "",
    SetA_Vinti: match.set_a_vinti?.toString() || "",
    SetB_Vinti: match.set_b_vinti?.toString() || "",
    "1_SET_PTS_A": punteggi[0]?.pts_a?.toString() || "",
    "1_SET_PTS_B": punteggi[0]?.pts_b?.toString() || "",
    "2_SET_PTS_A": punteggi[1]?.pts_a?.toString() || "",
    "2_SET_PTS_B": punteggi[1]?.pts_b?.toString() || "",
    "3_SET_PTS_A": punteggi[2]?.pts_a?.toString() || "",
    "3_SET_PTS_B": punteggi[2]?.pts_b?.toString() || "",
    "4_SET_PTS_A": punteggi[3]?.pts_a?.toString() || "",
    "4_SET_PTS_B": punteggi[3]?.pts_b?.toString() || "",
    "5_SET_PTS_A": punteggi[4]?.pts_a?.toString() || "",
    "5_SET_PTS_B": punteggi[4]?.pts_b?.toString() || "",
  };
}

// Converte DBMatch in CalendarEvent
function dbToCalendarEvent(match: DBMatch): CalendarEvent {
  const hasResult = match.set_a_vinti !== null && match.set_b_vinti !== null;
  const punteggi = match.punteggi_set || [];

  return {
    id: match.numero_gara,
    data: match.data,
    ora: match.ora || "",
    squadraA: match.squadra_a,
    squadraB: match.squadra_b,
    palestra: match.palestra || "",
    indirizzo_maps: match.indirizzo_maps || null,
    note: match.note || "",
    categoria: match.categoria,
    categoriaOriginale: match.categoria === "master" ? "4+2" : "OPMSB",
    risultato: hasResult
      ? {
          setA: match.set_a_vinti!,
          setB: match.set_b_vinti!,
          punteggiSet: punteggi
            .filter((s) => s.pts_a > 0 || s.pts_b > 0)
            .map((s) => ({ ptsA: s.pts_a, ptsB: s.pts_b })),
        }
      : undefined,
  };
}

/**
 * Legge tutte le partite di una categoria dal database
 */
export async function getMatchesByCategoria(
  categoria: "master" | "open",
): Promise<MatchResult[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("categoria", categoria)
    .order("data", { ascending: true });

  if (error) {
    console.error(`Errore getMatchesByCategoria(${categoria}):`, error);
    return [];
  }

  return (data || []).map(dbToMatchResult);
}

/**
 * Legge CSV - ora legge dal database (mantenuto per compatibilità)
 * @deprecated Usa getMatchesByCategoria invece
 */
export function readCampionatoCSV(filePath: string): MatchResult[] {
  // Determina categoria dal path
  const categoria = filePath.includes("master") ? "master" : "open";

  // NOTA: Questa funzione ora è sincrona ma i dati vengono dal DB
  // Per compatibilità con il codice esistente, usiamo una cache locale
  // In produzione, le pagine dovrebbero usare le funzioni async
  console.warn(
    `readCampionatoCSV è deprecata. Usa getMatchesByCategoria('${categoria}')`,
  );

  // Ritorna array vuoto - il codice chiamante dovrebbe essere aggiornato
  return [];
}

/**
 * Trova prossima partita dal database
 */
export async function getNextMatchAsync(
  categoria: "master" | "open",
  teamName: string = "ASD Patr. San Giuseppe",
): Promise<CalendarEvent | null> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const todayStr = today.toISOString().split("T")[0];

  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("categoria", categoria)
    .gte("data", todayStr)
    .is("set_a_vinti", null) // Partita non ancora giocata
    .or(`squadra_a.ilike.%${teamName}%,squadra_b.ilike.%${teamName}%`)
    .order("data", { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) {
    return null;
  }

  return dbToCalendarEvent(data[0]);
}

/**
 * Trova prossima partita (versione sincrona legacy)
 * @deprecated Usa getNextMatchAsync
 */
export function getNextMatch(
  matches: MatchResult[],
  teamName: string = "ASD Patr. San Giuseppe",
): CalendarEvent | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMatches = matches
    .filter((match) => {
      const matchDate = parseItalianDate(match.Data);
      matchDate.setHours(0, 0, 0, 0);

      const isTeamMatch =
        match["Squadra A"]?.includes(teamName) ||
        match["Squadra B"]?.includes(teamName);
      const isNotPlayed = !match.SetA_Vinti || match.SetA_Vinti === "";

      return matchDate >= today && isTeamMatch && isNotPlayed;
    })
    .sort((a, b) => {
      const dateA = parseItalianDate(a.Data);
      const dateB = parseItalianDate(b.Data);
      return dateA.getTime() - dateB.getTime();
    });

  if (upcomingMatches.length === 0) return null;

  const match = upcomingMatches[0];
  return convertToCalendarEvent(
    match,
    match.CAT.includes("4") ? "master" : "open",
  );
}

/**
 * Converte match in event (helper)
 */
export function convertToCalendarEvent(
  match: MatchResult,
  categoria: "master" | "open",
): CalendarEvent {
  const hasResult = match.SetA_Vinti && match.SetB_Vinti;

  return {
    id: match["N. Gara"],
    data: match.Data,
    ora: match.Ora || "",
    squadraA: match["Squadra A"] || "",
    squadraB: match["Squadra B"] || "",
    palestra: match.PALESTRA || "",
    indirizzo_maps: match.INDIRIZZO_MAPS || null,
    note: match.NOTE || "",
    categoria,
    categoriaOriginale: match.CAT || "",
    risultato: hasResult
      ? {
          setA: parseInt(match.SetA_Vinti) || 0,
          setB: parseInt(match.SetB_Vinti) || 0,
          punteggiSet: [
            {
              ptsA: parseInt(match["1_SET_PTS_A"]) || 0,
              ptsB: parseInt(match["1_SET_PTS_B"]) || 0,
            },
            {
              ptsA: parseInt(match["2_SET_PTS_A"]) || 0,
              ptsB: parseInt(match["2_SET_PTS_B"]) || 0,
            },
            {
              ptsA: parseInt(match["3_SET_PTS_A"]) || 0,
              ptsB: parseInt(match["3_SET_PTS_B"]) || 0,
            },
            {
              ptsA: parseInt(match["4_SET_PTS_A"]) || 0,
              ptsB: parseInt(match["4_SET_PTS_B"]) || 0,
            },
            {
              ptsA: parseInt(match["5_SET_PTS_A"]) || 0,
              ptsB: parseInt(match["5_SET_PTS_B"]) || 0,
            },
          ].filter((set) => set.ptsA > 0 || set.ptsB > 0),
        }
      : undefined,
  };
}

/**
 * Tutti gli eventi calendario dal database
 */
export async function getAllCalendarEventsAsync(): Promise<CalendarEvent[]> {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .order("data", { ascending: true });

  if (error) {
    console.error("Errore getAllCalendarEventsAsync:", error);
    return [];
  }

  return (data || []).map(dbToCalendarEvent);
}

/**
 * Tutti gli eventi calendario (versione sincrona legacy)
 * @deprecated Usa getAllCalendarEventsAsync
 */
export function getAllCalendarEvents(): CalendarEvent[] {
  console.warn(
    "getAllCalendarEvents sincrono è deprecato. Usa getAllCalendarEventsAsync",
  );
  return [];
}

/**
 * Calcola classifica dal database
 */
export async function calculateRankingAsync(
  categoria: "master" | "open",
): Promise<Ranking[]> {
  const { data: matches, error } = await supabase
    .from("matches")
    .select("*")
    .eq("categoria", categoria);

  if (error) {
    console.error(`Errore calculateRankingAsync(${categoria}):`, error);
    return [];
  }

  // Usa la stessa logica del ranking originale
  const matchResults = (matches || []).map(dbToMatchResult);
  return calculateRanking(matchResults);
}

/**
 * Calcola classifica (versione originale, funziona con MatchResult[])
 */
export function calculateRanking(matches: MatchResult[]): Ranking[] {
  const rankingMap = new Map<string, Ranking>();
  const allTeams = new Set<string>();

  for (const match of matches) {
    if (match["Squadra A"]) allTeams.add(match["Squadra A"].trim());
    if (match["Squadra B"]) allTeams.add(match["Squadra B"].trim());
  }

  for (const team of allTeams) {
    if (
      team.length > 0 &&
      team !== "Squadra A" &&
      team !== "Squadra B" &&
      team !== "RIPOSO"
    ) {
      rankingMap.set(team, {
        squadra: team,
        punti: 0,
        partiteGiocate: 0,
        partiteVinte: 0,
        setVinti: 0,
        setPersi: 0,
        quozienteSet: 0,
        puntiVinti: 0,
        puntiPersi: 0,
        quozientePunti: 0,
      });
    }
  }

  for (const match of matches) {
    const teamA = match["Squadra A"]?.trim();
    const teamB = match["Squadra B"]?.trim();

    if (match.SetA_Vinti === "" || match.SetB_Vinti === "") {
      continue;
    }

    const setA = Number(match.SetA_Vinti);
    const setB = Number(match.SetB_Vinti);

    if (
      isNaN(setA) ||
      isNaN(setB) ||
      !teamA ||
      !teamB ||
      !rankingMap.has(teamA) ||
      !rankingMap.has(teamB)
    ) {
      continue;
    }

    // Calcola punti vinti/persi dai parziali
    let puntiVintiA = 0,
      puntiPersiA = 0;
    for (let i = 1; i <= 5; i++) {
      const ptsA = Number(match[`${i}_SET_PTS_A` as keyof MatchResult]);
      const ptsB = Number(match[`${i}_SET_PTS_B` as keyof MatchResult]);
      if (!isNaN(ptsA) && !isNaN(ptsB) && (ptsA > 0 || ptsB > 0)) {
        puntiVintiA += ptsA;
        puntiPersiA += ptsB;
      }
    }

    const updateStats = (
      teamName: string,
      setsWon: number,
      setsLost: number,
      pF: number,
      pS: number,
    ) => {
      const stats = rankingMap.get(teamName)!;
      stats.partiteGiocate += 1;
      stats.setVinti += setsWon;
      stats.setPersi += setsLost;
      stats.puntiVinti += pF;
      stats.puntiPersi += pS;

      if (setsWon > setsLost) {
        stats.punti += setsLost === 2 && setsWon === 3 ? 2 : 3;
        stats.partiteVinte += 1;
      } else if (setsWon < setsLost) {
        stats.punti += setsWon === 2 && setsLost === 3 ? 1 : 0;
      }
    };

    updateStats(teamA, setA, setB, puntiVintiA, puntiPersiA);
    updateStats(teamB, setB, setA, puntiPersiA, puntiVintiA); // invertiti per B
  }

  /**
   * Dal regolamento UISP: https://www.uisp.it/pallavolo/files/principale/Struttura%20regolamento%20tecnico%20%20nazionale.pdf
   * Parità in classifica.
   * Ove nel punteggio di classifica finale due o più squadre risultino alla pari la graduatoria sarà così stabilita:
   * a. Quoziente sets — in base al più favorevole quoziente tra i sets vinti e quelli perduti.
   * b. Quoziente punti — in caso di parità del quoziente sets, in relazione al più favorevole quoziente tra i punti realizzati e quelli subiti.
   */
  const finalRanking = Array.from(rankingMap.values())
    .map((team) => ({
      ...team,
      quozienteSet:
        team.setPersi === 0 ? team.setVinti : team.setVinti / team.setPersi,
      quozientePunti:
        team.puntiPersi === 0
          ? team.puntiVinti
          : team.puntiVinti / team.puntiPersi,
    }))
    .filter((team) => team.partiteGiocate > 0)
    .sort((a, b) => {
      if (b.punti !== a.punti) return b.punti - a.punti;
      if (b.quozienteSet !== a.quozienteSet)
        return b.quozienteSet - a.quozienteSet; // 1° spareggio
      if (b.quozientePunti !== a.quozientePunti)
        return b.quozientePunti - a.quozientePunti; // 2° spareggio
      return 0;
    });

  return finalRanking;
}
