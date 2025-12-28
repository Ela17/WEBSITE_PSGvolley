"use client";

import { useState, useCallback, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Upload,
  X,
  Loader2,
  ImageIcon,
  GripVertical,
  AlertCircle,
  Plus,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface GalleryUploaderProps {
  /** Array di URL delle immagini */
  images: string[];
  /** Callback quando le immagini cambiano */
  onChange: (urls: string[]) => void;
  /** Cartella di destinazione su Supabase Storage */
  folder: string;
  /** Label del campo */
  label?: string;
  /** Numero massimo di immagini */
  maxImages?: number;
  /** Testo helper */
  helperText?: string;
}

export default function GalleryUploader({
  images = [],
  onChange,
  folder,
  label = "Galleria Immagini",
  maxImages = 50,
  helperText,
}: GalleryUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Upload multiple files
  const uploadFiles = useCallback(
    async (files: FileList) => {
      setError(null);
      setIsUploading(true);

      const newUrls: string[] = [];
      const totalFiles = Math.min(files.length, maxImages - images.length);

      for (let i = 0; i < totalFiles; i++) {
        const file = files[i];

        if (!file.type.startsWith("image/")) {
          continue;
        }

        setUploadProgress(`Caricamento ${i + 1}/${totalFiles}...`);

        try {
          const formData = new FormData();
          formData.append("file", file);
          formData.append("folder", `${folder}/gallery`);

          const res = await fetch("/api/admin/upload", {
            method: "POST",
            body: formData,
          });

          const data = await res.json();

          if (data.success) {
            newUrls.push(data.url);
          } else {
            console.error(`Errore upload ${file.name}:`, data.error);
          }
        } catch (err) {
          console.error(`Errore upload ${file.name}:`, err);
        }
      }

      if (newUrls.length > 0) {
        onChange([...images, ...newUrls]);
      }

      if (newUrls.length < totalFiles) {
        setError(`${totalFiles - newUrls.length} immagini non caricate`);
      }

      setIsUploading(false);
      setUploadProgress(null);
    },
    [folder, maxImages, onChange, images]
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
        uploadFiles(files);
      }
    },
    [uploadFiles]
  );

  const handleClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        uploadFiles(files);
      }
      // Reset input per permettere selezione stesso file
      e.target.value = "";
    },
    [uploadFiles]
  );

  // Rimuovi singola immagine
  const handleRemove = useCallback(
    (index: number) => {
      const newUrls = images.filter((_, i) => i !== index);
      onChange(newUrls);
    },
    [onChange, images]
  );

  // Rimuovi tutte le immagini
  const handleClearAll = useCallback(() => {
    onChange([]);
    setError(null);
  }, [onChange]);

  // Sposta immagine (drag and drop interno - futuro)
  const moveImage = useCallback(
    (fromIndex: number, toIndex: number) => {
      const newUrls = [...images];
      const [movedItem] = newUrls.splice(fromIndex, 1);
      newUrls.splice(toIndex, 0, movedItem);
      onChange(newUrls);
    },
    [onChange, images]
  );

  const canAddMore = images.length < maxImages;

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Label>
          {label} ({images.length}/{maxImages})
        </Label>
        {images.length > 0 && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
            onClick={handleClearAll}
          >
            <X className="w-3 h-3 mr-1" />
            Rimuovi tutte
          </Button>
        )}
      </div>

      {/* Dropzone */}
      {canAddMore && (
        <div
          onClick={handleClick}
          onDragEnter={handleDragEnter}
          onDragLeave={handleDragLeave}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          className={cn(
            "border-2 border-dashed rounded-lg cursor-pointer transition-all p-4",
            "flex flex-col items-center justify-center gap-2",
            isDragging && "border-primary bg-primary/5",
            !isDragging && "border-muted-foreground/25 hover:border-primary/50",
            isUploading && "pointer-events-none opacity-60"
          )}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            multiple
            onChange={handleFileChange}
            className="hidden"
          />

          {isUploading ? (
            <>
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
              <p className="text-sm text-muted-foreground">{uploadProgress}</p>
            </>
          ) : (
            <>
              <Plus className="w-6 h-6 text-muted-foreground" />
              <p className="text-sm text-muted-foreground text-center">
                Trascina immagini o{" "}
                <span className="text-primary font-medium">
                  clicca per selezionare
                </span>
              </p>
              <p className="text-xs text-muted-foreground">
                Puoi selezionare più file • Max 5MB ciascuno
              </p>
            </>
          )}
        </div>
      )}

      {/* Helper text */}
      {helperText && images.length === 0 && (
        <p className="text-xs text-muted-foreground">{helperText}</p>
      )}

      {/* Errore */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Griglia immagini */}
      {images.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-2">
          {images.map((url, index) => (
            <div
              key={url + index}
              className="relative group aspect-square rounded-lg overflow-hidden bg-muted border"
            >
              <Image
                src={url}
                alt={`Immagine ${index + 1}`}
                fill
                className="object-cover"
              />

              {/* Overlay con azioni */}
              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  type="button"
                  variant="destructive"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRemove(index)}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              {/* Numero immagine */}
              <div className="absolute top-1 left-1 bg-black/70 text-white text-xs px-1.5 py-0.5 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Info aggiuntive */}
      {images.length > 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Passa il mouse sulle immagini per rimuoverle singolarmente
        </p>
      )}
    </div>
  );
}
