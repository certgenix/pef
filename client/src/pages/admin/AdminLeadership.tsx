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
import { Users2, Plus, Pencil, Trash2, ArrowLeft } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import type { Leader, InsertLeader } from "@shared/schema";

export default function AdminLeadership() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingLeader, setEditingLeader] = useState<Leader | null>(null);
  const [deleteLeaderId, setDeleteLeaderId] = useState<string | null>(null);

  const { data: leaders = [], isLoading } = useQuery<Leader[]>({
    queryKey: ["/api/leaders"],
  });

  const handleOpenDialog = (leader?: Leader) => {
    if (leader) {
      setEditingLeader(leader);
    } else {
      setEditingLeader(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingLeader(null);
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
          <p className="text-muted-foreground">Loading leadership data...</p>
        </div>
      </div>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

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
                <Users2 className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Leadership Management</h1>
              </div>
              <p className="text-muted-foreground">Add, edit, and manage leadership team members</p>
            </div>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-leader">
              <Plus className="w-4 h-4 mr-2" />
              Add Leader
            </Button>
          </div>
        </div>

        {leaders.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Users2 className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">No leadership members yet</p>
              <p className="text-sm text-muted-foreground mb-4">Start by adding your first leader</p>
              <Button onClick={() => handleOpenDialog()} data-testid="button-add-first-leader">
                <Plus className="w-4 h-4 mr-2" />
                Add Leader
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leaders.map((leader) => (
              <Card key={leader.id} data-testid={`card-leader-${leader.id}`}>
                <CardContent className="p-6 text-center">
                  <Avatar className="w-32 h-32 mx-auto mb-4" data-testid={`avatar-leader-${leader.id}`}>
                    {leader.imageUrl && (
                      <AvatarImage src={leader.imageUrl} alt={leader.name} />
                    )}
                    <AvatarFallback className="text-2xl font-semibold">
                      {getInitials(leader.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <h3 className="text-xl font-bold mb-1" data-testid={`text-leader-name-${leader.id}`}>
                    {leader.name}
                  </h3>
                  <p className="text-primary font-medium mb-3" data-testid={`text-leader-title-${leader.id}`}>
                    {leader.title}
                  </p>
                  
                  {leader.bio && (
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-3" data-testid={`text-leader-bio-${leader.id}`}>
                      {leader.bio}
                    </p>
                  )}
                  
                  <div className="flex gap-2 justify-center mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleOpenDialog(leader)}
                      data-testid={`button-edit-leader-${leader.id}`}
                    >
                      <Pencil className="w-3 h-3 mr-1" />
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeleteLeaderId(leader.id)}
                      data-testid={`button-delete-leader-${leader.id}`}
                    >
                      <Trash2 className="w-3 h-3 mr-1" />
                      Delete
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
      <Footer />

      <LeaderFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        leader={editingLeader}
      />

      <DeleteLeaderDialog
        leaderId={deleteLeaderId}
        onClose={() => setDeleteLeaderId(null)}
      />
    </div>
  );
}

function LeaderFormDialog({
  open,
  onClose,
  leader,
}: {
  open: boolean;
  onClose: () => void;
  leader: Leader | null;
}) {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<InsertLeader>>({
    name: leader?.name || "",
    title: leader?.title || "",
    bio: leader?.bio || "",
    imageUrl: leader?.imageUrl || "",
    linkedinUrl: leader?.linkedinUrl || "",
    order: leader?.order || 0,
    visible: leader?.visible ?? true,
  });

  const saveMutation = useMutation({
    mutationFn: async (data: Partial<InsertLeader>) => {
      if (leader) {
        return await apiRequest("PATCH", `/api/leaders/${leader.id}`, data);
      } else {
        return await apiRequest("POST", "/api/leaders", data);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaders"] });
      toast({
        title: "Success",
        description: leader ? "Leader updated successfully" : "Leader added successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save leader",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.title) {
      toast({
        title: "Validation Error",
        description: "Name and title are required",
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
          <DialogTitle>{leader ? "Edit Leader" : "Add New Leader"}</DialogTitle>
          <DialogDescription>
            {leader ? "Update leader information" : "Add a new member to the leadership team"}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              data-testid="input-leader-name"
            />
          </div>

          <div>
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="CEO & Founder"
              data-testid="input-leader-title"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={formData.bio || ""}
              onChange={(e) => handleChange("bio", e.target.value)}
              placeholder="Brief biography..."
              rows={4}
              data-testid="input-leader-bio"
            />
          </div>

          <div>
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              value={formData.imageUrl || ""}
              onChange={(e) => handleChange("imageUrl", e.target.value)}
              placeholder="https://example.com/image.jpg"
              data-testid="input-leader-image"
            />
          </div>

          <div>
            <Label htmlFor="linkedinUrl">LinkedIn URL</Label>
            <Input
              id="linkedinUrl"
              value={formData.linkedinUrl || ""}
              onChange={(e) => handleChange("linkedinUrl", e.target.value)}
              placeholder="https://linkedin.com/in/username"
              data-testid="input-leader-linkedin"
            />
          </div>

          <div>
            <Label htmlFor="order">Display Order</Label>
            <Input
              id="order"
              type="number"
              value={formData.order}
              onChange={(e) => handleChange("order", parseInt(e.target.value) || 0)}
              placeholder="0"
              data-testid="input-leader-order"
            />
          </div>

          <div className="flex items-center gap-2">
            <Switch
              id="visible"
              checked={formData.visible}
              onCheckedChange={(checked) => handleChange("visible", checked)}
              data-testid="switch-leader-visible"
            />
            <Label htmlFor="visible">Visible on leadership page</Label>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              data-testid="button-cancel-leader"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saveMutation.isPending}
              data-testid="button-save-leader"
            >
              {saveMutation.isPending ? "Saving..." : leader ? "Update" : "Add"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function DeleteLeaderDialog({
  leaderId,
  onClose,
}: {
  leaderId: string | null;
  onClose: () => void;
}) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return await apiRequest("DELETE", `/api/leaders/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/leaders"] });
      toast({
        title: "Success",
        description: "Leader deleted successfully",
      });
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete leader",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    if (leaderId) {
      deleteMutation.mutate(leaderId);
    }
  };

  return (
    <Dialog open={!!leaderId} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete Leader</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this leader? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            data-testid="button-cancel-delete-leader"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid="button-confirm-delete-leader"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
