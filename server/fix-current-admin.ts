import { doc, setDoc, getDoc, getDocs, collection, query } from "firebase/firestore";
import { db } from "./firebase-admin";

async function fixCurrentAdmin() {
  console.log("🔧 Fixing Admin Access for Current User...\n");

  try {
    // Get all users from Firestore
    console.log("Step 1: Finding your user in Firestore...");
    const usersRef = collection(db, "users");
    const allUsers = await getDocs(usersRef);

    if (allUsers.empty) {
      console.log("\n❌ ERROR: No users found in Firestore!");
      console.log("Please make sure you've registered/logged in at least once.");
      process.exit(1);
    }

    console.log(`\nFound ${allUsers.size} user(s) in Firestore:\n`);
    
    // List all users
    allUsers.docs.forEach((docSnapshot, index) => {
      const data = docSnapshot.data();
      console.log(`${index + 1}. ${data.email || 'No email'}`);
      console.log(`   UID: ${docSnapshot.id}`);
      console.log(`   Admin: ${data.roles?.admin || data.roles?.isAdmin ? '✅ YES' : '❌ NO'}`);
      console.log(`   Status: ${data.approvalStatus || 'unknown'}\n`);
    });

    // Get target user from environment variable or use a specific email
    const targetEmail = process.env.ADMIN_EMAIL || "admin@pef.com";
    const targetUID = process.env.ADMIN_UID;

    let currentUserDoc;
    let currentUserData;
    let userId;

    if (targetUID) {
      // If UID is provided, use that
      currentUserDoc = allUsers.docs.find(doc => doc.id === targetUID);
      if (!currentUserDoc) {
        console.log(`\n❌ ERROR: No user found with UID: ${targetUID}`);
        process.exit(1);
      }
      currentUserData = currentUserDoc.data();
      userId = currentUserDoc.id;
      console.log(`\n✓ Found user by UID: ${currentUserData.email}`);
    } else {
      // Find user by email
      currentUserDoc = allUsers.docs.find(doc => doc.data().email === targetEmail);
      if (!currentUserDoc) {
        console.log(`\n❌ ERROR: No user found with email: ${targetEmail}`);
        console.log(`\nPlease either:`);
        console.log(`1. Set ADMIN_EMAIL environment variable to target a specific user`);
        console.log(`2. Set ADMIN_UID environment variable to target a specific user by UID`);
        console.log(`\nExample: ADMIN_EMAIL=your@email.com npm run fix-admin`);
        console.log(`Example: ADMIN_UID=your-firebase-uid npm run fix-admin`);
        process.exit(1);
      }
      currentUserData = currentUserDoc.data();
      userId = currentUserDoc.id;
      console.log(`\n✓ Found user by email: ${currentUserData.email}`);
    }

    console.log(`  UID: ${userId}`);

    // Step 2: Fix the user's roles
    console.log("\nStep 2: Updating user to be admin...");
    
    const updatedDoc = {
      ...currentUserData,
      approvalStatus: "approved",
      status: "approved",
      // Fix roles with both formats for compatibility
      roles: {
        professional: currentUserData.roles?.professional || currentUserData.roles?.isProfessional || false,
        jobSeeker: currentUserData.roles?.jobSeeker || currentUserData.roles?.isJobSeeker || false,
        employer: currentUserData.roles?.employer || currentUserData.roles?.isEmployer || false,
        businessOwner: currentUserData.roles?.businessOwner || currentUserData.roles?.isBusinessOwner || false,
        investor: currentUserData.roles?.investor || currentUserData.roles?.isInvestor || false,
        admin: true,  // Set admin to true
        isAdmin: true,  // Legacy support
        isProfessional: currentUserData.roles?.professional || currentUserData.roles?.isProfessional || false,
        isJobSeeker: currentUserData.roles?.jobSeeker || currentUserData.roles?.isJobSeeker || false,
        isEmployer: currentUserData.roles?.employer || currentUserData.roles?.isEmployer || false,
        isBusinessOwner: currentUserData.roles?.businessOwner || currentUserData.roles?.isBusinessOwner || false,
        isInvestor: currentUserData.roles?.investor || currentUserData.roles?.isInvestor || false,
      },
      // Ensure profile exists
      profile: currentUserData.profile || {
        fullName: currentUserData.displayName || currentUserData.name || "Admin User",
        phone: null,
        country: null,
        city: null,
        languages: null,
        headline: "Platform Administrator",
        bio: "Administrator",
        linkedinUrl: null,
        websiteUrl: null,
        portfolioUrl: null,
      },
      // Ensure empty role data exists
      professionalData: currentUserData.professionalData || {},
      jobSeekerData: currentUserData.jobSeekerData || {},
      employerData: currentUserData.employerData || {},
      businessOwnerData: currentUserData.businessOwnerData || {},
      investorData: currentUserData.investorData || {},
    };

    await setDoc(doc(db, "users", userId), updatedDoc, { merge: true });
    console.log("✅ User updated successfully!");

    // Step 3: Verify
    console.log("\nStep 3: Verifying the fix...");
    const verifyDoc = await getDoc(doc(db, "users", userId));
    
    if (verifyDoc.exists()) {
      const data = verifyDoc.data();
      console.log("\n✅ Verification Results:");
      console.log(`  ✓ Email: ${data.email}`);
      console.log(`  ✓ Approval Status: ${data.approvalStatus}`);
      console.log(`  ✓ Admin Role (admin): ${data.roles?.admin ? '✅ TRUE' : '❌ FALSE'}`);
      console.log(`  ✓ Admin Role (isAdmin): ${data.roles?.isAdmin ? '✅ TRUE' : '❌ FALSE'}`);
      
      if (!data.roles?.admin && !data.roles?.isAdmin) {
        console.log("\n❌ ERROR: Admin role still not set!");
        process.exit(1);
      }
      
      console.log("\n✅ ALL FIXED!");
      console.log("\nNow:");
      console.log("1. Log out of your application");
      console.log("2. Log back in with your email:", data.email);
      console.log("3. You should now have admin access!");
      console.log("4. Navigate to /admin to see the admin dashboard");
    } else {
      console.log("\n❌ ERROR: Could not verify user document");
      process.exit(1);
    }

  } catch (error) {
    console.error("\n❌ Error:", error);
    process.exit(1);
  }
}

fixCurrentAdmin()
  .then(() => {
    console.log("\n✅ Done!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("\n❌ Fatal error:", error);
    process.exit(1);
  });
