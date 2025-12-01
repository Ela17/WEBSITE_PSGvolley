import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  getEventoBySlug,
  getAllEventiPassati,
  getAllEventiFuturi,
} from "@/lib/eventi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, ImagePlus } from "lucide-react";

import {
  Calendar,
  MapPin,
  Users,
  Trophy,
  PartyPopper,
  ArrowLeft,
  ExternalLink,
} from "lucide-react";
import ImageCarousel from "@/components/ImagesCarousel";

// Mappa per le icone dei tipi di evento
const iconMap = {
  torneo: Trophy,
  amichevole: Users,
  "evento-sociale": PartyPopper,
  altro: Calendar,
};

// Mappa per i colori dei badge
const badgeColorMap = {
  torneo: "bg-yellow-500 hover:bg-yellow-600",
  amichevole: "bg-blue-500 hover:bg-blue-600",
  "evento-sociale": "bg-purple-500 hover:bg-purple-600",
  altro: "bg-gray-500 hover:bg-gray-600",
};

// Mappa per i label dei tipi
const typeLabelMap = {
  torneo: "Torneo",
  amichevole: "Amichevole",
  "evento-sociale": "Evento Sociale",
  altro: "Altro",
};

// Genera i parametri statici per tutti gli eventi
export async function generateStaticParams() {
  const eventiFuturi = getAllEventiFuturi();
  const eventiPassati = getAllEventiPassati();

  const allSlugs = [
    ...eventiFuturi.map((e) => ({ slug: e.slug })),
    ...eventiPassati.map((e) => ({ slug: e.slug })),
  ];

  return allSlugs;
}

export default async function EventoDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // In Next.js 15+, params è una Promise che deve essere awaited
  const { slug } = await params;

  // Prova prima negli eventi futuri (più recenti)
  let evento = await getEventoBySlug(slug, "futuro");
  let isPassato = false;

  // Se non trovato, prova negli eventi passati
  if (!evento) {
    evento = await getEventoBySlug(slug, "passato");
    isPassato = true;
  }

  // Se ancora non trovato, 404
  if (!evento) {
    notFound();
  }

  const Icon = iconMap[evento.type];
  const badgeColor = badgeColorMap[evento.type];
  const typeLabel = typeLabelMap[evento.type];

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section con Cover Image come sfondo */}
      <section className="relative min-h-[500px] flex items-center">
        {/* Cover Image come sfondo */}
        {evento.coverImage ? (
          <>
            <div className="absolute inset-0 z-0">
              <Image
                src={evento.coverImage}
                alt={evento.title}
                fill
                className="object-cover"
                priority
              />
            </div>
            {/* Overlay scuro per leggibilità */}
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-black/50 to-black/70 z-10"></div>
          </>
        ) : (
          // Fallback: gradient blu se non c'è cover
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600 to-blue-800 z-0"></div>
        )}

        {/* Contenuto Hero */}
        <div className="container mx-auto px-4 relative z-20">
          <div className="max-w-4xl mx-auto text-white py-16">
            {/* Breadcrumb/Back button */}
            <Link
              href="/eventi"
              className="inline-flex items-center text-white/90 hover:text-white mb-6 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna agli eventi
            </Link>

            {/* Badge tipo evento */}
            <div className="flex items-center gap-2 mb-4 flex-wrap">
              <Badge className={`${badgeColor} text-white`}>
                <Icon className="w-3 h-3 mr-1" />
                {typeLabel}
              </Badge>
              {evento.category && (
                <Badge
                  variant="secondary"
                  className="bg-white/20 text-white hover:bg-white/30 backdrop-blur-sm"
                >
                  {evento.category}
                </Badge>
              )}
              {/* Badge Futuro/Passato */}
              <Badge
                variant="secondary"
                className={`${
                  isPassato
                    ? "bg-gray-600 hover:bg-gray-700"
                    : "bg-green-600 hover:bg-green-700"
                } text-white`}
              >
                {isPassato ? "Evento Passato" : "Evento Futuro"}
              </Badge>
            </div>

            {/* Titolo con text-shadow per leggibilità */}
            <h1 className="text-5xl font-bold mb-4 drop-shadow-lg">
              {evento.title}
            </h1>

            {/* Hashtag/Tags come badge */}
            {evento.tags && evento.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6">
                {evento.tags.map((tag) => (
                  <Badge
                    key={tag}
                    variant="outline"
                    className="bg-white/10 text-white border-white/30 hover:bg-white/20 backdrop-blur-sm px-3 py-1 text-sm font-normal"
                  >
                    #{tag}
                  </Badge>
                ))}
              </div>
            )}

            {/* Meta info */}
            <div className="flex flex-col sm:flex-row gap-4 text-white/95">
              <div className="flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                <span className="text-lg drop-shadow">
                  {format(new Date(evento.date), "dd MMMM yyyy", {
                    locale: it,
                  })}
                </span>
              </div>
              {evento.location && (
                <>
                  {evento.locationLink ? (
                    <a
                      href={evento.locationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 hover:text-white transition-colors group"
                    >
                      <MapPin className="w-5 h-5 group-hover:scale-110 transition-transform" />
                      <span className="text-lg drop-shadow underline decoration-white/50 group-hover:decoration-white">
                        {evento.location}
                      </span>
                      <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
                    </a>
                  ) : (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-5 h-5" />
                      <span className="text-lg drop-shadow">
                        {evento.location}
                      </span>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Contenuto principale */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-4xl mx-auto">
          {/* Info box per eventi futuri */}
          {!isPassato && (
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h2 className="text-2xl font-bold mb-4">Informazioni</h2>
              <div className="space-y-3">
                {evento.fee && (
                  <div>
                    <span className="font-semibold">
                      Quota di partecipazione:
                    </span>{" "}
                    {evento.fee}
                  </div>
                )}
                {evento.registrationDeadline && (
                  <div>
                    <span className="font-semibold">Iscrizioni entro:</span>{" "}
                    {format(
                      new Date(evento.registrationDeadline),
                      "dd MMMM yyyy",
                      { locale: it }
                    )}
                  </div>
                )}
                {evento.registrationLink && (
                  <div className="pt-2">
                    <Link
                      href={evento.registrationLink}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Button className="w-full sm:w-auto bg-green-600 hover:bg-green-700">
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Iscriviti ora
                      </Button>
                    </Link>
                  </div>
                )}
                {evento.locandina && (
                  <div className="pt-2">
                    <a
                      href={evento.locandina}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      <Eye className="w-5 h-5" />
                      <span> Visualizza la locandina dell'evento!</span>
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Carosello immagini per eventi passati - PRIMA del contenuto */}
          {isPassato && evento.images && evento.images.length > 0 && (
            <>
              <div className="mb-6">
                <ImageCarousel
                  images={evento.images}
                  eventTitle={evento.title}
                />
              </div>

              {/* Link Google Drive subito dopo il carosello */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 mb-8 rounded-r-lg">
                <p className="text-gray-700">
                  <ImagePlus className="w-5 h-5 inline-block mr-2 text-blue-500" />
                  <strong>
                    Tutte le foto del torneo sono disponibili nella{" "}
                    <a
                      href="https://drive.google.com/drive/folders/19-j0bzuq7WtAcpBzOsle2e_w9vp1unUr?usp=drive_link"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 underline font-semibold"
                    >
                      Galleria su Google Drive
                    </a>
                  </strong>
                </p>
              </div>
            </>
          )}

          {/* Contenuto markdown */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <div
              className="prose prose-lg max-w-none
                prose-headings:font-bold 
                prose-h2:text-3xl prose-h2:mt-8 prose-h2:mb-4 prose-h2:border-b prose-h2:border-gray-200 prose-h2:pb-2
                prose-h3:text-2xl prose-h3:mt-6 prose-h3:mb-3
                prose-h4:text-xl prose-h4:mt-4 prose-h4:mb-2
                prose-p:text-gray-700 prose-p:leading-relaxed prose-p:mb-4
                prose-strong:text-gray-900 prose-strong:font-semibold
                prose-ul:my-4 prose-ul:list-disc prose-ul:pl-6
                prose-ol:my-4 prose-ol:list-decimal prose-ol:pl-6
                prose-li:text-gray-700 prose-li:my-1
                prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-4 prose-blockquote:border-blue-500 prose-blockquote:pl-4 prose-blockquote:italic prose-blockquote:text-gray-600
                prose-code:text-sm prose-code:bg-gray-100 prose-code:px-1 prose-code:py-0.5 prose-code:rounded
                prose-table:w-full prose-table:border-collapse
                prose-thead:bg-gray-100
                prose-th:border prose-th:border-gray-300 prose-th:px-4 prose-th:py-2 prose-th:text-left prose-th:font-semibold
                prose-td:border prose-td:border-gray-300 prose-td:px-4 prose-td:py-2
                prose-img:rounded-lg prose-img:shadow-md"
              dangerouslySetInnerHTML={{ __html: evento.content }}
            />
          </div>

          {/* Bottone torna agli eventi */}
          <div className="mt-12 text-center">
            <Link href="/eventi">
              <Button variant="outline" size="lg">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Torna a tutti gli eventi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
