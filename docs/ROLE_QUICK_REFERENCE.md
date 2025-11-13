# Role System Quick Reference

## The 5 Roles At a Glance

| # | Role | Icon | Database Field | What They Do |
|---|------|------|----------------|--------------|
| 1 | **Professional** | 💼 | `isProfessional` | Network, showcase skills, gain visibility |
| 2 | **Job Seeker** | 🔍 | `isJobSeeker` | Find jobs locally or internationally |
| 3 | **Employer** | 🏢 | `isEmployer` | Post jobs, hire talent |
| 4 | **Business Owner** | 🤝 | `isBusinessOwner` | Seek partnerships, investors, expansion |
| 5 | **Investor** | 📈 | `isInvestor` | Invest in businesses and opportunities |

## Common Code Patterns

### Check if user has a role
```typescript
const { hasRole } = useUserRoles(userId);
if (hasRole("employer")) {
  // Show employer features
}
```

### Display role badges
```typescript
import { RoleBadgeList } from "@/components/RoleBadge";
const { activeRoles } = useUserRoles(userId);

<RoleBadgeList roles={activeRoles} />
```

### Check permissions
```typescript
const { canAccess } = useUserRoles(userId);
if (canAccess("post_jobs")) {
  return <PostJobButton />;
}
```

### Protect backend routes
```typescript
import { hasRole } from "@shared/roleUtils";

const userRoles = await storage.getUserRoles(userId);
if (!hasRole(userRoles, "employer")) {
  return res.status(403).json({ error: "Access denied" });
}
```

## Files Created

- ✅ `shared/roleUtils.ts` - Core role utility functions
- ✅ `client/src/hooks/useUserRoles.ts` - React hook for role management
- ✅ `client/src/components/RoleBadge.tsx` - Visual role badges
- ✅ `client/src/components/examples/RoleManagementExample.tsx` - Example implementation
- ✅ `docs/ROLE_SYSTEM.md` - Complete documentation

## Key Features

✅ **Multi-Role Support** - Users can have multiple roles simultaneously  
✅ **Permission-Based Access** - Check capabilities, not just roles  
✅ **Type-Safe** - Full TypeScript support  
✅ **Visual Components** - Pre-built badge components  
✅ **React Hooks** - Easy integration with React components  
✅ **Backend Utilities** - Protect API routes and features
