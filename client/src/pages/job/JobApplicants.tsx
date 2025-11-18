import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getJobPost,
  getApplicationsByJobPost,
  getUserData,
  updateApplicationStatus,
} from "@/lib/firestoreUtils";
import type { FirestoreJobPost, FirestoreApplication, FirestoreUser } from "@shared/firestoreTypes";
import { Users, Mail, Phone, Calendar, ArrowLeft } from "lucide-react";
import { format } from "date-fns";

type ApplicationWithUser = FirestoreApplication & {
  user: FirestoreUser | null;
};

export default function JobApplicants() {
  const [, params] = useRoute("/job/:id/applicants");
  const jobId = params?.id;
  const { currentUser } = useAuth();
  const { hasRole } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [job, setJob] = useState<FirestoreJobPost | null>(null);
  const [applications, setApplications] = useState<ApplicationWithUser[]>([]);
  const [loading, setLoading] = useState(true);

  const isOwner = currentUser?.uid === job?.employerId;

  useEffect(() => {
    loadData();
  }, [jobId]);

  const loadData = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const jobData = await getJobPost(jobId);
      if (!jobData) {
        toast({
          title: "Job not found",
          description: "This job posting doesn't exist.",
          variant: "destructive",
        });
        setLocation("/dashboard");
        return;
      }

      setJob(jobData);

      if (currentUser?.uid !== jobData.employerId) {
        toast({
          title: "Access denied",
          description: "Only the job owner can view applicants.",
          variant: "destructive",
        });
        setLocation(`/job/${jobId}`);
        return;
      }

      const apps = await getApplicationsByJobPost(jobId);
      
      const appsWithUsers = await Promise.all(
        apps.map(async (app) => {
          const user = await getUserData(app.userId);
          return { ...app, user };
        })
      );

      setApplications(appsWithUsers);
    } catch (error) {
      console.error("Error loading applicants:", error);
      toast({
        title: "Error",
        description: "Failed to load applicants.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (applicationId: string, newStatus: FirestoreApplication["status"]) => {
    try {
      await updateApplicationStatus(applicationId, newStatus);
      
      setApplications((prev) =>
        prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
      );

      toast({
        title: "Status updated",
        description: "Application status has been changed.",
      });
    } catch (error) {
      console.error("Error updating application status:", error);
      toast({
        title: "Error",
        description: "Failed to update application status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading applicants...</p>
        </div>
      </div>
    );
  }

  if (!job || !isOwner) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You don't have permission to view this page.</CardDescription>
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

  const statusBadgeVariant = (status: string) => {
    switch (status) {
      case "offer":
        return "default";
      case "rejected":
        return "destructive";
      case "interview":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="min-h-screen">
      <Header />
      <main className="pt-24 md:pt-28 pb-16 px-4">
        <div className="max-w-5xl mx-auto space-y-6">
          <div className="flex items-center gap-4">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setLocation(`/job/${jobId}`)}
              data-testid="button-back"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Job
            </Button>
          </div>

          <Card>
            <CardHeader>
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl flex items-center gap-2">
                    <Users className="w-6 h-6" />
                    Applicants for {job.title}
                  </CardTitle>
                  <CardDescription>{applications.length} total applications</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="font-semibold mb-2">No applications yet</h3>
                  <p className="text-sm text-muted-foreground">
                    Applications will appear here once job seekers apply to your job posting.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications.map((application) => (
                    <Card key={application.id} className="hover-elevate">
                      <CardContent className="pt-6">
                        <div className="flex flex-wrap items-start justify-between gap-4">
                          <div className="flex items-start gap-4 flex-1">
                            <Avatar>
                              <AvatarFallback>
                                {application.user?.fullName
                                  ?.split(" ")
                                  .map((n) => n[0])
                                  .join("")
                                  .toUpperCase() || "?"}
                              </AvatarFallback>
                            </Avatar>

                            <div className="flex-1 space-y-2">
                              <div>
                                <h3 className="font-semibold" data-testid={`text-applicant-name-${application.id}`}>
                                  {application.user?.fullName || "Unknown"}
                                </h3>
                                {application.user?.headline && (
                                  <p className="text-sm text-muted-foreground">{application.user.headline}</p>
                                )}
                              </div>

                              <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                                {application.user?.email && (
                                  <div className="flex items-center gap-1">
                                    <Mail className="w-4 h-4" />
                                    <span>{application.user.email}</span>
                                  </div>
                                )}
                                {application.user?.phone && (
                                  <div className="flex items-center gap-1">
                                    <Phone className="w-4 h-4" />
                                    <span>{application.user.phone}</span>
                                  </div>
                                )}
                                <div className="flex items-center gap-1">
                                  <Calendar className="w-4 h-4" />
                                  <span>
                                    Applied{" "}
                                    {format(
                                      new Date(application.appliedAt),
                                      "MMM d, yyyy"
                                    )}
                                  </span>
                                </div>
                              </div>

                              {application.user?.jobSeekerData && (
                                <div className="pt-2">
                                  <div className="text-sm space-y-1">
                                    {application.user.jobSeekerData.targetRole && (
                                      <p>
                                        <span className="font-medium">Target Role:</span>{" "}
                                        {application.user.jobSeekerData.targetRole}
                                      </p>
                                    )}
                                    {application.user.jobSeekerData.expectedSalary && (
                                      <p>
                                        <span className="font-medium">Expected Salary:</span>{" "}
                                        {application.user.jobSeekerData.expectedSalary}
                                      </p>
                                    )}
                                    {application.user.jobSeekerData.availability && (
                                      <p>
                                        <span className="font-medium">Availability:</span>{" "}
                                        {application.user.jobSeekerData.availability}
                                      </p>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="flex flex-col items-end gap-2">
                            <Badge variant={statusBadgeVariant(application.status)}>
                              {application.status.replace("_", " ")}
                            </Badge>
                            <Select
                              value={application.status}
                              onValueChange={(value: any) => handleStatusChange(application.id, value)}
                            >
                              <SelectTrigger className="w-40" data-testid={`select-status-${application.id}`}>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="applied">Applied</SelectItem>
                                <SelectItem value="under_review">Under Review</SelectItem>
                                <SelectItem value="interview">Interview</SelectItem>
                                <SelectItem value="offer">Offer</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Footer />
    </div>
  );
}
