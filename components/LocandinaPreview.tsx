"use client";

import { useState } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Eye, X } from "lucide-react";

interface LocandinaPreviewProps {
  src: string;
  title: string;
}

export default function LocandinaPreview({
  src,
  title,
}: LocandinaPreviewProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Anteprima cliccabile */}
      <div className="pt-2">
        <p className="text-sm font-semibold mb-2 flex items-center gap-2">
          <Eye className="w-4 h-4" />
          Locandina dell'evento
        </p>
        <button
          onClick={() => setIsOpen(true)}
          className="relative group block w-full max-w-xs rounded-lg overflow-hidden border-2 border-gray-200 hover:border-blue-500 transition-all shadow-md hover:shadow-lg"
        >
          <Image
            src={src}
            alt={`Locandina ${title}`}
            width={300}
            height={400}
            className="object-cover w-full h-auto"
          />
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center">
            <span className="opacity-0 group-hover:opacity-100 transition-opacity bg-white/90 text-gray-800 px-3 py-1 rounded-full text-sm font-medium">
              Clicca per ingrandire
            </span>
          </div>
        </button>
      </div>

      {/* Modal fullscreen */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] p-0 overflow-hidden bg-black/95">
          <div className="relative flex items-center justify-center min-h-[50vh]">
            <Button
              variant="ghost"
              size="icon"
              className="absolute top-2 right-2 z-10 bg-white/20 hover:bg-white/40 text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5" />
            </Button>
            <Image
              src={src}
              alt={`Locandina ${title}`}
              width={800}
              height={1100}
              className="object-contain w-auto h-auto max-h-[85vh] max-w-full"
            />
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
