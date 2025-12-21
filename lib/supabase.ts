import { createClient } from '@supabase/supabase-js';

// Client pubblico (solo lettura con anon key)
export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

// Client admin (scrittura con service_role key - SOLO SERVER-SIDE!)
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

// Types per TypeScript
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

export interface Evento {
  id: string;
  slug: string;
  title: string;
  date: string;
  location: string | null;
  location_link: string | null;
  description: string;
  cover_image: string | null;
  type: 'torneo' | 'amichevole' | 'evento-sociale' | 'altro';
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
  created_at: string;
  updated_at: string;
}

export interface DBMatch {
  id: string;
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
  created_at: string;
  updated_at: string;
}