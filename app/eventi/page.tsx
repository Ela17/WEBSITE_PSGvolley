import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getEventoBySlug, getAllEventiFuturi, getAllEventiPassati } from "@/lib/eventi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Trophy,
  Users,
  PartyPopper,
  ExternalLink,
} from "lucide-react";

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

// Genera i path statici per tutti gli eventi
export async function generateStaticParams() {
  const eventiFuturi = getAllEventiFuturi();
  const eventiPassati = getAllEventiPassati();
  
  const allSlugs = [
    ...eventiFuturi.map(e => ({ slug: e.slug })),
    ...eventiPassati.map(e => ({ slug: e.slug }))
  ];
  
  return allSlugs;
}

export default async function EventoPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  
  // Prova prima negli eventi futuri, poi in quelli passati
  let evento = await getEventoBySlug(slug, 'futuro');
  let isPassato = false;
  
  if (!evento) {
    evento = await getEventoBySlug(slug, 'passato');
    isPassato = true;
  }

  if (!evento) {
    notFound();
  }

  const Icon = iconMap[evento.type];
  const badgeColor = badgeColorMap[evento.type];
  const typeLabel = typeLabelMap[evento.type];
  const isPastEvent = isPassato || new Date(evento.date) < new Date();

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header con meta informazioni */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-8 max-w-5xl">
          {/* Bottone torna indietro */}
          <Link href="/eventi">
            <Button variant="ghost" className="mb-6 hover:bg-blue-50">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Torna agli Eventi
            </Button>
          </Link>

          {/* Meta informazioni */}
          <div className="flex items-center gap-4 flex-wrap mb-4">
            <Badge className={`${badgeColor} text-white`}>
              <Icon className="w-4 h-4 mr-2" />
              {typeLabel}
            </Badge>
            {evento.category && (
              <Badge variant="outline" className="text-base px-3 py-1">
                {evento.category}
              </Badge>
            )}
          </div>

          {/* Titolo */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {evento.title}
          </h1>

          {/* Info evento */}
          <div className="flex flex-col gap-3 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-lg font-medium">
                {format(new Date(evento.date), "EEEE dd MMMM yyyy", {
                  locale: it,
                })}
              </span>
            </div>
            {evento.location && (
              <div className="flex items-center gap-2">
                <MapPin className="w-5 h-5 text-blue-600" />
                <span className="text-lg">{evento.location}</span>
              </div>
            )}
          </div>

          {/* Info iscrizione per eventi futuri */}
          {!isPastEvent && (
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              {evento.fee && (
                <p className="text-gray-700 mb-2">
                  <strong>Quota di partecipazione:</strong> {evento.fee}
                </p>
              )}
              {evento.registrationDeadline && (
                <p className="text-gray-700 mb-3">
                  <strong>Iscrizioni entro:</strong>{" "}
                  {format(new Date(evento.registrationDeadline), "dd MMMM yyyy", {
                    locale: it,
                  })}
                </p>
              )}
              {evento.registrationLink && (
                <Link
                  href={evento.registrationLink}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button className="bg-green-600 hover:bg-green-700">
                    <ExternalLink className="w-4 h-4 mr-2" />
                    Iscriviti ora
                  </Button>
                </Link>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Immagine hero full-width */}
      {evento.coverImage && (
        <div className="relative w-full aspect-[16/9] bg-gray-100">
          <Image
            src={evento.coverImage}
            alt={evento.title}
            fill
            className="object-cover"
            priority
            sizes="100vw"
          />
        </div>
      )}

      {/* Contenuto principale */}
      <div className="container mx-auto px-4 py-8 md:py-12">
        <div className="max-w-6xl mx-auto">
          {/* Contenuto evento */}
          <Card className="mb-8 shadow-lg">
            <CardContent className="p-6 md:p-8 lg:p-12">
              <article
                className="prose prose-lg max-w-none"
                dangerouslySetInnerHTML={{ __html: evento.content }}
              />
            </CardContent>
          </Card>

          {/* Gallery per eventi passati */}
          {isPastEvent && evento.images && evento.images.length > 0 && (
            <Card className="mb-8 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 text-blue-600">
                  Galleria Fotografica
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {evento.images.map((image, index) => (
                    <div
                      key={index}
                      className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      <Image
                        src={image}
                        alt={`Foto ${index + 1} - ${evento.title}`}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Risultati per eventi passati */}
          {isPastEvent && evento.results && (
            <Card className="mb-8 shadow-lg">
              <CardContent className="p-6 md:p-8">
                <h2 className="text-3xl font-bold mb-6 text-blue-600">
                  Risultati
                </h2>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: evento.results }}
                />
              </CardContent>
            </Card>
          )}

          {/* Bottone ritorno */}
          <div className="flex justify-center">
            <Link href="/eventi">
              <Button
                size="lg"
                className="bg-blue-600 hover:bg-blue-700 text-white shadow-md hover:shadow-lg transition-all"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Tutti gli eventi
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}