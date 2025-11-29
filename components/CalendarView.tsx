"use client";

import { useState } from "react";
import {
  CalendarEvent,
  parseItalianDate,
  getCategoriaLabel,
} from "@/lib/campionato-types";
import {
  ChevronLeft,
  ChevronRight,
  Clock,
  MapPin,
  Calendar,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";

interface CalendarViewProps {
  events: CalendarEvent[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(
    null
  );
  const [dialogOpen, setDialogOpen] = useState(false);

  // SOLO partite del PSG
  const psgEvents = events.filter(
    (event) =>
      event.squadraA.includes("ASD Patr. San Giuseppe") ||
      event.squadraB.includes("ASD Patr. San Giuseppe")
  );

  // Crea mappa date -> eventi PSG
  const eventsByDate = new Map<string, CalendarEvent[]>();
  psgEvents.forEach((event) => {
    const date = parseItalianDate(event.data);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // Genera giorni del mese
  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const daysInMonth = lastDay.getDate();
  const startingDayOfWeek = (firstDay.getDay() + 6) % 7; // 0 = Lunedì

  const monthNames = [
    "Gennaio",
    "Febbraio",
    "Marzo",
    "Aprile",
    "Maggio",
    "Giugno",
    "Luglio",
    "Agosto",
    "Settembre",
    "Ottobre",
    "Novembre",
    "Dicembre",
  ];

  const dayNames = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];

  // Handler navigazione mesi
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  // Genera array di giorni (inclusi padding)
  const calendarDays = [];

  // Padding iniziale (giorni del mese precedente)
  for (let i = 0; i < startingDayOfWeek; i++) {
    calendarDays.push(null);
  }

  // Giorni del mese corrente
  for (let day = 1; day <= daysInMonth; day++) {
    calendarDays.push(day);
  }

  // Handler click su giorno
  const handleDayClick = (day: number | null) => {
    if (!day) return;

    const date = new Date(year, month, day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    const dayEvents = eventsByDate.get(dateKey) || [];

    if (dayEvents.length > 0) {
      setSelectedEvent(dayEvents[0]);
      setDialogOpen(true);
    }
  };

  // Check se è oggi
  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return (
      day === today.getDate() &&
      month === today.getMonth() &&
      year === today.getFullYear()
    );
  };

  // Ottieni eventi per un giorno
  const getEventsForDay = (day: number | null): CalendarEvent[] => {
    if (!day) return [];
    const date = new Date(year, month, day);
    const dateKey = `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`;
    return eventsByDate.get(dateKey) || [];
  };

  // Filtra eventi del mese corrente per la vista lista mobile
  const monthEvents = psgEvents
    .filter((event) => {
      const eventDate = parseItalianDate(event.data);
      return eventDate.getMonth() === month && eventDate.getFullYear() === year;
    })
    .sort((a, b) => {
      const dateA = parseItalianDate(a.data);
      const dateB = parseItalianDate(b.data);
      return dateA.getTime() - dateB.getTime();
    });

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl">
              {monthNames[month]} {year}
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={goToToday}>
                Oggi
              </Button>
              <Button variant="outline" size="icon" onClick={goToPreviousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={goToNextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {/* VISTA MOBILE - Lista partite */}
          <div className="md:hidden space-y-3">
            {monthEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>Nessuna partita in programma questo mese</p>
              </div>
            ) : (
              monthEvents.map((event) => {
                const opponent = event.squadraA.includes(
                  "ASD Patr. San Giuseppe"
                )
                  ? event.squadraB
                  : event.squadraA;
                const eventDate = parseItalianDate(event.data);
                const isEventToday = isToday(eventDate.getDate());

                return (
                  <button
                    key={event.id}
                    onClick={() => {
                      setSelectedEvent(event);
                      setDialogOpen(true);
                    }}
                    className={cn(
                      "w-full text-left p-4 rounded-lg border-2 transition-all",
                      "hover:shadow-md hover:border-primary/50",
                      isEventToday && "border-primary bg-primary/5",
                      !isEventToday && "border-border"
                    )}
                  >
                    <div className="space-y-2">
                      {/* Header con data e badge */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="text-sm font-semibold text-muted-foreground">
                            {event.data}
                          </p>
                          <p className="text-lg font-bold mt-1">
                            vs {opponent.replace("ASD ", "")}
                          </p>
                        </div>
                        <Badge
                          variant={
                            event.categoria === "master" ? "master" : "open"
                          }
                          className="text-xs"
                        >
                          {event.categoria === "master" ? "4+2" : "3×3"}
                        </Badge>
                      </div>

                      {/* Dettagli */}
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {event.ora && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {event.ora}
                          </span>
                        )}
                        {event.palestra && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            <span className="truncate">
                              {event.palestra.substring(0, 25)}
                            </span>
                          </span>
                        )}
                      </div>

                      {/* Risultato se disponibile */}
                      {event.risultato && (
                        <div className="pt-2 border-t">
                          <p className="text-2xl font-bold text-center">
                            {event.risultato.setA} - {event.risultato.setB}
                          </p>
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* VISTA DESKTOP - Calendario tradizionale */}
          <div className="hidden md:block">
            {/* Header giorni settimana */}
            <div className="grid grid-cols-7 gap-2 mb-2">
              {dayNames.map((day) => (
                <div
                  key={day}
                  className="text-center text-sm font-semibold text-muted-foreground p-2"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Griglia calendario */}
            <div className="grid grid-cols-7 gap-2">
              {calendarDays.map((day, index) => {
                const dayEvents = getEventsForDay(day);
                const hasEvents = dayEvents.length > 0;
                const today = isToday(day);

                return (
                  <button
                    key={index}
                    onClick={() => handleDayClick(day)}
                    disabled={!day}
                    className={cn(
                      "min-h-[100px] p-2 rounded-lg border-2 transition-all text-left",
                      "hover:shadow-md hover:border-primary/50",
                      !day && "invisible",
                      today && "border-primary bg-primary/5",
                      hasEvents &&
                        "border-blue-300 dark:border-blue-700 bg-blue-50/50 dark:bg-blue-950/20",
                      !hasEvents && "border-border hover:bg-muted/50"
                    )}
                  >
                    {day && (
                      <>
                        {/* Numero giorno */}
                        <div
                          className={cn(
                            "text-sm font-semibold mb-1",
                            today && "text-primary",
                            !today && "text-foreground"
                          )}
                        >
                          {day}
                        </div>

                        {/* Anteprima evento */}
                        {hasEvents && (
                          <div className="space-y-1">
                            {dayEvents.slice(0, 2).map((event) => {
                              const badgeVariant: "master" | "open" =
                                event.categoria === "master"
                                  ? "master"
                                  : "open";

                              // Determina avversario
                              const opponent = event.squadraA.includes(
                                "ASD Patr. San Giuseppe"
                              )
                                ? event.squadraB
                                : event.squadraA;

                              return (
                                <div
                                  key={event.id}
                                  className="text-xs space-y-0.5"
                                >
                                  <Badge
                                    variant={badgeVariant}
                                    className="text-[10px] px-1 py-0"
                                  >
                                    {getCategoriaLabel(event.categoria)}
                                  </Badge>
                                  <p className="font-semibold truncate">
                                    vs{" "}
                                    {opponent
                                      .replace("ASD ", "")
                                      .substring(0, 20)}
                                  </p>
                                  {event.ora && (
                                    <p className="text-muted-foreground flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {event.ora}
                                    </p>
                                  )}
                                </div>
                              );
                            })}
                            {dayEvents.length > 2 && (
                              <p className="text-xs text-muted-foreground">
                                +{dayEvents.length - 2} altre
                              </p>
                            )}
                          </div>
                        )}
                      </>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Dialog dettagli partita */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        {selectedEvent && (
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-2xl">Dettagli Partita</DialogTitle>
            </DialogHeader>

            <div className="space-y-4">
              {/* Badge categoria */}
              <div>
                <Badge
                  variant={
                    selectedEvent.categoria === "master" ? "master" : "open"
                  }
                >
                  {getCategoriaLabel(selectedEvent.categoria)}
                </Badge>
              </div>

              {/* Squadre */}
              <div className="text-center py-4 bg-muted/50 rounded-lg">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
                  <span
                    className={cn(
                      "font-bold text-base sm:text-lg",
                      selectedEvent.squadraA.includes(
                        "ASD Patr. San Giuseppe"
                      ) && "text-primary"
                    )}
                  >
                    {selectedEvent.squadraA}
                  </span>
                  <span className="text-xl sm:text-2xl font-light text-muted-foreground">
                    vs
                  </span>
                  <span
                    className={cn(
                      "font-bold text-base sm:text-lg",
                      selectedEvent.squadraB.includes(
                        "ASD Patr. San Giuseppe"
                      ) && "text-primary"
                    )}
                  >
                    {selectedEvent.squadraB}
                  </span>
                </div>

                {selectedEvent.risultato && (
                  <div className="mt-3 text-3xl font-bold">
                    {selectedEvent.risultato.setA} -{" "}
                    {selectedEvent.risultato.setB}
                  </div>
                )}
              </div>

              {/* Info partita */}
              <div className="space-y-3 border-t pt-4">
                <div className="flex items-start gap-3">
                  <div className="text-sm">
                    <p className="text-muted-foreground">Data</p>
                    <p className="font-semibold">{selectedEvent.data}</p>
                  </div>
                </div>

                {selectedEvent.ora && (
                  <div className="flex items-start gap-3">
                    <Clock className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Orario</p>
                      <p className="font-semibold">{selectedEvent.ora}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.palestra && (
                  <div className="flex items-start gap-3">
                    <MapPin className="w-5 h-5 mt-0.5 text-muted-foreground" />
                    <div className="text-sm">
                      <p className="text-muted-foreground">Palestra</p>
                      <p className="font-semibold">{selectedEvent.palestra}</p>
                    </div>
                  </div>
                )}

                {selectedEvent.note && (
                  <div className="p-3 bg-yellow-50 dark:bg-yellow-950 rounded-lg border border-yellow-200 dark:border-yellow-800">
                    <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                      Note
                    </p>
                    <p className="text-sm text-yellow-800 dark:text-yellow-200">
                      {selectedEvent.note}
                    </p>
                  </div>
                )}
              </div>

              {/* Punteggi set se disponibili */}
              {selectedEvent.risultato &&
                selectedEvent.risultato.punteggiSet.length > 0 && (
                  <div className="border-t pt-4">
                    <p className="text-sm font-semibold mb-2">Punteggi Set</p>
                    <div className="space-y-2">
                      {selectedEvent.risultato.punteggiSet.map((set, idx) => (
                        <div key={idx} className="flex justify-between text-sm">
                          <span className="text-muted-foreground">
                            Set {idx + 1}:
                          </span>
                          <span className="font-semibold">
                            {set.ptsA} - {set.ptsB}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
          </DialogContent>
        )}
      </Dialog>
    </div>
  );
}
