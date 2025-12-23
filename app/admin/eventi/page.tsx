"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  ArrowLeft,
  Plus,
  Pencil,
  Trash2,
  Loader2,
  Calendar,
  Eye,
  Trophy,
  Users,
  PartyPopper,
} from "lucide-react";

interface Evento {
  id: number;
  slug: string;
  title: string;
  date: string;
  location: string | null;
  type: string;
  category: string | null;
}

const typeConfig: Record<
  string,
  { label: string; color: string; icon: React.ElementType }
> = {
  torneo: { label: "Torneo", color: "bg-yellow-500", icon: Trophy },
  amichevole: { label: "Amichevole", color: "bg-blue-500", icon: Users },
  "evento-sociale": {
    label: "Evento Sociale",
    color: "bg-purple-500",
    icon: PartyPopper,
  },
  altro: { label: "Altro", color: "bg-gray-500", icon: Calendar },
};

export default function AdminEventiPage() {
  const [eventi, setEventi] = useState<Evento[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Carica eventi
  const fetchEventi = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/admin/eventi");
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setEventi(data.eventi || []);
      }
    } catch (err) {
      setError("Errore nel caricamento degli eventi");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEventi();
  }, []);

  // Elimina evento
  const handleDelete = async () => {
    if (!deleteSlug) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/admin/eventi/${deleteSlug}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setEventi(eventi.filter((e) => e.slug !== deleteSlug));
        setDeleteSlug(null);
      } else {
        setError(data.error || "Errore durante l'eliminazione");
      }
    } catch (err) {
      setError("Errore durante l'eliminazione");
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  // Formatta data
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("it-IT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  // Determina se evento è passato
  const isPast = (dateStr: string) => {
    return new Date(dateStr) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Admin
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-bold">Gestione Eventi</h1>
              </div>
            </div>
            <Link href="/admin/eventi/nuovo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Evento
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Contenuto */}
      <div className="container mx-auto px-4 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">{error}</p>
          </div>
        )}

        <Card>
          <CardHeader>
            <CardTitle>Eventi ({eventi.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-green-600" />
              </div>
            ) : eventi.length === 0 ? (
              <div className="text-center py-12">
                <Calendar className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nessun evento creato</p>
                <Link href="/admin/eventi/nuovo">
                  <Button className="mt-4">Crea il primo evento</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Tipo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Luogo</TableHead>
                    <TableHead>Stato</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {eventi.map((evento) => {
                    const config = typeConfig[evento.type] || typeConfig.altro;
                    const Icon = config.icon;
                    const past = isPast(evento.date);

                    return (
                      <TableRow key={evento.id}>
                        <TableCell>
                          <div className="max-w-xs">
                            <p className="font-medium truncate">
                              {evento.title}
                            </p>
                            <p className="text-xs text-muted-foreground truncate">
                              /{evento.slug}
                            </p>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge className={`${config.color} text-white`}>
                            <Icon className="w-3 h-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(evento.date)}</TableCell>
                        <TableCell>
                          <span className="text-sm text-muted-foreground truncate block max-w-[150px]">
                            {evento.location || "-"}
                          </span>
                        </TableCell>
                        <TableCell>
                          <Badge variant={past ? "secondary" : "default"}>
                            {past ? "Passato" : "Futuro"}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link
                              href={`/eventi/${evento.slug}`}
                              target="_blank"
                            >
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Visualizza"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Link href={`/admin/eventi/${evento.slug}`}>
                              <Button
                                variant="ghost"
                                size="sm"
                                title="Modifica"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button
                              variant="ghost"
                              size="sm"
                              title="Elimina"
                              onClick={() => setDeleteSlug(evento.slug)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Dialog conferma eliminazione */}
      <AlertDialog open={!!deleteSlug} onOpenChange={() => setDeleteSlug(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Conferma eliminazione</AlertDialogTitle>
            <AlertDialogDescription>
              Sei sicuro di voler eliminare questo evento? Questa azione non può
              essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Eliminazione...
                </>
              ) : (
                "Elimina"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
