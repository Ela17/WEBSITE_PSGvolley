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
  process.exit(1);
}

const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: { autoRefreshToken: false, persistSession: false }
});

const eventiFuturiDir = path.join(process.cwd(), 'content/eventi/futuri');
const eventiPassatiDir = path.join(process.cwd(), 'content/eventi/passati');

interface EventoData {
  slug: string;
  title: string;
  date: string;
  location: string | null;
  location_link: string | null;
  description: string;
  cover_image: string | null;
  type: string;
  category: string | null;
  images: string[];
  images_folder: string | null;
  results: string | null;
  registration_link: string | null;
  registration_deadline: string | null;
  fee: string | null;
  tags: string[];
  content: string;
  locandina: string | null;
  is_past: boolean;
}

async function migrateEventi() {
  console.log('🚀 Inizio migrazione Eventi...\n');

  let imported = 0;
  let skipped = 0;

  async function processDir(dir: string, isPast: boolean) {
    const label = isPast ? 'PASSATI' : 'FUTURI';
    
    if (!fs.existsSync(dir)) {
      console.warn(`⚠️  Directory ${label} non trovata: ${dir}`);
      return;
    }

    console.log(`📁 Processando eventi ${label}...`);

    const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

    for (const fileName of files) {
      const slug = fileName.replace(/\.md$/, '');
      const fullPath = path.join(dir, fileName);
      
      try {
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        const { data, content } = matter(fileContents);

        if (!data.title || !data.date || !data.type) {
          console.warn(`⚠️  ${fileName}: campi obbligatori mancanti`);
          skipped++;
          continue;
        }

        const evento: EventoData = {
          slug,
          title: data.title,
          date: data.date,
          location: data.location || null,
          location_link: data.locationLink || null,
          description: data.description || '',
          cover_image: data.coverImage || null,
          type: data.type,
          category: data.category || null,
          images: data.images || [],
          images_folder: data.imagesFolder || null,
          results: data.results || null,
          registration_link: data.registrationLink || null,
          registration_deadline: data.registrationDeadline || null,
          fee: data.fee || null,
          tags: data.tags || [],
          content: content.trim(),
          locandina: data.locandina || null,
          is_past: isPast,
        };

        const { error } = await supabaseAdmin
          .from('eventi')
          .upsert(evento, { onConflict: 'slug' });

        if (error) {
          console.error(`❌ ${slug}:`, error.message);
          skipped++;
        } else {
          console.log(`✅ ${slug} (${isPast ? 'passato' : 'futuro'})`);
          imported++;
        }
      } catch (err) {
        console.error(`❌ Errore leggendo ${fileName}:`, err);
        skipped++;
      }
    }
  }

  await processDir(eventiFuturiDir, false);
  await processDir(eventiPassatiDir, true);

  console.log(`\n🎉 Migrazione Eventi completata!`);
  console.log(`   ✅ Importati: ${imported}`);
  console.log(`   ⚠️  Skippati: ${skipped}`);
}

migrateEventi().catch(console.error);