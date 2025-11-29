import { parse } from "csv-parse/sync";
import fs from "fs";
import path from "path";

export type { MatchResult, Ranking, CalendarEvent } from "./campionato-types";
export { parseItalianDate } from "./campionato-types";

import type { MatchResult, CalendarEvent, Ranking } from "./campionato-types";
import { parseItalianDate } from "./campionato-types"; // ✅ Import per uso interno!

/**
 * Normalizza la categoria dal CSV
 */
function normalizeCategoria(cat: string): "master" | "open" {
  const catUpper = cat.toUpperCase().trim();
  if (catUpper.includes("4+2") || catUpper.includes("4")) {
    return "master";
  }
  return "open";
}

/**
 * Legge CSV
 */
export function readCampionatoCSV(filePath: string): MatchResult[] {
  const fileContent = fs.readFileSync(filePath, "utf-8");
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    skip_records_with_empty_values: true,
  }) as MatchResult[];

  return records.filter(
    (record) => record["Squadra A"] && record["Squadra B"] && record["N. Gara"]
  );
}

/**
 * Trova prossima partita
 */
export function getNextMatch(
  matches: MatchResult[],
  teamName: string = "ASD Patr. San Giuseppe"
): CalendarEvent | null {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingMatches = matches
    .filter((match) => {
      // ✅ USA parseItalianDate per convertire correttamente le date italiane
      const matchDate = parseItalianDate(match.Data);
      matchDate.setHours(0, 0, 0, 0);

      const isTeamMatch =
        match["Squadra A"]?.includes(teamName) ||
        match["Squadra B"]?.includes(teamName);
      const isNotPlayed = !match.SetA_Vinti || match.SetA_Vinti === "";

      return matchDate >= today && isTeamMatch && isNotPlayed;
    })
    .sort((a, b) => {
      // ✅ USA parseItalianDate anche per il sort
      const dateA = parseItalianDate(a.Data);
      const dateB = parseItalianDate(b.Data);
      return dateA.getTime() - dateB.getTime();
    });

  if (upcomingMatches.length === 0) return null;

  const match = upcomingMatches[0];
  const categoria = normalizeCategoria(match.CAT || "");
  return convertToCalendarEvent(match, categoria);
}

/**
 * Converte match in event
 */
export function convertToCalendarEvent(
  match: MatchResult,
  categoria: "master" | "open"
): CalendarEvent {
  const hasResult = match.SetA_Vinti && match.SetB_Vinti;

  return {
    id: match["N. Gara"],
    data: match.Data,
    ora: match.Ora || "",
    squadraA: match["Squadra A"] || "",
    squadraB: match["Squadra B"] || "",
    palestra: match.PALESTRA || "",
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
 * Tutti gli eventi
 */
export function getAllCalendarEvents(): CalendarEvent[] {
  const masterPath = path.join(process.cwd(), "content/campionati/master.csv");
  const openPath = path.join(process.cwd(), "content/campionati/open.csv");

  const masterMatches = readCampionatoCSV(masterPath);
  const openMatches = readCampionatoCSV(openPath);

  const masterEvents = masterMatches.map((m) =>
    convertToCalendarEvent(m, "master")
  );
  const openEvents = openMatches.map((m) => convertToCalendarEvent(m, "open"));

  const allEvents = [...masterEvents, ...openEvents].sort((a, b) => {
    // ✅ USA parseItalianDate per ordinare correttamente
    const dateA = parseItalianDate(a.data);
    const dateB = parseItalianDate(b.data);
    return dateA.getTime() - dateB.getTime();
  });

  return allEvents;
}

/**
 * Calcola classifica
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
        setVinti: 0,
        setPersi: 0,
        quozienteSet: 0,
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

    const updateStats = (
      teamName: string,
      setsWon: number,
      setsLost: number
    ) => {
      const stats = rankingMap.get(teamName)!;
      stats.partiteGiocate += 1;
      stats.setVinti += setsWon;
      stats.setPersi += setsLost;

      if (setsWon > setsLost) {
        stats.punti += setsLost === 2 && setsWon === 3 ? 2 : 3;
      } else if (setsWon < setsLost) {
        stats.punti += setsWon === 2 && setsLost === 3 ? 1 : 0;
      }
    };

    updateStats(teamA, setA, setB);
    updateStats(teamB, setB, setA);
  }

  const finalRanking = Array.from(rankingMap.values())
    .map((team) => ({
      ...team,
      quozienteSet:
        team.setPersi === 0 ? team.setVinti : team.setVinti / team.setPersi,
    }))
    .filter((team) => team.partiteGiocate > 0)
    .sort((a, b) => {
      if (b.punti !== a.punti) return b.punti - a.punti;
      if (b.quozienteSet !== a.quozienteSet)
        return b.quozienteSet - a.quozienteSet;
      return 0;
    });

  return finalRanking;
}
