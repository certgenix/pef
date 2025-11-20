import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, userData, loading: authLoading, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const { status, data } = useMemberStatus();

  // Check if user has admin role
  const isAdmin = userData?.roles?.admin === true;

  useEffect(() => {
    if (!authLoading && !currentUser) {
      setLocation("/login");
    }
  }, [currentUser, authLoading, setLocation]);

  useEffect(() => {
    if (!authLoading && currentUser && userData && status === "active") {
      const isOnProfileCompletePage = location === "/profile/complete";
      const profileCompleted = userData.profileCompleted === true;
      
      if (!profileCompleted && !isOnProfileCompletePage) {
        setLocation("/profile/complete");
      }
    }
  }, [authLoading, currentUser, userData, status, location, setLocation]);

  if (authLoading || status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!currentUser) {
    return null;
  }

  // Allow all authenticated users - no approval required
  if (status === "error") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <CardTitle>Error Loading Account</CardTitle>
            <CardDescription>
              We're having trouble loading your account information
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Please try refreshing the page. If the problem persists, contact support.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => window.location.reload()}
                data-testid="button-refresh"
              >
                Refresh Page
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation("/")}
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
}
