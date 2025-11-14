import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import {
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged,
  sendPasswordResetEmail,
  sendEmailVerification,
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "@/lib/firebase";
import { User, UserRoles } from "../../../shared/types";

interface ProfileData {
  phone?: string | null;
  country?: string | null;
  city?: string | null;
  languages?: string[] | null;
  headline?: string | null;
  bio?: string | null;
  linkedinUrl?: string | null;
  websiteUrl?: string | null;
  portfolioUrl?: string | null;
}

interface AuthContextType {
  currentUser: FirebaseUser | null;
  userData: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string, roles: UserRoles, profileData?: ProfileData) => Promise<void>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  async function syncUserToBackend(user: User, firebaseUser: FirebaseUser, retries = 3): Promise<boolean> {
    let lastError: Error | null = null;
    
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const token = await firebaseUser.getIdToken();
        
        const response = await fetch("/api/auth/complete-registration", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            profile: {
              fullName: user.name,
              country: user.country || "",
              city: user.city || null,
              phone: user.phone || null,
              languages: user.languages || null,
              headline: user.headline || null,
              bio: user.bio || null,
              linkedinUrl: user.links?.linkedin || null,
              websiteUrl: user.links?.website || null,
              portfolioUrl: user.links?.portfolio || null,
            },
            roles: {
              professional: user.roles?.professional || false,
              jobSeeker: user.roles?.jobSeeker || false,
              employer: user.roles?.employer || false,
              businessOwner: user.roles?.businessOwner || false,
              investor: user.roles?.investor || false,
            },
          }),
        });

        if (response.ok) {
          return true;
        }

        const error = await response.json();
        if (error.error === "User already registered") {
          return true;
        }

        lastError = new Error(error.error || "Backend sync failed");
        
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      } catch (syncError) {
        lastError = syncError as Error;
        if (attempt < retries - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000 * (attempt + 1)));
        }
      }
    }

    console.error("Failed to sync user to backend after retries:", lastError);
    return false;
  }

  async function fetchUserData(uid: string, firebaseUser?: FirebaseUser) {
    try {
      const userDoc = await getDoc(doc(db, "users", uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        const userData = {
          ...data,
          uid,
          createdAt: data.createdAt?.toDate(),
          lastUpdated: data.lastUpdated?.toDate(),
        } as User;
        
        if (firebaseUser) {
          const synced = await syncUserToBackend(userData, firebaseUser);
          if (!synced) {
            console.error("Backend sync failed. Signing out user to prevent broken state.");
            await firebaseSignOut(auth);
            setUserData(null);
            throw new Error("Failed to sync user data to backend. Please try logging in again.");
          }
        }
        
        setUserData(userData);
      } else {
        setUserData(null);
      }
    } catch (error) {
      console.error("Error fetching user data:", error);
      setUserData(null);
      throw error;
    }
  }

  async function refreshUserData() {
    if (currentUser) {
      await fetchUserData(currentUser.uid, currentUser);
    }
  }

  async function register(
    email: string,
    password: string,
    name: string,
    roles: UserRoles,
    profileData?: ProfileData
  ) {
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      email,
      password
    );

    await sendEmailVerification(userCredential.user);

    const newUser: Omit<User, "uid"> = {
      name,
      email,
      roles,
      status: "pending",
      createdAt: new Date(),
      lastUpdated: new Date(),
      ...(profileData?.phone && { phone: profileData.phone }),
      ...(profileData?.country && { country: profileData.country }),
      ...(profileData?.city && { city: profileData.city }),
      ...(profileData?.languages && { languages: profileData.languages }),
      ...(profileData?.headline && { headline: profileData.headline }),
      ...(profileData?.bio && { bio: profileData.bio }),
      links: {
        ...(profileData?.linkedinUrl && { linkedin: profileData.linkedinUrl }),
        ...(profileData?.websiteUrl && { website: profileData.websiteUrl }),
        ...(profileData?.portfolioUrl && { portfolio: profileData.portfolioUrl }),
      },
    };

    const links: any = {};
    if (profileData?.linkedinUrl) links.linkedin = profileData.linkedinUrl;
    if (profileData?.websiteUrl) links.website = profileData.websiteUrl;
    if (profileData?.portfolioUrl) links.portfolio = profileData.portfolioUrl;

    const firestoreData: any = {
      name,
      email,
      roles,
      status: "pending",
      createdAt: serverTimestamp(),
      lastUpdated: serverTimestamp(),
      links,
    };

    if (profileData?.phone) firestoreData.phone = profileData.phone;
    if (profileData?.country) firestoreData.country = profileData.country;
    if (profileData?.city) firestoreData.city = profileData.city;
    if (profileData?.languages) firestoreData.languages = profileData.languages;
    if (profileData?.headline) firestoreData.headline = profileData.headline;
    if (profileData?.bio) firestoreData.bio = profileData.bio;

    await setDoc(doc(db, "users", userCredential.user.uid), firestoreData);

    const userData: User = {
      ...newUser,
      uid: userCredential.user.uid,
    };

    const synced = await syncUserToBackend(userData, userCredential.user);
    if (!synced) {
      await firebaseSignOut(auth);
      throw new Error("Failed to complete registration. Please try again or contact support.");
    }

    await firebaseSignOut(auth);
  }

  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(auth, email, password);
  }

  async function logout() {
    await firebaseSignOut(auth);
    setUserData(null);
  }

  async function resetPassword(email: string) {
    await sendPasswordResetEmail(auth, email);
  }

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setCurrentUser(user);
      if (user) {
        await fetchUserData(user.uid, user);
      } else {
        setUserData(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = {
    currentUser,
    userData,
    loading,
    login,
    register,
    logout,
    resetPassword,
    refreshUserData,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}
