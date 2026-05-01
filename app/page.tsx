import Image from "next/image";
import Link from "next/link";
import { getNextMatchAsync } from "@/lib/campionato";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { getCategoriaLabel } from "@/lib/campionato-types";
import NextMatchCard from "@/components/NextMatchCard";
import { getNextEvento, getLastEventoPassato } from "@/lib/eventi";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Trophy,
  Users,
  PartyPopper,
} from "lucide-react";

// Forza il refresh dei dati ad ogni richiesta (no cache)
export const revalidate = 0;

export default async function Home() {
  // Carica prossime partite e prossimo evento
  const [nextMasterMatch, nextOpenMatch, nextEvento, lastEventoPassato] =
    await Promise.all([
      getNextMatchAsync("master", "ASD Patr. San Giuseppe"),
      getNextMatchAsync("open", "ASD Patr. San Giuseppe"),
      getNextEvento(),
      getLastEventoPassato(),
    ]);

  const eventoInEvidenza = nextEvento ?? lastEventoPassato;
  const isFuturo = !!nextEvento;

  const iconMap = {
    torneo: Trophy,
    amichevole: Users,
    "evento-sociale": PartyPopper,
    altro: Calendar,
  };
  const badgeColorMap = {
    torneo: "bg-yellow-500",
    amichevole: "bg-blue-500",
    "evento-sociale": "bg-purple-500",
    altro: "bg-gray-500",
  };
  const typeLabelMap = {
    torneo: "Torneo",
    amichevole: "Amichevole",
    "evento-sociale": "Evento Sociale",
    altro: "Altro",
  };

  return (
    <main className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="flex justify-center mb-6">
            <Image
              src="/images/logos/PSG_LOGO.svg"
              alt="Logo squadra"
              width={150}
              height={150}
              className="rounded-full"
            />
          </div>
          <h1 className="text-5xl font-bold mb-4">Patrocinio San Giuseppe</h1>
          <h2 className="text-3xl font-bold mb-4">
            Associazione Sportiva Dilettantistica
          </h2>
          <p className="text-xl">Campionato UISP Volley Misto 4+2 e 3x3</p>
          <p className="text-xl">Stagione 2025/26</p>
        </div>
      </section>

      <div className="container mx-auto px-4 py-12 space-y-16">
        {/* Prossime Partite */}
        <section>
          <h2 className="text-3xl font-bold mb-6">Prossime Partite</h2>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <NextMatchCard
              match={nextMasterMatch}
              title="Prossima Partita Master"
              categoria="master"
            />
            <NextMatchCard
              match={nextOpenMatch}
              title="Prossima Partita Open"
              categoria="open"
            />
          </div>
        </section>

        {/* Sezione Prossimo / Ultimo Evento */}
        {eventoInEvidenza && (() => {
          const evento = eventoInEvidenza;
          const Icon = iconMap[evento.type] ?? Calendar;
          const badgeColor = badgeColorMap[evento.type] ?? "bg-gray-500";
          const typeLabel = typeLabelMap[evento.type] ?? "Altro";

          return (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-3xl font-bold">
                  {isFuturo ? "Prossimo Evento" : "Ultimo Evento"}
                </h2>
                <Link
                  href="/eventi"
                  className="flex items-center gap-1 text-blue-600 hover:underline text-sm font-medium"
                >
                  Vedi tutti gli eventi
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              <div className="bg-white dark:bg-card rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                <div className="md:flex">
                  {evento.coverImage && (
                    <div className="relative h-56 md:h-auto md:w-72 lg:w-80 flex-shrink-0">
                      <Image
                        src={evento.coverImage}
                        alt={evento.title}
                        fill
                        className="object-cover"
                      />
                    </div>
                  )}

                  <div className="p-6 flex flex-col justify-between flex-1">
                    <div>
                      <div className="flex items-center gap-2 mb-3 flex-wrap">
                        <Badge className={`${badgeColor} text-white`}>
                          <Icon className="w-3 h-3 mr-1" />
                          {typeLabel}
                        </Badge>
                        <Badge
                          className={
                            isFuturo
                              ? "bg-green-500 text-white"
                              : "bg-gray-400 text-white"
                          }
                        >
                          {isFuturo ? "In arrivo" : "Passato"}
                        </Badge>
                      </div>

                      <h3 className="text-2xl font-bold mb-3">
                        {evento.title}
                      </h3>

                      <div className="flex flex-col gap-1 mb-3">
                        <div className="flex items-center gap-2 text-muted-foreground text-sm">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(evento.date), "dd MMMM yyyy", {
                            locale: it,
                          })}
                        </div>
                        {evento.location && (
                          <div className="flex items-center gap-2 text-muted-foreground text-sm">
                            <MapPin className="w-4 h-4" />
                            {evento.location}
                          </div>
                        )}
                      </div>

                      <p className="text-muted-foreground line-clamp-3">
                        {evento.description}
                      </p>

                      {isFuturo && evento.fee && (
                        <p className="text-sm text-muted-foreground mt-2">
                          <span className="font-semibold">Quota:</span>{" "}
                          {evento.fee}
                        </p>
                      )}
                      {isFuturo && evento.registrationDeadline && (
                        <p className="text-sm text-muted-foreground mt-1">
                          <span className="font-semibold">
                            Iscrizioni entro:
                          </span>{" "}
                          {format(
                            new Date(evento.registrationDeadline),
                            "dd/MM/yyyy",
                            { locale: it }
                          )}
                        </p>
                      )}
                    </div>

                    <div className="flex gap-2 mt-5 flex-wrap">
                      <Link href={`/eventi/${evento.slug}`}>
                        <Button variant="default">
                          {isFuturo ? "Dettagli" : "Rivivi l'evento"}
                        </Button>
                      </Link>
                      {isFuturo && evento.registrationLink && (
                        <Link
                          href={evento.registrationLink}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button className="bg-green-600 hover:bg-green-700 text-white">
                            Partecipa!
                          </Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })()}
      </div>
    </main>
  );
}