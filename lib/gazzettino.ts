import { supabase, GazzettinoArticle } from './supabase';
import { remark } from 'remark';
import html from 'remark-html';
import gfm from 'remark-gfm';

// Interfacce compatibili con il codice esistente
export interface GazzettinoPost {
  slug: string;
  title: string;
  date: string;
  week: number;
  season: string;
  excerpt: string;
  coverImage: string;
  category: string;
  author: string;
  tags: string[];
  content: string;
}

export interface GazzettinoPostPreview extends Omit<GazzettinoPost, 'content'> {}

// Converte da formato DB a formato app
function dbToPost(article: GazzettinoArticle): GazzettinoPost {
  return {
    slug: article.slug,
    title: article.title,
    date: article.date,
    week: article.week,
    season: article.season,
    excerpt: article.excerpt || '',
    coverImage: article.cover_image || '',
    category: article.category || '',
    author: article.author,
    tags: article.tags || [],
    content: article.content,
  };
}

function dbToPreview(article: GazzettinoArticle): GazzettinoPostPreview {
  return {
    slug: article.slug,
    title: article.title,
    date: article.date,
    week: article.week,
    season: article.season,
    excerpt: article.excerpt || '',
    coverImage: article.cover_image || '',
    category: article.category || '',
    author: article.author,
    tags: article.tags || [],
  };
}

// Ottiene tutti gli slug degli articoli
export async function getAllGazzettinoSlugs(): Promise<string[]> {
  const { data, error } = await supabase
    .from('gazzettino_articles')
    .select('slug')
    .order('date', { ascending: false });

  if (error) {
    console.error('Errore getAllGazzettinoSlugs:', error);
    return [];
  }

  return data?.map(d => d.slug) || [];
}

// Ottiene i metadati di tutti i post (senza contenuto)
export async function getAllGazzettinoPostsPreview(): Promise<GazzettinoPostPreview[]> {
  const { data, error } = await supabase
    .from('gazzettino_articles')
    .select('*')
    .order('date', { ascending: false });

  if (error) {
    console.error('Errore getAllGazzettinoPostsPreview:', error);
    return [];
  }

  return (data || []).map(dbToPreview);
}

// Ottiene un singolo post con contenuto completo (HTML diretto dal DB)
export async function getGazzettinoPostBySlug(slug: string): Promise<GazzettinoPost | null> {
  const { data, error } = await supabase
    .from('gazzettino_articles')
    .select('*')
    .eq('slug', slug)
    .single();

  if (error || !data) {
    console.error('Errore getGazzettinoPostBySlug:', error);
    return null;
  }

  return dbToPost(data);
}

// Ottiene l'ultimo post pubblicato
export async function getLatestGazzettinoPost(): Promise<GazzettinoPostPreview | null> {
  const { data, error } = await supabase
    .from('gazzettino_articles')
    .select('*')
    .order('date', { ascending: false })
    .limit(1)
    .single();

  if (error || !data) {
    console.error('Errore getLatestGazzettinoPost:', error);
    return null;
  }

  return dbToPreview(data);
}

// Ottiene gli ultimi N post
export async function getLatestGazzettinoPosts(limit: number = 3): Promise<GazzettinoPostPreview[]> {
  const { data, error } = await supabase
    .from('gazzettino_articles')
    .select('*')
    .order('date', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Errore getLatestGazzettinoPosts:', error);
    return [];
  }

  return (data || []).map(dbToPreview);
}

// Ottiene post per stagione
export async function getGazzettinoPostsBySeason(season: string): Promise<GazzettinoPostPreview[]> {
  const { data, error } = await supabase
    .from('gazzettino_articles')
    .select('*')
    .eq('season', season)
    .order('date', { ascending: false });

  if (error) {
    console.error('Errore getGazzettinoPostsBySeason:', error);
    return [];
  }

  return (data || []).map(dbToPreview);
}