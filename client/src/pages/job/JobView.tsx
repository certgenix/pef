import { useEffect, useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { useLocation, useRoute } from "wouter";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import {
  getJobPost,
  getUserData,
  createApplication,
  getApplicationsByUser,
  deleteJobPost,
  updateJobPost,
} from "@/lib/firestoreUtils";
import type { FirestoreJobPost, FirestoreUser, FirestoreApplication } from "@shared/firestoreTypes";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Clock,
  CheckCircle,
  Building2,
  Edit,
  Trash2,
  Users,
} from "lucide-react";
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

export default function JobView() {
  const [, params] = useRoute("/job/:id");
  const jobId = params?.id;
  const { currentUser } = useAuth();
  const { hasRole } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const [job, setJob] = useState<FirestoreJobPost | null>(null);
  const [employer, setEmployer] = useState<FirestoreUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const isOwner = currentUser?.uid === job?.employerId;

  useEffect(() => {
    loadJobData();
  }, [jobId]);

  const loadJobData = async () => {
    if (!jobId) return;

    try {
      setLoading(true);
      const jobData = await getJobPost(jobId);
      if (!jobData) {
        toast({
          title: "Job not found",
          description: "This job posting doesn't exist or has been removed.",
          variant: "destructive",
        });
        setLocation("/dashboard");
        return;
      }

      setJob(jobData);

      const employerData = await getUserData(jobData.employerId);
      setEmployer(employerData);

      if (currentUser) {
        const applications = await getApplicationsByUser(currentUser.uid);
        const applied = applications.some((app) => app.jobPostId === jobId);
        setHasApplied(applied);
      }
    } catch (error) {
      console.error("Error loading job:", error);
      toast({
        title: "Error",
        description: "Failed to load job details.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleApply = async () => {
    if (!currentUser || !jobId) return;

    setApplying(true);
    try {
      await createApplication({
        userId: currentUser.uid,
        jobPostId: jobId,
        status: "applied",
      });

      setHasApplied(true);
      toast({
        title: "Application submitted!",
        description: "Your application has been sent to the employer.",
      });

      loadJobData();
    } catch (error) {
      console.error("Error applying to job:", error);
      toast({
        title: "Error",
        description: "Failed to submit application. Please try again.",
        variant: "destructive",
      });
    } finally {
      setApplying(false);
    }
  };

  const handleDelete = async () => {
    if (!jobId) return;

    setDeleting(true);
    try {
      await deleteJobPost(jobId);
      toast({
        title: "Job deleted",
        description: "The job posting has been removed.",
      });
      setLocation("/dashboard/employer");
    } catch (error) {
      console.error("Error deleting job:", error);
      toast({
        title: "Error",
        description: "Failed to delete job posting.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
      setShowDeleteDialog(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!jobId || !job) return;

    try {
      const newStatus = job.status === "open" ? "closed" : "open";
      await updateJobPost(jobId, { status: newStatus });
      setJob({ ...job, status: newStatus });
      toast({
        title: "Status updated",
        description: `Job is now ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating job status:", error);
      toast({
        title: "Error",
        description: "Failed to update job status.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading job details...</p>
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="pt-24 md:pt-28 pb-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Job Not Found</CardTitle>
              <CardDescription>This job posting doesn't exist.</CardDescription>
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
                    <CardTitle className="text-2xl" data-testid="text-job-title">
                      {job.title}
                    </CardTitle>
                    <Badge variant={job.status === "open" ? "default" : "secondary"} data-testid="badge-job-status">
                      {job.status}
                    </Badge>
                    {job.approvalStatus === "pending" && (
                      <Badge variant="outline" data-testid="badge-approval-status">
                        Pending Approval
                      </Badge>
                    )}
                  </div>
                  {employer && (
                    <CardDescription className="flex items-center gap-2">
                      <Building2 className="w-4 h-4" />
                      {employer.employerData?.companyName || employer.fullName}
                    </CardDescription>
                  )}
                </div>

                {isOwner ? (
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setLocation(`/job/${jobId}/applicants`)}
                      data-testid="button-view-applicants"
                    >
                      <Users className="w-4 h-4 mr-2" />
                      Applicants ({job.applicants?.length || 0})
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleToggleStatus}
                      data-testid="button-toggle-status"
                    >
                      {job.status === "open" ? "Close" : "Reopen"}
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
                ) : hasRole("jobSeeker") ? (
                  <Button
                    onClick={handleApply}
                    disabled={applying || hasApplied || job.status !== "open"}
                    data-testid="button-apply"
                  >
                    {hasApplied ? (
                      <>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Applied
                      </>
                    ) : applying ? (
                      "Applying..."
                    ) : (
                      "Apply Now"
                    )}
                  </Button>
                ) : null}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <MapPin className="w-4 h-4 text-muted-foreground" />
                  <span>{job.location}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <Clock className="w-4 h-4 text-muted-foreground" />
                  <span className="capitalize">{job.employmentType?.replace("-", " ")}</span>
                </div>
                {(job.salaryMin || job.salaryMax) && (
                  <div className="flex items-center gap-2 text-sm">
                    <DollarSign className="w-4 h-4 text-muted-foreground" />
                    <span>
                      {job.salaryCurrency} {job.salaryMin?.toLocaleString()}
                      {job.salaryMax && ` - ${job.salaryMax.toLocaleString()}`}
                    </span>
                  </div>
                )}
              </div>

              <Separator />

              <div>
                <h3 className="font-semibold mb-2">Job Description</h3>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{job.description}</p>
              </div>

              {job.requirements && job.requirements.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Requirements</h3>
                  <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
                    {job.requirements.map((req, index) => (
                      <li key={index}>{req}</li>
                    ))}
                  </ul>
                </div>
              )}

              {job.skills && job.skills.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Required Skills</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.skills.map((skill, index) => (
                      <Badge key={index} variant="secondary">
                        {skill}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {job.benefits && job.benefits.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Benefits</h3>
                  <div className="flex flex-wrap gap-2">
                    {job.benefits.map((benefit, index) => (
                      <Badge key={index} variant="outline">
                        {benefit}
                      </Badge>
                    ))}
                  </div>
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
            <AlertDialogTitle>Delete Job Posting?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the job posting and all applications.
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
