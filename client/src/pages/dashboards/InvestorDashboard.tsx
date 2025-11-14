import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, Target, DollarSign, Briefcase, Building2, Eye, BookmarkPlus } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { useLocation } from "wouter";

export default function InvestorDashboard() {
  const { currentUser, userData, loading: authLoading } = useAuth();
  const { hasRole, isLoading: rolesLoading } = useUserRoles(currentUser?.uid);
  const [, setLocation] = useLocation();

  // ✅ FIX: Safe fallback for investorData - never undefined
  const investorData = userData?.investorData || {};
  
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
  if (!hasRole("investor")) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Access Denied</CardTitle>
              <CardDescription>You need to be an Investor to access this dashboard.</CardDescription>
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

  // ✅ FIX: Show fallback UI if investor profile is incomplete
  if (Object.keys(investorData).length === 0) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Profile Incomplete</CardTitle>
              <CardDescription>
                You have not filled out your investor information yet.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/edit-profile")} data-testid="button-complete-profile">
                Complete Profile
              </Button>
            </CardContent>
          </Card>
        </main>
        <Footer />
      </div>
    );
  }

  // ✅ FIX: Safe access to investorData fields with fallbacks
  const investmentRange = investorData.investmentRange || "Not specified";
  const preferredStage = investorData.preferredStage || "Not specified";
  const investmentFocus = investorData.investmentFocus || [];
  const industries = investorData.industries || [];

  return (
    <div className="min-h-screen">
      <Header />
      <main className="py-8 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Investor Dashboard</h1>
          <p className="text-muted-foreground">Discover and track investment opportunities</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Investments</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">7</div>
              <p className="text-xs text-muted-foreground">Portfolio companies</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Opportunities</CardTitle>
              <Target className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">34</div>
              <p className="text-xs text-muted-foreground">New matches this week</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Saved Deals</CardTitle>
              <BookmarkPlus className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15</div>
              <p className="text-xs text-muted-foreground">Under review</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invested</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">$12.5M</div>
              <p className="text-xs text-muted-foreground">Across portfolio</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <CardTitle>Investment Opportunities</CardTitle>
                  <Button variant="outline" size="sm" data-testid="button-browse-all">
                    Browse All
                  </Button>
                </div>
                <CardDescription>Businesses seeking investment in your focus areas</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  {
                    company: "GreenTech Solutions",
                    industry: "Renewable Energy",
                    stage: "Growth",
                    seeking: "$3M - $5M",
                    revenue: "$5M - $10M",
                    location: "Riyadh, KSA",
                    match: "96%"
                  },
                  {
                    company: "HealthTech Innovations",
                    industry: "Healthcare Technology",
                    stage: "Early",
                    seeking: "$1M - $2M",
                    revenue: "$1M - $3M",
                    location: "Dubai, UAE",
                    match: "92%"
                  },
                  {
                    company: "FinanceFlow Platform",
                    industry: "Fintech",
                    stage: "Growth",
                    seeking: "$4M - $7M",
                    revenue: "$8M - $15M",
                    location: "Jeddah, KSA",
                    match: "88%"
                  },
                ].map((opp, idx) => (
                  <div key={idx} className="p-4 rounded-md border hover-elevate">
                    <div className="flex flex-wrap items-start justify-between gap-2 mb-3">
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-lg mb-1">{opp.company}</h3>
                        <p className="text-sm text-muted-foreground mb-2">{opp.industry}</p>
                      </div>
                      <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
                        {opp.match} Match
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-3 text-sm">
                      <div>
                        <p className="text-muted-foreground">Stage</p>
                        <p className="font-medium">{opp.stage}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Seeking</p>
                        <p className="font-medium">{opp.seeking}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Revenue</p>
                        <p className="font-medium">{opp.revenue}</p>
                      </div>
                      <div className="col-span-2 md:col-span-3">
                        <p className="text-muted-foreground">Location</p>
                        <p className="font-medium">{opp.location}</p>
                      </div>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button size="sm" data-testid={`button-view-deal-${idx}`}>View Deal</Button>
                      <Button size="sm" variant="outline" data-testid={`button-save-deal-${idx}`}>
                        <BookmarkPlus className="w-4 h-4 mr-2" />
                        Save
                      </Button>
                      <Button size="sm" variant="ghost" data-testid={`button-contact-${idx}`}>
                        Contact
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Portfolio Overview</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { company: "TechStartup Inc", invested: "$2M", stage: "Series A", performance: "+45%" },
                  { company: "AI Solutions Ltd", invested: "$1.5M", stage: "Seed", performance: "+32%" },
                  { company: "CloudServices Co", invested: "$3M", stage: "Series B", performance: "+58%" },
                ].map((portfolio, idx) => (
                  <div key={idx} className="flex flex-wrap items-center justify-between gap-2 p-3 rounded-md border">
                    <div className="flex-1 min-w-0">
                      <p className="font-medium">{portfolio.company}</p>
                      <p className="text-sm text-muted-foreground">{portfolio.stage}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm font-medium">{portfolio.invested}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">{portfolio.performance}</p>
                      </div>
                      <Button size="sm" variant="outline" data-testid={`button-portfolio-${idx}`}>
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Investment Profile</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="text-sm font-medium mb-1">Investment Range</p>
                  <p className="text-sm text-muted-foreground">{investmentRange}</p>
                </div>
                {investmentFocus.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Investment Focus</p>
                    <div className="flex flex-wrap gap-1">
                      {investmentFocus.map((focus, idx) => (
                        <Badge key={idx} variant="secondary">{focus}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                {industries.length > 0 && (
                  <div>
                    <p className="text-sm font-medium mb-2">Preferred Industries</p>
                    <div className="flex flex-wrap gap-1">
                      {industries.map((industry, idx) => (
                        <Badge key={idx} variant="secondary">{industry}</Badge>
                      ))}
                    </div>
                  </div>
                )}
                <div>
                  <p className="text-sm font-medium mb-1">Investment Stage</p>
                  <p className="text-sm text-muted-foreground">{preferredStage}</p>
                </div>
                <Button className="w-full" variant="outline" size="sm" onClick={() => setLocation("/edit-profile")} data-testid="button-edit-investor-profile">
                  Edit Profile
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button className="w-full" variant="outline" data-testid="button-search-opportunities">
                  <Target className="w-4 h-4 mr-2" />
                  Search Opportunities
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-view-portfolio">
                  <Briefcase className="w-4 h-4 mr-2" />
                  View Full Portfolio
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-saved-deals">
                  <BookmarkPlus className="w-4 h-4 mr-2" />
                  Saved Deals
                </Button>
                <Button className="w-full" variant="outline" data-testid="button-analytics">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Analytics
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: "New deal matched", time: "1 hour ago" },
                  { action: "Saved opportunity", time: "3 hours ago" },
                  { action: "Portfolio update available", time: "1 day ago" },
                  { action: "New sector report", time: "2 days ago" },
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
