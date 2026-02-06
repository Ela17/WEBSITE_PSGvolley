"use client";

import { useState, useMemo } from "react";
import {
  CalendarEvent,
  formatDateItalian,
  getCategoriaLabel,
} from "@/lib/campionato-types";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Search, Trophy, Clock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface TeamSearchProps {
  events: CalendarEvent[];
}

export default function TeamSearch({ events }: TeamSearchProps) {
  const [searchQuery, setSearchQuery] = useState("");

  // Filtra partite per squadra cercata
  const searchResults = useMemo(() => {
    if (!searchQuery.trim() || searchQuery.length < 2) return null;

    const query = searchQuery.toLowerCase().trim();

    const matches = events.filter(
      (e) =>
        e.squadraA.toLowerCase().includes(query) ||
        e.squadraB.toLowerCase().includes(query),
    );

    // Separa giocate e da giocare
    const played = matches.filter(
      (m) =>
        m.risultato !== null &&
        m.risultato !== undefined &&
        m.risultato.setA !== null &&
        m.risultato.setA !== undefined,
    );
    const upcoming = matches.filter(
      (m) =>
        !m.risultato ||
        m.risultato.setA === null ||
        m.risultato.setA === undefined,
    );

    // Ordina per data
    const sortByDate = (a: CalendarEvent, b: CalendarEvent) => {
      if (!a.data && !b.data) return 0;
      if (!a.data) return 1;
      if (!b.data) return -1;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    };

    played.sort(sortByDate);
    upcoming.sort((a, b) => {
      if (!a.data && !b.data) return 0;
      if (!a.data) return 1;
      if (!b.data) return -1;
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });

    // Calcola statistiche
    let vittorie = 0;
    let sconfitte = 0;
    let setVinti = 0;
    let setPerse = 0;

    played.forEach((m) => {
      if (!m.risultato) return;

      const isSquadraA = m.squadraA.toLowerCase().includes(query);
      const setA = m.risultato.setA;
      const setB = m.risultato.setB;

      if (isSquadraA) {
        setVinti += setA;
        setPerse += setB;
        if (setA > setB) vittorie++;
        else sconfitte++;
      } else {
        setVinti += setB;
        setPerse += setA;
        if (setB > setA) vittorie++;
        else sconfitte++;
      }
    });

    return {
      played,
      upcoming,
      stats: {
        vittorie,
        sconfitte,
        setVinti,
        setPerse,
      },
      teamName: matches[0]?.squadraA.toLowerCase().includes(query)
        ? matches[0]?.squadraA
        : matches[0]?.squadraB || searchQuery,
    };
  }, [events, searchQuery]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl">Cerca Squadra</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Barra di ricerca */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Es. Kolbe, Sinapsi, Frassati..."
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

        {/* Messaggio se query troppo corta */}
        {searchQuery.length > 0 && searchQuery.length < 2 && (
          <p className="text-sm text-muted-foreground text-center py-4">
            Inserisci almeno 2 caratteri per cercare
          </p>
        )}

        {/* Nessun risultato */}
        {searchResults &&
          searchResults.played.length === 0 &&
          searchResults.upcoming.length === 0 && (
            <div className="text-center py-8">
              <Search className="w-12 h-12 mx-auto text-muted-foreground/30 mb-3" />
              <p className="text-muted-foreground">
                Nessuna squadra trovata per "{searchQuery}"
              </p>
            </div>
          )}

        {/* Risultati */}
        {searchResults &&
          (searchResults.played.length > 0 ||
            searchResults.upcoming.length > 0) && (
            <div className="space-y-6">
              {/* Header con nome squadra e statistiche */}
              <div className="bg-muted/50 rounded-lg p-4">
                <h3 className="font-bold text-lg mb-3">
                  {searchResults.teamName.replace("ASD ", "")}
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-green-600">
                      {searchResults.stats.vittorie}
                    </p>
                    <p className="text-xs text-muted-foreground">Vittorie</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-2xl font-bold text-red-600">
                      {searchResults.stats.sconfitte}
                    </p>
                    <p className="text-xs text-muted-foreground">Sconfitte</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-2xl font-bold">
                      {searchResults.stats.setVinti}
                    </p>
                    <p className="text-xs text-muted-foreground">Set vinti</p>
                  </div>
                  <div className="text-center p-2 bg-background rounded-lg">
                    <p className="text-2xl font-bold">
                      {searchResults.stats.setPerse}
                    </p>
                    <p className="text-xs text-muted-foreground">Set persi</p>
                  </div>
                </div>
              </div>

              {/* Partite giocate */}
              {searchResults.played.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-green-600" />
                    Partite giocate ({searchResults.played.length})
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Partita</TableHead>
                          <TableHead className="text-center">
                            Risultato
                          </TableHead>
                          <TableHead className="text-right">Cat.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.played.map((match) => {
                          const isSquadraA = match.squadraA
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());
                          const hasWon = match.risultato
                            ? isSquadraA
                              ? match.risultato.setA > match.risultato.setB
                              : match.risultato.setB > match.risultato.setA
                            : false;

                          return (
                            <TableRow key={match.id}>
                              <TableCell className="text-sm">
                                {match.data
                                  ? formatDateItalian(match.data)
                                  : "Da definire"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "font-medium",
                                    isSquadraA && "text-primary",
                                  )}
                                >
                                  {match.squadraA.replace("ASD ", "")}
                                </span>
                                <span className="text-muted-foreground mx-2">
                                  vs
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    !isSquadraA && "text-primary",
                                  )}
                                >
                                  {match.squadraB.replace("ASD ", "")}
                                </span>
                              </TableCell>
                              <TableCell className="text-center">
                                <span
                                  className={cn(
                                    "font-bold text-lg",
                                    hasWon ? "text-green-600" : "text-red-600",
                                  )}
                                >
                                  {match.risultato?.setA} -{" "}
                                  {match.risultato?.setB}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    match.categoria === "master"
                                      ? "master"
                                      : "open"
                                  }
                                  className="text-xs"
                                >
                                  {getCategoriaLabel(match.categoria)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}

              {/* Partite da giocare */}
              {searchResults.upcoming.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-3 flex items-center gap-2">
                    <Clock className="w-4 h-4 text-orange-500" />
                    Da giocare ({searchResults.upcoming.length})
                  </h4>
                  <div className="border rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Data</TableHead>
                          <TableHead>Partita</TableHead>
                          <TableHead className="text-right">Cat.</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {searchResults.upcoming.slice(0, 10).map((match) => {
                          const isSquadraA = match.squadraA
                            .toLowerCase()
                            .includes(searchQuery.toLowerCase());

                          return (
                            <TableRow key={match.id}>
                              <TableCell className="text-sm">
                                {match.data
                                  ? formatDateItalian(match.data)
                                  : "Da definire"}
                              </TableCell>
                              <TableCell>
                                <span
                                  className={cn(
                                    "font-medium",
                                    isSquadraA && "text-primary",
                                  )}
                                >
                                  {match.squadraA.replace("ASD ", "")}
                                </span>
                                <span className="text-muted-foreground mx-2">
                                  vs
                                </span>
                                <span
                                  className={cn(
                                    "font-medium",
                                    !isSquadraA && "text-primary",
                                  )}
                                >
                                  {match.squadraB.replace("ASD ", "")}
                                </span>
                              </TableCell>
                              <TableCell className="text-right">
                                <Badge
                                  variant={
                                    match.categoria === "master"
                                      ? "master"
                                      : "open"
                                  }
                                  className="text-xs"
                                >
                                  {getCategoriaLabel(match.categoria)}
                                </Badge>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                        {searchResults.upcoming.length > 10 && (
                          <TableRow>
                            <TableCell
                              colSpan={3}
                              className="text-center text-muted-foreground text-sm"
                            >
                              ... e altre {searchResults.upcoming.length - 10}{" "}
                              partite
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </div>
              )}
            </div>
          )}
      </CardContent>
    </Card>
  );
}
