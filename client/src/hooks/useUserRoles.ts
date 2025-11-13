import { useQuery } from "@tanstack/react-query";
import { UserRoles } from "@shared/schema";
import { hasRole, hasAnyRole, hasAllRoles, getUserRoles, canAccessFeature, RoleType } from "@shared/roleUtils";

export function useUserRoles(userId?: string) {
  const { data: userRoles, isLoading, error } = useQuery<UserRoles | null>({
    queryKey: userId ? ["/api/users", userId, "roles"] : [],
    enabled: !!userId,
  });

  return {
    userRoles,
    isLoading,
    error,
    hasRole: (role: RoleType) => hasRole(userRoles ?? null, role),
    hasAnyRole: (roles: RoleType[]) => hasAnyRole(userRoles ?? null, roles),
    hasAllRoles: (roles: RoleType[]) => hasAllRoles(userRoles ?? null, roles),
    activeRoles: getUserRoles(userRoles ?? null),
    canAccess: (permission: string) => canAccessFeature(userRoles ?? null, permission),
    isProfessional: userRoles?.isProfessional ?? false,
    isJobSeeker: userRoles?.isJobSeeker ?? false,
    isEmployer: userRoles?.isEmployer ?? false,
    isBusinessOwner: userRoles?.isBusinessOwner ?? false,
    isInvestor: userRoles?.isInvestor ?? false,
  };
}
