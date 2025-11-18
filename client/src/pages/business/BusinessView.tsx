import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getBusinessOpportunity,
  getUserData,
  createInvestorInterest,
  getInvestorInterestByUser,
  deleteBusinessOpportunity,
  updateBusinessOpportunity,
} from "@/lib/firestoreUtils";
import type { FirestoreBusinessOpportunity, FirestoreUser, FirestoreInvestorInterest } from "@shared/firestoreTypes";
import { Lightbulb, MapPin, DollarSign, TrendingUp, Clock, CheckCircle, Building2, Trash2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function BusinessView() {
  const [, params] = useRoute("/business/:id");
  const opportunityId = params?.id;
  const { currentUser } = useAuth();
  const { hasRole } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [opportunity, setOpportunity] = useState<FirestoreBusinessOpportunity | null>(null);
  const [businessOwner, setBusinessOwner] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [expressing, setExpressing] = useState(false);
  const [hasExpressed, setHasExpressed] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUser?.uid === opportunity?.businessOwnerId;

  useEffect(() => {
    loadOpportunityData();
  }, [opportunityId]);

  const loadOpportunityData = async () => {
    if (!opportunityId) return;

    try {
      setLoading(true);
      const oppData = await getBusinessOpportunity(opportunityId);
      if (!oppData) {
        toast({
          title: "Opportunity not found",
          description: "This opportunity doesn't exist or has been removed.",
          variant: "destructive",
        });
        setLocation("/dashboard");
        return;
      }

      setOpportunity(oppData);

      const ownerData = await getUserData(oppData.businessOwnerId);
      setBusinessOwner(ownerData);

      if (currentUser) {
        const interests = await getInvestorInterestByUser(currentUser.uid);
        const expressed = interests.some((interest: FirestoreInvestorInterest) => interest.businessOpportunityId === opportunityId);
        setHasExpressed(expressed);
      }
    } catch (error) {
      console.error("Error loading opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to load opportunity details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExpressInterest = async () => {
    if (!currentUser || !opportunityId) return;

    setExpressing(true);
    try {
      await createInvestorInterest({
        userId: currentUser.uid,
        businessOpportunityId: opportunityId,
        status: "interested",
      });

      setHasExpressed(true);
      toast({
        title: "Interest expressed!",
        description: "The business owner will be notified of your interest.",
      });

      loadOpportunityData();
    } catch (error) {
      console.error("Error expressing interest:", error);
      toast({
        title: "Error",
        description: "Failed to express interest. Please try again.",
        variant: "destructive",
      });
    } finally {
      setExpressing(false);
    }
  };

  const handleDelete = async () => {
    if (!opportunityId) return;

    setDeleting(true);
    try {
      await deleteBusinessOpportunity(opportunityId);
      toast({
        title: "Opportunity deleted",
        description: "The opportunity has been removed.",
      });
      setLocation("/dashboard/business-owner");
    } catch (error) {
      console.error("Error deleting opportunity:", error);
      toast({
        title: "Error",
        description: "Failed to delete opportunity.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!opportunityId || !opportunity) return;

    try {
      const newStatus = opportunity.status === "open" ? "closed" : "open";
      await updateBusinessOpportunity(opportunityId, { status: newStatus });
      setOpportunity({ ...opportunity, status: newStatus });
      toast({
        title: "Status updated",
        description: `Opportunity is now ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Error",
        description: "Failed to update status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading opportunity...</p>
        </div>
      </div>
    );
  }

  if (!opportunity) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Opportunity Not Found</CardTitle>
              <CardDescription>This opportunity doesn't exist.</CardDescription>
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

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-4xl mx-auto space-y-6">
          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <CardTitle className="text-2xl" data-testid="text-opportunity-title">
                      {opportunity.title}
                    </CardTitle>
                    <Badge variant={opportunity.status === "open" ? "default" : "secondary"} data-testid="badge-status">
                      {opportunity.status}
                    </Badge>
                    {opportunity.approvalStatus === "pending" && (
                      <Badge variant="outline" data-testid="badge-approval">
                        Pending Approval
                      </Badge>
                    )}
                    <Badge variant="outline" className="capitalize">
                      {opportunity.opportunityType}
                    </Badge>
                  </div>
                  {businessOwner && (
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {businessOwner.businessOwnerData?.businessName || businessOwner.fullName}
                    </CardDescription>
                  )}
                </div>

                {isOwner ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleStatus}
                      data-testid="button-toggle-status"
                    >
                      {opportunity.status === "open" ? "Close" : "Reopen"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowDeleteDialog(true)}
                      data-testid="button-delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                ) : hasRole("investor") ? (
                  <Button
                    onClick={handleExpressInterest}
                    disabled={expressing || hasExpressed || opportunity.status !== "open"}
                    data-testid="button-express-interest"
                  >
                    {hasExpressed ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Interest Expressed
                      </>
                    ) : expressing ? (
                      "Expressing..."
                    ) : (
                      "Express Interest"
                    )}
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <Building2 className="w-4 h-4 text-muted-foreground" />
                  <span>{opportunity.industry}</span>
                </div>
                {opportunity.location && (
                  <div className="flex items-center gap-2 text-sm">
                    <MapPin className="w-4 h-4 text-muted-foreground" />
                    <span>{opportunity.location}</span>
                  </div>
                )}
                {opportunity.fundingRequired && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {opportunity.currency} {opportunity.fundingRequired.toLocaleString()}
                    </span>
                  </div>
                )}
              </div>

              {(opportunity.equity || opportunity.returnPotential || opportunity.timeline) && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  {opportunity.equity && (
                    <div className="text-sm">
                      <span className="font-medium">Equity:</span> {opportunity.equity}
                    </div>
                  )}
                  {opportunity.returnPotential && (
                    <div className="text-sm">
                      <span className="font-medium">Return:</span> {opportunity.returnPotential}
                    </div>
                  )}
                  {opportunity.timeline && (
                    <div className="text-sm">
                      <span className="font-medium">Timeline:</span> {opportunity.timeline}
                    </div>
                  )}
                </div>
              )}

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Opportunity Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{opportunity.description}</p>
              </div>

              {opportunity.keyHighlights && opportunity.keyHighlights.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Key Highlights</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {opportunity.keyHighlights.map((highlight, index) => (
                      <li key={index}>{highlight}</li>
                    ))}
                  </ul>
                </div>
              )}

              {isOwner && opportunity.interestedInvestors && opportunity.interestedInvestors.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">
                    Interested Investors ({opportunity.interestedInvestors.length})
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    View investor details in your dashboard to connect with interested parties.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Opportunity?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the opportunity and all investor interests.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={deleting}>
              {deleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
