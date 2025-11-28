import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";

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
  imagesFolder?: string; // Cartella in public/images/
  results?: string;
  registrationLink?: string;
  registrationDeadline?: string;
  fee?: string;
  tags?: string[]; // Hashtag/tags dell'evento
  content: string;
}

export interface EventoPreview extends Omit<Evento, "content"> {}

// Funzione helper per leggere le immagini da una cartella
function getImagesFromFolder(folderPath: string): string[] {
  try {
    const publicPath = path.join(process.cwd(), "public", "images", folderPath);

    if (!fs.existsSync(publicPath)) {
      console.warn(`Images folder not found: ${publicPath}`);
      return [];
    }

    const files = fs.readdirSync(publicPath);
    const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".webp"];

    return files
      .filter((file) => {
        const ext = path.extname(file).toLowerCase();
        return imageExtensions.includes(ext);
      })
      .map((file) => `/images/${folderPath}/${file}`);
  } catch (error) {
    console.error(`Error reading images from folder ${folderPath}:`, error);
    return [];
  }
}

// Legge tutti gli eventi futuri
export function getAllEventiFuturi(): EventoPreview[] {
  if (!fs.existsSync(eventiFuturiDirectory)) {
    return [];
  }

  const fileNames = fs.readdirSync(eventiFuturiDirectory);
  const eventi = fileNames
    .filter((fileName) => fileName.endsWith(".md"))
    .map((fileName) => {
      try {
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
      } catch (error) {
        console.error(`Error reading evento futuro ${fileName}:`, error);
        return null;
      }
    })
    .filter((evento): evento is EventoPreview => evento !== null)
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
      try {
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
      } catch (error) {
        console.error(`Error reading evento passato ${fileName}:`, error);
        return null;
      }
    })
    .filter((evento): evento is EventoPreview => evento !== null)
    .sort((a, b) => (new Date(a.date) > new Date(b.date) ? -1 : 1)); // Ordina per data decrescente

  return eventi;
}

// Ottiene un singolo evento con contenuto completo
export async function getEventoBySlug(
  slug: string,
  type: "futuro" | "passato"
): Promise<Evento | null> {
  // Controllo che lo slug sia valido
  if (!slug || slug === "undefined" || slug === "null") {
    console.error("Invalid slug provided:", slug);
    return null;
  }

  try {
    const directory =
      type === "futuro" ? eventiFuturiDirectory : eventiPassatiDirectory;
    const fullPath = path.join(directory, `${slug}.md`);

    // Verifica che il file esista
    if (!fs.existsSync(fullPath)) {
      console.error(`File not found: ${fullPath}`);
      return null;
    }

    const fileContents = fs.readFileSync(fullPath, "utf8");
    const { data, content } = matter(fileContents);

    // Converti markdown in HTML con supporto per tabelle GFM
    const processedContent = await remark()
      .use(remarkGfm) // GitHub Flavored Markdown (tabelle, strikethrough, ecc.)
      .use(html)
      .process(content);
    const contentHtml = processedContent.toString();

    // Leggi le immagini dalla cartella se specificata
    let eventImages = data.images || [];
    if (data.imagesFolder && eventImages.length === 0) {
      // Se imagesFolder è un array, prendi il primo elemento
      const folderPath = Array.isArray(data.imagesFolder)
        ? data.imagesFolder[0]
        : data.imagesFolder;

      // Rimuovi il prefisso "/images/" se presente
      const cleanPath = folderPath.replace(/^\/images\//, "");

      eventImages = getImagesFromFolder(cleanPath);
    }

    return {
      slug,
      title: data.title || "",
      date: data.date || "",
      location: data.location || "",
      description: data.description || "",
      coverImage: data.coverImage || "",
      type: data.type || "altro",
      category: data.category || "",
      images: eventImages,
      imagesFolder: data.imagesFolder,
      results: data.results,
      registrationLink: data.registrationLink,
      registrationDeadline: data.registrationDeadline,
      fee: data.fee,
      tags: data.tags || [],
      content: contentHtml,
    };
  } catch (error) {
    console.error(`Error reading evento ${slug}:`, error);
    return null;
  }
}
