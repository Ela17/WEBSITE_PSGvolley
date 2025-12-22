"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
  FileText,
  Eye,
} from "lucide-react";

interface Article {
  id: number;
  slug: string;
  title: string;
  date: string;
  week: number | null;
  season: string | null;
  squadra: string;
  author: string | null;
  excerpt: string | null;
}

export default function AdminGazzettinoPage() {
  const router = useRouter();
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deleteSlug, setDeleteSlug] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);

  // Carica articoli
  const fetchArticles = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gazzettino");
      const data = await res.json();

      if (data.error) {
        setError(data.error);
      } else {
        setArticles(data.articles || []);
      }
    } catch (err) {
      setError("Errore nel caricamento degli articoli");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArticles();
  }, []);

  // Elimina articolo
  const handleDelete = async () => {
    if (!deleteSlug) return;

    setDeleting(true);
    try {
      const res = await fetch(`/api/gazzettino/${deleteSlug}`, {
        method: "DELETE",
      });
      const data = await res.json();

      if (data.success) {
        setArticles(articles.filter((a) => a.slug !== deleteSlug));
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
                <FileText className="w-6 h-6 text-blue-600" />
                <h1 className="text-2xl font-bold">Gestione Gazzettino</h1>
              </div>
            </div>
            <Link href="/admin/gazzettino/nuovo">
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Nuovo Articolo
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
            <CardTitle>Articoli ({articles.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            ) : articles.length === 0 ? (
              <div className="text-center py-12">
                <FileText className="w-12 h-12 mx-auto text-gray-300 mb-4" />
                <p className="text-gray-500">Nessun articolo pubblicato</p>
                <Link href="/admin/gazzettino/nuovo">
                  <Button className="mt-4">Crea il primo articolo</Button>
                </Link>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Titolo</TableHead>
                    <TableHead>Squadra</TableHead>
                    <TableHead>Giornata</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Autore</TableHead>
                    <TableHead className="text-right">Azioni</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {articles.map((article) => (
                    <TableRow key={article.id}>
                      <TableCell>
                        <div className="max-w-xs">
                          <p className="font-medium truncate">
                            {article.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            /{article.slug}
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge
                          variant={
                            article.squadra === "MASTER 4+2" ? "master" : "open"
                          }
                        >
                          {article.squadra === "MASTER 4+2" ? "Master" : "Open"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {article.week ? `G${article.week}` : "-"}
                      </TableCell>
                      <TableCell>{formatDate(article.date)}</TableCell>
                      <TableCell>
                        <span className="text-sm text-muted-foreground">
                          {article.author || "-"}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/gazzettino/${article.slug}`}
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
                          <Link href={`/admin/gazzettino/${article.slug}`}>
                            <Button variant="ghost" size="sm" title="Modifica">
                              <Pencil className="w-4 h-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Elimina"
                            onClick={() => setDeleteSlug(article.slug)}
                            className="text-red-600 hover:text-red-700 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
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
              Sei sicuro di voler eliminare questo articolo? Questa azione non
              può essere annullata.
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
