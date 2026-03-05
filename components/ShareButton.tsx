"use client";

import { useState } from "react";
import { Share2, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ShareButton() {
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    const url = window.location.href;
    const title = document.title;

    if (navigator.share) {
      try {
        await navigator.share({ title, url });
      } catch {
        // utente ha annullato o errore
      }
    } else {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          onClick={handleShare}
          size="icon-lg"
          className="fixed bottom-6 left-6 md:bottom-8 md:left-8 z-50 rounded-full shadow-lg bg-blue-600 hover:bg-blue-700 transition-all duration-300 hover:scale-110 active:scale-95"
          aria-label="Condividi pagina"
        >
          {copied ? (
            <Check className="w-5 h-5 md:w-6 md:h-6" />
          ) : (
            <Share2 className="w-5 h-5 md:w-6 md:h-6" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent side="right">
        {copied ? "Link copiato!" : "Condividi pagina"}
      </TooltipContent>
    </Tooltip>
  );
}
