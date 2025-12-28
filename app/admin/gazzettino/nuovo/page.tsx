"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Save, Loader2, FileText } from "lucide-react";
import WysiwygEditor from "@/components/WysiwygEditor";
import ImageUploader from "@/components/ImageUploader";

export default function NuovoArticoloPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: new Date().toISOString().split("T")[0],
    week: "",
    season: "2025-26",
    category: "",
    author: "",
    excerpt: "",
    coverImage: "",
    tags: "",
    content: "",
  });

  // Auto-genera slug dal titolo
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[àáâãäå]/g, "a")
      .replace(/[èéêë]/g, "e")
      .replace(/[ìíîï]/g, "i")
      .replace(/[òóôõö]/g, "o")
      .replace(/[ùúûü]/g, "u")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "");
  };

  const handleTitleChange = (title: string) => {
    setForm({
      ...form,
      title,
      slug: generateSlug(title),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch("/api/admin/gazzettino", {
        method: "POST",
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
        router.push("/admin/gazzettino");
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
              <h1 className="text-2xl font-bold">Nuovo Articolo</h1>
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
                    onChange={(e) => handleTitleChange(e.target.value)}
                    placeholder="Es: Vittoria in rimonta per il PSG"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="vittoria-in-rimonta-per-il-psg"
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

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Es: Cronaca Partita"
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
                <Label>Contenuto</Label>
                <WysiwygEditor
                  content={form.content}
                  onChange={(html) => setForm({ ...form, content: html })}
                  placeholder="Scrivi il contenuto dell'articolo..."
                  minHeight="400px"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media e Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Media e Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Cover Image con Upload */}
              <ImageUploader
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder={`gazzettino/${form.slug || "temp"}`}
                label="Immagine di copertina"
                placeholder="/images/gazzettino/.../cover.jpg"
                helperText="Carica un'immagine o inserisci un URL. L'immagine verrà salvata su cloud."
                allowManualUrl={true}
              />

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
                  Pubblica Articolo
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
