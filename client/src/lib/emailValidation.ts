import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "./firebase";

export interface EmailCheckResult {
  exists: boolean;
  source?: "registrations" | "users";
  message?: string;
}

export async function checkEmailExists(email: string): Promise<EmailCheckResult> {
  const normalizedEmail = email.trim().toLowerCase();

  try {
    const registrationsRef = collection(db, "registrations");
    const registrationsQuery = query(
      registrationsRef,
      where("email", "==", normalizedEmail)
    );
    const registrationsSnapshot = await getDocs(registrationsQuery);

    if (!registrationsSnapshot.empty) {
      return {
        exists: true,
        source: "registrations",
        message: "This email has already been submitted. Please check your email for registration updates or contact support.",
      };
    }

    const usersRef = collection(db, "users");
    const usersQuery = query(usersRef, where("email", "==", normalizedEmail));
    const usersSnapshot = await getDocs(usersQuery);

    if (!usersSnapshot.empty) {
      return {
        exists: true,
        source: "users",
        message: "An account with this email already exists. Please log in instead.",
      };
    }

    return {
      exists: false,
    };
  } catch (error) {
    console.error("Error checking email existence:", error);
    throw new Error("Failed to verify email. Please try again.");
  }
}
