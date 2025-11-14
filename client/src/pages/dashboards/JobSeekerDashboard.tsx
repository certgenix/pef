import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Search, Briefcase, MapPin, DollarSign, Clock, BookmarkPlus, FileText } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

export default function JobSeekerDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();

  // ✅ FIX: Safe fallback for jobSeekerData - never undefined
  const jobSeekerData = userData?.jobSeekerData || {};
  
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
  if (!hasRole("jobSeeker")) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You need to be a Job Seeker to access this dashboard.</CardDescription>
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

  // ✅ FIX: Show fallback UI if job seeker profile is incomplete
  if (Object.keys(jobSeekerData).length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Profile Incomplete</CardTitle>
              <CardDescription>
                You have not filled out your job seeker information yet.
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

  // ✅ FIX: Safe access to jobSeekerData fields with fallbacks
  const targetRole = jobSeekerData.targetRole || "Not specified";
  const expectedSalary = jobSeekerData.expectedSalary || "Not specified";
  const availability = jobSeekerData.availability || "Not specified";
  const skills = jobSeekerData.skills || [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Job Seeker Dashboard</h1>
          <p className="text-muted-foreground">Find your next career opportunity</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Applications</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">3 awaiting response</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Jobs</CardTitle>
              <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">28</div>
              <p className="text-xs text-muted-foreground">5 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Job Matches</CardTitle>
              <Search className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">45</div>
              <p className="text-xs text-muted-foreground">Based on your profile</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Strength</CardTitle>
              <Briefcase className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">85%</div>
              <p className="text-xs text-muted-foreground">Good visibility</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>Recommended Jobs</CardTitle>
                  <Button variant="outline" size="sm" data-testid="button-search-jobs">
                    <Search className="w-4 h-4 mr-2" />
                    Search More
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    title: "Senior Frontend Developer",
                    company: "TechCorp International",
                    location: "Riyadh, Saudi Arabia",
                    type: "Full-time",
                    salary: "$80k - $120k",
                    posted: "2 days ago",
                    match: "95%"
                  },
                  {
                    title: "React Developer",
                    company: "Digital Solutions Ltd",
                    location: "Remote",
                    type: "Remote",
                    salary: "$70k - $100k",
                    posted: "1 week ago",
                    match: "88%"
                  },
                  {
                    title: "Full Stack Engineer",
                    company: "Innovation Hub",
                    location: "Dubai, UAE",
                    type: "Full-time",
                    salary: "$90k - $130k",
                    posted: "3 days ago",
                    match: "82%"
                  },
                ].map((job, idx) => (
                  <div key={idx} className="p-4 rounded-md border hover-elevate">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{job.title}</h3>
                        <p className="text-muted-foreground mb-2">{job.company}</p>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                        {job.match} Match
                      </Badge>
                    </div>
                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <div className="flex items-center gap-1">
                        <MapPin className="w-4 h-4" />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <Briefcase className="w-4 h-4" />
                        {job.type}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign className="w-4 h-4" />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-4 h-4" />
                        {job.posted}
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" data-testid={`button-apply-${idx}`}>Apply Now</Button>
                      <Button size="sm" variant="outline" data-testid={`button-save-${idx}`}>
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-details-${idx}`}>
                        View Details
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
                  { job: "Product Manager", company: "StartupX", status: "Under Review", date: "2 days ago" },
                  { job: "Tech Lead", company: "Enterprise Co", status: "Interview Scheduled", date: "1 week ago" },
                  { job: "Software Engineer", company: "CloudTech", status: "Application Sent", date: "2 weeks ago" },
                ].map((app, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{app.job}</p>
                      <p className="text-sm text-muted-foreground">{app.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{app.status}</Badge>
                      <span className="text-xs text-muted-foreground">{app.date}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Job Preferences</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Target Role</p>
                  <p className="text-sm text-muted-foreground">{targetRole}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Expected Salary</p>
                  <p className="text-sm text-muted-foreground">{expectedSalary}</p>
                </div>
                <div>
                  <p className="text-sm font-medium mb-1">Availability</p>
                  <p className="text-sm text-muted-foreground">{availability}</p>
                </div>
                {skills.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Skills</p>
                    <div className="flex flex-wrap gap-1">
                      {skills.slice(0, 5).map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <Button className="w-full" variant="outline" size="sm" onClick={() => setLocation("/complete-profile")} data-testid="button-edit-preferences">
                  Edit Preferences
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Tips & Resources</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Resume Tips</p>
                  <p className="text-xs text-muted-foreground">Improve your resume to get more interviews</p>
                  <Button size="sm" variant="ghost" className="h-auto p-0 mt-2" data-testid="button-resume-tips">
                    Learn More →
                  </Button>
                </div>
                <div className="p-3 bg-muted rounded-md">
                  <p className="text-sm font-medium mb-1">Interview Prep</p>
                  <p className="text-xs text-muted-foreground">Practice common interview questions</p>
                  <Button size="sm" variant="ghost" className="h-auto p-0 mt-2" data-testid="button-interview-prep">
                    Start Practicing →
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
