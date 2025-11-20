import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Images, Calendar } from "lucide-react";
import type { GalleryImage } from "@shared/schema";
import { format } from "date-fns";

export default function Gallery() {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  
  const { data: images, isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <section className="relative py-24 md:py-32 bg-gradient-to-br from-primary to-[hsl(213,58%,35%)] text-white overflow-hidden">
          <div className="absolute inset-0 opacity-10">
            <svg className="w-full h-full" xmlns="http://www.w3.org/2000/svg">
              <defs>
                <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                  <circle cx="20" cy="20" r="1" fill="white" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
            </svg>
          </div>
          
          <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <div className="flex items-center justify-center mb-6">
              <Images className="w-12 h-12 text-secondary" />
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold mb-6">
              Event Gallery
            </h1>
            <p className="text-xl md:text-2xl text-white/90 max-w-3xl mx-auto">
              Explore photos from our events, meetings, and networking sessions
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading gallery...</p>
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {images.map((image) => (
                  <Card 
                    key={image.id} 
                    className="border-2 hover:border-primary/30 transition-all hover-elevate cursor-pointer overflow-hidden" 
                    onClick={() => setSelectedImage(image)}
                    data-testid={`card-gallery-${image.id}`}
                  >
                    <div className="aspect-video relative overflow-hidden">
                      <img
                        src={image.imageUrl}
                        alt={image.title}
                        className="w-full h-full object-cover"
                        data-testid={`img-gallery-${image.id}`}
                      />
                    </div>
                    <CardContent className="p-4">
                      <h3 className="font-semibold mb-2 line-clamp-1" data-testid={`text-gallery-title-${image.id}`}>
                        {image.title}
                      </h3>
                      
                      {image.description && (
                        <p className="text-sm text-muted-foreground mb-3 line-clamp-2" data-testid={`text-gallery-description-${image.id}`}>
                          {image.description}
                        </p>
                      )}
                      
                      <div className="flex flex-wrap items-center gap-2">
                        {image.category && (
                          <Badge variant="secondary" data-testid={`badge-gallery-category-${image.id}`}>
                            {image.category}
                          </Badge>
                        )}
                        {image.eventDate && (
                          <div className="flex items-center text-xs text-muted-foreground" data-testid={`text-gallery-date-${image.id}`}>
                            <Calendar className="w-3 h-3 mr-1" />
                            {format(new Date(image.eventDate), "MMM d, yyyy")}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No gallery images to display at this time.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-4xl p-0" data-testid="dialog-gallery-image">
          {selectedImage && (
            <div className="relative">
              <img
                src={selectedImage.imageUrl}
                alt={selectedImage.title}
                className="w-full h-auto rounded-md"
                data-testid="img-gallery-full"
              />
              <div className="p-6">
                <h2 className="text-2xl font-bold mb-2" data-testid="text-gallery-full-title">
                  {selectedImage.title}
                </h2>
                {selectedImage.description && (
                  <p className="text-muted-foreground mb-4" data-testid="text-gallery-full-description">
                    {selectedImage.description}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  {selectedImage.category && (
                    <Badge variant="secondary" data-testid="badge-gallery-full-category">
                      {selectedImage.category}
                    </Badge>
                  )}
                  {selectedImage.eventDate && (
                    <div className="flex items-center text-sm text-muted-foreground" data-testid="text-gallery-full-date">
                      <Calendar className="w-4 h-4 mr-1" />
                      {format(new Date(selectedImage.eventDate), "MMMM d, yyyy")}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
