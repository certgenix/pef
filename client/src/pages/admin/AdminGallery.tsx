import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { Images, Plus, Pencil, Trash2, ArrowLeft, Upload } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GalleryImage, InsertGalleryImage } from "@shared/schema";
import { insertGalleryImageSchema } from "@shared/schema";
import { format } from "date-fns";
import { z } from "zod";
import { ImageUpload } from "@/components/ImageUpload";

// Form schema with string eventDate that transforms to Date | null
const galleryImageFormSchema = insertGalleryImageSchema.extend({
  eventDate: z
    .union([z.string(), z.null()])
    .transform((val) => {
      if (!val || val === "") return null;
      const date = new Date(val);
      if (Number.isNaN(date.getTime())) return null;
      return date;
    }),
});

type GalleryImageFormValues = z.input<typeof galleryImageFormSchema>;

export default function AdminGallery() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [bulkUploadOpen, setBulkUploadOpen] = useState(false);
  const [editingImage, setEditingImage] = useState<GalleryImage | null>(null);
  const [deleteImageId, setDeleteImageId] = useState<string | null>(null);

  const { data: images = [], isLoading } = useQuery<GalleryImage[]>({
    queryKey: ["/api/gallery"],
  });

  const handleOpenDialog = (image?: GalleryImage) => {
    if (image) {
      setEditingImage(image);
    } else {
      setEditingImage(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingImage(null);
  };

  if (!currentUser || !userData?.roles?.admin) {
    setLocation("/login");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading gallery data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-28 pb-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <Button
            variant="ghost"
            onClick={() => setLocation("/admin")}
            className="mb-4"
            data-testid="button-back-to-admin"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Admin Dashboard
          </Button>
          
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Images className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Gallery Management</h1>
              </div>
              <p className="text-muted-foreground">Add, edit, and manage event gallery images</p>
            </div>
            <div className="flex gap-2">
              <Button onClick={() => handleOpenDialog()} data-testid="button-add-image">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
              <Button onClick={() => setBulkUploadOpen(true)} variant="secondary" data-testid="button-bulk-upload">
                <Upload className="w-4 h-4 mr-2" />
                Bulk Upload
              </Button>
            </div>
          </div>
        </div>

        {images.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Images className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No gallery images yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start by adding your first image</p>
              <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-image">
                <Plus className="w-4 h-4 mr-2" />
                Add Image
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {images.map((image) => (
              <Card key={image.id} data-testid={`card-image-${image.id}`}>
                <CardContent className="p-0">
                  <div className="aspect-video relative overflow-hidden">
                    <img
                      src={image.imageUrl}
                      alt={image.title}
                      className="w-full h-full object-cover"
                      data-testid={`img-gallery-${image.id}`}
                    />
                  </div>
                  
                  <div className="p-4 space-y-3">
                    <div>
                      <h3 className="font-bold text-lg mb-1" data-testid={`text-image-title-${image.id}`}>
                        {image.title}
                      </h3>
                      {image.description && (
                        <p className="text-sm text-muted-foreground line-clamp-2" data-testid={`text-image-description-${image.id}`}>
                          {image.description}
                        </p>
                      )}
                      {image.category && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Category: {image.category}
                        </p>
                      )}
                      {image.eventDate && (
                        <p className="text-xs text-muted-foreground">
                          Event: {format(new Date(image.eventDate), "MMM dd, yyyy")}
                        </p>
                      )}
                    </div>
                    
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(image)}
                        data-testid={`button-edit-image-${image.id}`}
                      >
                        <Pencil className="w-3 h-3 mr-1" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteImageId(image.id)}
                        data-testid={`button-delete-image-${image.id}`}
                      >
                        <Trash2 className="w-3 h-3 mr-1" />
                        Delete
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <GalleryImageFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        image={editingImage}
      />

      <DeleteImageDialog
        imageId={deleteImageId}
        onClose={() => setDeleteImageId(null)}
      />

      <BulkUploadDialog
        open={bulkUploadOpen}
        onClose={() => setBulkUploadOpen(false)}
      />
    </div>
  );
}

function GalleryImageFormDialog({
  open,
  onClose,
  image,
}: {
  open: boolean;
  onClose: () => void;
  image: GalleryImage | null;
}) {
  const { toast } = useToast();
  
  const form = useForm<GalleryImageFormValues>({
    resolver: zodResolver(galleryImageFormSchema),
    defaultValues: {
      title: "",
      imageUrl: "",
      description: "",
      category: "",
      eventDate: "",
      visible: true,
    },
  });

  // Reset form when image changes
  useEffect(() => {
    if (image) {
      form.reset({
        title: image.title,
        imageUrl: image.imageUrl,
        description: image.description ?? "",
        category: image.category ?? "",
        eventDate: image.eventDate ? format(new Date(image.eventDate), "yyyy-MM-dd") : "",
        visible: image.visible,
      });
    } else {
      form.reset({
        title: "",
        imageUrl: "",
        description: "",
        category: "",
        eventDate: "",
        visible: true,
      });
    }
  }, [image, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: z.output<typeof galleryImageFormSchema>) => {
      if (image) {
        return await apiRequest("PATCH", `/api/gallery/${image.id}`, data);
      } else {
        return await apiRequest("POST", "/api/gallery", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Success",
        description: image ? "Image updated successfully" : "Image added successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save image",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (values: GalleryImageFormValues) => {
    const parsed = galleryImageFormSchema.parse(values);
    saveMutation.mutate(parsed);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{image ? "Edit Gallery Image" : "Add New Gallery Image"}</DialogTitle>
          <DialogDescription>
            {image ? "Update gallery image information" : "Add a new image to the gallery"}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title *</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder="Annual Conference 2024" data-testid="input-image-title" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Brief description of the event..."
                      rows={3}
                      data-testid="input-image-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="imageUrl"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                      label="Image *"
                      description="Upload an image or paste a URL"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      value={field.value ?? ""}
                      placeholder="Conference, Workshop, Networking, etc."
                      data-testid="input-image-category"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="eventDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Date</FormLabel>
                  <FormControl>
                    <Input
                      type="date"
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value || "")}
                      data-testid="input-image-event-date"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="visible"
              render={({ field }) => (
                <FormItem className="flex items-center gap-2 space-y-0">
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                      data-testid="switch-image-visible"
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">Visible in gallery</FormLabel>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                data-testid="button-cancel-image"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save-image"
              >
                {saveMutation.isPending ? "Saving..." : image ? "Update" : "Add"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteImageDialog({
  imageId,
  onClose,
}: {
  imageId: string | null;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/gallery/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      toast({
        title: "Success",
        description: "Image deleted successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete image",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (imageId) {
      deleteMutation.mutate(imageId);
    }
  };

  return (
    <Dialog open={!!imageId} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Gallery Image</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this image? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel-delete-image"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid="button-confirm-delete-image"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function BulkUploadDialog({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const { toast } = useToast();
  const [urls, setUrls] = useState("");
  const [category, setCategory] = useState("");
  const [eventDate, setEventDate] = useState("");
  const [uploadErrors, setUploadErrors] = useState<Array<{ url: string; error: string }>>([]);
  
  const bulkUploadMutation = useMutation({
    mutationFn: async (data: { urls: string[]; category?: string; eventDate?: string }) => {
      return await apiRequest("POST", "/api/gallery/bulk", data);
    },
    onSuccess: (response: any) => {
      queryClient.invalidateQueries({ queryKey: ["/api/gallery"] });
      const count = response.count || 0;
      const errorCount = response.errors?.length || 0;
      
      // Store errors for display
      if (response.errors && response.errors.length > 0) {
        setUploadErrors(response.errors);
      }
      
      if (count > 0) {
        // Some or all succeeded
        toast({
          title: errorCount > 0 ? "Partial Success" : "Success",
          description: errorCount > 0 
            ? `${count} image${count !== 1 ? 's' : ''} added. ${errorCount} failed - see details below.`
            : `${count} image${count !== 1 ? 's' : ''} added successfully`,
        });
        
        // Only close and clear if fully successful
        if (errorCount === 0) {
          setUrls("");
          setCategory("");
          setEventDate("");
          setUploadErrors([]);
          onClose();
        }
      } else if (errorCount > 0) {
        // All failed
        toast({
          title: "Upload Failed",
          description: `All ${errorCount} image${errorCount !== 1 ? 's' : ''} failed. See details below.`,
          variant: "destructive",
        });
      }
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to upload images",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous errors
    setUploadErrors([]);
    
    const urlList = urls
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    if (urlList.length === 0) {
      toast({
        title: "No URLs provided",
        description: "Please enter at least one image URL",
        variant: "destructive",
      });
      return;
    }

    const invalidUrls = urlList.filter(url => {
      try {
        new URL(url);
        return false;
      } catch {
        return true;
      }
    });

    if (invalidUrls.length > 0) {
      toast({
        title: "Invalid URLs",
        description: `${invalidUrls.length} URL${invalidUrls.length !== 1 ? 's are' : ' is'} invalid. Please check and try again.`,
        variant: "destructive",
      });
      return;
    }

    bulkUploadMutation.mutate({
      urls: urlList,
      category: category.trim() || undefined,
      eventDate: eventDate.trim() || undefined,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Bulk Upload Gallery Images</DialogTitle>
          <DialogDescription>
            Paste multiple image URLs (one per line) to add them all at once
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {uploadErrors.length > 0 && (
            <div className="bg-destructive/10 border border-destructive/30 rounded-md p-4">
              <h4 className="font-semibold text-destructive mb-2">Failed Uploads ({uploadErrors.length}):</h4>
              <div className="space-y-1 max-h-40 overflow-y-auto">
                {uploadErrors.map((err, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-mono text-xs break-all">{err.url}</span>
                    <p className="text-destructive text-xs ml-2">→ {err.error}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <Label htmlFor="bulk-urls">Image URLs (one per line) *</Label>
            <Textarea
              id="bulk-urls"
              value={urls}
              onChange={(e) => setUrls(e.target.value)}
              placeholder="https://example.com/image1.jpg&#10;https://example.com/image2.jpg&#10;https://example.com/image3.jpg"
              rows={10}
              className="font-mono text-sm"
              data-testid="textarea-bulk-urls"
            />
            <p className="text-sm text-muted-foreground mt-1">
              Each URL will create a separate gallery image with a default title
            </p>
          </div>

          <div>
            <Label htmlFor="bulk-category">Default Category (optional)</Label>
            <Input
              id="bulk-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              placeholder="Conference, Workshop, etc."
              data-testid="input-bulk-category"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This category will be applied to all uploaded images
            </p>
          </div>

          <div>
            <Label htmlFor="bulk-event-date">Default Event Date (optional)</Label>
            <Input
              type="date"
              id="bulk-event-date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              data-testid="input-bulk-event-date"
            />
            <p className="text-sm text-muted-foreground mt-1">
              This date will be applied to all uploaded images
            </p>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-bulk-upload"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={bulkUploadMutation.isPending}
              data-testid="button-submit-bulk-upload"
            >
              {bulkUploadMutation.isPending ? "Uploading..." : "Upload All"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
