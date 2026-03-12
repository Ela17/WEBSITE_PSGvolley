import { createClient } from "@supabase/supabase-js";

// Tipi per il database
export interface GazzettinoArticle {
  id: string;
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
  created_at: string;
  updated_at: string;
}

export interface DBEvento {
  id: string;
  slug: string;
  title: string;
  date: string;
  end_date: string | null;
  start_time: string | null;
  end_time: string | null;
  extra_dates: string[] | null;
  location: string | null;
  location_link: string | null;
  description: string;
  cover_image: string | null;
  type: "torneo" | "amichevole" | "evento-sociale" | "altro";
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
  google_drive_link: string | null;
  created_at: string;
  updated_at: string;
}

export interface DBMatch {
  id: string;
  categoria: "master" | "open";
  numero_gara: string;
  data: string;
  ora: string | null;
  squadra_a: string;
  squadra_b: string;
  palestra: string | null;
  indirizzo_maps: string | null;
  note: string | null;
  set_a_vinti: number | null;
  set_b_vinti: number | null;
  punteggi_set: Array<{ set: number; pts_a: number; pts_b: number }>;
  created_at: string;
  updated_at: string;
}

// Verifica che le variabili d'ambiente siano presenti
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    "⚠️ Variabili Supabase mancanti - alcune funzionalità potrebbero non funzionare"
  );
}

// Client pubblico (solo lettura con anon key)
// Sicuro da usare sia client-side che server-side
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");

// Client admin (scrittura con service_role key)
// ATTENZIONE: Usare SOLO in server-side (API routes, server components, scripts)
export function getSupabaseAdmin() {
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!serviceRoleKey) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY non configurata");
  }

  return createClient(supabaseUrl || "", serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}

// Alias per compatibilità
export const createAdminClient = getSupabaseAdmin;
