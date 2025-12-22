"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import {
  ArrowLeft,
  Trophy,
  Loader2,
  Pencil,
  Save,
  X,
  CheckCircle,
  Clock,
} from "lucide-react";

interface Match {
  id: number;
  n_gara: string;
  data: string;
  ora: string;
  squadra_a: string;
  squadra_b: string;
  palestra: string;
  note: string;
  categoria: string;
  set_a: number | null;
  set_b: number | null;
  punteggi_set: Array<{ pts_a: number; pts_b: number }> | null;
}

export default function AdminCampionatoPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editMatch, setEditMatch] = useState<Match | null>(null);
  const [saving, setSaving] = useState(false);

  // Form risultato
  const [resultForm, setResultForm] = useState({
    set_a: "",
    set_b: "",
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

  // Carica partite
  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/campionato");
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
      set_a: match.set_a?.toString() || "",
      set_b: match.set_b?.toString() || "",
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

      const res = await fetch(`/api/campionato/${editMatch.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          set_a: resultForm.set_a ? parseInt(resultForm.set_a) : null,
          set_b: resultForm.set_b ? parseInt(resultForm.set_b) : null,
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
                  set_a: data.match.set_a,
                  set_b: data.match.set_b,
                  punteggi_set: data.match.punteggi_set,
                }
              : m
          )
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
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("it-IT", {
      weekday: "short",
      day: "2-digit",
      month: "2-digit",
    });
  };

  // Filtra partite per categoria
  const masterMatches = matches.filter((m) => m.categoria === "master");
  const openMatches = matches.filter((m) => m.categoria === "open");

  // Componente tabella partite
  const MatchesTable = ({
    matches,
    categoria,
  }: {
    matches: Match[];
    categoria: string;
  }) => {
    const played = matches.filter((m) => m.set_a !== null);
    const upcoming = matches.filter((m) => m.set_a === null);

    return (
      <div className="space-y-6">
        {/* Partite da giocare */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <Clock className="w-5 h-5 text-orange-500" />
            Da giocare ({upcoming.length})
          </h3>
          {upcoming.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nessuna partita in programma
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">N°</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Squadra A</TableHead>
                  <TableHead className="text-center">vs</TableHead>
                  <TableHead>Squadra B</TableHead>
                  <TableHead>Ora</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcoming.slice(0, 15).map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-mono text-sm">
                      {match.n_gara}
                    </TableCell>
                    <TableCell>{formatDate(match.data)}</TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_a.replace("ASD ", "")}
                    </TableCell>
                    <TableCell className="text-center text-muted-foreground">
                      vs
                    </TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_b.replace("ASD ", "")}
                    </TableCell>
                    <TableCell>{match.ora || "-"}</TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(match)}
                        title="Inserisci risultato"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>

        {/* Partite giocate */}
        <div>
          <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-green-500" />
            Giocate ({played.length})
          </h3>
          {played.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              Nessuna partita giocata
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-20">N°</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Squadra A</TableHead>
                  <TableHead className="text-center">Risultato</TableHead>
                  <TableHead>Squadra B</TableHead>
                  <TableHead className="text-right">Azioni</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {played.map((match) => (
                  <TableRow key={match.id}>
                    <TableCell className="font-mono text-sm">
                      {match.n_gara}
                    </TableCell>
                    <TableCell>{formatDate(match.data)}</TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_a.replace("ASD ", "")}
                    </TableCell>
                    <TableCell className="text-center">
                      <span className="font-bold text-lg">
                        {match.set_a} - {match.set_b}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {match.squadra_b.replace("ASD ", "")}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => openEditDialog(match)}
                        title="Modifica risultato"
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
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
            <CardTitle>Partite Campionato</CardTitle>
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
                    MASTER 4+2 ({masterMatches.length})
                  </TabsTrigger>
                  <TabsTrigger value="open">
                    OPEN 3×3 ({openMatches.length})
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="master">
                  <MatchesTable matches={masterMatches} categoria="master" />
                </TabsContent>

                <TabsContent value="open">
                  <MatchesTable matches={openMatches} categoria="open" />
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
              {editMatch?.set_a !== null ? "Modifica" : "Inserisci"} Risultato
            </DialogTitle>
          </DialogHeader>

          {editMatch && (
            <div className="space-y-4">
              {/* Info partita */}
              <div className="bg-muted/50 rounded-lg p-3 text-center">
                <p className="text-sm text-muted-foreground mb-1">
                  {formatDate(editMatch.data)} - {editMatch.ora || "Ora TBD"}
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
                    value={resultForm.set_a}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, set_a: e.target.value })
                    }
                    className="text-center text-xl font-bold"
                    placeholder="0"
                  />
                  <span className="text-xl font-light">-</span>
                  <Input
                    type="number"
                    min="0"
                    max="3"
                    value={resultForm.set_b}
                    onChange={(e) =>
                      setResultForm({ ...resultForm, set_b: e.target.value })
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
    </div>
  );
}
