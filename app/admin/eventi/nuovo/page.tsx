"use client";

import { useState } from "react";
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
import { ArrowLeft, Save, Loader2, Calendar, Info } from "lucide-react";
import ImageUploader from "@/components/ImageUploader";
import GalleryUploader from "@/components/GalleryUploader";

export default function NuovoEventoPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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
    images: [] as string[], // Array di URL per la galleria
    googleDriveLink: "",
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

  // Controlla se l'evento è nel passato
  const isEventPast = () => {
    if (!form.date) return false;
    const eventDate = new Date(form.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return eventDate < today;
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
          googleDriveLink: form.googleDriveLink || null,
          // Nota: images è già un array
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

  const isPast = isEventPast();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-4">
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
                  {isPast && (
                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                      <Info className="w-3 h-3" />
                      Evento nel passato - potrai aggiungere la galleria foto
                    </p>
                  )}
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

          {/* Iscrizioni (solo eventi futuri) */}
          {!isPast && (
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
                        setForm({
                          ...form,
                          registrationDeadline: e.target.value,
                        })
                      }
                    />
                  </div>

                  <div>
                    <Label htmlFor="fee">Quota partecipazione</Label>
                    <Input
                      id="fee"
                      value={form.fee}
                      onChange={(e) =>
                        setForm({ ...form, fee: e.target.value })
                      }
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
                      placeholder="URL della locandina PDF o immagine"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Contenuto */}
          <Card>
            <CardHeader>
              <CardTitle>Contenuto</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="description">Descrizione breve</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm({ ...form, description: e.target.value })
                  }
                  placeholder="Breve descrizione dell'evento..."
                  rows={3}
                />
              </div>

              <div>
                <Label htmlFor="content">Contenuto completo (HTML)</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) =>
                    setForm({ ...form, content: e.target.value })
                  }
                  placeholder="<h2>Programma</h2><ul><li>9:00 Ritrovo</li><li>10:00 Inizio partite</li></ul>"
                  rows={15}
                  className="font-mono text-sm"
                />
              </div>
            </CardContent>
          </Card>

          {/* Media */}
          <Card>
            <CardHeader>
              <CardTitle>Media</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Cover Image */}
              <ImageUploader
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder={`eventi/${form.slug || "temp"}`}
                label="Immagine di copertina"
                helperText="Immagine principale dell'evento, mostrata nell'hero e nelle card"
                allowManualUrl={true}
              />

              {/* Galleria (solo per eventi passati) */}
              {isPast && (
                <>
                  <div className="border-t pt-6">
                    <GalleryUploader
                      images={form.images}
                      onChange={(urls) => setForm({ ...form, images: urls })}
                      folder={`eventi/${form.slug || "temp"}`}
                      label="Galleria Foto (evento passato)"
                      maxImages={50}
                      helperText="Carica le foto dell'evento. Verranno mostrate in un carosello nella pagina dettaglio."
                    />
                  </div>

                  <div>
                    <Label htmlFor="googleDriveLink">
                      Link Google Drive (galleria completa)
                    </Label>
                    <Input
                      id="googleDriveLink"
                      value={form.googleDriveLink}
                      onChange={(e) =>
                        setForm({ ...form, googleDriveLink: e.target.value })
                      }
                      placeholder="https://drive.google.com/drive/folders/..."
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Opzionale - link alla cartella Drive con tutte le foto
                    </p>
                  </div>
                </>
              )}
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="tags">Tags (separati da virgola)</Label>
                <Input
                  id="tags"
                  value={form.tags}
                  onChange={(e) => setForm({ ...form, tags: e.target.value })}
                  placeholder="torneo, misto, natale"
                />
              </div>
            </CardContent>
          </Card>

          {/* Azioni */}
          <div className="flex items-center justify-end gap-4">
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
