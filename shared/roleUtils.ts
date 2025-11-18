import { UserRoles } from "./schema";

export type RoleType = 
  | "professional" 
  | "jobSeeker" 
  | "employer" 
  | "businessOwner" 
  | "investor"
  | "admin";

export const ROLE_DEFINITIONS = {
  professional: {
    id: "professional" as const,
    key: "isProfessional" as const,
    label: "Professional",
    description: "Network, showcase skills, and gain career visibility",
    permissions: ["view_professionals", "create_professional_profile", "update_own_profile"],
  },
  jobSeeker: {
    id: "jobSeeker" as const,
    key: "isJobSeeker" as const,
    label: "Job Seeker",
    description: "Actively looking for jobs locally or internationally",
    permissions: ["view_jobs", "apply_to_jobs", "create_job_seeker_profile"],
  },
  employer: {
    id: "employer" as const,
    key: "isEmployer" as const,
    label: "Employer",
    description: "Post job openings and find qualified candidates",
    permissions: ["post_jobs", "view_applicants", "create_employer_profile"],
  },
  businessOwner: {
    id: "businessOwner" as const,
    key: "isBusinessOwner" as const,
    label: "Business Owner",
    description: "Seek partnerships, expansion support, and investors",
    permissions: ["post_partnerships", "post_investment_opportunities", "create_business_profile"],
  },
  investor: {
    id: "investor" as const,
    key: "isInvestor" as const,
    label: "Investor",
    description: "Invest in startups, SMEs, and market opportunities",
    permissions: ["view_investments", "contact_businesses", "create_investor_profile"],
  },
  admin: {
    id: "admin" as const,
    key: "isAdmin" as const,
    label: "Admin",
    description: "Manage users, content, and platform settings",
    permissions: ["manage_users", "approve_content", "view_analytics", "manage_system"],
  },
} as const;

export function hasRole(userRoles: UserRoles | null, role: RoleType): boolean {
  if (!userRoles) return false;
  const roleKey = ROLE_DEFINITIONS[role].key;
  return userRoles[roleKey] === true;
}

export function hasAnyRole(userRoles: UserRoles | null, roles: RoleType[]): boolean {
  return roles.some(role => hasRole(userRoles, role));
}

export function hasAllRoles(userRoles: UserRoles | null, roles: RoleType[]): boolean {
  return roles.every(role => hasRole(userRoles, role));
}

export function getUserRoles(userRoles: UserRoles | null): RoleType[] {
  if (!userRoles) return [];
  
  const activeRoles: RoleType[] = [];
  
  if (userRoles.isProfessional) activeRoles.push("professional");
  if (userRoles.isJobSeeker) activeRoles.push("jobSeeker");
  if (userRoles.isEmployer) activeRoles.push("employer");
  if (userRoles.isBusinessOwner) activeRoles.push("businessOwner");
  if (userRoles.isInvestor) activeRoles.push("investor");
  if (userRoles.isAdmin) activeRoles.push("admin");
  
  return activeRoles;
}

export function getUserRoleLabels(userRoles: UserRoles | null): string[] {
  return getUserRoles(userRoles).map(role => ROLE_DEFINITIONS[role].label);
}

export function canAccessFeature(userRoles: UserRoles | null, permission: string): boolean {
  if (!userRoles) return false;
  
  const activeRoles = getUserRoles(userRoles);
  
  return activeRoles.some(role => {
    return (ROLE_DEFINITIONS[role].permissions as readonly string[]).includes(permission);
  });
}

export function formatRoleList(userRoles: UserRoles | null): string {
  const labels = getUserRoleLabels(userRoles);
  if (labels.length === 0) return "No roles";
  if (labels.length === 1) return labels[0];
  if (labels.length === 2) return `${labels[0]} and ${labels[1]}`;
  return `${labels.slice(0, -1).join(", ")}, and ${labels[labels.length - 1]}`;
}

export function createRolesObject(selectedRoles: RoleType[]): Omit<UserRoles, "id" | "userId" | "createdAt"> {
  return {
    isProfessional: selectedRoles.includes("professional"),
    isJobSeeker: selectedRoles.includes("jobSeeker"),
    isEmployer: selectedRoles.includes("employer"),
    isBusinessOwner: selectedRoles.includes("businessOwner"),
    isInvestor: selectedRoles.includes("investor"),
    isAdmin: selectedRoles.includes("admin"),
  };
}

export function getRoleRequiredProfiles(roles: RoleType[]): string[] {
  const profiles: string[] = [];
  
  if (roles.includes("professional")) profiles.push("professional");
  if (roles.includes("jobSeeker")) profiles.push("jobSeeker");
  if (roles.includes("employer")) profiles.push("employer");
  if (roles.includes("businessOwner")) profiles.push("businessOwner");
  if (roles.includes("investor")) profiles.push("investor");
  if (roles.includes("admin")) profiles.push("admin");
  
  return profiles;
}
