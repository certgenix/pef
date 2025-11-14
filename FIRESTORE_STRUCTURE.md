# Cleaned-Up Firestore Structure

## Overview

The Firestore database has been simplified to use a **consolidated structure** where all user data is stored in a single `users` collection with nested fields, instead of multiple separate collections.

## Firestore Collections

### 1. `users/` Collection (Main User Data)

Each user document contains all user-related data in nested fields:

```javascript
users/{uid}: {
  // Basic Info
  id: string,
  email: string,
  displayName: string,
  name: string,
  status: "pending" | "approved" | "rejected",
  createdAt: Timestamp,
  lastUpdated: Timestamp,
  lastLogin: Timestamp | null,
  approvalStatus: "pending" | "approved" | "rejected",
  
  // Profile Data (nested)
  profile: {
    phone: string | null,
    country: string | null,
    city: string | null,
    languages: string[] | null,
    headline: string | null,
    bio: string | null,
    linkedinUrl: string | null,
    websiteUrl: string | null,
    portfolioUrl: string | null
  },
  
  // User Roles (nested)
  roles: {
    isProfessional: boolean,
    isJobSeeker: boolean,
    isEmployer: boolean,
    isBusinessOwner: boolean,
    isInvestor: boolean
  },
  
  // Role-Specific Data (nested)
  professionalData: {
    yearsOfExperience: number,
    industry: string,
    skills: string[],
    certifications: string[],
    currentJobTitle: string,
    currentEmployer: string,
    createdAt: Date,
    updatedAt: Date
  },
  
  jobSeekerData: {
    targetJobTitles: string[],
    preferredIndustries: string[],
    employmentType: string,
    salaryExpectationMin: number,
    salaryExpectationMax: number,
    availability: string,
    willingToRelocate: boolean,
    targetCountries: string[],
    createdAt: Date,
    updatedAt: Date
  },
  
  employerData: {
    companyName: string,
    industry: string,
    createdAt: Date,
    updatedAt: Date
  },
  
  businessOwnerData: {
    businessName: string,
    industry: string,
    companySize: string,
    yearsInOperation: number,
    country: string,
    city: string,
    lookingFor: string[],
    revenueRange: string,
    capitalRequired: string,
    expansionCountries: string[],
    createdAt: Date,
    updatedAt: Date
  },
  
  investorData: {
    investmentRangeMin: number,
    investmentRangeMax: number,
    preferredSectors: string[],
    preferredCountries: string[],
    investmentStage: string,
    investmentType: string,
    investmentThesis: string,
    contactPreference: string,
    createdAt: Date,
    updatedAt: Date
  }
}
```

### 2. `opportunities/` Collection

Stores job postings, business opportunities, and investment opportunities:

```javascript
opportunities/{id}: {
  id: string,
  userId: string,
  type: "job" | "investment" | "partnership" | "collaboration",
  title: string,
  description: string,
  sector: string | null,
  country: string | null,
  city: string | null,
  budgetOrSalary: string | null,
  contactPreference: string | null,
  details: object | null,
  status: "open" | "closed",
  approvalStatus: "pending" | "approved" | "rejected",
  createdAt: Timestamp,
  updatedAt: Timestamp
}
```

## Collections Removed

The following collections have been **removed** and their data consolidated into the `users` collection:

- ❌ `userProfiles` - Now nested as `profile` field in `users`
- ❌ `userRoles` - Now nested as `roles` field in `users`
- ❌ `professionalProfiles` - Now nested as `professionalData` field in `users`
- ❌ `jobSeekerProfiles` - Now nested as `jobSeekerData` field in `users`
- ❌ `employerProfiles` - Now nested as `employerData` field in `users`
- ❌ `businessOwnerProfiles` - Now nested as `businessOwnerData` field in `users`
- ❌ `investorProfiles` - Now nested as `investorData` field in `users`

## Benefits of Consolidated Structure

1. **Simplicity**: All user data in one place - easier to understand and maintain
2. **Performance**: Fewer Firestore reads (1 document instead of 3-7 documents)
3. **Consistency**: No data synchronization issues between collections
4. **Cost**: Lower Firestore costs (fewer document reads/writes)
5. **Clean Schema**: Easy to reason about and debug

## Reading User Data

### Frontend (Firestore Client SDK)

```javascript
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";

// Get complete user data
const userRef = doc(db, "users", uid);
const userSnap = await getDoc(userRef);

if (userSnap.exists()) {
  const userData = userSnap.data();
  
  // Access nested fields
  console.log(userData.profile.fullName);
  console.log(userData.roles.professional);
  console.log(userData.professionalData);
}
```

### Backend (Storage Layer)

```javascript
// The storage layer automatically handles the consolidated structure
const userWithRoles = await storage.getUserWithRoles(uid);

// Returns: { user: User, roles: UserRoles }
```

## Updating User Data

### Update Profile

```javascript
import { doc, updateDoc } from "firebase/firestore";

const userRef = doc(db, "users", uid);
await updateDoc(userRef, {
  "profile.headline": "Senior Software Engineer",
  "profile.bio": "Passionate about building scalable systems"
});
```

### Update Roles

```javascript
await updateDoc(userRef, {
  "roles.isProfessional": true,
  "roles.isEmployer": false
});
```

### Update Role-Specific Data

```javascript
await updateDoc(userRef, {
  professionalData: {
    yearsOfExperience: 5,
    industry: "Technology",
    skills: ["JavaScript", "React", "Node.js"],
    currentJobTitle: "Senior Developer",
    updatedAt: new Date()
  }
});
```

## Migration from Old Structure

If you have existing data in the old structure (separate collections), you need to migrate it:

### Migration Steps

1. **Backup your Firestore data** before migration
2. **Run a migration script** to consolidate data:

```javascript
// Example migration script
async function migrateUser(uid) {
  // Get user from old structure
  const userDoc = await getDoc(doc(db, "users", uid));
  const profileSnap = await getDocs(
    query(collection(db, "userProfiles"), where("userId", "==", uid))
  );
  const rolesDoc = await getDoc(doc(db, "userRoles", uid));
  
  const profileData = profileSnap.docs[0]?.data();
  const rolesData = rolesDoc.data();
  
  // Create consolidated document
  const consolidatedData = {
    ...userDoc.data(),
    profile: {
      fullName: profileData?.fullName,
      phone: profileData?.phone,
      country: profileData?.country,
      // ... other profile fields
    },
    roles: {
      professional: rolesData?.isProfessional || false,
      jobSeeker: rolesData?.isJobSeeker || false,
      // ... other roles
    },
    professionalData: {},
    jobSeekerData: {},
    employerData: {},
    businessOwnerData: {},
    investorData: {}
  };
  
  // Update user document with consolidated data
  await setDoc(doc(db, "users", uid), consolidatedData);
  
  // Delete old documents (optional - be careful!)
  // await deleteDoc(doc(db, "userProfiles", profileData.id));
  // await deleteDoc(doc(db, "userRoles", uid));
}
```

3. **Test thoroughly** before deploying to production
4. **Clean up old collections** after verifying migration succeeded

## Auth Flow Changes

### Registration Flow

1. User fills out registration form
2. Firebase Auth creates the user account
3. **Single Firestore write** creates consolidated user document in `users/{uid}`
4. User is signed out and redirected to login page
5. User logs in
6. Backend syncs data and user is redirected to dashboard

### Login Flow

1. User submits login credentials
2. Firebase Auth signs in the user
3. **Auto-redirect** to `/dashboard` (if already logged in)
4. ProtectedRoute checks auth state
5. If authenticated and approved, dashboard loads
6. If pending approval, shows pending screen

## Key Implementation Files

- `client/src/contexts/AuthContext.tsx` - Handles registration with consolidated structure
- `server/storage.ts` - Backend storage layer using consolidated Firestore structure
- `client/src/pages/Login.tsx` - Auto-redirects when already logged in
- `client/src/components/ProtectedRoute.tsx` - Guards protected routes

## Best Practices

1. **Always read from `users/{uid}`** - Never query separate collections
2. **Use dot notation for updates** - e.g., `"profile.headline"` instead of replacing entire profile object
3. **Initialize nested objects** - Empty objects (`{}`) for role-specific data prevent undefined errors
4. **Atomic updates** - Update multiple nested fields in single `updateDoc` call when possible
5. **Handle null values** - Many nested fields are optional, check for existence before accessing
