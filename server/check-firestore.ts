import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import { db } from "./firebase-admin";

async function checkData() {
  try {
    const userId = "PsDAn44cGkgdxI6ozrqg388efzX2";
    
    // Check if user exists
    const userDoc = await getDoc(doc(db, "users", userId));
    console.log("User exists:", userDoc.exists());
    if (userDoc.exists()) {
      console.log("User data:", JSON.stringify(userDoc.data(), null, 2));
    }
    
    // Check if roles exist
    const rolesDoc = await getDoc(doc(db, "userRoles", userId));
    console.log("\nRoles exist:", rolesDoc.exists());
    if (rolesDoc.exists()) {
      console.log("Roles data:", JSON.stringify(rolesDoc.data(), null, 2));
    }
    
    // Check jobs
    const jobsQuery = query(collection(db, "opportunities"), where("type", "==", "job"));
    const jobsSnapshot = await getDocs(jobsQuery);
    console.log("\nTotal jobs in Firestore:", jobsSnapshot.size);
    jobsSnapshot.docs.forEach(doc => {
      const data = doc.data();
      console.log("Job:", doc.id, "-", data.title);
    });
  } catch (error) {
    console.error("Error:", error);
  }
  process.exit(0);
}

checkData();
