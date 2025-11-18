import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { createBusinessOpportunity } from "@/lib/firestoreUtils";
import { Lightbulb, DollarSign } from "lucide-react";

export default function BusinessCreate() {
  const { currentUser } = useAuth();
  const { hasRole } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    opportunityType: "investment" as "investment" | "partnership" | "acquisition" | "franchise",
    industry: "",
    location: "",
    fundingRequired: "",
    currency: "USD",
    equity: "",
    returnPotential: "",
    timeline: "",
    keyHighlights: "",
  });

  if (!hasRole("businessOwner")) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>Only business owners can post opportunities.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/dashboard")} data-testid="button-go-dashboard">
                Go to Dashboard
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!formData.title || !formData.description || !formData.industry) {
      toast({
        title: "Missing required fields",
        description: "Please fill in title, description, and industry.",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const opportunityData = {
        businessOwnerId: currentUser.uid,
        title: formData.title,
        description: formData.description,
        opportunityType: formData.opportunityType,
        industry: formData.industry,
        location: formData.location,
        fundingRequired: formData.fundingRequired ? parseInt(formData.fundingRequired) : undefined,
        currency: formData.currency,
        equity: formData.equity,
        returnPotential: formData.returnPotential,
        timeline: formData.timeline,
        keyHighlights: formData.keyHighlights.split("\n").filter((h) => h.trim()),
        status: "open" as const,
        approvalStatus: "pending" as const,
        interestedInvestors: [],
      };

      const opportunityId = await createBusinessOpportunity(opportunityData);

      toast({
        title: "Opportunity posted successfully!",
        description: "Your business opportunity is now live and pending approval.",
      });

      setLocation(`/business/${opportunityId}`);
    } catch (error) {
      console.error("Error creating opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to create opportunity. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-3xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Lightbulb className="w-6 h-6" />
                Post a Business Opportunity
              </CardTitle>
              <CardDescription>Share your business opportunity with investors</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="title">Opportunity Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      placeholder="e.g., Tech Startup Seeking Series A Funding"
                      required
                      data-testid="input-opportunity-title"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      placeholder="Describe your business, the opportunity, market potential, and why investors should be interested..."
                      rows={6}
                      required
                      data-testid="input-opportunity-description"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="opportunityType">Opportunity Type</Label>
                      <Select
                        value={formData.opportunityType}
                        onValueChange={(value: any) => setFormData({ ...formData, opportunityType: value })}
                      >
                        <SelectTrigger data-testid="select-opportunity-type">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="investment">Investment</SelectItem>
                          <SelectItem value="partnership">Partnership</SelectItem>
                          <SelectItem value="acquisition">Acquisition</SelectItem>
                          <SelectItem value="franchise">Franchise</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="industry">Industry *</Label>
                      <Input
                        id="industry"
                        value={formData.industry}
                        onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                        placeholder="e.g., Technology, Healthcare"
                        required
                        data-testid="input-industry"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="location">Location</Label>
                    <Input
                      id="location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      placeholder="e.g., San Francisco, CA"
                      data-testid="input-location"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fundingRequired">Funding Required</Label>
                      <Input
                        id="fundingRequired"
                        type="number"
                        value={formData.fundingRequired}
                        onChange={(e) => setFormData({ ...formData, fundingRequired: e.target.value })}
                        placeholder="500000"
                        data-testid="input-funding-required"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="currency">Currency</Label>
                      <Input
                        id="currency"
                        value={formData.currency}
                        onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                        placeholder="USD"
                        data-testid="input-currency"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="equity">Equity Offered</Label>
                      <Input
                        id="equity"
                        value={formData.equity}
                        onChange={(e) => setFormData({ ...formData, equity: e.target.value })}
                        placeholder="e.g., 10-20%"
                        data-testid="input-equity"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="returnPotential">Return Potential</Label>
                      <Input
                        id="returnPotential"
                        value={formData.returnPotential}
                        onChange={(e) => setFormData({ ...formData, returnPotential: e.target.value })}
                        placeholder="e.g., 3x-5x in 5 years"
                        data-testid="input-return-potential"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="timeline">Timeline</Label>
                    <Input
                      id="timeline"
                      value={formData.timeline}
                      onChange={(e) => setFormData({ ...formData, timeline: e.target.value })}
                      placeholder="e.g., Looking to close in Q2 2025"
                      data-testid="input-timeline"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="keyHighlights">Key Highlights (one per line)</Label>
                    <Textarea
                      id="keyHighlights"
                      value={formData.keyHighlights}
                      onChange={(e) => setFormData({ ...formData, keyHighlights: e.target.value })}
                      placeholder="Strong revenue growth (200% YoY)&#10;Experienced founding team&#10;Proven product-market fit&#10;Strategic partnerships with Fortune 500 companies"
                      rows={4}
                      data-testid="input-key-highlights"
                    />
                  </div>
                </div>

                <div className="flex gap-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setLocation("/dashboard/business-owner")}
                    disabled={loading}
                    data-testid="button-cancel"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" disabled={loading} className="flex-1" data-testid="button-post-opportunity">
                    {loading ? "Posting..." : "Post Opportunity"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
