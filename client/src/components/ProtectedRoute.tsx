import { useAuth } from "@/contexts/AuthContext";
import { useLocation } from "wouter";
import { useEffect } from "react";
import { useMemberStatus } from "@/hooks/useMemberStatus";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, CheckCircle, XCircle } from "lucide-react";

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { currentUser, loading: authLoading } = useAuth();
  const [, setLocation] = useLocation();
  const { status, data } = useMemberStatus();

  useEffect(() => {
    if (!authLoading && !currentUser) {
      setLocation("/login");
    }
  }, [currentUser, authLoading, setLocation]);

  useEffect(() => {
    if (status === "unregistered") {
      setLocation("/edit-profile");
    }
  }, [status, setLocation]);

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

  if (status === "unregistered") {
    return null;
  }

  if (status === "pending") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-amber-100 dark:bg-amber-900 rounded-full flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
              </div>
              <CardTitle>Account Pending Approval</CardTitle>
            </div>
            <CardDescription>
              Your registration is being reviewed by our admin team
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Thank you for registering with the Professional Executive Forum. Your account is currently under review. You will receive an email notification once your account has been approved.
            </p>
            <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
              <p className="text-sm text-blue-900 dark:text-blue-100">
                This typically takes 1-2 business days. You'll be able to access all features once approved.
              </p>
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation("/")}
                data-testid="button-go-home"
              >
                Go to Home
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  useAuth().logout();
                  setLocation("/login");
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (status === "rejected") {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="max-w-md">
          <CardHeader>
            <div className="flex items-center gap-3 mb-2">
              <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle>Account Rejected</CardTitle>
            </div>
            <CardDescription>
              Your registration has been reviewed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Unfortunately, your account registration did not meet our approval criteria. If you believe this is an error, please contact our support team.
            </p>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => setLocation("/contact")}
                data-testid="button-contact-support"
              >
                Contact Support
              </Button>
              <Button 
                variant="outline" 
                className="w-full" 
                onClick={() => {
                  useAuth().logout();
                  setLocation("/login");
                }}
                data-testid="button-logout"
              >
                Logout
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

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
