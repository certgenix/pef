import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Briefcase, Award, Building2, TrendingUp, Users, Edit, Plus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

export default function ProfessionalDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();

  // ✅ FIX: Safe fallback for professionalData - never undefined
  const professionalData = userData?.professionalData || {};
  
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
  if (!hasRole("professional")) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You need to be a Professional to access this dashboard.</CardDescription>
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

  // ✅ FIX: Show fallback UI if professional profile is incomplete
  if (Object.keys(professionalData).length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Profile Incomplete</CardTitle>
              <CardDescription>
                You have not filled out your professional information yet.
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

  // ✅ FIX: Safe access to professionalData fields with fallbacks
  const currentJobTitle = professionalData.title || "Not specified";
  const currentEmployer = professionalData.experience || "Not specified";
  const skills = professionalData.skills || [];
  const certifications = professionalData.certifications || [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-2">
            <h1 className="text-3xl font-bold">Professional Dashboard</h1>
            <Button onClick={() => setLocation("/complete-profile")} data-testid="button-edit-profile">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          </div>
          <p className="text-muted-foreground">Manage your professional profile and network</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile Views</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1,234</div>
              <p className="text-xs text-muted-foreground">+20% from last month</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Connections</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">342</div>
              <p className="text-xs text-muted-foreground">+12 new this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">8</div>
              <p className="text-xs text-muted-foreground">Relevant matches</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Skills Verified</CardTitle>
              <Award className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{skills.length}</div>
              <p className="text-xs text-muted-foreground">Total skills</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Professional Profile</CardTitle>
                <CardDescription>Your professional information and experience</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Current Position</h3>
                  <div className="flex items-start gap-3">
                    <Building2 className="w-5 h-5 text-muted-foreground mt-1" />
                    <div>
                      <p className="font-medium">{currentJobTitle}</p>
                      <p className="text-sm text-muted-foreground">{currentEmployer}</p>
                    </div>
                  </div>
                </div>

                {skills.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Skills & Expertise</h3>
                    <div className="flex flex-wrap gap-2">
                      {skills.map((skill, idx) => (
                        <Badge key={idx} variant="secondary">{skill}</Badge>
                      ))}
                    </div>
                  </div>
                )}

                {certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold mb-2">Certifications</h3>
                    <div className="space-y-2">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <Award className="w-4 h-4 text-primary" />
                          <span className="text-sm">{cert}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>Opportunities For You</CardTitle>
                  <Button variant="outline" size="sm" data-testid="button-view-all-opportunities">
                    View All
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { title: "Senior Developer Position", company: "GlobalTech", type: "Job", match: "95%" },
                  { title: "Tech Leadership Workshop", company: "PEF Events", type: "Event", match: "88%" },
                  { title: "Partnership Opportunity", company: "StartupX", type: "Partnership", match: "75%" },
                ].map((opp, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-4 p-3 rounded-md hover-elevate">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{opp.title}</p>
                      <p className="text-sm text-muted-foreground">{opp.company}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary">{opp.type}</Badge>
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                        {opp.match} Match
                      </Badge>
                      <Button size="sm" data-testid={`button-view-opportunity-${idx}`}>View</Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" onClick={() => setLocation("/complete-profile")} data-testid="button-update-skills">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Update Skills
                </Button>
                <Button className="w-full" variant="outline" onClick={() => setLocation("/complete-profile")} data-testid="button-add-certification">
                  <Award className="w-4 h-4 mr-2" />
                  Add Certification
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-network">
                  <Users className="w-4 h-4 mr-2" />
                  Explore Network
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-post-update">
                  <Plus className="w-4 h-4 mr-2" />
                  Post Update
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: "Profile viewed by TechCorp", time: "2 hours ago" },
                  { action: "New connection request", time: "5 hours ago" },
                  { action: "Skill endorsed: React", time: "1 day ago" },
                  { action: "Posted professional update", time: "2 days ago" },
                ].map((activity, idx) => (
                  <div key={idx} className="text-sm">
                    <p className="font-medium">{activity.action}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
