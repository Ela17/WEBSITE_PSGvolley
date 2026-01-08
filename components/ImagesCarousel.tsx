"use client";

import { useState, useCallback, useEffect } from "react";
import Image from "next/image";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

interface ImageCarouselProps {
  images: string[];
  eventTitle: string;
}

export default function ImageCarousel({
  images,
  eventTitle,
}: ImageCarouselProps) {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [fullscreenApi, setFullscreenApi] = useState<CarouselApi>();

  // Sync main carousel index
  useEffect(() => {
    if (!mainApi) return;

    const onSelect = () => {
      setCurrentIndex(mainApi.selectedScrollSnap());
    };

    mainApi.on("select", onSelect);
    onSelect(); // Set initial

    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi]);

  // Sync fullscreen carousel index
  useEffect(() => {
    if (!fullscreenApi) return;

    const onSelect = () => {
      setCurrentIndex(fullscreenApi.selectedScrollSnap());
    };

    fullscreenApi.on("select", onSelect);

    return () => {
      fullscreenApi.off("select", onSelect);
    };
  }, [fullscreenApi]);

  // Scroll to index when opening fullscreen
  useEffect(() => {
    if (isFullscreen && fullscreenApi) {
      fullscreenApi.scrollTo(currentIndex, true);
    }
  }, [isFullscreen, fullscreenApi, currentIndex]);

  // Click thumbnail
  const handleThumbnailClick = useCallback(
    (index: number) => {
      setCurrentIndex(index);
      mainApi?.scrollTo(index);
    },
    [mainApi]
  );

  // Open fullscreen at current index
  const openFullscreen = useCallback(() => {
    setIsFullscreen(true);
  }, []);

  if (images.length === 0) return null;

  return (
    <>
      <Card className="overflow-hidden border-0 shadow-lg">
        {/* Carousel principale */}
        <div className="relative bg-gray-100">
          <Carousel
            className="w-full"
            opts={{ loop: true }}
            setApi={setMainApi}
          >
            <CarouselContent>
              {images.map((image, index) => (
                <CarouselItem key={index}>
                  <div
                    className="relative w-full bg-gray-200"
                    style={{ aspectRatio: "16/9" }}
                  >
                    <Image
                      src={image}
                      alt={`${eventTitle} - Foto ${index + 1}`}
                      fill
                      className="object-contain cursor-pointer hover:opacity-95 transition-opacity"
                      onClick={openFullscreen}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            {images.length > 1 && (
              <>
                <CarouselPrevious className="left-2" />
                <CarouselNext className="right-2" />
              </>
            )}
          </Carousel>
        </div>

        {/* Thumbnails */}
        {images.length > 1 && (
          <div className="p-4 bg-gray-50">
            <div className="flex gap-2 overflow-x-auto pb-2">
              {images.map((image, index) => (
                <button
                  key={index}
                  onClick={() => handleThumbnailClick(index)}
                  className={`relative flex-shrink-0 w-16 h-16 rounded-md overflow-hidden border-2 transition-all ${
                    currentIndex === index
                      ? "border-blue-500 ring-2 ring-blue-300"
                      : "border-transparent hover:border-gray-300"
                  }`}
                >
                  <Image
                    src={image}
                    alt={`Thumbnail ${index + 1}`}
                    fill
                    className="object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        )}
      </Card>

      {/* Modal fullscreen */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/95 z-50 flex items-center justify-center"
          onClick={() => setIsFullscreen(false)}
        >
          {/* Bottone chiudi */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
            onClick={(e) => {
              e.stopPropagation();
              setIsFullscreen(false);
            }}
          >
            <X className="size-6" />
          </Button>

          {/* Carousel fullscreen */}
          <div
            className="w-full h-full flex items-center justify-center p-4"
            onClick={(e) => e.stopPropagation()}
          >
            <Carousel
              className="w-full max-w-7xl"
              opts={{ loop: true, startIndex: currentIndex }}
              setApi={setFullscreenApi}
            >
              <CarouselContent>
                {images.map((image, index) => (
                  <CarouselItem key={index}>
                    <div className="relative w-full h-[80vh]">
                      <Image
                        src={image}
                        alt={`${eventTitle} - Foto ${index + 1}`}
                        fill
                        className="object-contain"
                      />
                    </div>
                  </CarouselItem>
                ))}
              </CarouselContent>
              {images.length > 1 && (
                <>
                  <CarouselPrevious className="left-4 bg-white/20 hover:bg-white/30 text-white border-0" />
                  <CarouselNext className="right-4 bg-white/20 hover:bg-white/30 text-white border-0" />
                </>
              )}
            </Carousel>
          </div>

          {/* Contatore */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/70 text-white px-4 py-2 rounded-full pointer-events-none">
            {currentIndex + 1} / {images.length}
          </div>
        </div>
      )}
    </>
  );
}