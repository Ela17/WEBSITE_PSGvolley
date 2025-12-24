"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ArrowLeft, Save, Loader2, Calendar, Eye, EyeOff } from "lucide-react";

// Import dinamico per evitare SSR issues con Tiptap
const WysiwygEditor = dynamic(() => import("@/components/WysiwygEditor"), {
  ssr: false,
  loading: () => (
    <div className="border rounded-lg p-4 min-h-[300px] bg-muted/20 animate-pulse flex items-center justify-center">
      <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
    </div>
  ),
});

export default function NuovoEventoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [showPreview, setShowPreview] = useState(false);

  const [form, setForm] = useState({
    title: "",
    slug: "",
    date: new Date().toISOString().split("T")[0],
    type: "torneo",
    category: "",
    location: "",
    locationLink: "",
    description: "",
    coverImage: "",
    registrationLink: "",
    registrationDeadline: "",
    fee: "",
    locandina: "",
    imagesFolder: "",
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
      const res = await fetch("/api/admin/eventi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          tags: form.tags
            ? form.tags
                .split(",")
                .map((t) => t.trim())
                .filter(Boolean)
            : [],
          registrationDeadline: form.registrationDeadline || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        router.push("/admin/eventi");
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
      <div className="bg-white border-b sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/eventi">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Indietro
                </Button>
              </Link>
              <div className="flex items-center gap-2">
                <Calendar className="w-6 h-6 text-green-600" />
                <h1 className="text-2xl font-bold">Nuovo Evento</h1>
              </div>
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setShowPreview(!showPreview)}
            >
              {showPreview ? (
                <>
                  <EyeOff className="w-4 h-4 mr-2" />
                  Nascondi anteprima
                </>
              ) : (
                <>
                  <Eye className="w-4 h-4 mr-2" />
                  Mostra anteprima
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Form */}
      <div className="container mx-auto px-4 py-8">
        <form onSubmit={handleSubmit} className="max-w-6xl mx-auto space-y-6">
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
                    placeholder="Es: Torneo di Natale 2025"
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="slug">Slug (URL) *</Label>
                  <Input
                    id="slug"
                    value={form.slug}
                    onChange={(e) => setForm({ ...form, slug: e.target.value })}
                    placeholder="torneo-natale-2025"
                    required
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    URL: /eventi/{form.slug || "..."}
                  </p>
                </div>

                <div>
                  <Label htmlFor="date">Data evento *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={form.date}
                    onChange={(e) => setForm({ ...form, date: e.target.value })}
                    required
                  />
                </div>

                <div>
                  <Label htmlFor="type">Tipo evento *</Label>
                  <Select
                    value={form.type}
                    onValueChange={(value) => setForm({ ...form, type: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="torneo">Torneo</SelectItem>
                      <SelectItem value="amichevole">Amichevole</SelectItem>
                      <SelectItem value="evento-sociale">
                        Evento Sociale
                      </SelectItem>
                      <SelectItem value="altro">Altro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="category">Categoria</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm({ ...form, category: e.target.value })
                    }
                    placeholder="Es: Misto, Master, Open"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Luogo */}
          <Card>
            <CardHeader>
              <CardTitle>Luogo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="location">Indirizzo</Label>
                  <Input
                    id="location"
                    value={form.location}
                    onChange={(e) =>
                      setForm({ ...form, location: e.target.value })
                    }
                    placeholder="Es: Via Baiardi 4, Torino"
                  />
                </div>

                <div>
                  <Label htmlFor="locationLink">Link Google Maps</Label>
                  <Input
                    id="locationLink"
                    value={form.locationLink}
                    onChange={(e) =>
                      setForm({ ...form, locationLink: e.target.value })
                    }
                    placeholder="https://www.google.com/maps/place/..."
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Iscrizioni */}
          <Card>
            <CardHeader>
              <CardTitle>Iscrizioni</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="registrationLink">Link iscrizioni</Label>
                  <Input
                    id="registrationLink"
                    value={form.registrationLink}
                    onChange={(e) =>
                      setForm({ ...form, registrationLink: e.target.value })
                    }
                    placeholder="https://forms.google.com/..."
                  />
                </div>

                <div>
                  <Label htmlFor="registrationDeadline">
                    Scadenza iscrizioni
                  </Label>
                  <Input
                    id="registrationDeadline"
                    type="date"
                    value={form.registrationDeadline}
                    onChange={(e) =>
                      setForm({ ...form, registrationDeadline: e.target.value })
                    }
                  />
                </div>

                <div>
                  <Label htmlFor="fee">Quota partecipazione</Label>
                  <Input
                    id="fee"
                    value={form.fee}
                    onChange={(e) => setForm({ ...form, fee: e.target.value })}
                    placeholder="Es: 10€ a persona"
                  />
                </div>

                <div>
                  <Label htmlFor="locandina">Locandina (URL)</Label>
                  <Input
                    id="locandina"
                    value={form.locandina}
                    onChange={(e) =>
                      setForm({ ...form, locandina: e.target.value })
                    }
                    placeholder="/locandine/eventi/torneo-2025/locandina.pdf"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Descrizione breve */}
          <Card>
            <CardHeader>
              <CardTitle>Descrizione Breve</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="description">
                  Descrizione (mostrata nelle card)
                </Label>
                <Input
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Breve descrizione dell'evento..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Contenuto con Editor WYSIWYG */}
          <Card>
            <CardHeader>
              <CardTitle>Contenuto Completo</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <WysiwygEditor
                  content={form.content}
                  onChange={(content) => setForm({ ...form, content })}
                  placeholder="Scrivi qui il programma, le regole, i dettagli dell'evento..."
                />
              </div>
            </CardContent>
          </Card>

          {/* Anteprima contenuto */}
          {showPreview && form.content && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5" />
                  Anteprima Contenuto
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div
                  className="prose prose-lg max-w-none"
                  dangerouslySetInnerHTML={{ __html: form.content }}
                />
              </CardContent>
            </Card>
          )}

          {/* Media e Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Media e Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="coverImage">
                    Immagine di copertina (URL)
                  </Label>
                  <Input
                    id="coverImage"
                    value={form.coverImage}
                    onChange={(e) =>
                      setForm({ ...form, coverImage: e.target.value })
                    }
                    placeholder="/images/eventi/torneo-2025/cover.jpg"
                  />
                </div>

                <div>
                  <Label htmlFor="imagesFolder">
                    Cartella immagini (per eventi passati)
                  </Label>
                  <Input
                    id="imagesFolder"
                    value={form.imagesFolder}
                    onChange={(e) =>
                      setForm({ ...form, imagesFolder: e.target.value })
                    }
                    placeholder="eventi/torneo-2025"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Percorso relativo a public/images/
                  </p>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="tags">Tags (separati da virgola)</Label>
                  <Input
                    id="tags"
                    value={form.tags}
                    onChange={(e) => setForm({ ...form, tags: e.target.value })}
                    placeholder="torneo, misto, natale"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <div className="flex items-center justify-end gap-4 sticky bottom-4 bg-white/80 backdrop-blur-sm p-4 rounded-lg border shadow-lg">
            <Link href="/admin/eventi">
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
                  Crea Evento
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
