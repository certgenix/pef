import { useAuth } from "@/contexts/AuthContext";
import { RoleType } from "@shared/roleUtils";
import { UserRoles as FirestoreUserRoles } from "@shared/types";

type RoleTypeKey = "professional" | "jobSeeker" | "employer" | "businessOwner" | "investor" | "admin";

export function useUserRoles(userId?: string) {
  const { userData, loading: authLoading } = useAuth();
  
  // Defensive logging for role issues
  if (userData && !userData.roles) {
    console.warn("⚠️ useUserRoles: userData exists but roles object is missing", { 
      userId, 
      userData 
    });
  }
  
  const firestoreRoles: FirestoreUserRoles = userData?.roles || {
    professional: false,
    jobSeeker: false,
    employer: false,
    businessOwner: false,
    investor: false,
    admin: false,
  };

  const activeRoles: RoleType[] = Object.entries(firestoreRoles)
    .filter(([key, value]) => value === true)
    .map(([key]) => key as RoleType);

  const isLoading = authLoading;

  const hasRole = (role: RoleType): boolean => {
    return firestoreRoles[role as RoleTypeKey] === true;
  };

  const hasAnyRole = (roles: RoleType[]): boolean => {
    return roles.some(role => hasRole(role));
  };

  const hasAllRoles = (roles: RoleType[]): boolean => {
    return roles.every(role => hasRole(role));
  };

  const canAccess = (permission: string): boolean => {
    return activeRoles.length > 0;
  };

  return {
    userRoles: firestoreRoles,
    activeRoles,
    isLoading,
    error: null,
    hasRole,
    hasAnyRole,
    hasAllRoles,
    canAccess,
    isProfessional: firestoreRoles.professional,
    isJobSeeker: firestoreRoles.jobSeeker,
    isEmployer: firestoreRoles.employer,
    isBusinessOwner: firestoreRoles.businessOwner,
    isInvestor: firestoreRoles.investor,
    isAdmin: firestoreRoles.admin,
  };
}
