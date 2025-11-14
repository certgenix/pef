import { useState } from "react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { auth } from "@/lib/firebase";

interface PostJobDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PostJobDialog({ open, onOpenChange }: PostJobDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    sector: "",
    country: "",
    city: "",
    budgetOrSalary: "",
    contactPreference: "",
    employmentType: "full-time" as "full-time" | "part-time" | "remote" | "contract",
    experienceRequired: "",
    skills: "",
    benefits: "",
    applicationEmail: "",
  });

  const createJobMutation = useMutation({
    mutationFn: async (data: typeof formData) => {
      if (!auth.currentUser) {
        throw new Error("You must be logged in to post a job");
      }

      const token = await auth.currentUser.getIdToken();
      if (!token) {
        throw new Error("Failed to get authentication token. Please try logging in again.");
      }
      
      const skillsArray = data.skills.split(",").map(s => s.trim()).filter(Boolean);
      const benefitsArray = data.benefits.split(",").map(b => b.trim()).filter(Boolean);
      
      const response = await fetch("/api/opportunities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          type: "job",
          title: data.title,
          description: data.description,
          sector: data.sector,
          country: data.country,
          city: data.city,
          budgetOrSalary: data.budgetOrSalary,
          contactPreference: data.contactPreference,
          details: {
            employmentType: data.employmentType,
            experienceRequired: data.experienceRequired,
            skills: skillsArray.length > 0 ? skillsArray : undefined,
            benefits: benefitsArray.length > 0 ? benefitsArray : undefined,
            applicationEmail: data.applicationEmail,
          },
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to create job posting");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success!",
        description: "Your job posting has been created and is now live on the opportunities page!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      setFormData({
        title: "",
        description: "",
        sector: "",
        country: "",
        city: "",
        budgetOrSalary: "",
        contactPreference: "",
        employmentType: "full-time",
        experienceRequired: "",
        skills: "",
        benefits: "",
        applicationEmail: "",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to create job posting. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createJobMutation.mutate(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Post a New Job</DialogTitle>
          <DialogDescription>
            Fill out the form below to create a new job posting. It will go live immediately on the opportunities page.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Job Title *</Label>
            <Input
              id="title"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="e.g. Senior Software Engineer"
              data-testid="input-job-title"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="employmentType">Employment Type *</Label>
              <Select
                value={formData.employmentType}
                onValueChange={(value) => setFormData({ ...formData, employmentType: value as any })}
              >
                <SelectTrigger id="employmentType" data-testid="select-employment-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full-time">Full-time</SelectItem>
                  <SelectItem value="part-time">Part-time</SelectItem>
                  <SelectItem value="remote">Remote</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="sector">Industry/Sector</Label>
              <Input
                id="sector"
                value={formData.sector}
                onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                placeholder="e.g. Technology, Healthcare"
                data-testid="input-sector"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Input
                id="country"
                required
                value={formData.country}
                onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                placeholder="e.g. United States"
                data-testid="input-country"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                placeholder="e.g. New York"
                data-testid="input-city"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Job Description *</Label>
            <Textarea
              id="description"
              required
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Describe the role, responsibilities, and requirements..."
              rows={5}
              data-testid="textarea-description"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="experienceRequired">Experience Required</Label>
            <Input
              id="experienceRequired"
              value={formData.experienceRequired}
              onChange={(e) => setFormData({ ...formData, experienceRequired: e.target.value })}
              placeholder="e.g. 5+ years in software development"
              data-testid="input-experience"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skills">Required Skills (comma-separated)</Label>
            <Input
              id="skills"
              value={formData.skills}
              onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              placeholder="e.g. React, TypeScript, Node.js"
              data-testid="input-skills"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="budgetOrSalary">Salary Range</Label>
            <Input
              id="budgetOrSalary"
              value={formData.budgetOrSalary}
              onChange={(e) => setFormData({ ...formData, budgetOrSalary: e.target.value })}
              placeholder="e.g. $80,000 - $120,000/year"
              data-testid="input-salary"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="benefits">Benefits (comma-separated)</Label>
            <Input
              id="benefits"
              value={formData.benefits}
              onChange={(e) => setFormData({ ...formData, benefits: e.target.value })}
              placeholder="e.g. Health insurance, 401k, Remote work"
              data-testid="input-benefits"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="applicationEmail">Application Email *</Label>
            <Input
              id="applicationEmail"
              type="email"
              required
              value={formData.applicationEmail}
              onChange={(e) => setFormData({ ...formData, applicationEmail: e.target.value })}
              placeholder="e.g. careers@company.com"
              data-testid="input-application-email"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactPreference">Additional Contact Information</Label>
            <Textarea
              id="contactPreference"
              value={formData.contactPreference}
              onChange={(e) => setFormData({ ...formData, contactPreference: e.target.value })}
              placeholder="Phone number, website, or other contact details..."
              rows={2}
              data-testid="textarea-contact"
            />
          </div>

          <div className="flex flex-wrap gap-3 justify-end pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createJobMutation.isPending}
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createJobMutation.isPending}
              data-testid="button-submit-job"
            >
              {createJobMutation.isPending ? "Creating..." : "Post Job"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
