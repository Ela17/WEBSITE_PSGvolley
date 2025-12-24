import { supabase, DBEvento } from "./supabase";

// Interfacce compatibili con il codice esistente
export interface Evento {
  slug: string;
  title: string;
  date: string;
  location: string;
  locationLink?: string;
  description: string;
  coverImage: string;
  type: "torneo" | "amichevole" | "evento-sociale" | "altro";
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
  googleDriveLink?: string;
}

export interface EventoPreview extends Omit<Evento, "content"> {}

// Converte da formato DB a formato app
function dbToEvento(e: DBEvento, includeContent: boolean = false): Evento {
  return {
    slug: e.slug,
    title: e.title,
    date: e.date,
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
 * Controlla se una data è passata (utility sincrona)
 * @param dateStr - Data in formato YYYY-MM-DD o ISO
 * @returns true se la data è precedente a oggi
 */
export function isEventoPast(dateStr: string): boolean {
  const today = getTodayString();
  const eventDate = dateStr.split("T")[0]; // Normalizza a YYYY-MM-DD
  return eventDate < today;
}

// Legge tutti gli eventi futuri (data >= oggi)
export async function getAllEventiFuturi(): Promise<EventoPreview[]> {
  const today = getTodayString();

  const { data, error } = await supabase
    .from("eventi")
    .select("*")
    .gte("date", today)
    .order("date", { ascending: true });

  if (error) {
    console.error("Errore getAllEventiFuturi:", error);
    return [];
  }

  return (data || [])
    .filter((e) => e.slug && e.slug !== "undefined" && e.slug !== "null")
    .map(dbToPreview);
}

// Legge tutti gli eventi passati (data < oggi)
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
    .map(dbToPreview);
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
