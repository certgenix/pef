import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";

interface PublicOpportunityFormData {
  name: string;
  email: string;
  type: string;
  title: string;
  description: string;
}

export default function PublicOpportunityForm() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<PublicOpportunityFormData>({
    name: "",
    email: "",
    type: "",
    title: "",
    description: "",
  });

  const submitMutation = useMutation({
    mutationFn: async (data: PublicOpportunityFormData) => {
      const response = await fetch("/api/public-opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to submit opportunity");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Opportunity submitted successfully!",
        description: "Your opportunity will be reviewed and posted soon.",
      });
      setFormData({
        name: "",
        email: "",
        type: "",
        title: "",
        description: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Failed to submit opportunity",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.type) {
      toast({
        title: "Please select an opportunity type",
        variant: "destructive",
      });
      return;
    }
    submitMutation.mutate(formData);
  };

  const handleChange = (field: keyof PublicOpportunityFormData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  return (
    <Card className="border-2">
      <CardHeader>
        <CardTitle>Post an Opportunity</CardTitle>
        <CardDescription>
          Share your business opportunity with our community
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Your Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleChange("name", e.target.value)}
              placeholder="John Doe"
              required
              data-testid="input-name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email Address *</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => handleChange("email", e.target.value)}
              placeholder="john@example.com"
              required
              data-testid="input-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="type">Opportunity Type *</Label>
            <Select
              value={formData.type}
              onValueChange={(value) => handleChange("type", value)}
            >
              <SelectTrigger id="type" data-testid="select-type">
                <SelectValue placeholder="Select opportunity type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="investment">Investment Opportunity</SelectItem>
                <SelectItem value="partnership">Sponsorship</SelectItem>
                <SelectItem value="collaboration">Collaboration Project</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="title">Opportunity Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => handleChange("title", e.target.value)}
              placeholder="e.g., Seeking Investment for Tech Startup"
              required
              data-testid="input-title"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Describe your opportunity in detail..."
              rows={6}
              required
              data-testid="input-description"
            />
          </div>

          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={submitMutation.isPending}
            data-testid="button-submit"
          >
            {submitMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Submitting...
              </>
            ) : (
              "Submit Opportunity"
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
