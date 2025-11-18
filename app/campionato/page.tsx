import { parse } from 'csv-parse/sync';
import fs from 'fs';
import path from 'path';

interface MatchResult {
  N_Gara: string;
  Data: string;
  Ora: string;
  Squadra_A: string;
  Squadra_B: string;
  PALESTRA: string;
  SetA_Vinti: string;
  SetB_Vinti: string;
  '1_SET_PTS_A': string;
  '1_SET_PTS_B': string;
  '2_SET_PTS_A': string;
  '2_SET_PTS_B': string;
  '3_SET_PTS_A': string;
  '3_SET_PTS_B': string;
  '4_SET_PTS_A': string;
  '4_SET_PTS_B': string;
  '5_SET_PTS_A': string;
  '5_SET_PTS_B': string;
}

interface Ranking {
  squadra: string;
  punti: number;
  partiteGiocate: number;
  setVinti: number;
  setPersi: number;
  quozienteSet: number;
}

function calculateRanking(matches: MatchResult[]): Ranking[] {
  const rankingMap = new Map<string, Ranking>();

  const allTeams = new Set<string>();

  // 1. Identifica tutte le squadre
  for (const match of matches) {
      if (match['Squadra_A']) allTeams.add(match['Squadra_A'].trim());
      if (match['Squadra_B']) allTeams.add(match['Squadra_B'].trim());
  }

  // Inizializza la mappa
  for (const team of allTeams) {
    if (team.length > 0 && team !== 'Squadra A' && team !== 'Squadra B') {
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

  // 2. Elabora i risultati
  for (const match of matches) {
    const teamA = match['Squadra_A']?.trim();
    const teamB = match['Squadra_B']?.trim();
    
    const setA = Number(match.SetA_Vinti);
    const setB = Number(match.SetB_Vinti);
    
    // Salta se il risultato non è numerico o la partita non è giocata
    if (isNaN(setA) || isNaN(setB) || !teamA || !teamB || !rankingMap.has(teamA) || !rankingMap.has(teamB)) {
        continue;
    }

    // Funzione di aggiornamento per un team
    const updateStats = (teamName: string, setsWon: number, setsLost: number) => {
        const stats = rankingMap.get(teamName)!;
        stats.partiteGiocate += 1;
        stats.setVinti += setsWon;
        stats.setPersi += setsLost;

        if (setsWon > setsLost) {
            // Vittoria (3-0, 3-1, 3-2)
            stats.punti += (setsLost === 2 && setsWon === 3) ? 2 : 3; // 3 punti (3-0 o 3-1), 2 punti (3-2)
        } else if (setsWon < setsLost) {
            // Sconfitta (0-3, 1-3, 2-3)
            stats.punti += (setsWon === 2 && setsLost === 3) ? 1 : 0; // 1 punto (2-3), 0 punti (0-3 o 1-3)
        }
    };
    
    // Applica a Squadra A e Squadra B
    updateStats(teamA, setA, setB);
    updateStats(teamB, setB, setA);
  }

  // 3. Conversione in array e Calcolo Quoziente Set
  const finalRanking = Array.from(rankingMap.values())
      .map(team => ({
          ...team,
          // Calcola il Quoziente Set (per il tie-breaker)
          quozienteSet: team.setPersi === 0 ? team.setVinti : team.setVinti / team.setPersi,
      }))
      .filter(team => team.partiteGiocate > 0) 
      .sort((a, b) => {
          // Ordine 1: Punti (dal maggiore al minore)
          if (b.punti !== a.punti) return b.punti - a.punti;

          // Ordine 2: Quoziente Set (dal maggiore al minore)
          if (b.quozienteSet !== a.quozienteSet) return b.quozienteSet - a.quozienteSet;
          
          return 0; // Se tutto è uguale
      });

  return finalRanking;
}