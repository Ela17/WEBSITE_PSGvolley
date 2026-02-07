"use client";

import { useState } from "react";
import { CalendarEvent, parseItalianDate, getCategoriaLabel, formatDateItalian, formatTimeItalian } from "@/lib/campionato-types";
import { getGoogleMapsLink } from "@/lib/calendar-utils";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, MapPin, Clock, Calendar, Trophy, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface TeamSearchProps {
  events: CalendarEvent[];
}

type CategoriaFilter = "all" | "master" | "open";

export default function TeamSearch({ events }: TeamSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [categoriaFilter, setCategoriaFilter] = useState<CategoriaFilter>("all");

  // Filtra per nome squadra
  const filterByTeam = (eventList: CalendarEvent[]): CalendarEvent[] => {
    if (!searchQuery.trim()) return eventList;
    const query = searchQuery.toLowerCase().trim();
    return eventList.filter(
      (event) =>
        event.squadraA.toLowerCase().includes(query) ||
        event.squadraB.toLowerCase().includes(query)
    );
  };

  // Filtra per categoria
  const filterByCategoria = (eventList: CalendarEvent[]): CalendarEvent[] => {
    if (categoriaFilter === "all") return eventList;
    return eventList.filter((event) => event.categoria === categoriaFilter);
  };

  // Applica entrambi i filtri SOLO se c'è una ricerca attiva
  const hasSearch = searchQuery.trim().length > 0;
  const filteredEvents = hasSearch ? filterByCategoria(filterByTeam(events)) : [];

  // Ordina per data (più recenti prima)
  const sortedEvents = [...filteredEvents].sort((a, b) => {
    if (!a.data || !b.data) return 0;
    const dateA = parseItalianDate(a.data);
    const dateB = parseItalianDate(b.data);
    return dateB.getTime() - dateA.getTime();
  });

  // Verifica se ha risultato
  const hasResult = (event: CalendarEvent) => event.risultato !== undefined;

  return (
    <div className="space-y-4">
      {/* Filtri */}
      <div className="flex flex-col sm:flex-row gap-3">
        {/* Input ricerca */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Cerca squadra..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0"
              onClick={() => setSearchQuery("")}
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>

        {/* Toggle categoria - visibile solo con ricerca attiva */}
        {hasSearch && (
          <div className="flex items-center gap-2">
            <Button
              variant={categoriaFilter === "all" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFilter("all")}
              className="min-w-[80px]"
            >
              Tutte
            </Button>
            <Button
              variant={categoriaFilter === "master" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFilter("master")}
              className="min-w-[80px]"
            >
              4+2
            </Button>
            <Button
              variant={categoriaFilter === "open" ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoriaFilter("open")}
              className="min-w-[80px]"
            >
              3×3
            </Button>
          </div>
        )}
      </div>

      {/* Risultati */}
      {!hasSearch ? null : sortedEvents.length === 0 ? (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-muted-foreground">
            Nessuna partita trovata per "{searchQuery}"
            {categoriaFilter !== "all" &&
              ` nel campionato ${categoriaFilter === "master" ? "Master 4+2" : "Open 3×3"}`}
          </p>
          <div className="flex gap-2 justify-center mt-4">
            <Button variant="link" size="sm" onClick={() => setSearchQuery("")}>
              Cancella ricerca
            </Button>
            {categoriaFilter !== "all" && (
              <Button
                variant="link"
                size="sm"
                onClick={() => setCategoriaFilter("all")}
              >
                Mostra tutte le categorie
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            {sortedEvents.length} partite trovate
            {categoriaFilter !== "all" &&
              ` nel campionato ${categoriaFilter === "master" ? "Master 4+2" : "Open 3×3"}`}
          </p>
          {sortedEvents.map((event) => (
            <Card key={event.id} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  {/* Badge categoria */}
                  <Badge
                    variant={event.categoria === "master" ? "default" : "secondary"}
                    className={cn(
                      "shrink-0",
                      event.categoria === "master"
                        ? "bg-blue-500 hover:bg-blue-600"
                        : "bg-green-500 hover:bg-green-600"
                    )}
                  >
                    <Trophy className="w-3 h-3 mr-1" />
                    {getCategoriaLabel(event.categoria)}
                  </Badge>

                  {/* Info partita */}
                  <div className="flex-1 space-y-1">
                    <div className="font-semibold text-sm sm:text-base">
                      {event.squadraA} <span className="text-muted-foreground">vs</span>{" "}
                      {event.squadraB}
                    </div>

                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {formatDateItalian(event.data)}
                      </span>
                      {event.ora && (
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatTimeItalian(event.ora)}
                        </span>
                      )}
                      {event.palestra && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {event.palestra}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Risultato */}
                  {hasResult(event) ? (
                    <div className="shrink-0">
                      <div className="flex items-center gap-2 text-lg font-bold">
                        <span
                          className={cn(
                            event.risultato!.setA > event.risultato!.setB
                              ? "text-green-600"
                              : "text-gray-500"
                          )}
                        >
                          {event.risultato!.setA}
                        </span>
                        <span className="text-muted-foreground">-</span>
                        <span
                          className={cn(
                            event.risultato!.setB > event.risultato!.setA
                              ? "text-green-600"
                              : "text-gray-500"
                          )}
                        >
                          {event.risultato!.setB}
                        </span>
                      </div>
                      <div className="text-xs text-muted-foreground text-center mt-1">
                        (
                        {event.risultato!.punteggiSet
                          .map((s) => `${s.ptsA}-${s.ptsB}`)
                          .join(", ")}
                        )
                      </div>
                    </div>
                  ) : (
                    <Badge variant="outline" className="shrink-0">
                      Da giocare
                    </Badge>
                  )}
                </div>

                {/* Link Google Maps */}
                {event.indirizzo_maps && (
                  <div className="mt-3 pt-3 border-t">
                    <a
                      href={getGoogleMapsLink(event.indirizzo_maps)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      Indicazioni stradali
                    </a>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}