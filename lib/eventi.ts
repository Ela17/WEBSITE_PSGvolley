import { supabase, DBEvento } from "./supabase";

export interface Evento {
  slug: string;
  title: string;
  date: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  extraDates?: string[];
  location: string;
  locationLink?: string;
  description: string;
  coverImage: string;
  type: "torneo" | "amichevole" | "evento-sociale" | "altro";
  category: string;
  images: string[];
  imagesFolder?: string;
  results?: string;
  registrationLink?: string;
  registrationDeadline?: string;
  fee?: string;
  tags?: string[];
  content: string;
  locandina?: string | null;
  googleDriveLink?: string;
}

export interface EventoPreview extends Omit<Evento, "content"> {}

// Converte da formato DB a formato app
function dbToEvento(e: DBEvento, includeContent: boolean = false): Evento {
  return {
    slug: e.slug,
    title: e.title,
    date: e.date,
    endDate: e.end_date || undefined,
    startTime: e.start_time || undefined,
    endTime: e.end_time || undefined,
    extraDates: e.extra_dates || undefined,
    location: e.location || "",
    locationLink: e.location_link || undefined,
    description: e.description,
    coverImage: e.cover_image || "",
    type: e.type,
    category: e.category || "",
    images: e.images || [],
    imagesFolder: e.images_folder || undefined,
    results: e.results || undefined,
    registrationLink: e.registration_link || undefined,
    registrationDeadline: e.registration_deadline || undefined,
    fee: e.fee || undefined,
    tags: e.tags || [],
    content: includeContent ? e.content : "",
    locandina: e.locandina,
    googleDriveLink: e.google_drive_link || "",
  };
}

function dbToPreview(e: DBEvento): EventoPreview {
  const { content, ...rest } = dbToEvento(e);
  return rest as EventoPreview;
}

// Helper per ottenere la data di oggi in formato YYYY-MM-DD
function getTodayString(): string {
  return new Date().toISOString().split("T")[0];
}

/**
 * Controlla se un evento è completamente passato (utility sincrona).
 * - Con endTime: passato quando data_fine + ora_fine < adesso
 * - Senza endTime: passato dal giorno successivo alla data_fine
 */
export function isEventoPast(evento: {
  date: string;
  endDate?: string;
  endTime?: string;
  extraDates?: string[];
}): boolean {
  const effectiveEnd =
    evento.endDate?.split("T")[0] ||
    (evento.extraDates?.length
      ? [...evento.extraDates].sort().at(-1)!
      : null) ||
    evento.date.split("T")[0];

  if (evento.endTime) {
    // Confronto preciso data+ora (ora locale, non UTC)
    return new Date(`${effectiveEnd}T${evento.endTime}`) < new Date();
  }

  // Senza ora: passato solo dal giorno successivo
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${effectiveEnd}T00:00:00`) < today;
}

// Legge tutti gli eventi futuri o in corso (end_date >= oggi, o date >= oggi se no end_date)
export async function getAllEventiFuturi(): Promise<EventoPreview[]> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .or(`date.gte.${today},end_date.gte.${today}`)
    .order("date", { ascending: true });

  if (error) {
    console.error("Errore getAllEventiFuturi:", error);
    return [];
  }

  return (data || [])
    .filter((e) => e.slug && e.slug !== "undefined" && e.slug !== "null")
    .map(dbToPreview);
}

// Legge tutti gli eventi completamente passati
export async function getAllEventiPassati(): Promise<EventoPreview[]> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .lt("date", today)
    .order("date", { ascending: false });

  if (error) {
    console.error("Errore getAllEventiPassati:", error);
    return [];
  }

  return (data || [])
    .filter((e) => e.slug && e.slug !== "undefined" && e.slug !== "null")
    .map(dbToPreview)
    .filter((e) => isEventoPast(e));
}

// Ottiene un singolo evento con contenuto completo
export async function getEventoBySlug(slug: string): Promise<Evento | null> {
  // Controllo che lo slug sia valido
  if (!slug || slug === "undefined" || slug === "null") {
    console.error("Invalid slug provided:", slug);
    return null;
  }

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .eq("slug", slug)
    .single();

  if (error || !data) {
    console.error("Errore getEventoBySlug:", error);
    return null;
  }

  // Il contenuto è già in HTML nel database
  return dbToEvento(data, true);
}

// Ottiene il prossimo evento futuro o in corso (il primo in ordine cronologico)
export async function getNextEvento(): Promise<EventoPreview | null> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .or(`date.gte.${today},end_date.gte.${today}`)
    .order("date", { ascending: true })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const e = data[0];
  if (!e.slug || e.slug === "undefined" || e.slug === "null") return null;

  return dbToPreview(e);
}

// Ottiene l'ultimo evento passato (il più recente)
export async function getLastEventoPassato(): Promise<EventoPreview | null> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .lt("date", today)
    .order("date", { ascending: false })
    .limit(1);

  if (error || !data || data.length === 0) return null;

  const e = data[0];
  if (!e.slug || e.slug === "undefined" || e.slug === "null") return null;

  return dbToPreview(e);
}

// Ottiene tutti gli eventi (futuri + passati)
export async function getAllEventi(): Promise<EventoPreview[]> {
  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .order("date", { ascending: false });

  if (error) {
    console.error("Errore getAllEventi:", error);
    return [];
  }

  return (data || [])
    .filter((e) => e.slug && e.slug !== "undefined" && e.slug !== "null")
    .map(dbToPreview);
}
