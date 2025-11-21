import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Upload, X, Image as ImageIcon } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

interface ImageUploadProps {
  value?: string | null;
  onChange: (url: string | null) => void;
  label?: string;
  description?: string;
}

export function ImageUpload({ value, onChange, label, description }: ImageUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { currentUser } = useAuth();
  const { toast } = useToast();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = async (file: File) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload a JPEG, PNG, GIF, or WebP image",
        variant: "destructive",
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please upload an image smaller than 5MB",
        variant: "destructive",
      });
      return;
    }

    if (!currentUser) {
      toast({
        title: "Not authenticated",
        description: "Please log in to upload images",
        variant: "destructive",
      });
      return;
    }

    setUploading(true);

    try {
      const token = await currentUser.getIdToken();

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Upload failed');
      }

      const data = await response.json();
      
      if (!data.success || !data.url) {
        throw new Error("Upload succeeded but no URL returned");
      }

      onChange(data.url);

      toast({
        title: "Upload successful",
        description: "Image has been uploaded successfully",
      });
    } catch (error) {
      console.error("Upload error:", error);
      toast({
        title: "Upload failed",
        description: error instanceof Error ? error.message : "Failed to upload image",
        variant: "destructive",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleButtonClick = () => {
    fileInputRef.current?.click();
  };

  const handleClear = () => {
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className="space-y-2">
      {label && <Label>{label}</Label>}
      {description && (
        <p className="text-sm text-muted-foreground">{description}</p>
      )}
      
      <div className="space-y-4">
        {value ? (
          <div className="relative">
            <div className="relative aspect-video w-full max-w-md overflow-hidden rounded-md border">
              <img
                src={value}
                alt="Preview"
                className="h-full w-full object-cover"
              />
            </div>
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="mt-2"
              onClick={handleClear}
              data-testid="button-clear-image"
            >
              <X className="w-4 h-4 mr-2" />
              Remove Image
            </Button>
          </div>
        ) : (
          <div
            className={`relative flex flex-col items-center justify-center w-full max-w-md h-48 border-2 border-dashed rounded-md transition-colors ${
              dragActive
                ? "border-primary bg-primary/5"
                : "border-muted-foreground/25 hover:border-muted-foreground/50"
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <input
              ref={fileInputRef}
              type="file"
              className="hidden"
              accept="image/*"
              onChange={handleChange}
              disabled={uploading}
              data-testid="input-file-upload"
            />
            
            <div className="flex flex-col items-center justify-center gap-2 text-center">
              {uploading ? (
                <>
                  <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
                  <p className="text-sm text-muted-foreground">Uploading...</p>
                </>
              ) : (
                <>
                  <ImageIcon className="w-12 h-12 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">
                      Drag and drop your image here, or
                    </p>
                    <Button
                      type="button"
                      variant="ghost"
                      className="p-0 h-auto text-sm text-primary hover:text-primary/80"
                      onClick={handleButtonClick}
                      data-testid="button-browse-files"
                    >
                      browse files
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </>
              )}
            </div>
          </div>
        )}

        <div className="flex items-center gap-2">
          <div className="h-px flex-1 bg-border" />
          <span className="text-xs text-muted-foreground">OR</span>
          <div className="h-px flex-1 bg-border" />
        </div>

        <div>
          <Label htmlFor="image-url-input">Paste Image URL</Label>
          <Input
            id="image-url-input"
            type="url"
            placeholder="https://example.com/image.jpg"
            value={value || ""}
            onChange={(e) => onChange(e.target.value)}
            disabled={uploading}
            data-testid="input-image-url-paste"
          />
        </div>
      </div>
    </div>
  );
}
