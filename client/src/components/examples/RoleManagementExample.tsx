import { useUserRoles } from "@/hooks/useUserRoles";
import { RoleBadgeList } from "@/components/RoleBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, XCircle } from "lucide-react";

export function RoleManagementExample({ userId }: { userId: string }) {
  const {
    activeRoles,
    hasRole,
    hasAnyRole,
    canAccess,
    isProfessional,
    isJobSeeker,
    isEmployer,
    isBusinessOwner,
    isInvestor,
    isLoading,
  } = useUserRoles(userId);

  if (isLoading) {
    return <div>Loading roles...</div>;
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>User Roles</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm text-muted-foreground mb-2">Active Roles:</p>
            <RoleBadgeList roles={activeRoles} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div className="flex items-center gap-2">
              {isProfessional ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">Professional</span>
            </div>
            <div className="flex items-center gap-2">
              {isJobSeeker ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">Job Seeker</span>
            </div>
            <div className="flex items-center gap-2">
              {isEmployer ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">Employer</span>
            </div>
            <div className="flex items-center gap-2">
              {isBusinessOwner ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">Business Owner</span>
            </div>
            <div className="flex items-center gap-2">
              {isInvestor ? (
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              ) : (
                <XCircle className="w-4 h-4 text-muted-foreground" />
              )}
              <span className="text-sm">Investor</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Role-Based Features</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {hasRole("employer") && (
            <Button className="w-full" data-testid="button-post-job">
              Post a Job Opening
            </Button>
          )}

          {hasRole("businessOwner") && (
            <Button className="w-full" data-testid="button-seek-investment">
              Seek Investment
            </Button>
          )}

          {hasRole("investor") && (
            <Button className="w-full" data-testid="button-browse-opportunities">
              Browse Investment Opportunities
            </Button>
          )}

          {hasRole("jobSeeker") && (
            <Button className="w-full" data-testid="button-browse-jobs">
              Browse Jobs
            </Button>
          )}

          {hasAnyRole(["employer", "businessOwner"]) && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">You can post opportunities!</p>
              <p className="text-xs text-muted-foreground">
                Employers can post jobs, Business Owners can seek partnerships
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Permission-Based Access</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <PermissionItem
            permission="post_jobs"
            canAccess={canAccess("post_jobs")}
            label="Post Job Openings"
          />
          <PermissionItem
            permission="view_investments"
            canAccess={canAccess("view_investments")}
            label="View Investment Opportunities"
          />
          <PermissionItem
            permission="post_partnerships"
            canAccess={canAccess("post_partnerships")}
            label="Post Partnership Opportunities"
          />
          <PermissionItem
            permission="apply_to_jobs"
            canAccess={canAccess("apply_to_jobs")}
            label="Apply to Jobs"
          />
        </CardContent>
      </Card>
    </div>
  );
}

function PermissionItem({
  permission,
  canAccess,
  label,
}: {
  permission: string;
  canAccess: boolean;
  label: string;
}) {
  return (
    <div className="flex items-center justify-between p-2 rounded-md hover-elevate">
      <span className="text-sm">{label}</span>
      {canAccess ? (
        <Badge className="bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100">
          Allowed
        </Badge>
      ) : (
        <Badge variant="secondary">Not Allowed</Badge>
      )}
    </div>
  );
}
