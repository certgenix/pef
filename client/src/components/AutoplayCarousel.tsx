import { useEffect, useCallback } from "react";
import useEmblaCarousel from "embla-carousel-react";
import type { EmblaOptionsType } from "embla-carousel";

interface AutoplayCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  interval?: number;
}

export function AutoplayCarousel({ 
  images, 
  alt, 
  className = "",
  interval = 3500 
}: AutoplayCarouselProps) {
  const options: EmblaOptionsType = {
    loop: true,
    duration: 20,
  };

  const [emblaRef, emblaApi] = useEmblaCarousel(options);

  const scrollNext = useCallback(() => {
    if (emblaApi) emblaApi.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi || images.length <= 1) return;

    const autoplay = setInterval(() => {
      scrollNext();
    }, interval);

    return () => clearInterval(autoplay);
  }, [emblaApi, scrollNext, interval, images.length]);

  // Guard against empty arrays
  if (!images || images.length === 0) {
    return null;
  }

  // If only one image, don't use carousel
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
    <div className="absolute inset-0 overflow-hidden" ref={emblaRef}>
      <div className="flex h-full">
        {images.map((image, index) => (
          <div
            key={index}
            className="flex-[0_0_100%] min-w-0 h-full"
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
  );
}
