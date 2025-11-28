import Image from "next/image";
import Link from "next/link";
import { getAllEventiFuturi, getAllEventiPassati } from "@/lib/eventi";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, MapPin, Users, Trophy, PartyPopper } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

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

export default function EventiPage() {
  const eventiFuturi = getAllEventiFuturi().filter(
    (e) => e.slug && e.slug !== "undefined" && e.slug !== "null"
  );
  const eventiPassati = getAllEventiPassati().filter(
    (e) => e.slug && e.slug !== "undefined" && e.slug !== "null"
  );

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-blue-600 to-blue-800 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-4">Eventi</h1>
            <p className="text-xl text-blue-100">
              Tornei, amichevoli e tutti gli eventi del Patrocinio San Giuseppe
            </p>
          </div>
        </div>
      </section>

      {/* Contenuto */}
      <div className="container mx-auto px-4 py-12">
        <Tabs defaultValue="futuri" className="w-full">
          {/* Tab Navigation */}
          <TabsList className="grid w-full max-w-md mx-auto grid-cols-2 mb-8">
            <TabsTrigger value="futuri" className="text-lg">
              Prossimi Eventi
            </TabsTrigger>
            <TabsTrigger value="passati" className="text-lg">
              Eventi Passati
            </TabsTrigger>
          </TabsList>

          {/* Eventi Futuri */}
          <TabsContent value="futuri">
            {eventiFuturi.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nessun evento in programma al momento
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventiFuturi.map((evento) => {
                  const Icon = iconMap[evento.type];
                  const badgeColor = badgeColorMap[evento.type];
                  const typeLabel = typeLabelMap[evento.type];

                  return (
                    <Card
                      key={evento.slug}
                      className="overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* Immagine */}
                      {evento.coverImage && (
                        <div className="relative h-48 bg-gray-200">
                          <Image
                            src={evento.coverImage}
                            alt={evento.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <CardHeader>
                        {/* Badge tipo evento */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${badgeColor} text-white`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {typeLabel}
                          </Badge>
                          {evento.category && (
                            <Badge variant="outline">{evento.category}</Badge>
                          )}
                        </div>

                        <CardTitle className="text-2xl">
                          {evento.title}
                        </CardTitle>

                        {/* Data e luogo */}
                        <CardDescription>
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(evento.date), "dd MMMM yyyy", {
                                  locale: it,
                                })}
                              </span>
                            </div>
                            {evento.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{evento.location}</span>
                              </div>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {evento.description}
                        </p>

                        {/* Info iscrizione */}
                        {evento.fee && (
                          <p className="text-sm text-gray-600 mb-2">
                            <strong>Quota:</strong> {evento.fee}
                          </p>
                        )}
                        {evento.registrationDeadline && (
                          <p className="text-sm text-gray-600 mb-4">
                            <strong>Iscrizioni entro:</strong>{" "}
                            {format(
                              new Date(evento.registrationDeadline),
                              "dd/MM/yyyy",
                              { locale: it }
                            )}
                          </p>
                        )}

                        {/* Bottoni azione */}
                        <div className="flex gap-2">
                          <Link
                            href={`/eventi/${evento.slug}`}
                            className="flex-1"
                          >
                            <Button variant="default" className="w-full">
                              Dettagli
                            </Button>
                          </Link>
                          {evento.registrationLink && (
                            <Link
                              href={evento.registrationLink}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1"
                            >
                              <Button
                                variant="outline"
                                className="w-full bg-green-50 hover:bg-green-100 border-green-500 text-green-700"
                              >
                                Iscriviti
                              </Button>
                            </Link>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>

          {/* Eventi Passati */}
          <TabsContent value="passati">
            {eventiPassati.length === 0 ? (
              <div className="text-center py-20">
                <Calendar className="w-20 h-20 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500 text-lg">
                  Nessun evento passato disponibile
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {eventiPassati.map((evento) => {
                  const Icon = iconMap[evento.type];
                  const badgeColor = badgeColorMap[evento.type];
                  const typeLabel = typeLabelMap[evento.type];

                  return (
                    <Card
                      key={evento.slug}
                      className="overflow-hidden hover:shadow-xl transition-shadow"
                    >
                      {/* Immagine */}
                      {evento.coverImage && (
                        <div className="relative h-48 bg-gray-200">
                          <Image
                            src={evento.coverImage}
                            alt={evento.title}
                            fill
                            className="object-cover"
                          />
                        </div>
                      )}

                      <CardHeader>
                        {/* Badge tipo evento */}
                        <div className="flex items-center gap-2 mb-2">
                          <Badge className={`${badgeColor} text-white`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {typeLabel}
                          </Badge>
                          {evento.category && (
                            <Badge variant="outline">{evento.category}</Badge>
                          )}
                        </div>

                        <CardTitle className="text-2xl">
                          {evento.title}
                        </CardTitle>

                        {/* Data e luogo */}
                        <CardDescription>
                          <div className="flex flex-col gap-1 mt-2">
                            <div className="flex items-center gap-2 text-gray-600">
                              <Calendar className="w-4 h-4" />
                              <span>
                                {format(new Date(evento.date), "dd MMMM yyyy", {
                                  locale: it,
                                })}
                              </span>
                            </div>
                            {evento.location && (
                              <div className="flex items-center gap-2 text-gray-600">
                                <MapPin className="w-4 h-4" />
                                <span>{evento.location}</span>
                              </div>
                            )}
                          </div>
                        </CardDescription>
                      </CardHeader>

                      <CardContent>
                        <p className="text-gray-700 mb-4">
                          {evento.description}
                        </p>

                        {/* Link dettagli */}
                        <Link href={`/eventi/${evento.slug}`}>
                          <Button variant="default" className="w-full">
                            Vedi resoconto
                          </Button>
                        </Link>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </main>
  );
}
