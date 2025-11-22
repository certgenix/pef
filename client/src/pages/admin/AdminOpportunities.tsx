import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { Briefcase, Plus, Pencil, Trash2, ArrowLeft, Search, CheckCircle2, XCircle, Clock } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { apiRequest, queryClient } from "@/lib/queryClient";
import type { Opportunity, InsertOpportunity } from "@shared/schema";
import { insertOpportunitySchema } from "@shared/schema";
import { format } from "date-fns";

export default function AdminOpportunities() {
  const { currentUser, userData } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingOpportunity, setEditingOpportunity] = useState<Opportunity | null>(null);
  const [deleteOpportunityId, setDeleteOpportunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedType, setSelectedType] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  const { data: opportunities = [], isLoading } = useQuery<Opportunity[]>({
    queryKey: ["/api/admin/opportunities"],
    enabled: !!currentUser && !!userData?.roles?.admin,
  });

  useEffect(() => {
    if (!currentUser) {
      setLocation("/login");
      return;
    }

    if (!userData?.roles?.admin) {
      toast({
        title: "Access Denied",
        description: "You don't have permission to access this page",
        variant: "destructive",
      });
      setLocation("/");
      return;
    }
  }, [currentUser, userData, setLocation, toast]);

  const handleOpenDialog = (opportunity?: Opportunity) => {
    if (opportunity) {
      setEditingOpportunity(opportunity);
    } else {
      setEditingOpportunity(null);
    }
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
    setEditingOpportunity(null);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading opportunities data...</p>
        </div>
      </div>
    );
  }

  const getApprovalStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge variant="default" className="bg-green-600 text-white"><CheckCircle2 className="w-3 h-3 mr-1" />Approved</Badge>;
      case "rejected":
        return <Badge variant="destructive"><XCircle className="w-3 h-3 mr-1" />Rejected</Badge>;
      default:
        return <Badge variant="secondary"><Clock className="w-3 h-3 mr-1" />Pending</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    const colors = {
      job: "bg-blue-600 text-white",
      investment: "bg-purple-600 text-white",
      partnership: "bg-orange-600 text-white",
      collaboration: "bg-green-600 text-white"
    };
    return <Badge className={colors[type as keyof typeof colors] || ""}>{type}</Badge>;
  };

  const filteredOpportunities = opportunities.filter(opp => {
    const matchesSearch = opp.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         opp.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = selectedType === "all" || opp.type === selectedType;
    const matchesStatus = selectedStatus === "all" || opp.approvalStatus === selectedStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

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
          
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Briefcase className="w-8 h-8 text-primary" />
                <h1 className="text-3xl font-bold">Opportunities Management</h1>
              </div>
              <p className="text-muted-foreground">Review, approve, and manage opportunities</p>
            </div>
            <Button onClick={() => handleOpenDialog()} data-testid="button-add-opportunity">
              <Plus className="w-4 h-4 mr-2" />
              Add Opportunity
            </Button>
          </div>

          <div className="flex flex-wrap gap-4 mb-6">
            <div className="flex-1 min-w-[200px]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  placeholder="Search opportunities..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-opportunities"
                />
              </div>
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[180px]" data-testid="select-type-filter">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="job">Job</SelectItem>
                <SelectItem value="investment">Investment</SelectItem>
                <SelectItem value="partnership">Partnership</SelectItem>
                <SelectItem value="collaboration">Collaboration</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]" data-testid="select-status-filter">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="approved">Approved</SelectItem>
                <SelectItem value="rejected">Rejected</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {filteredOpportunities.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center">
              <Briefcase className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground mb-2">
                {searchQuery || selectedType !== "all" || selectedStatus !== "all" 
                  ? "No opportunities found matching your filters" 
                  : "No opportunities yet"}
              </p>
              {!searchQuery && selectedType === "all" && selectedStatus === "all" && (
                <Button onClick={() => handleOpenDialog()} className="mt-4" data-testid="button-add-first-opportunity">
                  <Plus className="w-4 h-4 mr-2" />
                  Add Opportunity
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredOpportunities.map((opportunity) => (
              <Card key={opportunity.id} data-testid={`card-opportunity-${opportunity.id}`}>
                <CardContent className="p-6">
                  <div className="flex flex-wrap gap-4 items-start justify-between">
                    <div className="flex-1 min-w-[200px]">
                      <div className="flex flex-wrap gap-2 items-center mb-2">
                        {getTypeBadge(opportunity.type)}
                        {getApprovalStatusBadge(opportunity.approvalStatus)}
                        <Badge variant={opportunity.status === "open" ? "default" : "secondary"}>
                          {opportunity.status}
                        </Badge>
                      </div>
                      <h3 className="text-xl font-semibold mb-2" data-testid={`title-opportunity-${opportunity.id}`}>
                        {opportunity.title}
                      </h3>
                      <p className="text-muted-foreground mb-2 line-clamp-2">
                        {opportunity.description}
                      </p>
                      <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                        {opportunity.sector && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Sector:</span> {opportunity.sector}
                          </span>
                        )}
                        {opportunity.country && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Location:</span> {opportunity.city ? `${opportunity.city}, ` : ""}{opportunity.country}
                          </span>
                        )}
                        {opportunity.budgetOrSalary && (
                          <span className="flex items-center gap-1">
                            <span className="font-medium">Budget/Salary:</span> {opportunity.budgetOrSalary}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Posted {format(new Date(opportunity.createdAt), "MMM d, yyyy")}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleOpenDialog(opportunity)}
                        data-testid={`button-edit-opportunity-${opportunity.id}`}
                      >
                        <Pencil className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeleteOpportunityId(opportunity.id)}
                        data-testid={`button-delete-opportunity-${opportunity.id}`}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
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

      <OpportunityFormDialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        opportunity={editingOpportunity}
      />

      <DeleteOpportunityDialog
        opportunityId={deleteOpportunityId}
        onClose={() => setDeleteOpportunityId(null)}
      />
    </div>
  );
}

interface OpportunityFormDialogProps {
  open: boolean;
  onClose: () => void;
  opportunity: Opportunity | null;
}

// Discriminated union schema with proper validation for each opportunity type
const adminOpportunitySchema = z.discriminatedUnion("type", [
  // Job schema - requires employment type and application email
  z.object({
    userId: z.string(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    sector: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    budgetOrSalary: z.string().optional(),
    contactPreference: z.string().optional(),
    details: z.any().optional().nullable(),
    status: z.enum(["open", "closed"]),
    approvalStatus: z.enum(["pending", "approved", "rejected"]),
    type: z.literal("job"),
    employmentType: z.enum(["full-time", "part-time", "remote", "contract"], {
      required_error: "Employment type is required for job postings",
    }),
    experienceRequired: z.string().optional(),
    skills: z.string().optional(),
    benefits: z.string().optional(),
    applicationEmail: z.string().trim().email("Please enter a valid email address").min(1, "Application email is required for job postings"),
    // Other type fields (optional for form compatibility)
    investmentAmount: z.string().optional(),
    investmentType: z.string().optional(),
    partnershipType: z.string().optional(),
  }),
  // Investment schema - requires investment amount and type
  z.object({
    userId: z.string(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    sector: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    budgetOrSalary: z.string().optional(),
    contactPreference: z.string().optional(),
    details: z.any().optional().nullable(),
    status: z.enum(["open", "closed"]),
    approvalStatus: z.enum(["pending", "approved", "rejected"]),
    type: z.literal("investment"),
    investmentAmount: z.string().trim().min(1, "Investment amount is required for investment opportunities"),
    investmentType: z.string().trim().min(1, "Investment type is required for investment opportunities"),
    // Other type fields (optional for form compatibility)
    employmentType: z.enum(["full-time", "part-time", "remote", "contract"]).optional(),
    experienceRequired: z.string().optional(),
    skills: z.string().optional(),
    benefits: z.string().optional(),
    applicationEmail: z.string().optional(),
    partnershipType: z.string().optional(),
  }),
  // Partnership schema - requires partnership type
  z.object({
    userId: z.string(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    sector: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    budgetOrSalary: z.string().optional(),
    contactPreference: z.string().optional(),
    details: z.any().optional().nullable(),
    status: z.enum(["open", "closed"]),
    approvalStatus: z.enum(["pending", "approved", "rejected"]),
    type: z.literal("partnership"),
    partnershipType: z.string().trim().min(1, "Partnership type is required for partnership opportunities"),
    // Other type fields (optional for form compatibility)
    employmentType: z.enum(["full-time", "part-time", "remote", "contract"]).optional(),
    experienceRequired: z.string().optional(),
    skills: z.string().optional(),
    benefits: z.string().optional(),
    applicationEmail: z.string().optional(),
    investmentAmount: z.string().optional(),
    investmentType: z.string().optional(),
  }),
  // Collaboration schema - no specific fields required beyond base fields
  z.object({
    userId: z.string(),
    title: z.string().trim().min(1, "Title is required"),
    description: z.string().trim().min(1, "Description is required"),
    sector: z.string().optional(),
    country: z.string().optional(),
    city: z.string().optional(),
    budgetOrSalary: z.string().optional(),
    contactPreference: z.string().optional(),
    details: z.any().optional().nullable(),
    status: z.enum(["open", "closed"]),
    approvalStatus: z.enum(["pending", "approved", "rejected"]),
    type: z.literal("collaboration"),
    // Other type fields (optional for form compatibility)
    employmentType: z.enum(["full-time", "part-time", "remote", "contract"]).optional(),
    experienceRequired: z.string().optional(),
    skills: z.string().optional(),
    benefits: z.string().optional(),
    applicationEmail: z.string().optional(),
    investmentAmount: z.string().optional(),
    investmentType: z.string().optional(),
    partnershipType: z.string().optional(),
  }),
]);

type AdminOpportunityFormData = z.infer<typeof adminOpportunitySchema>;

function OpportunityFormDialog({ open, onClose, opportunity }: OpportunityFormDialogProps) {
  const { toast } = useToast();
  const { currentUser } = useAuth();

  const form = useForm<AdminOpportunityFormData>({
    resolver: zodResolver(adminOpportunitySchema),
    defaultValues: {
      userId: currentUser?.uid || "",
      type: "job",
      title: "",
      description: "",
      sector: "",
      country: "",
      city: "",
      budgetOrSalary: "",
      contactPreference: "",
      details: null,
      status: "open",
      approvalStatus: "approved",
      employmentType: "full-time",
      experienceRequired: "",
      skills: "",
      benefits: "",
      applicationEmail: "",
      investmentAmount: "",
      investmentType: "",
      partnershipType: "",
    },
  });

  useEffect(() => {
    if (opportunity) {
      const details = opportunity.details as any;
      form.reset({
        userId: opportunity.userId,
        type: opportunity.type,
        title: opportunity.title,
        description: opportunity.description,
        sector: opportunity.sector || "",
        country: opportunity.country || "",
        city: opportunity.city || "",
        budgetOrSalary: opportunity.budgetOrSalary || "",
        contactPreference: opportunity.contactPreference || "",
        details: opportunity.details as Record<string, unknown> | null,
        status: opportunity.status,
        approvalStatus: opportunity.approvalStatus,
        // Extract type-specific fields from details
        employmentType: details?.employmentType || "full-time",
        experienceRequired: details?.experienceRequired || "",
        skills: Array.isArray(details?.skills) ? details.skills.join(", ") : (details?.skills || ""),
        benefits: Array.isArray(details?.benefits) ? details.benefits.join(", ") : (details?.benefits || ""),
        applicationEmail: details?.applicationEmail || "",
        investmentAmount: details?.investmentAmount || "",
        investmentType: details?.investmentType || "",
        partnershipType: details?.partnershipType || "",
      });
    } else {
      form.reset({
        userId: currentUser?.uid || "",
        type: "job",
        title: "",
        description: "",
        sector: "",
        country: "",
        city: "",
        budgetOrSalary: "",
        contactPreference: "",
        details: null,
        status: "open",
        approvalStatus: "approved",
        employmentType: "full-time",
        experienceRequired: "",
        skills: "",
        benefits: "",
        applicationEmail: "",
        investmentAmount: "",
        investmentType: "",
        partnershipType: "",
      });
    }
  }, [opportunity, currentUser?.uid, form]);

  const saveMutation = useMutation({
    mutationFn: async (data: InsertOpportunity) => {
      if (opportunity) {
        return apiRequest("PATCH", `/api/admin/opportunities/${opportunity.id}`, data);
      } else {
        return apiRequest("POST", "/api/admin/opportunities", data);
      }
    },
    onSuccess: () => {
      toast({
        title: opportunity ? "Opportunity updated" : "Opportunity created",
        description: opportunity 
          ? "The opportunity has been successfully updated." 
          : "The new opportunity has been created.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      onClose();
      form.reset();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to save opportunity",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = form.handleSubmit((data) => {
    // Start with existing details to preserve unknown fields (especially for collaboration)
    const existingDetails = (opportunity?.details as Record<string, any>) || {};
    const details: Record<string, any> = { ...existingDetails };
    
    // Package type-specific fields into details JSON
    if (data.type === "job") {
      details.employmentType = data.employmentType;
      details.experienceRequired = data.experienceRequired;
      details.skills = data.skills ? data.skills.split(",").map(s => s.trim()).filter(Boolean) : [];
      details.benefits = data.benefits ? data.benefits.split(",").map(s => s.trim()).filter(Boolean) : [];
      details.applicationEmail = data.applicationEmail;
      
      // Clean up fields from other types
      delete details.investmentAmount;
      delete details.investmentType;
      delete details.partnershipType;
    } else if (data.type === "investment") {
      details.investmentAmount = data.investmentAmount;
      details.investmentType = data.investmentType;
      
      // Clean up fields from other types
      delete details.employmentType;
      delete details.experienceRequired;
      delete details.skills;
      delete details.benefits;
      delete details.applicationEmail;
      delete details.partnershipType;
    } else if (data.type === "partnership") {
      details.partnershipType = data.partnershipType;
      
      // Clean up fields from other types
      delete details.employmentType;
      delete details.experienceRequired;
      delete details.skills;
      delete details.benefits;
      delete details.applicationEmail;
      delete details.investmentAmount;
      delete details.investmentType;
    } else if (data.type === "collaboration") {
      // For collaboration, preserve any existing unknown fields but clean up known type-specific fields
      delete details.employmentType;
      delete details.experienceRequired;
      delete details.skills;
      delete details.benefits;
      delete details.applicationEmail;
      delete details.investmentAmount;
      delete details.investmentType;
      delete details.partnershipType;
    }

    // Remove the extra fields from the main data object
    const { 
      employmentType, 
      experienceRequired, 
      skills, 
      benefits, 
      applicationEmail,
      investmentAmount,
      investmentType,
      partnershipType,
      ...opportunityData 
    } = data;

    saveMutation.mutate({
      ...opportunityData,
      userId: currentUser?.uid || "",
      details: Object.keys(details).length > 0 ? details : null,
    });
  });

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" data-testid="dialog-opportunity-form">
        <DialogHeader>
          <DialogTitle>{opportunity ? "Edit Opportunity" : "Add New Opportunity"}</DialogTitle>
          <DialogDescription>
            {opportunity 
              ? "Update the opportunity details below." 
              : "Fill in the details to create a new opportunity."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Opportunity Type</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-opportunity-type">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="job">Job</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                      <SelectItem value="partnership">Partnership</SelectItem>
                      <SelectItem value="collaboration">Collaboration</SelectItem>
                    </SelectContent>
                  </Select>
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
                    <Input {...field} placeholder="Opportunity title" data-testid="input-opportunity-title" />
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
                      placeholder="Describe the opportunity" 
                      rows={4}
                      data-testid="textarea-opportunity-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Job-specific fields */}
            {form.watch("type") === "job" && (
              <>
                <FormField
                  control={form.control}
                  name="employmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Employment Type</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger data-testid="select-employment-type">
                            <SelectValue placeholder="Select employment type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="full-time">Full-time</SelectItem>
                          <SelectItem value="part-time">Part-time</SelectItem>
                          <SelectItem value="remote">Remote</SelectItem>
                          <SelectItem value="contract">Contract</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="experienceRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Experience Required (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. 5+ years in software development" data-testid="input-experience-required" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="skills"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Required Skills (Optional, comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. React, TypeScript, Node.js" data-testid="input-skills" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="benefits"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Benefits (Optional, comma-separated)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Health insurance, 401k, Remote work" data-testid="input-benefits" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="applicationEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Application Email</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="e.g. careers@company.com" data-testid="input-application-email" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Investment-specific fields */}
            {form.watch("type") === "investment" && (
              <>
                <FormField
                  control={form.control}
                  name="investmentAmount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Amount Sought (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. $500,000 - $1,000,000" data-testid="input-investment-amount" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="investmentType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Investment Type (Optional)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. Equity, Debt, Convertible Note" data-testid="input-investment-type" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </>
            )}

            {/* Partnership-specific fields */}
            {form.watch("type") === "partnership" && (
              <FormField
                control={form.control}
                name="partnershipType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Partnership Type (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="e.g. Strategic, Financial, Technology" data-testid="input-partnership-type" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="sector"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Sector (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="e.g., Technology, Finance" data-testid="input-opportunity-sector" />
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
                    <FormLabel>Budget/Salary (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="e.g., $50,000 - $80,000" data-testid="input-opportunity-budget" />
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
                    <FormLabel>Country (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="Country" data-testid="input-opportunity-country" />
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
                    <FormLabel>City (Optional)</FormLabel>
                    <FormControl>
                      <Input {...field} value={field.value || ""} placeholder="City" data-testid="input-opportunity-city" />
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
                  <FormLabel>Contact Preference (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} value={field.value || ""} placeholder="Email, phone, etc." data-testid="input-opportunity-contact" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-opportunity-status">
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="open">Open</SelectItem>
                        <SelectItem value="closed">Closed</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="approvalStatus"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Approval Status</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-opportunity-approval">
                          <SelectValue placeholder="Select approval status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={saveMutation.isPending}
                data-testid="button-cancel-opportunity"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={saveMutation.isPending}
                data-testid="button-save-opportunity"
              >
                {saveMutation.isPending ? "Saving..." : (opportunity ? "Update" : "Create")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteOpportunityDialogProps {
  opportunityId: string | null;
  onClose: () => void;
}

function DeleteOpportunityDialog({ opportunityId, onClose }: DeleteOpportunityDialogProps) {
  const { toast } = useToast();

  const deleteMutation = useMutation({
    mutationFn: async () => {
      if (!opportunityId) return;
      return apiRequest("DELETE", `/api/admin/opportunities/${opportunityId}`);
    },
    onSuccess: () => {
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been permanently removed.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/opportunities"] });
      queryClient.invalidateQueries({ queryKey: ["/api/opportunities"] });
      onClose();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to delete opportunity",
        variant: "destructive",
      });
    },
  });

  const handleDelete = () => {
    deleteMutation.mutate();
  };

  return (
    <Dialog open={!!opportunityId} onOpenChange={onClose}>
      <DialogContent data-testid="dialog-delete-opportunity">
        <DialogHeader>
          <DialogTitle>Delete Opportunity</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete this opportunity? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button
            variant="outline"
            onClick={onClose}
            disabled={deleteMutation.isPending}
            data-testid="button-cancel-delete"
          >
            Cancel
          </Button>
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteMutation.isPending}
            data-testid="button-confirm-delete"
          >
            {deleteMutation.isPending ? "Deleting..." : "Delete"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
