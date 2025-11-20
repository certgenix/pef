import { doc, setDoc, getDoc, getDocs, collection, query, where, deleteDoc } from "firebase/firestore";
import { db } from "./firebase-admin";

const ADMIN_EMAIL = "muneeb@gmail.com";
const ADMIN_NAME = "Admin User";

async function setupAdmin() {
  console.log("🔧 Starting Admin User Setup...\n");

  try {
    // Step 1: Check for existing admin users and clean them up
    console.log("Step 1: Checking for existing admin users...");
    const usersRef = collection(db, "users");
    const adminQuery = query(usersRef, where("email", "==", ADMIN_EMAIL));
    const existingAdmins = await getDocs(adminQuery);

    if (!existingAdmins.empty) {
      console.log(`Found ${existingAdmins.size} existing user(s) with email ${ADMIN_EMAIL}`);
      for (const docSnapshot of existingAdmins.docs) {
        const data = docSnapshot.data();
        console.log(`  - User ID: ${docSnapshot.id}`);
        console.log(`  - Current roles:`, data.roles || "MISSING");
        console.log(`  - Approval status:`, data.approvalStatus || "MISSING");
      }
    } else {
      console.log("No existing admin users found.");
    }

    // Step 2: Prompt for Firebase UID
    console.log("\n⚠️  IMPORTANT: You need to create the Firebase Auth user first!");
    console.log("\nTo create the admin user:");
    console.log("1. Go to Firebase Console: https://console.firebase.google.com/");
    console.log("2. Select your project");
    console.log("3. Go to Authentication → Users");
    console.log("4. Click 'Add User'");
    console.log(`5. Email: ${ADMIN_EMAIL}`);
    console.log("6. Password: [Set a secure password]");
    console.log("7. Copy the UID of the created user");
    
    // For automation, we'll use environment variable or hardcoded UID
    const ADMIN_UID = process.env.ADMIN_UID || "PLEASE_SET_UID";
    
    if (ADMIN_UID === "PLEASE_SET_UID") {
      console.log("\n❌ ERROR: Please set ADMIN_UID environment variable with the Firebase Auth UID");
      console.log("   Example: ADMIN_UID=your-firebase-uid npm run setup-admin");
      process.exit(1);
    }

    console.log(`\nUsing UID: ${ADMIN_UID}`);

    // Step 3: Create or update the Firestore document with correct structure
    console.log("\nStep 3: Creating/updating Firestore document...");
    
    const adminDoc = {
      id: ADMIN_UID,
      email: ADMIN_EMAIL,
      displayName: ADMIN_NAME,
      createdAt: new Date(),
      lastLogin: null,
      approvalStatus: "approved",
      preRegistered: false,
      preRegisteredAt: null,
      registrationSource: null,
      // Embedded profile (consolidated structure)
      profile: {
        fullName: ADMIN_NAME,
        phone: null,
        country: null,
        city: null,
        languages: null,
        headline: "Platform Administrator",
        bio: "Administrator of the Professional Executive Forum",
        linkedinUrl: null,
        websiteUrl: null,
        portfolioUrl: null,
      },
      // Embedded roles (consolidated structure)
      roles: {
        isProfessional: false,
        isJobSeeker: false,
        isEmployer: false,
        isBusinessOwner: false,
        isInvestor: false,
        isAdmin: true,  // THIS IS THE KEY FIELD
      },
      // Empty role-specific data
      professionalData: {},
      jobSeekerData: {},
      employerData: {},
      businessOwnerData: {},
      investorData: {},
      // Additional fields
      name: ADMIN_NAME,
      status: "approved",
      lastUpdated: new Date(),
    };

    await setDoc(doc(db, "users", ADMIN_UID), adminDoc, { merge: true });
    console.log("✅ Admin user document created/updated successfully!");

    // Step 4: Verify the setup
    console.log("\nStep 4: Verifying setup...");
    const verifyDoc = await getDoc(doc(db, "users", ADMIN_UID));
    
    if (verifyDoc.exists()) {
      const data = verifyDoc.data();
      console.log("\n✅ Verification Results:");
      console.log(`  ✓ User ID: ${verifyDoc.id}`);
      console.log(`  ✓ Email: ${data.email}`);
      console.log(`  ✓ Display Name: ${data.displayName}`);
      console.log(`  ✓ Approval Status: ${data.approvalStatus}`);
      console.log(`  ✓ Admin Role: ${data.roles?.isAdmin ? '✅ TRUE' : '❌ FALSE'}`);
      
      if (!data.roles?.isAdmin) {
        console.log("\n❌ ERROR: Admin role is not set correctly!");
        process.exit(1);
      }
      
      console.log("\n✅ Admin user setup completed successfully!");
      console.log("\nYou can now log in with:");
      console.log(`  Email: ${ADMIN_EMAIL}`);
      console.log(`  Password: [The password you set in Firebase Console]`);
      console.log(`  Admin Dashboard: /admin`);
    } else {
      console.log("\n❌ ERROR: Could not verify admin user document");
      process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ Error setting up admin user:", error);
    process.exit(1);
  }
}

setupAdmin()
  .then(() => {
    console.log("\n✅ All done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
