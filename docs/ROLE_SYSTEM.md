# Role-Based Access Control (RBAC) System

## Overview

The Professional Executive Forum uses a flexible multi-role system where users can have multiple roles simultaneously. This document explains how the role system works and how to manage it.

## The 5 Roles

### 1. Professional
**Purpose**: Network and showcase professional skills
- **Database Field**: `isProfessional`
- **Profile Table**: `professional_profiles`
- **Key Features**:
  - Years of experience tracking
  - Industry and skills listing
  - Certifications management
  - Current employment information
- **Permissions**:
  - `view_professionals` - Browse other professionals
  - `create_professional_profile` - Create professional profile
  - `update_own_profile` - Update their own profile

### 2. Job Seeker
**Purpose**: Find employment opportunities
- **Database Field**: `isJobSeeker`
- **Profile Table**: `job_seeker_profiles`
- **Key Features**:
  - Target job titles
  - Salary expectations
  - Employment type preferences
  - Location and relocation preferences
- **Permissions**:
  - `view_jobs` - Browse job opportunities
  - `apply_to_jobs` - Apply to job postings
  - `create_job_seeker_profile` - Create job seeker profile

### 3. Employer
**Purpose**: Post jobs and hire talent
- **Database Field**: `isEmployer`
- **Profile Table**: `employer_profiles`
- **Key Features**:
  - Company information
  - Industry details
  - Job posting capabilities
- **Permissions**:
  - `post_jobs` - Create job postings
  - `view_applicants` - See job applicants
  - `create_employer_profile` - Create employer profile

### 4. Business Owner
**Purpose**: Seek partnerships, expansion, and investment
- **Database Field**: `isBusinessOwner`
- **Profile Table**: `business_owner_profiles`
- **Key Features**:
  - Business information
  - Revenue and capital needs
  - Expansion plans
  - Partnership preferences
- **Permissions**:
  - `post_partnerships` - Post partnership opportunities
  - `post_investment_opportunities` - Seek investments
  - `create_business_profile` - Create business profile

### 5. Investor
**Purpose**: Invest in businesses and opportunities
- **Database Field**: `isInvestor`
- **Profile Table**: `investor_profiles`
- **Key Features**:
  - Investment range
  - Preferred sectors
  - Investment thesis
  - Geographic preferences
- **Permissions**:
  - `view_investments` - Browse investment opportunities
  - `contact_businesses` - Connect with businesses
  - `create_investor_profile` - Create investor profile

## Database Schema

### User Roles Table
```typescript
{
  id: varchar("id"),
  userId: varchar("user_id"),  // References users.id
  isProfessional: boolean,
  isJobSeeker: boolean,
  isEmployer: boolean,
  isBusinessOwner: boolean,
  isInvestor: boolean,
  createdAt: timestamp
}
```

## Using the Role System

### 1. Check if User Has a Role

```typescript
import { useUserRoles } from "@/hooks/useUserRoles";

function MyComponent() {
  const { hasRole, isProfessional, isEmployer } = useUserRoles(userId);
  
  // Method 1: Using the hasRole function
  if (hasRole("professional")) {
    // User is a professional
  }
  
  // Method 2: Using direct boolean properties
  if (isProfessional) {
    // User is a professional
  }
}
```

### 2. Check Multiple Roles

```typescript
import { useUserRoles } from "@/hooks/useUserRoles";

function MyComponent() {
  const { hasAnyRole, hasAllRoles } = useUserRoles(userId);
  
  // Check if user has ANY of these roles
  if (hasAnyRole(["employer", "businessOwner"])) {
    // User can post opportunities
  }
  
  // Check if user has ALL of these roles
  if (hasAllRoles(["professional", "jobSeeker"])) {
    // User is both a professional and job seeker
  }
}
```

### 3. Get All Active Roles

```typescript
import { useUserRoles } from "@/hooks/useUserRoles";

function MyComponent() {
  const { activeRoles } = useUserRoles(userId);
  
  console.log(activeRoles); // ["professional", "jobSeeker", "employer"]
}
```

### 4. Check Permissions

```typescript
import { useUserRoles } from "@/hooks/useUserRoles";

function MyComponent() {
  const { canAccess } = useUserRoles(userId);
  
  if (canAccess("post_jobs")) {
    // User can post jobs
    return <PostJobButton />;
  }
}
```

### 5. Display Role Badges

```typescript
import { RoleBadge, RoleBadgeList } from "@/components/RoleBadge";
import { useUserRoles } from "@/hooks/useUserRoles";

function UserProfile({ userId }: { userId: string }) {
  const { activeRoles } = useUserRoles(userId);
  
  return (
    <div>
      <h3>Roles</h3>
      <RoleBadgeList roles={activeRoles} />
      
      {/* Or display individual badges */}
      <RoleBadge role="professional" showIcon={true} />
    </div>
  );
}
```

## Backend Role Management

### Creating User Roles

```typescript
import { createRolesObject } from "@shared/roleUtils";

// When registering a new user
const selectedRoles = ["professional", "jobSeeker"];
const rolesData = createRolesObject(selectedRoles);

await storage.createUserRoles({
  userId: user.id,
  ...rolesData,
});
```

### Updating User Roles

```typescript
// Add a new role to existing user
await storage.updateUserRoles(userId, {
  isEmployer: true,
});

// Remove a role
await storage.updateUserRoles(userId, {
  isInvestor: false,
});
```

### Checking Roles in API Routes

```typescript
import { hasRole, canAccessFeature } from "@shared/roleUtils";

app.post("/api/opportunities/job", async (req, res) => {
  const userRoles = await storage.getUserRoles(req.user.id);
  
  // Check if user can post jobs
  if (!hasRole(userRoles, "employer")) {
    return res.status(403).json({ error: "Only employers can post jobs" });
  }
  
  // Or check by permission
  if (!canAccessFeature(userRoles, "post_jobs")) {
    return res.status(403).json({ error: "No permission to post jobs" });
  }
  
  // Proceed with job posting...
});
```

## Utility Functions Reference

### Frontend (React Hooks)

- `useUserRoles(userId)` - Main hook for role management
  - Returns: `{ userRoles, hasRole, hasAnyRole, hasAllRoles, activeRoles, canAccess, isProfessional, isJobSeeker, isEmployer, isBusinessOwner, isInvestor }`

### Shared Utilities

- `hasRole(userRoles, role)` - Check single role
- `hasAnyRole(userRoles, roles[])` - Check if has any of the roles
- `hasAllRoles(userRoles, roles[])` - Check if has all the roles
- `getUserRoles(userRoles)` - Get array of active role IDs
- `getUserRoleLabels(userRoles)` - Get array of role labels
- `canAccessFeature(userRoles, permission)` - Check permission
- `formatRoleList(userRoles)` - Format roles as readable string
- `createRolesObject(selectedRoles[])` - Create roles object for database
- `getRoleRequiredProfiles(roles[])` - Get required profile types

## Best Practices

1. **Always check roles on the backend** - Never rely solely on frontend role checks for security
2. **Use permissions over direct role checks** - `canAccess("post_jobs")` is better than `hasRole("employer")`
3. **Support multiple roles** - Users can have multiple roles, design your UI to accommodate this
4. **Provide clear role selection** - Make it easy for users to understand and select their roles during registration
5. **Validate role-specific data** - Ensure users with specific roles have completed their role-specific profiles

## Admin Approval Flow

All users require admin approval before their account is activated:

```typescript
// User registration sets approval status to "pending"
{
  approvalStatus: "pending" | "approved" | "rejected"
}

// Admin must approve before user can access full features
if (user.approvalStatus !== "approved") {
  return <PendingApprovalMessage />;
}
```

## Migration Guide

If you need to add a new role in the future:

1. Add new enum to `userRoles` table in `shared/schema.ts`
2. Add role definition to `ROLE_DEFINITIONS` in `shared/roleUtils.ts`
3. Create corresponding profile table if needed
4. Update registration form to include new role option
5. Add role icon and color to `RoleBadge.tsx`
6. Run database migration: `npm run db:push`
