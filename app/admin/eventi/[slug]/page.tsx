"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
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

export default function ModificaEventoPage({
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
    googleDriveLink: "",
    tags: "",
    content: "",
    images: [] as string[], // Array di URL immagini gallery
  });

  // Determina se l'evento è passato (per mostrare sezione gallery)
  const isPastEvent = form.date ? new Date(form.date) < new Date() : false;

  // Carica evento esistente
  useEffect(() => {
    const fetchEvento = async () => {
      try {
        const res = await fetch(`/api/admin/eventi/${slug}`);
        const data = await res.json();

        if (data.error) {
          setError(data.error);
        } else {
          const evento = data.evento;
          setForm({
            title: evento.title || "",
            slug: evento.slug || "",
            date: evento.date?.split("T")[0] || "",
            type: evento.type || "torneo",
            category: evento.category || "",
            location: evento.location || "",
            locationLink: evento.location_link || "",
            description: evento.description || "",
            coverImage: evento.cover_image || "",
            registrationLink: evento.registration_link || "",
            registrationDeadline:
              evento.registration_deadline?.split("T")[0] || "",
            fee: evento.fee || "",
            locandina: evento.locandina || "",
            imagesFolder: evento.images_folder || "",
            googleDriveLink: evento.google_drive_link || "",
            tags: evento.tags?.join(", ") || "",
            content: evento.content || "",
            images: evento.images || [],
          });
        }
      } catch (err) {
        setError("Errore nel caricamento dell'evento");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchEvento();
  }, [slug]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const res = await fetch(`/api/admin/eventi/${slug}`, {
        method: "PUT",
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
          images: form.images, // Invia array immagini
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-green-600" />
      </div>
    );
  }

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
              <h1 className="text-2xl font-bold">Modifica Evento</h1>
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
                  <Label>Locandina</Label>
                  <ImageUploader
                    value={form.locandina}
                    onChange={(url) => setForm({ ...form, locandina: url })}
                    folder={`eventi/${form.slug || slug}`}
                    label="Carica locandina"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Immagine della locandina (verrà mostrata nella pagina
                    evento)
                  </p>
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

          {/* Immagine Copertina */}
          <Card>
            <CardHeader>
              <CardTitle>Immagine di Copertina</CardTitle>
              <CardDescription>
                L'immagine principale che appare nell'hero dell'evento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ImageUploader
                value={form.coverImage}
                onChange={(url) => setForm({ ...form, coverImage: url })}
                folder={`eventi/${form.slug || "temp"}`}
                label="Cover Image"
                helperText="Carica un'immagine o inserisci un URL. Formati: JPG, PNG, GIF, WebP. Max 5MB."
                showPreview={true}
                allowManualUrl={true}
              />
            </CardContent>
          </Card>

          {/* Galleria Immagini - Solo per eventi passati */}
          {isPastEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Galleria Fotografica</CardTitle>
                <CardDescription>
                  Carica le foto dell'evento concluso. Queste verranno mostrate
                  nel carosello.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <GalleryUploader
                  images={form.images}
                  onChange={(urls) => setForm({ ...form, images: urls })}
                  folder={`eventi/${form.slug || "temp"}/gallery`}
                  maxImages={50}
                />

                {/* Info su imagesFolder legacy */}
                {form.imagesFolder && (
                  <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-lg text-sm">
                    <Info className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="font-medium text-blue-800">
                        Immagini legacy
                      </p>
                      <p className="text-blue-700">
                        Questo evento ha anche immagini nella cartella locale:{" "}
                        <code className="bg-blue-100 px-1 rounded">
                          {form.imagesFolder}
                        </code>
                      </p>
                      <p className="text-blue-600 mt-1">
                        Le nuove immagini caricate qui verranno mostrate insieme
                        a quelle esistenti.
                      </p>
                    </div>
                  </div>
                )}

                {/* Link Google Drive */}
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
                    Opzionale - Link alla galleria completa su Drive
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Sezione eventi futuri - imagesFolder legacy */}
          {!isPastEvent && (
            <Card>
              <CardHeader>
                <CardTitle>Media</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="imagesFolder">
                    Cartella immagini (per quando l'evento sarà passato)
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
                    Opzionale - Percorso relativo a public/images/
                  </p>
                </div>
              </CardContent>
            </Card>
          )}

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
