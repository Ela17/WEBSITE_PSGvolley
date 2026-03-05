"use client";

import { useState } from "react";
import { CalendarEvent, parseItalianDate, getCategoriaLabel, formatDateItalian } from "@/lib/campionato-types";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Search, Calendar, Trophy, X } from "lucide-react";
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

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Separa partite passate e future
  // Una partita è "giocata" se ha data passata OPPURE ha un risultato (es. vittoria a tavolino senza data)
  const pastEvents = filteredEvents
    .filter((e) => {
      if (e.risultato !== undefined) return true; // ha risultato = giocata
      if (!e.data) return false;
      const d = parseItalianDate(e.data);
      return d < today;
    })
    .sort((a, b) => {
      const dateA = a.data ? parseItalianDate(a.data) : new Date(0);
      const dateB = b.data ? parseItalianDate(b.data) : new Date(0);
      return dateB.getTime() - dateA.getTime();
    });

  const futureEventsCount = filteredEvents.filter((e) => {
    if (e.risultato !== undefined) return false; // ha risultato = già giocata
    if (!e.data) return false;
    const d = parseItalianDate(e.data);
    return d >= today;
  }).length;

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
      {!hasSearch ? null : pastEvents.length === 0 && futureEventsCount === 0 ? (
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
          <div className="flex flex-wrap items-center gap-3">
            <p className="text-sm text-muted-foreground">
              {pastEvents.length} {pastEvents.length === 1 ? "partita giocata" : "partite giocate"}
              {categoriaFilter !== "all" &&
                ` nel campionato ${categoriaFilter === "master" ? "Master 4+2" : "Open 3×3"}`}
            </p>
            {futureEventsCount > 0 && (
              <Badge variant="outline" className="text-xs">
                {futureEventsCount} {futureEventsCount === 1 ? "partita" : "partite"} ancora da giocare
              </Badge>
            )}
          </div>
          {pastEvents.map((event) => (
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

              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}