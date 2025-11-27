import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";

const eventiFuturiDirectory = path.join(process.cwd(), "content/eventi/futuri");
const eventiPassatiDirectory = path.join(
  process.cwd(),
  "content/eventi/passati"
);

export interface Evento {
  slug: string;
  title: string;
  date: string;
  location: string;
  description: string;
  coverImage: string;
  type: "torneo" | "amichevole" | "evento-sociale" | "altro";
  category: string;
  images?: string[];
  results?: string;
  registrationLink?: string;
  registrationDeadline?: string;
  fee?: string;
  content: string;
}

export interface EventoPreview extends Omit<Evento, "content"> {}

// Legge tutti gli eventi futuri
export function getAllEventiFuturi(): EventoPreview[] {
  if (!fs.existsSync(eventiFuturiDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(eventiFuturiDirectory);
  const eventi = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(eventiFuturiDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || "",
        date: data.date || "",
        location: data.location || "",
        description: data.description || "",
        coverImage: data.coverImage || "",
        type: data.type || "altro",
        category: data.category || "",
        registrationLink: data.registrationLink,
        registrationDeadline: data.registrationDeadline,
        fee: data.fee,
      } as EventoPreview;
    })
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? 1 : -1)); // Ordina per data crescente

  return eventi;
}

// Legge tutti gli eventi passati
export function getAllEventiPassati(): EventoPreview[] {
  if (!fs.existsSync(eventiPassatiDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(eventiPassatiDirectory);
  const eventi = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      const slug = fileName.replace(/\.md$/, "");
      const fullPath = path.join(eventiPassatiDirectory, fileName);
      const fileContents = fs.readFileSync(fullPath, "utf8");
      const { data } = matter(fileContents);

      return {
        slug,
        title: data.title || "",
        date: data.date || "",
        location: data.location || "",
        description: data.description || "",
        coverImage: data.coverImage || "",
        type: data.type || "altro",
        category: data.category || "",
        images: data.images || [],
        results: data.results,
      } as EventoPreview;
    })
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1)); // Ordina per data decrescente

  return eventi;
}

// Ottiene un singolo evento con contenuto completo
export async function getEventoBySlug(
  slug: string,
  type: "futuro" | "passato"
): Promise<Evento | null> {
  try {
    const directory =
      type === "futuro" ? eventiFuturiDirectory : eventiPassatiDirectory;
    const fullPath = path.join(directory, `${slug}.md`);
    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Converti markdown in HTML
    const processedContent = await remark().use(html).process(content);
    const contentHtml = processedContent.toString();

    return {
      slug,
      title: data.title || "",
      date: data.date || "",
      location: data.location || "",
      description: data.description || "",
      coverImage: data.coverImage || "",
      type: data.type || "altro",
      category: data.category || "",
      images: data.images || [],
      results: data.results,
      registrationLink: data.registrationLink,
      registrationDeadline: data.registrationDeadline,
      fee: data.fee,
      content: contentHtml,
    };
  } catch (error) {
    console.error(`Error reading evento ${slug}:`, error);
    return null;
  }
}
