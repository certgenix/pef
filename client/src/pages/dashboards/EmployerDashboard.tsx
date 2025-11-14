import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, Users, Briefcase, TrendingUp, Eye, FileText, Edit } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

export default function EmployerDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();

  // ✅ FIX: Safe fallback for employerData - never undefined
  const employerData = userData?.employerData || {};
  
  // ✅ FIX: Combined loading state - wait for both auth and roles
  const isLoading = authLoading || rolesLoading;

  // ✅ FIX: Show loading spinner while Firestore is fetching data
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Check role access only after loading is complete
  if (!hasRole("employer")) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You need to be an Employer to access this dashboard.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/")} data-testid="button-go-home">
                Go Home
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ FIX: Show fallback UI if employer profile is incomplete
  if (Object.keys(employerData).length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Profile Incomplete</CardTitle>
              <CardDescription>
                You have not filled out your employer information yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/complete-profile")} data-testid="button-complete-profile">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ FIX: Safe access to employerData fields with fallbacks
  const companyName = employerData.companyName || "Not specified";
  const industry = employerData.industry || "Not specified";
  const companySize = employerData.companySize || "Not specified";

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold">Employer Dashboard</h1>
            <Button data-testid="button-post-job">
              <Plus className="w-4 h-4 mr-2" />
              Post New Job
            </Button>
          </div>
          <p className="text-muted-foreground">Manage your job postings and find talent</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Jobs</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">2 pending approval</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">156</div>
              <p className="text-xs text-muted-foreground">+23 this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Views</CardTitle>
              <Eye className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2,847</div>
              <p className="text-xs text-muted-foreground">+12% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Shortlisted</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">Across all jobs</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Active Job Postings</CardTitle>
                <CardDescription>Manage your current openings</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Senior Software Engineer",
                    status: "approved",
                    applications: 45,
                    views: 892,
                    posted: "2 weeks ago"
                  },
                  {
                    title: "Product Manager",
                    status: "approved",
                    applications: 32,
                    views: 654,
                    posted: "1 week ago"
                  },
                  {
                    title: "UI/UX Designer",
                    status: "pending",
                    applications: 0,
                    views: 0,
                    posted: "1 day ago"
                  },
                ].map((job, idx) => (
                  <div key={idx} className="p-4 rounded-md border hover-elevate">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                        <p className="text-sm text-muted-foreground">Posted {job.posted}</p>
                      </div>
                      <Badge 
                        className={
                          job.status === "approved" 
                            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100"
                            : "bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100"
                        }
                      >
                        {job.status === "approved" ? "Live" : "Pending Approval"}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-4 mb-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Applications</p>
                        <p className="font-semibold">{job.applications}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Views</p>
                        <p className="font-semibold">{job.views}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" data-testid={`button-view-applicants-${idx}`}>
                        View Applicants
                      </Button>
                      <Button size="sm" variant="outline" data-testid={`button-edit-job-${idx}`}>
                        <Edit className="w-4 h-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-job-details-${idx}`}>
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Applications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  {
                    applicant: "Ahmed Al-Rashid",
                    job: "Senior Software Engineer",
                    experience: "8 years",
                    match: "92%",
                    time: "2 hours ago"
                  },
                  {
                    applicant: "Sarah Johnson",
                    job: "Product Manager",
                    experience: "6 years",
                    match: "88%",
                    time: "5 hours ago"
                  },
                  {
                    applicant: "Mohammed Hassan",
                    job: "Senior Software Engineer",
                    experience: "10 years",
                    match: "95%",
                    time: "1 day ago"
                  },
                ].map((app, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{app.applicant}</p>
                      <p className="text-sm text-muted-foreground">{app.job}</p>
                      <p className="text-xs text-muted-foreground">{app.experience} experience</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                        {app.match}
                      </Badge>
                      <Button size="sm" data-testid={`button-review-${idx}`}>Review</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Company Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Company Name</p>
                  <p className="text-sm text-muted-foreground">{companyName}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Industry</p>
                  <p className="text-sm text-muted-foreground">{industry}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Company Size</p>
                  <p className="text-sm text-muted-foreground">{companySize}</p>
                </div>
                <Button className="w-full" variant="outline" size="sm" onClick={() => setLocation("/complete-profile")} data-testid="button-edit-company">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Hiring Analytics</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm">Average Time to Hire</span>
                  <span className="text-sm font-semibold">28 days</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Application Rate</span>
                  <span className="text-sm font-semibold">19.5/job</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm">Response Rate</span>
                  <span className="text-sm font-semibold">67%</span>
                </div>
                <Button className="w-full" variant="outline" size="sm" data-testid="button-view-analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" data-testid="button-search-candidates">
                  <Users className="w-4 h-4 mr-2" />
                  Search Candidates
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-draft-jobs">
                  <FileText className="w-4 h-4 mr-2" />
                  View Draft Jobs
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
