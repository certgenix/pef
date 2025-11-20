# Fix Admin Access - Quick Guide

## Problem
You manually set up Firestore and now cannot access the admin panel. The logs show all roles are `false`, indicating the user document structure is incorrect.

## Solution Options

### Option 1: Fix via Firebase Console (Recommended - 5 minutes)

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `pef-web`

2. **Navigate to Firestore Database**
   - Click on "Firestore Database" in the left sidebar
   - Click on the `users` collection

3. **Find Your User Document**
   - Look for the document with your email (the one you're currently logged in with)
   - Click on the document ID to open it

4. **Update the Document Structure**
   - Click "Edit Document" (pencil icon)
   - Make sure the document has this EXACT structure:

   ```
   Field: approvalStatus, Type: string, Value: approved
   Field: email, Type: string, Value: your@email.com
   Field: displayName, Type: string, Value: Your Name
   Field: createdAt, Type: timestamp, Value: (keep existing or create new)
   Field: lastLogin, Type: timestamp or null, Value: (keep existing or null)
   
   Field: roles, Type: map
     ↳ isProfessional, Type: boolean, Value: false
     ↳ isJobSeeker, Type: boolean, Value: false
     ↳ isEmployer, Type: boolean, Value: false
     ↳ isBusinessOwner, Type: boolean, Value: false
     ↳ isInvestor, Type: boolean, Value: false
     ↳ isAdmin, Type: boolean, Value: true    ← IMPORTANT!
   
   Field: profile, Type: map
     ↳ fullName, Type: string, Value: Your Full Name
     ↳ headline, Type: string or null, Value: Platform Administrator
     ↳ bio, Type: string or null, Value: Administrator
     ↳ phone, Type: string or null, Value: null
     ↳ country, Type: string or null, Value: null
     ↳ city, Type: string or null, Value: null
     ↳ languages, Type: array or null, Value: null
     ↳ linkedinUrl, Type: string or null, Value: null
     ↳ websiteUrl, Type: string or null, Value: null
     ↳ portfolioUrl, Type: string or null, Value: null
   
   Field: professionalData, Type: map, Value: {}
   Field: jobSeekerData, Type: map, Value: {}
   Field: employerData, Type: map, Value: {}
   Field: businessOwnerData, Type: map, Value: {}
   Field: investorData, Type: map, Value: {}
   ```

5. **Critical Fields to Check**
   - ✅ `approvalStatus` must be `"approved"` (string)
   - ✅ `roles.isAdmin` must be `true` (boolean, not string!)
   - ✅ `roles` must be a **map/object**, not missing
   - ✅ All other `roles.is*` fields should be `false`

6. **Save and Test**
   - Click "Update"
   - **Log out** of your application
   - **Log back in**
   - You should now see the admin dashboard option

### Option 2: Create New Admin User (If Current User is Broken)

1. **Create User in Firebase Auth**
   - Go to Firebase Console → Authentication → Users
   - Click "Add User"
   - Email: `admin@yourcompany.com`
   - Password: (choose a secure password)
   - Click "Add User"
   - **Copy the UID** of the newly created user

2. **Create Firestore Document**
   - Go to Firestore Database → `users` collection
   - Click "Add Document"
   - **Document ID**: Paste the UID you copied
   - Add fields following the structure in Option 1 above

3. **Login with New Admin**
   - Log out of current account
   - Log in with the new admin email and password
   - Navigate to `/admin`

### Option 3: Use the Setup Script (Advanced)

1. **Get Firebase Auth UID**
   - Log in to your app
   - Open browser console (F12)
   - Run: `firebase.auth().currentUser.uid`
   - Copy the UID

2. **Run the Setup Script**
   ```bash
   ADMIN_UID=your-firebase-uid npm run setup-admin
   ```

3. **The script will:**
   - Check existing admin users
   - Create/update Firestore document with correct structure
   - Verify the setup

## Common Mistakes to Avoid

❌ **DON'T** use `admin: true` - use `isAdmin: true`
❌ **DON'T** make `isAdmin` a string `"true"` - make it a boolean `true`
❌ **DON'T** forget the `approvalStatus: "approved"` field
❌ **DON'T** have `roles` as a separate collection - it must be embedded in the user document

## Verifying the Fix

After making changes:

1. **Clear your browser cache** or open an incognito window
2. **Log out and log back in**
3. **Check the console logs** (F12 → Console tab)
4. Look for: `✓ Dashboard: User roles loaded`
5. You should see `"isAdmin": true` and `"admin": true`

Example of correct log output:
```
✓ Dashboard: User roles loaded {
  isAdmin: true,
  roles: {
    professional: false,
    jobSeeker: false,
    employer: false,
    businessOwner: false,
    investor: false,
    admin: true  ← Should be true!
  },
  activeRoles: ["admin"]
}
```

## Dashboard Redirect Flow

After fixing the admin access, the dashboard flow will work as expected:

1. Login → Brief loading screen (1-2 seconds)
2. Dashboard page appears
3. Automatic redirect to `/admin` (since you have only admin role)
4. Admin dashboard loads

If you don't see the redirect, check:
- Console logs show `isAdmin: true`
- No errors in the console
- Try refreshing the page

## Still Having Issues?

Check these in the browser console:

```javascript
// Check current user data
// This will show you what roles the app sees
```

If all roles are still `false`, the Firestore document structure is still incorrect. Double-check the `roles` field is a **map** with `isAdmin` as a **boolean** set to `true`.

## Need Help?

If you're still stuck:
1. Check the browser console for specific error messages
2. Verify the Firestore document structure matches exactly
3. Make sure you logged out and back in after making changes
4. Try using an incognito window to bypass caching
