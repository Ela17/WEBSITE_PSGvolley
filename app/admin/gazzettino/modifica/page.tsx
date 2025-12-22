"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react";
import { use } from "react";

export default function ModificaArticoloPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: "",
    week: "",
    season: "",
    squadra: "MASTER 4+2",
    category: "",
    author: "",
    excerpt: "",
    coverImage: "",
    tags: "",
    content: "",
  });

  // Carica articolo esistente
  useEffect(() => {
    const fetchArticle = async () => {
      try {
        const res = await fetch(`/api/gazzettino/${slug}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          const article = data.article;
          setForm({
            title: article.title || "",
            slug: article.slug || "",
            date: article.date?.split("T")[0] || "",
            week: article.week?.toString() || "",
            season: article.season || "",
            squadra: article.squadra || "MASTER 4+2",
            category: article.category || "",
            author: article.author || "",
            excerpt: article.excerpt || "",
            coverImage: article.cover_image || "",
            tags: article.tags?.join(", ") || "",
            content: article.content || "",
          });
        }
      } catch (err) {
        setError("Errore nel caricamento dell'articolo");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchArticle();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/gazzettino/${slug}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          week: form.week ? parseInt(form.week) : null,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Se lo slug è cambiato, redirect al nuovo slug
        if (form.slug !== slug) {
          router.push(`/admin/gazzettino/${form.slug}`);
        } else {
          router.push("/admin/gazzettino");
        }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Link href="/admin/gazzettino">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Indietro
              </Button>
            </Link>
            <div className="flex items-center gap-2">
              <FileText className="w-6 h-6 text-blue-600" />
              <h1 className="text-2xl font-bold">Modifica Articolo</h1>
            </div>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <p className="text-red-800">{error}</p>
            </div>
          )}

          {/* Info base */}
          <Card>
            <CardHeader>
              <CardTitle>Informazioni Base</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <Label htmlFor="title">Titolo *</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) =>
                      setForm({ ...form, title: e.target.value })
                    }
                    placeholder="Es: La 4+2 trionfa nel derby cittadino"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="la-4-2-trionfa-nel-derby"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /gazzettino/{form.slug || "..."}
                  </p>
                </div>

                <div>
                  <Label htmlFor="date">Data pubblicazione *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="squadra">Squadra *</Label>
                  <Select
                    value={form.squadra}
                    onValueChange={(value) =>
                      setForm({ ...form, squadra: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MASTER 4+2">MASTER 4+2</SelectItem>
                      <SelectItem value="OPEN 3×3">OPEN 3×3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="week">Giornata</Label>
                  <Input
                    id="week"
                    type="number"
                    min="1"
                    max="30"
                    value={form.week}
                    onChange={(e) => setForm({ ...form, week: e.target.value })}
                    placeholder="Es: 5"
                  />
                </div>

                <div>
                  <Label htmlFor="season">Stagione</Label>
                  <Input
                    id="season"
                    value={form.season}
                    onChange={(e) =>
                      setForm({ ...form, season: e.target.value })
                    }
                    placeholder="Es: 2025-26"
                  />
                </div>

                <div>
                  <Label htmlFor="author">Autore</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) =>
                      setForm({ ...form, author: e.target.value })
                    }
                    placeholder="Es: Redazione PSG"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Contenuto */}
          <Card>
            <CardHeader>
              <CardTitle>Contenuto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="excerpt">Anteprima / Riassunto</Label>
                <Textarea
                  id="excerpt"
                  value={form.excerpt}
                  onChange={(e) =>
                    setForm({ ...form, excerpt: e.target.value })
                  }
                  placeholder="Breve descrizione dell'articolo..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Contenuto (Markdown)</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="## Titolo sezione&#10;&#10;Testo dell'articolo...&#10;&#10;### Sottosezione&#10;&#10;Altro testo..."
                  rows={20}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Supporta Markdown: ## titoli, **grassetto**, *corsivo*, -
                  liste
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Media e Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Media e Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="coverImage">Immagine di copertina (URL)</Label>
                <Input
                  id="coverImage"
                  value={form.coverImage}
                  onChange={(e) =>
                    setForm({ ...form, coverImage: e.target.value })
                  }
                  placeholder="/images/gazzettino/master/giornata-5/cover.jpg"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Percorso relativo alla cartella public/
                </p>
              </div>

              <div>
                <Label htmlFor="category">Categoria</Label>
                <Input
                  id="category"
                  value={form.category}
                  onChange={(e) =>
                    setForm({ ...form, category: e.target.value })
                  }
                  placeholder="Es: Campionato Master"
                />
              </div>

              <div>
                <Label htmlFor="tags">Tags (separati da virgola)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="vittoria, derby, rimonta"
                />
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <div className="flex items-center justify-end gap-4">
            <Link href="/admin/gazzettino">
              <Button variant="outline" type="button">
                Annulla
              </Button>
            </Link>
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Salvataggio...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  Salva Modifiche
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
