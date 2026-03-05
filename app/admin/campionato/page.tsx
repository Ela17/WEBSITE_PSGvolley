"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { UISPSyncButton } from "@/components/UISPSyncButton";
import {
  ArrowLeft,
  Trophy,
  Loader2,
  Swords,
  Save,
  X,
  CheckCircle,
  Clock,
  Search,
  CalendarCog,
} from "lucide-react";

interface Match {
  id: string;
  numero_gara: string;
  data: string | null;
  ora: string | null;
  squadra_a: string;
  squadra_b: string;
  palestra: string | null;
  note: string | null;
  categoria: string;
  set_a_vinti: number | null;
  set_b_vinti: number | null;
  punteggi_set: Array<{ pts_a: number; pts_b: number }> | null;
}

export default function AdminCampionatoPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [editDetailsMatch, setEditDetailsMatch] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Form risultato
  const [resultForm, setResultForm] = useState({
    set_a_vinti: "",
    set_b_vinti: "",
    set1_a: "",
    set1_b: "",
    set2_a: "",
    set2_b: "",
    set3_a: "",
    set3_b: "",
    set4_a: "",
    set4_b: "",
    set5_a: "",
    set5_b: "",
  });

  // Form dettagli partita (data/ora/luogo)
  const [detailsForm, setDetailsForm] = useState({
    data: "",
    ora: "",
    palestra: "",
    note: "",
  });

  // Carica partite
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/campionato");
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setMatches(data.matches || []);
      }
    } catch (err) {
      setError("Errore nel caricamento delle partite");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Apri dialog modifica
  const openEditDialog = (match: Match) => {
    setEditMatch(match);
    const punteggi = match.punteggi_set || [];
    setResultForm({
      set_a_vinti: match.set_a_vinti?.toString() || "",
      set_b_vinti: match.set_b_vinti?.toString() || "",
      set1_a: punteggi[0]?.pts_a?.toString() || "",
      set1_b: punteggi[0]?.pts_b?.toString() || "",
      set2_a: punteggi[1]?.pts_a?.toString() || "",
      set2_b: punteggi[1]?.pts_b?.toString() || "",
      set3_a: punteggi[2]?.pts_a?.toString() || "",
      set3_b: punteggi[2]?.pts_b?.toString() || "",
      set4_a: punteggi[3]?.pts_a?.toString() || "",
      set4_b: punteggi[3]?.pts_b?.toString() || "",
      set5_a: punteggi[4]?.pts_a?.toString() || "",
      set5_b: punteggi[4]?.pts_b?.toString() || "",
    });
  };

  // Apri dialog modifica dettagli (data/ora/luogo)
  const openDetailsDialog = (match: Match) => {
    setEditDetailsMatch(match);
    setDetailsForm({
      data: match.data?.split("T")[0] || "",
      ora: match.ora || "",
      palestra: match.palestra || "",
      note: match.note || "",
    });
  };

  // Salva dettagli partita
  const handleSaveDetails = async () => {
    if (!editDetailsMatch) return;

    setSaving(true);
    try {
      const res = await fetch(`/api/admin/campionato/${editDetailsMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          data: detailsForm.data || null,
          ora: detailsForm.ora || null,
          palestra: detailsForm.palestra || null,
          note: detailsForm.note || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Aggiorna lista locale
        setMatches(
          matches.map((m) =>
            m.id === editDetailsMatch.id
              ? {
                  ...m,
                  data: data.match.data,
                  ora: data.match.ora,
                  palestra: data.match.palestra,
                  note: data.match.note,
                }
              : m,
          ),
        );
        setEditDetailsMatch(null);
      } else {
        setError(data.error || "Errore durante il salvataggio");
      }
    } catch (err) {
      setError("Errore durante il salvataggio");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Salva risultato
  const handleSaveResult = async () => {
    if (!editMatch) return;

    setSaving(true);
    try {
      // Costruisci punteggi set
      const punteggiSet = [];
      if (resultForm.set1_a && resultForm.set1_b) {
        punteggiSet.push({
          pts_a: parseInt(resultForm.set1_a),
          pts_b: parseInt(resultForm.set1_b),
        });
      }
      if (resultForm.set2_a && resultForm.set2_b) {
        punteggiSet.push({
          pts_a: parseInt(resultForm.set2_a),
          pts_b: parseInt(resultForm.set2_b),
        });
      }
      if (resultForm.set3_a && resultForm.set3_b) {
        punteggiSet.push({
          pts_a: parseInt(resultForm.set3_a),
          pts_b: parseInt(resultForm.set3_b),
        });
      }
      if (resultForm.set4_a && resultForm.set4_b) {
        punteggiSet.push({
          pts_a: parseInt(resultForm.set4_a),
          pts_b: parseInt(resultForm.set4_b),
        });
      }
      if (resultForm.set5_a && resultForm.set5_b) {
        punteggiSet.push({
          pts_a: parseInt(resultForm.set5_a),
          pts_b: parseInt(resultForm.set5_b),
        });
      }

      const res = await fetch(`/api/admin/campionato/${editMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          set_a_vinti: resultForm.set_a_vinti
            ? parseInt(resultForm.set_a_vinti)
            : null,
          set_b_vinti: resultForm.set_b_vinti
            ? parseInt(resultForm.set_b_vinti)
            : null,
          punteggi_set: punteggiSet.length > 0 ? punteggiSet : null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Aggiorna lista locale
        setMatches(
          matches.map((m) =>
            m.id === editMatch.id
              ? {
                  ...m,
                  set_a_vinti: data.match.set_a_vinti,
                  set_b_vinti: data.match.set_b_vinti,
                  punteggi_set: data.match.punteggi_set,
                }
              : m,
          ),
        );
        setEditMatch(null);
      } else {
        setError(data.error || "Errore durante il salvataggio");
      }
    } catch (err) {
      setError("Errore durante il salvataggio");
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  // Formatta data
  const formatDate = (dateStr: string | null | undefined) => {
    if (!dateStr) return "Da definire";

    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return "Da definire";

    return date.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Determina se una partita ha un risultato
  const hasResult = (match: Match): boolean => {
    return match.set_a_vinti !== null && match.set_b_vinti !== null;
  };

  // Determina se una partita è futura (basandosi sulla data)
  const isFutureMatch = (match: Match): boolean => {
    // Se data non definita, considerala futura
    if (!match.data) return true;

    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const matchDate = new Date(match.data);
    matchDate.setHours(0, 0, 0, 0);
    return matchDate >= today;
  };

  // Filtra partite per categoria
  const masterMatches = matches.filter((m) => m.categoria === "master");
  const openMatches = matches.filter((m) => m.categoria === "open");

  // Filtra per ricerca (numero gara o squadre)
  const filterBySearch = (matchList: Match[]): Match[] => {
    if (!searchQuery.trim()) return matchList;
    const query = searchQuery.toLowerCase().trim();
    return matchList.filter(
      (m) =>
        m.numero_gara.toLowerCase().includes(query) ||
        m.squadra_a.toLowerCase().includes(query) ||
        m.squadra_b.toLowerCase().includes(query),
    );
  };

  const filteredMasterMatches = filterBySearch(masterMatches);
  const filteredOpenMatches = filterBySearch(openMatches);

  // Componente tabella partite
  const MatchesTable = ({
    matches,
  }: {
    matches: Match[];
    categoria: string;
  }) => {
    // Se la ricerca non trova nulla
    if (matches.length === 0 && searchQuery) {
      return (
        <div className="text-center py-12">
          <Search className="w-12 h-12 mx-auto text-gray-300 mb-4" />
          <p className="text-muted-foreground">
            Nessuna partita trovata per "{searchQuery}"
          </p>
          <Button
            variant="link"
            size="sm"
            onClick={() => setSearchQuery("")}
            className="mt-2"
          >
            Cancella ricerca
          </Button>
        </div>
      );
    }

    // Partite da giocare: senza risultato (la data è irrilevante - anche tavolino senza data ha risultato)
    const upcoming = matches.filter((m) => !hasResult(m));
    // Partite giocate: hanno risultato (anche a tavolino senza data)
    const played = matches.filter((m) => hasResult(m));

    // Ordina: upcoming per data crescente (quelle da definire in fondo), played per data decrescente
    const sortedUpcoming = [...upcoming].sort((a, b) => {
      // Partite senza data vanno in fondo
      if (!a.data && !b.data) return 0;
      if (!a.data) return 1;
      if (!b.data) return -1;
      return new Date(a.data).getTime() - new Date(b.data).getTime();
    });

    const sortedPlayed = [...played].sort((a, b) => {
      // Partite senza data vanno in fondo
      if (!a.data && !b.data) return 0;
      if (!a.data) return 1;
      if (!b.data) return -1;
      return new Date(b.data).getTime() - new Date(a.data).getTime();
    });

    return (
      <div className="space-y-6">
        {/* Partite da giocare */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Da giocare ({sortedUpcoming.length})
          </h3>
          {sortedUpcoming.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nessuna partita in programma
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">N° Gara</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Squadra A</TableHead>
                  <TableHead className="text-center w-16">vs</TableHead>
                  <TableHead>Squadra B</TableHead>
                  <TableHead>Ora</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedUpcoming.slice(0, 20).map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {match.numero_gara}
                    </TableCell>
                    <TableCell>{formatDate(match.data)}</TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_a
                        .replace("ASD ", "")
                        .replace("Patr.", "P.")}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      -
                    </TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_b
                        .replace("ASD ", "")
                        .replace("Patr.", "P.")}
                    </TableCell>
                    <TableCell>{match.ora || "-"}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(match)}
                          title="Modifica data/ora/luogo"
                        >
                          <CalendarCog className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(match)}
                          title="Inserisci risultato"
                        >
                          <Swords className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {sortedUpcoming.length > 20 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center text-muted-foreground"
                    >
                      ... e altre {sortedUpcoming.length - 20} partite
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Partite giocate */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Giocate ({sortedPlayed.length})
          </h3>
          {sortedPlayed.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nessuna partita giocata
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-24">N° Gara</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Squadra A</TableHead>
                  <TableHead className="text-center">Risultato</TableHead>
                  <TableHead>Squadra B</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPlayed.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-mono text-sm font-medium">
                      {match.numero_gara}
                    </TableCell>
                    <TableCell>{formatDate(match.data)}</TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_a
                        .replace("ASD ", "")
                        .replace("Patr.", "P.")}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">
                        {match.set_a_vinti} - {match.set_b_vinti}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_b
                        .replace("ASD ", "")
                        .replace("Patr.", "P.")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openDetailsDialog(match)}
                          title="Modifica data/ora/luogo"
                        >
                          <CalendarCog className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => openEditDialog(match)}
                          title="Modifica risultato"
                        >
                          <Swords className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Admin
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <Trophy className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold">Gestione Campionato</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
            <Button variant="link" size="sm" onClick={() => setError("")}>
              Chiudi
            </Button>
          </div>
        )}

        <Card>
          <CardHeader>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div className="flex items-center gap-3">
                <CardTitle>
                  Partite Campionato ({matches.length} totali)
                </CardTitle>
                <UISPSyncButton onSyncComplete={fetchMatches} />
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Cerca N° gara o squadra..."
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
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-orange-600" />
              </div>
            ) : (
              <Tabs defaultValue="master">
                <TabsList className="mb-6">
                  <TabsTrigger value="master">
                    MASTER 4+2 ({filteredMasterMatches.length}
                    {searchQuery &&
                    filteredMasterMatches.length !== masterMatches.length
                      ? ` / ${masterMatches.length}`
                      : ""}
                    )
                  </TabsTrigger>
                  <TabsTrigger value="open">
                    OPEN 3×3 ({filteredOpenMatches.length}
                    {searchQuery &&
                    filteredOpenMatches.length !== openMatches.length
                      ? ` / ${openMatches.length}`
                      : ""}
                    )
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="master">
                  <MatchesTable
                    matches={filteredMasterMatches}
                    categoria="master"
                  />
                </TabsContent>

                <TabsContent value="open">
                  <MatchesTable
                    matches={filteredOpenMatches}
                    categoria="open"
                  />
                </TabsContent>
              </Tabs>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog modifica risultato */}
      <Dialog open={!!editMatch} onOpenChange={() => setEditMatch(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMatch?.set_a_vinti !== null ? "Modifica" : "Inserisci"}{" "}
              Risultato
            </DialogTitle>
          </DialogHeader>

          {editMatch && (
            <div className="space-y-4">
              {/* Info partita */}
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Gara {editMatch.numero_gara} • {formatDate(editMatch.data)} •{" "}
                  {editMatch.ora || "Ora TBD"}
                </p>
                <p className="font-semibold">
                  {editMatch.squadra_a.replace("ASD ", "")} vs{" "}
                  {editMatch.squadra_b.replace("ASD ", "")}
                </p>
              </div>

              {/* Risultato set */}
              <div>
                <Label className="mb-2 block">Risultato (Set vinti)</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={resultForm.set_a_vinti}
                    onChange={(e) =>
                      setResultForm({
                        ...resultForm,
                        set_a_vinti: e.target.value,
                      })
                    }
                    className="text-center text-xl font-bold"
                    placeholder="0"
                  />
                  <span className="text-xl font-light">-</span>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={resultForm.set_b_vinti}
                    onChange={(e) =>
                      setResultForm({
                        ...resultForm,
                        set_b_vinti: e.target.value,
                      })
                    }
                    className="text-center text-xl font-bold"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Punteggi singoli set */}
              <div>
                <Label className="mb-2 block">Punteggi Set (opzionale)</Label>
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((setNum) => (
                    <div key={setNum} className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground w-12">
                        Set {setNum}
                      </span>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={
                          resultForm[
                            `set${setNum}_a` as keyof typeof resultForm
                          ]
                        }
                        onChange={(e) =>
                          setResultForm({
                            ...resultForm,
                            [`set${setNum}_a`]: e.target.value,
                          })
                        }
                        className="text-center"
                        placeholder="-"
                      />
                      <span>-</span>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={
                          resultForm[
                            `set${setNum}_b` as keyof typeof resultForm
                          ]
                        }
                        onChange={(e) =>
                          setResultForm({
                            ...resultForm,
                            [`set${setNum}_b`]: e.target.value,
                          })
                        }
                        className="text-center"
                        placeholder="-"
                      />
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditMatch(null)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Annulla
            </Button>
            <Button onClick={handleSaveResult} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog modifica dettagli (data/ora/luogo) */}
      <Dialog
        open={!!editDetailsMatch}
        onOpenChange={() => setEditDetailsMatch(null)}
      >
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarCog className="w-5 h-5" />
              Modifica Data/Ora/Luogo
            </DialogTitle>
          </DialogHeader>

          {editDetailsMatch && (
            <div className="space-y-4">
              {/* Info partita */}
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  Gara {editDetailsMatch.numero_gara}
                </p>
                <p className="font-semibold">
                  {editDetailsMatch.squadra_a.replace("ASD ", "")} vs{" "}
                  {editDetailsMatch.squadra_b.replace("ASD ", "")}
                </p>
              </div>

              {/* Data */}
              <div>
                <Label htmlFor="data" className="mb-2 block">
                  Data
                </Label>
                <Input
                  id="data"
                  type="date"
                  value={detailsForm.data}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, data: e.target.value })
                  }
                />
              </div>

              {/* Ora */}
              <div>
                <Label htmlFor="ora" className="mb-2 block">
                  Orario
                </Label>
                <Input
                  id="ora"
                  type="text"
                  value={detailsForm.ora}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, ora: e.target.value })
                  }
                  placeholder="es. 21:00"
                />
              </div>

              {/* Palestra */}
              <div>
                <Label htmlFor="palestra" className="mb-2 block">
                  Palestra / Luogo
                </Label>
                <Input
                  id="palestra"
                  type="text"
                  value={detailsForm.palestra}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, palestra: e.target.value })
                  }
                  placeholder="es. Via Baiardi 4, Torino"
                />
              </div>

              {/* Note */}
              <div>
                <Label htmlFor="note" className="mb-2 block">
                  Note
                </Label>
                <Input
                  id="note"
                  type="text"
                  value={detailsForm.note}
                  onChange={(e) =>
                    setDetailsForm({ ...detailsForm, note: e.target.value })
                  }
                  placeholder="es. Partita rinviata, ingresso dal retro..."
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditDetailsMatch(null)}
              disabled={saving}
            >
              <X className="w-4 h-4 mr-2" />
              Annulla
            </Button>
            <Button onClick={handleSaveDetails} disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salva
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
