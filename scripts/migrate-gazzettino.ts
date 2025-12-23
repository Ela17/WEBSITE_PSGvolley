// Carica le variabili d'ambiente da .env.local
import dotenv from 'dotenv';
dotenv.config({ path: '.env.local' });

import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { createClient } from '@supabase/supabase-js';

// Verifica variabili d'ambiente
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variabili d\'ambiente mancanti!');
  console.error('   NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '✅' : '❌');
  console.error('   SUPABASE_SERVICE_ROLE_KEY:', supabaseServiceKey ? '✅' : '❌');
  console.error('\nAssicurati che .env.local contenga queste variabili.');
  process.exit(1);
}

// Client Supabase admin
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const gazzettinoDir = path.join(process.cwd(), 'content/gazzettino');

interface ArticleData {
  slug: string;
  title: string;
  date: string;
  week: number;
  season: string;
  excerpt: string | null;
  cover_image: string | null;
  category: string | null;
  author: string;
  tags: string[];
  content: string;
}

async function migrateGazzettino() {
  console.log('🚀 Inizio migrazione Gazzettino...\n');

  if (!fs.existsSync(gazzettinoDir)) {
    console.error('❌ Directory content/gazzettino non trovata!');
    return;
  }

  let imported = 0;
  let skipped = 0;

  // Leggi tutti i file .md direttamente dalla cartella gazzettino
  const files = fs.readdirSync(gazzettinoDir).filter(f => f.endsWith('.md'));
  
  console.log(`📁 Trovati ${files.length} file markdown\n`);

  for (const fileName of files) {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(gazzettinoDir, fileName);
    
    try {
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data, content } = matter(fileContents);

      // Valida campi obbligatori
      if (!data.title || !data.date || !data.author) {
        console.warn(`⚠️  ${fileName}: campi obbligatori mancanti (title, date, author)`);
        skipped++;
        continue;
      }

      const article: ArticleData = {
        slug,
        title: data.title,
        date: data.date,
        week: data.week || 1,
        season: data.season || '2024-25',
        excerpt: data.excerpt || null,
        cover_image: data.coverImage || null,
        category: data.category || null,
        author: data.author,
        tags: data.tags || [],
        content: content.trim(),
      };

      const { error } = await supabaseAdmin
        .from('gazzettino_articles')
        .upsert(article, { onConflict: 'slug' });

      if (error) {
        console.error(`❌ ${slug}:`, error.message);
        skipped++;
      } else {
        console.log(`✅ ${slug}`);
        imported++;
      }
    } catch (err) {
      console.error(`❌ Errore leggendo ${fileName}:`, err);
      skipped++;
    }
  }

  console.log(`\n🎉 Migrazione Gazzettino completata!`);
  console.log(`   ✅ Importati: ${imported}`);
  console.log(`   ⚠️  Skippati: ${skipped}`);
}

migrateGazzettino().catch(console.error);