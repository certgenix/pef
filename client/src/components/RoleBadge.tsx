import { Badge } from "@/components/ui/badge";
import { ROLE_DEFINITIONS, RoleType } from "@shared/roleUtils";
import { Briefcase, Search, Building2, Handshake, TrendingUp } from "lucide-react";

const roleIcons = {
  professional: Briefcase,
  jobSeeker: Search,
  employer: Building2,
  businessOwner: Handshake,
  investor: TrendingUp,
};

const roleColors = {
  professional: "bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-100",
  jobSeeker: "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100",
  employer: "bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-100",
  businessOwner: "bg-orange-100 dark:bg-orange-900 text-orange-800 dark:text-orange-100",
  investor: "bg-amber-100 dark:bg-amber-900 text-amber-800 dark:text-amber-100",
};

interface RoleBadgeProps {
  role: RoleType;
  showIcon?: boolean;
  variant?: "default" | "sm";
}

export function RoleBadge({ role, showIcon = true, variant = "default" }: RoleBadgeProps) {
  const Icon = roleIcons[role];
  const roleInfo = ROLE_DEFINITIONS[role];

  if (!roleInfo) {
    console.warn(`Invalid role: ${role}`);
    return null;
  }

  return (
    <Badge 
      className={`${roleColors[role]} ${variant === "sm" ? "text-xs" : ""}`}
      data-testid={`badge-role-${role}`}
    >
      {showIcon && Icon && <Icon className="w-3 h-3 mr-1" />}
      {roleInfo.label}
    </Badge>
  );
}

interface RoleBadgeListProps {
  roles: RoleType[];
  showIcons?: boolean;
  variant?: "default" | "sm";
}

export function RoleBadgeList({ roles, showIcons = true, variant = "default" }: RoleBadgeListProps) {
  if (roles.length === 0) {
    return <span className="text-muted-foreground text-sm">No roles</span>;
  }

  return (
    <div className="flex flex-wrap gap-2" data-testid="role-badge-list">
      {roles.map((role) => (
        <RoleBadge key={role} role={role} showIcon={showIcons} variant={variant} />
      ))}
    </div>
  );
}
