import { useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface NavigableCarouselProps {
  images: string[];
  alt: string;
  className?: string;
}

export function NavigableCarousel({ 
  images, 
  alt, 
  className = ""
}: NavigableCarouselProps) {
  const options: EmblaOptionsType = {
    loop: true,
    duration: 20,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const scrollPrev = useCallback(() => {
    if (emblaApi) emblaApi.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  // If only one image, don't show navigation
  if (images.length === 1) {
    return (
      <img
        src={images[0]}
        alt={alt}
        className={className}
      />
    );
  }

  return (
    <div className="relative">
      <div className="overflow-hidden" ref={emblaRef}>
        <div className="flex">
          {images.map((image, index) => (
            <div
              key={index}
              className="flex-[0_0_100%] min-w-0"
            >
              <img
                src={image}
                alt={`${alt} - ${index + 1}`}
                className={className}
              />
            </div>
          ))}
        </div>
      </div>
      
      {/* Navigation buttons */}
      <Button
        variant="outline"
        size="icon"
        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          scrollPrev();
        }}
        data-testid="button-carousel-prev"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      
      <Button
        variant="outline"
        size="icon"
        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
        onClick={(e) => {
          e.stopPropagation();
          scrollNext();
        }}
        data-testid="button-carousel-next"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}
