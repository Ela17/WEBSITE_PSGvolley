'use client';

import { useState } from 'react';
import { CalendarEvent, parseItalianDate } from '@/lib/campionato-types';
import { Calendar, Clock, MapPin } from 'lucide-react';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

interface CalendarViewProps {
  events: CalendarEvent[];
}

export default function CalendarView({ events }: CalendarViewProps) {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedDayEvents, setSelectedDayEvents] = useState<CalendarEvent[]>([]);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Crea mappa date -> eventi
  const eventsByDate = new Map<string, CalendarEvent[]>();
  events.forEach(event => {
    const date = parseItalianDate(event.data);
    const dateKey = date.toDateString();
    if (!eventsByDate.has(dateKey)) {
      eventsByDate.set(dateKey, []);
    }
    eventsByDate.get(dateKey)!.push(event);
  });

  // Giorni con partite
  const daysWithMatches = Array.from(eventsByDate.keys()).map(key => new Date(key));

  // Handler click giorno
  const handleDayClick = (date: Date | undefined) => {
    if (!date) return;
    
    setSelectedDate(date);
    const dateKey = date.toDateString();
    const dayEvents = eventsByDate.get(dateKey) || [];
    
    if (dayEvents.length > 0) {
      setSelectedDayEvents(dayEvents);
      setDialogOpen(true);
    }
  };

  // Modifiers per evidenziare giorni
  const modifiers = {
    hasMatch: daysWithMatches,
  };

  const modifiersClassNames = {
    hasMatch: 'bg-blue-100 dark:bg-blue-900 font-bold',
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Calendario Partite</CardTitle>
        </CardHeader>
        <CardContent className="flex justify-center">
          <CalendarComponent
            mode="single"
            selected={selectedDate}
            onSelect={handleDayClick}
            modifiers={modifiers}
            modifiersClassNames={modifiersClassNames}
            className="rounded-md border"
          />
        </CardContent>
      </Card>

      {/* Dialog partite del giorno */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Partite del {selectedDate?.toLocaleDateString('it-IT')}
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 max-h-[60vh] overflow-y-auto">
            {selectedDayEvents.map(event => {
              
              const badgeVariant: 'master' | 'open' = event.categoria === 'master' ? 'master' : 'open';
              
              return (
                <Card key={event.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <Badge variant={badgeVariant}>
                        {event.categoriaOriginale || badgeVariant.toUpperCase()}
                      </Badge>
                      {event.ora && <span className="text-sm text-muted-foreground">{event.ora}</span>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="text-center mb-3">
                      <div className="flex items-center justify-center gap-3">
                        <span className="font-bold">{event.squadraA}</span>
                        <span className="text-muted-foreground">vs</span>
                        <span className="font-bold">{event.squadraB}</span>
                      </div>
                      {event.risultato && (
                        <div className="mt-2 text-lg font-bold">
                          {event.risultato.setA} - {event.risultato.setB}
                        </div>
                      )}
                    </div>
                    {event.palestra && (
                      <p className="text-sm text-muted-foreground">
                        📍 {event.palestra}
                      </p>
                    )}
                    {event.note && (
                      <p className="mt-2 text-xs text-yellow-600 dark:text-yellow-400">
                        ⚠️ {event.note}
                      </p>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}