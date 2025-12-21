import { supabase, DBEvento } from './supabase';
import { remark } from 'remark';
import html from 'remark-html';
import remarkGfm from 'remark-gfm';

// Interfacce compatibili con il codice esistente
export interface Evento {
  slug: string;
  title: string;
  date: string;
  location: string;
  locationLink?: string;
  description: string;
  coverImage: string;
  type: 'torneo' | 'amichevole' | 'evento-sociale' | 'altro';
  category: string;
  images?: string[];
  imagesFolder?: string;
  results?: string;
  registrationLink?: string;
  registrationDeadline?: string;
  fee?: string;
  tags?: string[];
  content: string;
  locandina?: string | null;
}

export interface EventoPreview extends Omit<Evento, 'content'> {}

// Converte da formato DB a formato app
function dbToEvento(e: DBEvento, includeContent: boolean = false): Evento {
  return {
    slug: e.slug,
    title: e.title,
    date: e.date,
    location: e.location || '',
    locationLink: e.location_link || undefined,
    description: e.description,
    coverImage: e.cover_image || '',
    type: e.type,
    category: e.category || '',
    images: e.images || [],
    imagesFolder: e.images_folder || undefined,
    results: e.results || undefined,
    registrationLink: e.registration_link || undefined,
    registrationDeadline: e.registration_deadline || undefined,
    fee: e.fee || undefined,
    tags: e.tags || [],
    content: includeContent ? e.content : '',
    locandina: e.locandina,
  };
}

function dbToPreview(e: DBEvento): EventoPreview {
  const { content, ...rest } = dbToEvento(e);
  return rest as EventoPreview;
}

// Legge tutti gli eventi futuri (is_past = false)
export async function getAllEventiFuturi(): Promise<EventoPreview[]> {
  const { data, error } = await supabase
    .from('eventi')
    .select('*')
    .eq('is_past', false)
    .order('date', { ascending: true }); // Futuri ordinati per data crescente

  if (error) {
    console.error('Errore getAllEventiFuturi:', error);
    return [];
  }

  return (data || [])
    .filter(e => e.slug && e.slug !== 'undefined' && e.slug !== 'null')
    .map(dbToPreview);
}

// Legge tutti gli eventi passati (is_past = true)
export async function getAllEventiPassati(): Promise<EventoPreview[]> {
  const { data, error } = await supabase
    .from('eventi')
    .select('*')
    .eq('is_past', true)
    .order('date', { ascending: false }); // Passati ordinati per data decrescente

  if (error) {
    console.error('Errore getAllEventiPassati:', error);
    return [];
  }

  return (data || [])
    .filter(e => e.slug && e.slug !== 'undefined' && e.slug !== 'null')
    .map(dbToPreview);
}

// Ottiene un singolo evento con contenuto completo
export async function getEventoBySlug(
  slug: string,
  type?: 'futuro' | 'passato'
): Promise<Evento | null> {
  // Controllo che lo slug sia valido
  if (!slug || slug === 'undefined' || slug === 'null') {
    console.error('Invalid slug provided:', slug);
    return null;
  }

  let query = supabase
    .from('eventi')
    .select('*')
    .eq('slug', slug);

  // Se specificato il tipo, filtra per is_past
  if (type === 'futuro') {
    query = query.eq('is_past', false);
  } else if (type === 'passato') {
    query = query.eq('is_past', true);
  }

  const { data, error } = await query.single();

  if (error || !data) {
    // Se non trovato con il tipo specificato, prova senza filtro
    if (type) {
      return getEventoBySlug(slug);
    }
    console.error('Errore getEventoBySlug:', error);
    return null;
  }

  // Converti markdown in HTML
  const processedContent = await remark()
    .use(remarkGfm)
    .use(html)
    .process(data.content);

  const evento = dbToEvento(data, true);
  evento.content = processedContent.toString();

  return evento;
}

// Ottiene tutti gli eventi (futuri + passati)
export async function getAllEventi(): Promise<EventoPreview[]> {
  const { data, error } = await supabase
    .from('eventi')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Errore getAllEventi:', error);
    return [];
  }

  return (data || [])
    .filter(e => e.slug && e.slug !== 'undefined' && e.slug !== 'null')
    .map(dbToPreview);
}

// Controlla se un evento è passato (utility)
export function isEventoPast(slug: string): Promise<boolean> {
  return supabase
    .from('eventi')
    .select('is_past')
    .eq('slug', slug)
    .single()
    .then(({ data }) => data?.is_past ?? false);
}