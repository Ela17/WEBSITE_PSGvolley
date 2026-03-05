"use client";

import { useState, useEffect } from "react";
import { Rocket } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export default function ScrollToTop() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility);
    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <>
      {isVisible && (
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              onClick={scrollToTop}
              size="icon-lg"
              className="fixed bottom-6 right-6 md:bottom-8 md:right-8 z-50 rounded-full shadow-lg bg-red-600 hover:bg-red-700 transition-all duration-300 hover:scale-110 active:scale-95"
              aria-label="Torna su"
            >
              <Rocket className="w-5 h-5 md:w-6 md:h-6 -rotate-45" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="left">Torna su</TooltipContent>
        </Tooltip>
      )}
    </>
  );
}
