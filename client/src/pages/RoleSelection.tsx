import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { Briefcase, Search, Building2, Handshake, TrendingUp } from "lucide-react";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { auth } from "@/lib/firebase";

const roleOptions = [
  {
    id: "professional",
    title: "Professional",
    description: "Share your expertise and connect with opportunities",
    icon: Briefcase,
  },
  {
    id: "jobSeeker",
    title: "Job Seeker",
    description: "Find your next career opportunity",
    icon: Search,
  },
  {
    id: "employer",
    title: "Employer",
    description: "Post jobs and find talented candidates",
    icon: Building2,
  },
  {
    id: "businessOwner",
    title: "Business Owner",
    description: "Grow your business and find partnerships",
    icon: Handshake,
  },
  {
    id: "investor",
    title: "Investor",
    description: "Discover and track investment opportunities",
    icon: TrendingUp,
  },
];

export default function RoleSelection() {
  const { currentUser, refreshUserData } = useAuth();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRoleToggle = (roleId: string) => {
    setSelectedRoles(prev =>
      prev.includes(roleId)
        ? prev.filter(id => id !== roleId)
        : [...prev, roleId]
    );
  };

  const handleSubmit = async () => {
    if (selectedRoles.length === 0) {
      toast({
        title: "No roles selected",
        description: "Please select at least one role to continue.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const token = await auth.currentUser?.getIdToken();
      if (!token) {
        throw new Error("Not authenticated");
      }

      const roles: Record<string, boolean> = {
        professional: selectedRoles.includes("professional"),
        jobSeeker: selectedRoles.includes("jobSeeker"),
        employer: selectedRoles.includes("employer"),
        businessOwner: selectedRoles.includes("businessOwner"),
        investor: selectedRoles.includes("investor"),
      };

      const response = await fetch("/api/users/assign-roles", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ roles }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to assign roles");
      }

      await refreshUserData();

      toast({
        title: "Roles assigned",
        description: "Your roles have been successfully assigned.",
      });

      setLocation("/dashboard");
    } catch (error) {
      console.error("Role assignment error:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to assign roles",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen">
        <Header />
        <main className="py-16 px-4">
          <Card className="max-w-md mx-auto">
            <CardHeader>
              <CardTitle>Not Logged In</CardTitle>
              <CardDescription>Please log in to select your roles.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={() => setLocation("/login")} data-testid="button-go-login">
                Go to Login
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
      <main className="py-12 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Select Your Roles</h1>
          <p className="text-muted-foreground">
            Choose one or more roles that describe how you'd like to use the platform
          </p>
        </div>

        <Card>
          <CardContent className="pt-6">
            <div className="space-y-4">
              {roleOptions.map((role) => {
                const Icon = role.icon;
                const isSelected = selectedRoles.includes(role.id);

                return (
                  <div
                    key={role.id}
                    className={`flex items-start gap-4 p-4 rounded-md border-2 transition-colors cursor-pointer hover-elevate ${
                      isSelected
                        ? "border-primary bg-primary/5"
                        : "border-border"
                    }`}
                    onClick={() => handleRoleToggle(role.id)}
                    data-testid={`role-option-${role.id}`}
                  >
                    <Checkbox
                      id={role.id}
                      checked={isSelected}
                      onCheckedChange={() => handleRoleToggle(role.id)}
                      className="mt-1"
                      data-testid={`checkbox-${role.id}`}
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className="w-5 h-5 text-primary" />
                        <Label
                          htmlFor={role.id}
                          className="text-lg font-semibold cursor-pointer"
                        >
                          {role.title}
                        </Label>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {role.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="mt-6 flex flex-wrap justify-between gap-4">
              <Button
                variant="outline"
                onClick={() => setLocation("/")}
                data-testid="button-cancel"
              >
                Cancel
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={selectedRoles.length === 0 || isSubmitting}
                data-testid="button-submit-roles"
              >
                {isSubmitting ? "Assigning Roles..." : "Continue"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </main>
      <Footer />
    </div>
  );
}
