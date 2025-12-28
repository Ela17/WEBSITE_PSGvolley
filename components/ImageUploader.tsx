"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  Link as LinkIcon,
  AlertCircle,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ImageUploaderProps {
  /** URL attuale dell'immagine (può essere path locale o URL Supabase) */
  value: string;
  /** Callback quando l'immagine cambia */
  onChange: (url: string) => void;
  /** Cartella di destinazione su Supabase Storage (es: "gazzettino/mio-articolo") */
  folder?: string;
  /** Label del campo */
  label?: string;
  /** Placeholder per input URL manuale */
  placeholder?: string;
  /** Mostra anteprima dell'immagine */
  showPreview?: boolean;
  /** Altezza minima dell'area drop */
  dropzoneHeight?: string;
  /** Permetti anche inserimento URL manuale */
  allowManualUrl?: boolean;
  /** Testo helper */
  helperText?: string;
}

export default function ImageUploader({
  value,
  onChange,
  folder = "general",
  label = "Immagine",
  placeholder = "Incolla URL o trascina un file...",
  showPreview = true,
  dropzoneHeight = "150px",
  allowManualUrl = true,
  helperText,
}: ImageUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<"upload" | "url">("upload");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Handler upload file
  const uploadFile = useCallback(
    async (file: File) => {
      setError(null);
      setIsUploading(true);

      try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("folder", folder);

        const res = await fetch("/api/admin/upload", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();

        if (data.success) {
          onChange(data.url);
        } else {
          setError(data.error || "Errore durante l'upload");
        }
      } catch (err) {
        console.error("Upload error:", err);
        setError("Errore di connessione durante l'upload");
      } finally {
        setIsUploading(false);
      }
    },
    [folder, onChange]
  );

  // Drag handlers
  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragging(false);

      const files = e.dataTransfer.files;
      if (files && files.length > 0) {
        const file = files[0];
        if (file.type.startsWith("image/")) {
          uploadFile(file);
        } else {
          setError("Il file deve essere un'immagine");
        }
      }
    },
    [uploadFile]
  );

  // Click to select file
  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadFile(files[0]);
      }
    },
    [uploadFile]
  );

  // Clear image
  const handleClear = useCallback(() => {
    onChange("");
    setError(null);
  }, [onChange]);

  return (
    <div className="space-y-2">
      {/* Label e toggle mode */}
      <div className="flex items-center justify-between">
        <Label>{label}</Label>
        {allowManualUrl && (
          <div className="flex gap-1">
            <Button
              type="button"
              variant={mode === "upload" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setMode("upload")}
            >
              <Upload className="w-3 h-3 mr-1" />
              Upload
            </Button>
            <Button
              type="button"
              variant={mode === "url" ? "default" : "ghost"}
              size="sm"
              className="h-7 text-xs"
              onClick={() => setMode("url")}
            >
              <LinkIcon className="w-3 h-3 mr-1" />
              URL
            </Button>
          </div>
        )}
      </div>

      {/* Modalità URL manuale */}
      {mode === "url" && (
        <div className="space-y-2">
          <Input
            type="text"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
          />
          {helperText && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </div>
      )}

      {/* Modalità Upload */}
      {mode === "upload" && (
        <>
          {/* Dropzone */}
          <div
            onClick={handleClick}
            onDragEnter={handleDragEnter}
            onDragLeave={handleDragLeave}
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className={cn(
              "relative border-2 border-dashed rounded-lg cursor-pointer transition-all",
              "flex flex-col items-center justify-center gap-2",
              isDragging && "border-primary bg-primary/5",
              !isDragging && "border-muted-foreground/25 hover:border-primary/50",
              isUploading && "pointer-events-none opacity-60"
            )}
            style={{ minHeight: dropzoneHeight }}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              onChange={handleFileChange}
              className="hidden"
            />

            {isUploading ? (
              <>
                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                <p className="text-sm text-muted-foreground">Caricamento...</p>
              </>
            ) : (
              <>
                <Upload className="w-8 h-8 text-muted-foreground" />
                <p className="text-sm text-muted-foreground text-center px-4">
                  Trascina un'immagine qui o{" "}
                  <span className="text-primary font-medium">clicca per selezionare</span>
                </p>
                <p className="text-xs text-muted-foreground">
                  JPG, PNG, GIF, WebP • Max 5MB
                </p>
              </>
            )}
          </div>

          {/* Helper text */}
          {helperText && !value && (
            <p className="text-xs text-muted-foreground">{helperText}</p>
          )}
        </>
      )}

      {/* Errore */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Anteprima immagine */}
      {showPreview && value && (
        <div className="relative group">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-muted border">
            <Image
              src={value}
              alt="Anteprima"
              fill
              className="object-contain"
              onError={() => setError("Impossibile caricare l'immagine")}
            />
          </div>

          {/* Overlay con azioni */}
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 rounded-lg">
            <Button
              type="button"
              variant="secondary"
              size="sm"
              onClick={handleClear}
            >
              <X className="w-4 h-4 mr-1" />
              Rimuovi
            </Button>
          </div>

          {/* URL troncato */}
          <p className="text-xs text-muted-foreground mt-1 truncate" title={value}>
            {value.length > 60 ? `...${value.slice(-60)}` : value}
          </p>
        </div>
      )}

      {/* Mostra URL se c'è valore ma preview è disabilitata */}
      {!showPreview && value && (
        <div className="flex items-center gap-2 p-2 bg-muted rounded text-sm">
          <ImageIcon className="w-4 h-4 text-muted-foreground" />
          <span className="truncate flex-1">{value}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleClear}
            className="h-6 w-6 p-0"
          >
            <X className="w-4 h-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
