import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const gazzettinoDirectory = path.join(process.cwd(), 'content/gazzettino');

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

// Legge tutti i post del gazzettino
export function getAllGazzettinoSlugs(): string[] {
  if (!fs.existsSync(gazzettinoDirectory)) {
    return [];
  }
  const fileNames = fs.readdirSync(gazzettinoDirectory);
  return fileNames
    .filter(fileName => fileName.endsWith('.md'))
    .map(fileName => fileName.replace(/\.md$/, ''));
}

// Ottiene i metadati di tutti i post (senza contenuto)
export function getAllGazzettinoPostsPreview(): GazzettinoPostPreview[] {
  if (!fs.existsSync(gazzettinoDirectory)) {
    return [];
  }

  const slugs = getAllGazzettinoSlugs();
  const posts = slugs
    .map(slug => {
      const fullPath = path.join(gazzettinoDirectory, `${slug}.md`);
      const fileContents = fs.readFileSync(fullPath, 'utf8');
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        week: data.week || 0,
        season: data.season || '',
        excerpt: data.excerpt || '',
        coverImage: data.coverImage || '',
        category: data.category || '',
        author: data.author || '',
        tags: data.tags || [],
      };
    })
    .sort((a, b) => (a.date > b.date ? -1 : 1)); // Ordina per data decrescente

  return posts;
}

// Ottiene un singolo post con contenuto completo
export async function getGazzettinoPostBySlug(slug: string): Promise<GazzettinoPost | null> {
  try {
    const fullPath = path.join(gazzettinoDirectory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContents);

    // Converti markdown in HTML
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || '',
      date: data.date || '',
      week: data.week || 0,
      season: data.season || '',
      excerpt: data.excerpt || '',
      coverImage: data.coverImage || '',
      category: data.category || '',
      author: data.author || '',
      tags: data.tags || [],
      content: contentHtml,
    };
  } catch (error) {
    console.error(`Error reading post ${slug}:`, error);
    return null;
  }
}

// Ottiene l'ultimo post pubblicato
export function getLatestGazzettinoPost(): GazzettinoPostPreview | null {
  const posts = getAllGazzettinoPostsPreview();
  return posts.length > 0 ? posts[0] : null;
}