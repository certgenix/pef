import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Images, Calendar, X, Tag } from "lucide-react";
import type { GalleryImage } from "@shared/schema";
import { format } from "date-fns";
import { Button } from "@/components/ui/button";

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
              Explore memorable moments from our events, meetings, and networking sessions
            </p>
          </div>
        </section>

        <section className="py-16 md:py-24 bg-background">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {isLoading ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-muted-foreground">Loading gallery...</p>
              </div>
            ) : images && images.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {images.map((image, index) => {
                  // Create varied heights for masonry effect
                  const heights = ["aspect-square", "aspect-[4/5]", "aspect-[3/4]", "aspect-video"];
                  const heightClass = heights[index % heights.length];
                  
                  return (
                    <Card 
                      key={image.id} 
                      className="group border-2 hover:border-primary/50 transition-all cursor-pointer hover-elevate overflow-visible" 
                      onClick={() => setSelectedImage(image)}
                      data-testid={`card-gallery-${image.id}`}
                    >
                      <div className={`${heightClass} relative overflow-hidden`}>
                        <img
                          src={image.imageUrl}
                          alt={image.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                          data-testid={`img-gallery-${image.id}`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                          <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-2 group-hover:translate-y-0 transition-transform duration-300">
                            <h3 className="font-semibold text-lg mb-1 line-clamp-2" data-testid={`text-gallery-title-${image.id}`}>
                              {image.title}
                            </h3>
                            <div className="flex flex-wrap items-center gap-2">
                              {image.category && (
                                <Badge variant="secondary" className="text-xs" data-testid={`badge-gallery-category-${image.id}`}>
                                  {image.category}
                                </Badge>
                              )}
                              {image.eventDate && (
                                <span className="text-xs flex items-center gap-1" data-testid={`text-gallery-date-${image.id}`}>
                                  <Calendar className="w-3 h-3" />
                                  {format(new Date(image.eventDate), "MMM d, yyyy")}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-12">
                <Images className="w-16 h-16 mx-auto mb-4 text-muted-foreground opacity-50" />
                <p className="text-muted-foreground text-lg">No gallery images to display at this time.</p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Footer />

      <Dialog open={!!selectedImage} onOpenChange={() => setSelectedImage(null)}>
        <DialogContent className="max-w-5xl max-h-[90vh] p-0 overflow-hidden" data-testid="dialog-gallery-image">
          {selectedImage && (
            <div className="grid md:grid-cols-2 gap-0">
              <div className="relative bg-black/5 dark:bg-black/20 flex items-center justify-center p-4 md:p-8">
                <img
                  src={selectedImage.imageUrl}
                  alt={selectedImage.title}
                  className="w-full h-auto max-h-[70vh] object-contain rounded-md"
                  data-testid="img-gallery-full"
                />
              </div>
              
              <div className="p-6 md:p-8 flex flex-col">
                <DialogHeader className="mb-6">
                  <DialogTitle className="text-2xl md:text-3xl font-display font-bold" data-testid="text-gallery-full-title">
                    {selectedImage.title}
                  </DialogTitle>
                </DialogHeader>

                <div className="space-y-6 flex-1">
                  {selectedImage.description && (
                    <div>
                      <h4 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide mb-2">
                        Description
                      </h4>
                      <p className="text-base leading-relaxed" data-testid="text-gallery-full-description">
                        {selectedImage.description}
                      </p>
                    </div>
                  )}

                  <div className="space-y-4">
                    {selectedImage.category && (
                      <div className="flex items-start gap-3">
                        <Tag className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Category</h4>
                          <Badge variant="secondary" className="text-sm" data-testid="badge-gallery-full-category">
                            {selectedImage.category}
                          </Badge>
                        </div>
                      </div>
                    )}
                    
                    {selectedImage.eventDate && (
                      <div className="flex items-start gap-3">
                        <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                        <div>
                          <h4 className="text-sm font-semibold text-muted-foreground mb-1">Event Date</h4>
                          <p className="text-base" data-testid="text-gallery-full-date">
                            {format(new Date(selectedImage.eventDate), "EEEE, MMMM d, yyyy")}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setSelectedImage(null)}
                    data-testid="button-close-gallery"
                  >
                    <X className="w-4 h-4 mr-2" />
                    Close
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
