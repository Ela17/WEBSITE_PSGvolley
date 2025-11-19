export interface MatchResult {
  CAT: string;
  'N. Gara': string;
  Data: string;
  Ora: string;
  'Squadra A': string;
  Separatore: string;
  'Squadra B': string;
  PALESTRA: string;
  NOTE: string;
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
  note: string;
  categoria: 'master' | 'open';
  categoriaOriginale: string;
  risultato?: {
    setA: number;
    setB: number;
    punteggiSet: Array<{ ptsA: number; ptsB: number }>;
  };
}

export function parseItalianDate(dateStr: string): Date {
  if (!dateStr || dateStr.trim() === '') return new Date();
  
  const cleanDate = dateStr.replace(/^[a-z]{3}\s+/i, '').trim();
  const parts = cleanDate.split('/');
  
  if (parts.length !== 3) return new Date();
  
  const day = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1;
  const year = parseInt(parts[2], 10) + 2000;
  
  return new Date(year, month, day);
}