import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Images, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { GalleryImage, InsertGalleryImage } from "@shared/schema";
import { format } from "date-fns";

export default function AdminGallery() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
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
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-image">
              <Plus className="w-4 h-4 mr-2" />
              Add Image
            </Button>
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
  const [formData, setFormData] = useState({
    title: image?.title || "",
    description: image?.description || "",
    imageUrl: image?.imageUrl || "",
    category: image?.category || "",
    eventDate: image?.eventDate ? format(new Date(image.eventDate), "yyyy-MM-dd") : "",
    visible: image?.visible ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      const submitData: Partial<InsertGalleryImage> = {
        title: data.title,
        description: data.description || null,
        imageUrl: data.imageUrl,
        category: data.category || null,
        eventDate: data.eventDate ? new Date(data.eventDate) : null,
        visible: data.visible,
      };
      
      if (image) {
        return await apiRequest("PATCH", `/api/gallery/${image.id}`, submitData);
      } else {
        return await apiRequest("POST", "/api/gallery", submitData);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.imageUrl) {
      toast({
        title: "Validation Error",
        description: "Title and image URL are required",
        variant: "destructive",
      });
      return;
    }
    saveMutation.mutate(formData);
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
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

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="Annual Conference 2024"
              data-testid="input-image-title"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ""}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief description of the event..."
              rows={3}
              data-testid="input-image-description"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL *</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              data-testid="input-image-url"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Input
              id="category"
              value={formData.category || ""}
              onChange={(e) => handleChange("category", e.target.value)}
              placeholder="Conference, Workshop, Networking, etc."
              data-testid="input-image-category"
            />
          </div>

          <div>
            <Label htmlFor="eventDate">Event Date</Label>
            <Input
              id="eventDate"
              type="date"
              value={formData.eventDate || ""}
              onChange={(e) => handleChange("eventDate", e.target.value)}
              data-testid="input-image-event-date"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) => handleChange("visible", checked)}
              data-testid="switch-image-visible"
            />
            <Label htmlFor="visible">Visible in gallery</Label>
          </div>

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
