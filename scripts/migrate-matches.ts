// Carica le variabili d'ambiente da .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { createClient } from '@supabase/supabase-js';

// Verifica variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

interface CSVMatch {
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

interface MatchData {
  categoria: 'master' | 'open';
  numero_gara: string;
  data: string;
  ora: string | null;
  squadra_a: string;
  squadra_b: string;
  palestra: string | null;
  note: string | null;
  set_a_vinti: number | null;
  set_b_vinti: number | null;
  punteggi_set: Array<{ set: number; pts_a: number; pts_b: number }>;
}

function parseItalianDate(dateStr: string): string {
  if (!dateStr?.trim()) return '';
  
  // Rimuove giorno settimana (es. "mer ", "gio ")
  const cleanDate = dateStr.replace(/^[a-z]{3}\s+/i, '').trim();
  
  // Split e pulizia spazi
  const parts = cleanDate.split('/').map(p => p.trim());
  
  if (parts.length !== 3) {
    console.warn(`⚠️  Data non valida: "${dateStr}"`);
    return '';
  }
  
  const day = parts[0].padStart(2, '0');
  const month = parts[1].padStart(2, '0');
  const year = `20${parts[2]}`;
  
  return `${year}-${month}-${day}`;
}

function parsePunteggiSet(match: CSVMatch): Array<{ set: number; pts_a: number; pts_b: number }> {
  const sets: Array<{ set: number; pts_a: number; pts_b: number }> = [];
  
  for (let i = 1; i <= 5; i++) {
    const ptsAKey = `${i}_SET_PTS_A` as keyof CSVMatch;
    const ptsBKey = `${i}_SET_PTS_B` as keyof CSVMatch;
    
    const ptsA = parseInt(match[ptsAKey] || '0');
    const ptsB = parseInt(match[ptsBKey] || '0');
    
    if (ptsA > 0 || ptsB > 0) {
      sets.push({ set: i, pts_a: ptsA, pts_b: ptsB });
    }
  }
  
  return sets;
}

async function migrateCSV(categoria: 'master' | 'open'): Promise<{ imported: number; skipped: number }> {
  const csvPath = path.join(process.cwd(), 'content/campionati', `${categoria}.csv`);
  
  console.log(`\n📄 Migrazione ${categoria.toUpperCase()}...`);
  
  if (!fs.existsSync(csvPath)) {
    console.error(`❌ File ${csvPath} non trovato!`);
    return { imported: 0, skipped: 0 };
  }
  
  const fileContent = fs.readFileSync(csvPath, 'utf-8');
  
  const records = parse(fileContent, {
    columns: true,
    skip_empty_lines: true,
    trim: true,
    relax_column_count: true,
  }) as CSVMatch[];
  
  let imported = 0;
  let skipped = 0;
  
  for (const record of records) {
    // Salta righe senza dati essenziali
    if (!record['Squadra A'] || !record['Squadra B'] || !record['N. Gara']) {
      skipped++;
      continue;
    }
    
    // Salta partite di RIPOSO
    if (record['Squadra A'] === 'RIPOSO' || record['Squadra B'] === 'RIPOSO') {
      skipped++;
      continue;
    }
    
    const data = parseItalianDate(record.Data);
    if (!data) {
      console.warn(`⚠️  Data invalida per gara ${record['N. Gara']}: "${record.Data}"`);
      skipped++;
      continue;
    }
    
    const match: MatchData = {
      categoria,
      numero_gara: record['N. Gara'],
      data,
      ora: record.Ora?.replace(/^ore\s*/i, '').trim() || null,
      squadra_a: record['Squadra A'],
      squadra_b: record['Squadra B'],
      palestra: record.PALESTRA || null,
      note: record.NOTE || null,
      set_a_vinti: record.SetA_Vinti ? parseInt(record.SetA_Vinti) : null,
      set_b_vinti: record.SetB_Vinti ? parseInt(record.SetB_Vinti) : null,
      punteggi_set: parsePunteggiSet(record),
    };
    
    const { error } = await supabaseAdmin
      .from('matches')
      .upsert(match, { onConflict: 'numero_gara,categoria' });
    
    if (error) {
      console.error(`❌ Gara ${match.numero_gara}:`, error.message);
      skipped++;
    } else {
      imported++;
    }
  }
  
  console.log(`✅ ${categoria.toUpperCase()}: ${imported} importate, ${skipped} skippate`);
  return { imported, skipped };
}

async function main() {
  console.log('🚀 Inizio migrazione CSV Campionati → Database\n');
  
  const masterResult = await migrateCSV('master');
  const openResult = await migrateCSV('open');
  
  const totalImported = masterResult.imported + openResult.imported;
  const totalSkipped = masterResult.skipped + openResult.skipped;
  
  // Verifica totale
  const { count } = await supabaseAdmin
    .from('matches')
    .select('*', { count: 'exact', head: true });
  
  console.log(`\n🎉 Migrazione Matches completata!`);
  console.log(`   ✅ Importate: ${totalImported}`);
  console.log(`   ⚠️  Skippate: ${totalSkipped}`);
  console.log(`   📊 Totale nel DB: ${count}`);
}

main().catch(console.error);