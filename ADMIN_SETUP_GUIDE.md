# Admin User Setup Guide

This guide explains how to create an admin user for the Professional Executive Forum.

## Prerequisites
- Access to Firebase Console
- Firebase project credentials

## Creating the Admin User

### Option 1: Through Firebase Console (Recommended)

1. **Go to Firebase Console**
   - Visit [Firebase Console](https://console.firebase.google.com/)
   - Select your project: `pef-8d0fb`

2. **Create the User Account**
   - Navigate to **Authentication** → **Users**
   - Click **Add User**
   - Email: `muneeb@gmail.com`
   - Password: `P@kistan1234`
   - Click **Add User**

3. **Update User Document in Firestore**
   - Navigate to **Firestore Database**
   - Find the `users` collection
   - Locate the user document with the UID from the newly created user
   - Click **Edit** and add/update the following fields:

   ```json
   {
     "name": "Admin User",
     "email": "muneeb@gmail.com",
     "status": "approved",
     "createdAt": [current timestamp],
     "lastUpdated": [current timestamp],
     "profile": {
       "fullName": "Admin User",
       "phone": null,
       "country": null,
       "city": null,
       "languages": null,
       "headline": "Platform Administrator",
       "bio": "Administrator of the Professional Executive Forum",
       "linkedinUrl": null,
       "websiteUrl": null,
       "portfolioUrl": null
     },
     "roles": {
       "isProfessional": false,
       "isJobSeeker": false,
       "isEmployer": false,
       "isBusinessOwner": false,
       "isInvestor": false,
       "isAdmin": true
     },
     "professionalData": {},
     "jobSeekerData": {},
     "employerData": {},
     "businessOwnerData": {},
     "investorData": {}
   }
   ```

4. **Verify Admin Access**
   - Go to your application
   - Log in with:
     - Email: `muneeb@gmail.com`
     - Password: `P@kistan1234`
   - Navigate to `/admin` to access the admin dashboard

### Option 2: Using Firebase Admin SDK (Advanced)

If you prefer to use code, you can use the Firebase Admin SDK:

```javascript
// This requires Firebase Admin SDK setup
const admin = require('firebase-admin');
const { getFirestore } = require('firebase-admin/firestore');
const { getAuth } = require('firebase-admin/auth');

// Initialize Firebase Admin
admin.initializeApp({
  credential: admin.credential.applicationDefault()
});

const db = getFirestore();
const auth = getAuth();

async function createAdminUser() {
  try {
    // Create user in Auth
    const userRecord = await auth.createUser({
      email: 'muneeb@gmail.com',
      password: 'P@kistan1234',
      displayName: 'Admin User',
      emailVerified: true
    });

    // Create user document in Firestore
    await db.collection('users').doc(userRecord.uid).set({
      name: 'Admin User',
      email: 'muneeb@gmail.com',
      status: 'approved',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      lastUpdated: admin.firestore.FieldValue.serverTimestamp(),
      profile: {
        fullName: 'Admin User',
        headline: 'Platform Administrator',
        bio: 'Administrator of the Professional Executive Forum'
      },
      roles: {
        isProfessional: false,
        isJobSeeker: false,
        isEmployer: false,
        isBusinessOwner: false,
        isInvestor: false,
        isAdmin: true
      }
    });

    console.log('Admin user created successfully!');
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

createAdminUser();
```

## Admin Dashboard Features

Once logged in as admin, you can access the admin dashboard at `/admin` which provides:

### Statistics Dashboard
- **Total Users**: View count of all registered users
- **Role Distribution**: See how many users have each role:
  - Professionals
  - Job Seekers
  - Employers
  - Business Owners
  - Investors
  - Admins
- **Status Overview**: Track pending, approved, and rejected users

### User Management
- **Pending Users Tab**: Review and approve/reject new registrations
- **Approved Users Tab**: Manage active users
- **Rejected Users Tab**: View denied applications
- **All Users Tab**: Complete user list with full management

### Available Actions
- **Approve Users**: Grant access to pending registrations
- **Reject Users**: Deny access to registrations
- **Suspend Users**: Temporarily revoke access from approved users
- **Edit Roles**: Assign or remove roles from any user:
  - Professional
  - Job Seeker
  - Employer
  - Business Owner
  - Investor
  - Admin

## Security Notes

- Admin access is controlled by the `isAdmin` role in the user's Firestore document
- All admin API endpoints verify:
  1. Valid Firebase authentication token
  2. User has `isAdmin: true` in their roles
- Only admins can access `/admin` route
- Admin credentials should be kept secure
- Consider changing the default password immediately after first login

## Troubleshooting

### Cannot Access Admin Dashboard
- Verify the user document has `isAdmin: true` in the roles object
- Check that the user status is "approved"
- Ensure you're logged in with the correct email

### Firestore Rules
Make sure your Firestore rules allow admins to read/write user documents:

```javascript
match /users/{userId} {
  allow read: if request.auth != null;
  allow write: if request.auth.uid == userId || 
                  get(/databases/$(database)/documents/users/$(request.auth.uid)).data.roles.isAdmin == true;
}
```

## Next Steps

After creating the admin user:
1. Log in with the admin credentials
2. Review pending user registrations
3. Assign appropriate roles to users
4. Monitor platform statistics
5. Consider creating additional admin users if needed

---

**Important**: Store the admin credentials securely and change the default password after first login.
