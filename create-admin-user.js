/**
 * Admin User Creation Script
 * 
 * This script creates an admin user in Firebase with the specified credentials.
 * Run once with: node create-admin-user.js
 * 
 * SECURITY NOTE: This script should be run in a secure environment and deleted after use.
 */

import { initializeApp } from 'firebase/app';
import { getAuth, createUserWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, setDoc, serverTimestamp } from 'firebase/firestore';

// Firebase configuration (same as in client)
const firebaseConfig = {
  apiKey: "AIzaSyB4L4MiJp9w3tY7u8E3TKTLKQ0TVuJ23Tc",
  authDomain: "pef-8d0fb.firebaseapp.com",
  projectId: "pef-8d0fb",
  storageBucket: "pef-8d0fb.firebasestorage.app",
  messagingSenderId: "341598394434",
  appId: "1:341598394434:web:25f55ffb17ab7ecc70c3e5"
};

// Admin credentials
const ADMIN_EMAIL = 'muneeb@gmail.com';
const ADMIN_PASSWORD = 'P@kistan1234';
const ADMIN_NAME = 'Admin User';

async function createAdminUser() {
  try {
    console.log('Initializing Firebase...');
    const app = initializeApp(firebaseConfig);
    const auth = getAuth(app);
    const db = getFirestore(app);

    console.log(`Creating admin user: ${ADMIN_EMAIL}...`);
    
    // Create the user in Firebase Auth
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      ADMIN_EMAIL,
      ADMIN_PASSWORD
    );

    const user = userCredential.user;
    console.log(`✅ Admin user created with UID: ${user.uid}`);

    // Create user document in Firestore with admin role
    const userData = {
      name: ADMIN_NAME,
      email: ADMIN_EMAIL,
      status: 'approved', // Admin is auto-approved
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      profile: {
        fullName: ADMIN_NAME,
        phone: null,
        country: null,
        city: null,
        languages: null,
        headline: 'Platform Administrator',
        bio: 'Administrator of the Professional Executive Forum',
        linkedinUrl: null,
        websiteUrl: null,
        portfolioUrl: null
      },
      roles: {
        isProfessional: false,
        isJobSeeker: false,
        isEmployer: false,
        isBusinessOwner: false,
        isInvestor: false,
        isAdmin: true // Admin role
      },
      professionalData: {},
      jobSeekerData: {},
      employerData: {},
      businessOwnerData: {},
      investorData: {}
    };

    await setDoc(doc(db, 'users', user.uid), userData);
    console.log('✅ Admin user document created in Firestore');
    
    console.log('\n🎉 Admin user created successfully!');
    console.log(`Email: ${ADMIN_EMAIL}`);
    console.log(`Password: ${ADMIN_PASSWORD}`);
    console.log('\n⚠️  IMPORTANT: Please delete this script after running it for security purposes.');
    
    process.exit(0);
  } catch (error) {
    if (error.code === 'auth/email-already-in-use') {
      console.error('❌ Error: Email already in use. Admin user may already exist.');
    } else {
      console.error('❌ Error creating admin user:', error.message);
    }
    process.exit(1);
  }
}

createAdminUser();
