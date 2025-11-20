import { useAuth } from "@/contexts/AuthContext";
import { useUserRoles } from "@/hooks/useUserRoles";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { RoleBadgeList } from "@/components/RoleBadge";
import { Briefcase, Search, Building2, Handshake, TrendingUp, ArrowRight, Shield } from "lucide-react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { useLocation } from "wouter";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useEffect } from "react";

const roleDashboards = [
  {
    role: "professional" as const,
    title: "Professional Dashboard",
    description: "Manage your professional profile and network",
    icon: Briefcase,
    path: "/dashboard/professional",
    color: "bg-blue-100 dark:bg-blue-900",
  },
  {
    role: "jobSeeker" as const,
    title: "Job Seeker Dashboard",
    description: "Find and track job opportunities",
    icon: Search,
    path: "/dashboard/job-seeker",
    color: "bg-green-100 dark:bg-green-900",
  },
  {
    role: "employer" as const,
    title: "Employer Dashboard",
    description: "Post jobs and manage applicants",
    icon: Building2,
    path: "/dashboard/employer",
    color: "bg-purple-100 dark:bg-purple-900",
  },
  {
    role: "businessOwner" as const,
    title: "Business Owner Dashboard",
    description: "Grow your business and find partnerships",
    icon: Handshake,
    path: "/dashboard/business-owner",
    color: "bg-orange-100 dark:bg-orange-900",
  },
  {
    role: "investor" as const,
    title: "Investor Dashboard",
    description: "Discover and track investments",
    icon: TrendingUp,
    path: "/dashboard/investor",
    color: "bg-amber-100 dark:bg-amber-900",
  },
  {
    role: "admin" as const,
    title: "Admin Dashboard",
    description: "Manage users, content, and platform settings",
    icon: Shield,
    path: "/admin",
    color: "bg-red-100 dark:bg-red-900",
  },
];

function DashboardContent() {
  const { currentUser, userData } = useAuth();
  const { activeRoles, isLoading, userRoles } = useUserRoles(currentUser?.uid);
  const [location, setLocation] = useLocation();

  const safeRoles = Array.isArray(activeRoles) ? activeRoles : [];
  const isAdmin = userData?.roles?.admin || false;

  // Auto-redirect if user has only one role
  useEffect(() => {
    if (!isLoading) {
      // Admin only - redirect to admin dashboard
      if (isAdmin && safeRoles.length === 0) {
        setLocation("/admin");
        return;
      }
      
      // Single role - redirect to that dashboard
      if (safeRoles.length === 1) {
        const roleConfig = roleDashboards.find(d => d.role === safeRoles[0]);
        if (roleConfig) {
          setLocation(roleConfig.path);
        }
      }
    }
  }, [isLoading, safeRoles, isAdmin, setLocation]);

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

  return (
    <DashboardLayout>
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
        <p className="text-muted-foreground mb-4">
          Welcome back! Select a dashboard to get started.
        </p>
        {safeRoles.length > 0 && (
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Your Roles:</span>
            <RoleBadgeList roles={safeRoles} variant="sm" />
          </div>
        )}
      </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {roleDashboards
            .filter(dashboard => {
              // Hide admin card for non-admins
              if (dashboard.role === "admin" && !isAdmin) return false;
              // Admins can see all cards
              if (isAdmin) return true;
              // Others see only their assigned roles or all if no roles
              return safeRoles.length === 0 || safeRoles.includes(dashboard.role);
            })
            .map((dashboard) => {
              const Icon = dashboard.icon;
              return (
                <Card
                  key={dashboard.role}
                  className="hover-elevate cursor-pointer"
                  onClick={() => setLocation(dashboard.path)}
                  data-testid={`card-dashboard-${dashboard.role}`}
                >
                  <CardHeader>
                    <div className={`w-12 h-12 rounded-md ${dashboard.color} flex items-center justify-center mb-4`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <CardTitle className="mb-2">{dashboard.title}</CardTitle>
                    <CardDescription>{dashboard.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Button
                      className="w-full"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        setLocation(dashboard.path);
                      }}
                      data-testid={`button-open-${dashboard.role}`}
                    >
                      Open Dashboard
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
        </div>
    </DashboardLayout>
  );
}

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
