import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { remark } from 'remark';
import html from 'remark-html';

const gazzettiniDirectory = path.join(process.cwd(), 'content/gazzettino');

export interface GazzettinoPost {
  slug: string;
  title: string;
  date: string;
  excerpt: string;
  image?: string;
  content: string;
}

export async function getGazzettinoPost(slug: string): Promise<GazzettinoPost> {
  const fullPath = path.join(gazzettiniDirectory, `${slug}.md`);
  const fileContents = fs.readFileSync(fullPath, 'utf8');
  const { data, content } = matter(fileContents);

  const processedContent = await remark().use(html).process(content);
  const contentHtml = processedContent.toString();

  return {
    slug,
    title: data.title,
    date: data.date,
    excerpt: data.excerpt,
    image: data.image,
    content: contentHtml,
  };
}

export function getAllGazzettinoSlugs(): string[] {
  const fileNames = fs.readdirSync(gazzettiniDirectory);
  return fileNames.map(fileName => fileName.replace(/\.md$/, ''));
}

export function getAllGazzettinoPostsMetadata(): Omit<GazzettinoPost, 'content'>[] {
  const fileNames = fs.readdirSync(gazzettiniDirectory);
  const allPostsData = fileNames.map(fileName => {
    const slug = fileName.replace(/\.md$/, '');
    const fullPath = path.join(gazzettiniDirectory, fileName);
    const fileContents = fs.readFileSync(fullPath, 'utf8');
    const { data } = matter(fileContents);

    return {
      slug,
      title: data.title,
      date: data.date,
      excerpt: data.excerpt,
      image: data.image,
    };
  });

  return allPostsData.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export function getLatestGazzettinoPost(): Omit<GazzettinoPost, 'content'> | null {
  const posts = getAllGazzettinoPostsMetadata();
  return posts.length > 0 ? posts[0] : null;
}