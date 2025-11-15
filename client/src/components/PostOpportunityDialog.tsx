import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { Plus } from "lucide-react";

const opportunitySchema = z.object({
  type: z.enum(["investment", "partnership", "collaboration"]),
  title: z.string().min(10, "Title must be at least 10 characters"),
  description: z.string().min(50, "Description must be at least 50 characters"),
  sector: z.string().optional(),
  country: z.string().optional(),
  city: z.string().optional(),
  budgetOrSalary: z.string().optional(),
  contactPreference: z.string().optional(),
});

type OpportunityFormData = z.infer<typeof opportunitySchema>;

interface PostOpportunityDialogProps {
  trigger?: React.ReactNode;
}

export default function PostOpportunityDialog({ trigger }: PostOpportunityDialogProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const form = useForm<OpportunityFormData>({
    resolver: zodResolver(opportunitySchema),
    defaultValues: {
      type: "investment",
      title: "",
      description: "",
      sector: "",
      country: "",
      city: "",
      budgetOrSalary: "",
      contactPreference: "email",
    },
  });

  const createOpportunityMutation = useMutation({
    mutationFn: async (data: OpportunityFormData) => {
      if (!currentUser) throw new Error("Not authenticated");
      
      const response = await apiRequest("POST", "/api/opportunities", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      toast({
        title: "Success!",
        description: "Your opportunity has been posted successfully.",
      });
      setOpen(false);
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to post opportunity",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OpportunityFormData) => {
    createOpportunityMutation.mutate(data);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button data-testid="button-post-opportunity">
            <Plus className="w-4 h-4 mr-2" />
            Post Opportunity
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post Business Opportunity</DialogTitle>
          <DialogDescription>
            Share investment, partnership, or collaboration opportunities with the PEF community
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity Type</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-opportunity-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="investment">Investment Opportunity</SelectItem>
                      <SelectItem value="partnership">Partnership Proposal</SelectItem>
                      <SelectItem value="collaboration">Collaboration Project</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    Choose the type of opportunity you're offering
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Title</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="e.g., Seeking $2M Series A for Clean Energy Expansion" 
                      {...field} 
                      data-testid="input-title"
                    />
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
                      placeholder="Provide detailed information about this opportunity, including goals, requirements, and what you're looking for..."
                      className="min-h-32"
                      {...field}
                      data-testid="textarea-description"
                    />
                  </FormControl>
                  <FormDescription>
                    Minimum 50 characters - be specific about your opportunity
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector/Industry</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Clean Energy, Technology" {...field} data-testid="input-sector" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="budgetOrSalary"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Budget/Investment Amount</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., $1M - $5M" {...field} data-testid="input-budget" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., United Arab Emirates" {...field} data-testid="input-country" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Dubai" {...field} data-testid="input-city" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="contactPreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Contact Preference</FormLabel>
                  <FormControl>
                    <Input placeholder="How should interested parties reach you?" {...field} data-testid="input-contact-preference" />
                  </FormControl>
                  <FormDescription>
                    e.g., "via email" or "through PEF messaging"
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 justify-end pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createOpportunityMutation.isPending}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                disabled={createOpportunityMutation.isPending}
                data-testid="button-submit-opportunity"
              >
                {createOpportunityMutation.isPending ? "Posting..." : "Post Opportunity"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
