import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import gfm from "remark-gfm";

const gazzettinoDirectory = path.join(process.cwd(), "content/gazzettino");

export interface GazzettinoPost {
  slug: string;
  title: string;
  date: string;
  week: number;
  season: string;
  excerpt: string;
  coverImage: string;
  squadra: "MASTER 4+2" | "OPEN 3×3";
  category: string; // Manteniamo per compatibilità
  author: string;
  tags: string[];
  content: string;
}

export interface GazzettinoPostPreview
  extends Omit<GazzettinoPost, "content"> {}

// Legge tutti i post del gazzettino da entrambe le categorie
export function getAllGazzettinoSlugs(): Array<{
  slug: string;
  squadra: "MASTER 4+2" | "OPEN 3×3";
}> {
  const slugs: Array<{
    slug: string;
    squadra: "MASTER 4+2" | "OPEN 3×3";
  }> = [];

  // Legge dalla cartella master
  const masterDir = path.join(gazzettinoDirectory, "master");
  if (fs.existsSync(masterDir)) {
    const masterFiles = fs.readdirSync(masterDir);
    masterFiles
      .filter((fileName) => fileName.endsWith(".md"))
      .forEach((fileName) => {
        slugs.push({
          slug: fileName.replace(/\.md$/, ""),
          squadra: "MASTER 4+2",
        });
      });
  }

  // Legge dalla cartella open
  const openDir = path.join(gazzettinoDirectory, "open");
  if (fs.existsSync(openDir)) {
    const openFiles = fs.readdirSync(openDir);
    openFiles
      .filter((fileName) => fileName.endsWith(".md"))
      .forEach((fileName) => {
        slugs.push({
          slug: fileName.replace(/\.md$/, ""),
          squadra: "OPEN 3×3",
        });
      });
  }

  return slugs;
}

// Ottiene i metadati di tutti i post (senza contenuto)
export function getAllGazzettinoPostsPreview(): GazzettinoPostPreview[] {
  const slugsData = getAllGazzettinoSlugs();
  const posts = slugsData
    .map(({ slug, squadra }) => {
      const subDir = squadra === "MASTER 4+2" ? "master" : "open";
      const fullPath = path.join(gazzettinoDirectory, subDir, `${slug}.md`);

      if (!fs.existsSync(fullPath)) {
        return null;
      }

      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || "",
        date: data.date || "",
        week: data.week || 0,
        season: data.season || "",
        excerpt: data.excerpt || "",
        coverImage: data.coverImage || "",
        squadra: squadra,
        category: data.category || "",
        author: data.author || "",
        tags: data.tags || [],
      };
    })
    .filter((post): post is GazzettinoPostPreview => post !== null)
    .sort((a, b) => (a.date > b.date ? -1 : 1)); // Ordina per data decrescente

  return posts;
}

// Ottiene un singolo post con contenuto completo
export async function getGazzettinoPostBySlug(
  slug: string,
  squadraRichiesta?: "MASTER 4+2" | "OPEN 3×3"
): Promise<GazzettinoPost | null> {
  try {
    let filePath: string;
    let squadraTrovata: "MASTER 4+2" | "OPEN 3×3";

    // Se la squadra è specificata, cerca solo in quella cartella
    if (squadraRichiesta) {
      const cartella = squadraRichiesta === "MASTER 4+2" ? "master" : "open";
      filePath = path.join(gazzettinoDirectory, cartella, `${slug}.md`);
      squadraTrovata = squadraRichiesta;

      if (!fs.existsSync(filePath)) {
        return null;
      }
    } else {
      // Fallback: cerca prima in master, poi in open
      filePath = path.join(gazzettinoDirectory, "master", `${slug}.md`);

      if (fs.existsSync(filePath)) {
        squadraTrovata = "MASTER 4+2";
      } else {
        filePath = path.join(gazzettinoDirectory, "open", `${slug}.md`);

        if (!fs.existsSync(filePath)) {
          return null;
        }
        squadraTrovata = "OPEN 3×3";
      }
    }

    const fileContents = fs.readFileSync(filePath, "utf8");
    const { data, content } = matter(fileContents);

    // Converti markdown in HTML
    const processedContent = await remark().use(gfm).use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || "",
      date: data.date || "",
      week: data.week || 0,
      season: data.season || "",
      excerpt: data.excerpt || "",
      coverImage: data.coverImage || "",
      squadra: squadraTrovata,
      category: data.category || "",
      author: data.author || "",
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

// Ottiene l'ultimo post per squadra
export function getLatestGazzettinoPostBySquadra(
  squadra: "MASTER 4+2" | "OPEN 3×3"
): GazzettinoPostPreview | null {
  const posts = getGazzettinoPostsBySquadra(squadra);
  return posts.length > 0 ? posts[0] : null;
}

// Ottiene i post filtrati per squadra
export function getGazzettinoPostsBySquadra(
  squadra: "MASTER 4+2" | "OPEN 3×3"
): GazzettinoPostPreview[] {
  const allPosts = getAllGazzettinoPostsPreview();
  return allPosts.filter((post) => post.squadra === squadra);
}
