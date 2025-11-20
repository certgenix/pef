import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "./firebase-admin";

async function updateAdminEmail() {
  const uid = 'aiJxjmV3f0Ta03bBrar0NFxpgdT2';
  const newEmail = 'admin@pef.com';
  
  console.log('🔧 Updating admin email to admin@pef.com...\n');
  
  try {
    // Get current user document
    const userDocRef = doc(db, "users", uid);
    const userDoc = await getDoc(userDocRef);
    
    if (!userDoc.exists()) {
      console.error('❌ User not found!');
      return;
    }
    
    const userData = userDoc.data();
    console.log('Current email:', userData.email);
    
    // Update only the email field
    await setDoc(userDocRef, {
      email: newEmail
    }, { merge: true });
    
    console.log('✅ Email updated to:', newEmail);
    
    // Verify
    const updated = await getDoc(userDocRef);
    const updatedData = updated.data();
    
    console.log('\n✅ Verification:');
    console.log('  Email:', updatedData?.email);
    console.log('  Admin:', updatedData?.roles?.isAdmin ? '✅ TRUE' : '❌ FALSE');
    console.log('  Status:', updatedData?.approvalStatus);
    console.log('\nYou can now log in with:');
    console.log('  Email:', newEmail);
    console.log('  Password: [The password you set in Firebase Console]');
    console.log('  Admin Dashboard: /admin');
    
  } catch (error) {
    console.error('❌ Error:', error);
  }
}

updateAdminEmail()
  .then(() => {
    console.log('\n✅ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  });
