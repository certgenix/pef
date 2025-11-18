import { db } from "./firebase";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  Timestamp,
  addDoc,
} from "firebase/firestore";
import type {
  FirestoreUser,
  FirestoreJobPost,
  FirestoreBusinessOpportunity,
  FirestoreApplication,
  FirestoreInvestorInterest,
} from "@shared/firestoreTypes";

const convertTimestamp = (timestamp: any): Date => {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  if (timestamp instanceof Date) {
    return timestamp;
  }
  if (typeof timestamp === "string") {
    return new Date(timestamp);
  }
  return new Date();
};

export const usersCollection = collection(db, "users");
export const jobPostsCollection = collection(db, "jobPosts");
export const businessOpportunitiesCollection = collection(db, "businessOpportunities");
export const applicationsCollection = collection(db, "applications");
export const investorInterestsCollection = collection(db, "investorInterests");

export async function getUserData(uid: string): Promise<FirestoreUser | null> {
  try {
    const userDoc = await getDoc(doc(usersCollection, uid));
    if (!userDoc.exists()) return null;

    const data = userDoc.data();
    return {
      ...data,
      uid: userDoc.id,
      createdAt: convertTimestamp(data.createdAt),
      lastUpdated: convertTimestamp(data.lastUpdated),
    } as FirestoreUser;
  } catch (error) {
    console.error("Error fetching user data:", error);
    return null;
  }
}

export async function updateUserData(
  uid: string,
  data: Partial<FirestoreUser>
): Promise<void> {
  try {
    const userRef = doc(usersCollection, uid);
    await updateDoc(userRef, {
      ...data,
      lastUpdated: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating user data:", error);
    throw error;
  }
}

export async function createJobPost(
  jobPost: Omit<FirestoreJobPost, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(jobPostsCollection, {
      ...jobPost,
      applicants: [],
      status: "open",
      approvalStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating job post:", error);
    throw error;
  }
}

export async function getJobPost(id: string): Promise<FirestoreJobPost | null> {
  try {
    const jobDoc = await getDoc(doc(jobPostsCollection, id));
    if (!jobDoc.exists()) return null;

    const data = jobDoc.data();
    return {
      ...data,
      id: jobDoc.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as FirestoreJobPost;
  } catch (error) {
    console.error("Error fetching job post:", error);
    return null;
  }
}

export async function getJobPosts(filters?: {
  employerId?: string;
  status?: string;
  limit?: number;
}): Promise<FirestoreJobPost[]> {
  try {
    let q = query(jobPostsCollection, orderBy("createdAt", "desc"));

    if (filters?.employerId) {
      q = query(q, where("employerId", "==", filters.employerId));
    }
    if (filters?.status) {
      q = query(q, where("status", "==", filters.status));
    }
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as FirestoreJobPost;
    });
  } catch (error) {
    console.error("Error fetching job posts:", error);
    return [];
  }
}

export async function updateJobPost(
  id: string,
  data: Partial<FirestoreJobPost>
): Promise<void> {
  try {
    const jobRef = doc(jobPostsCollection, id);
    await updateDoc(jobRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating job post:", error);
    throw error;
  }
}

export async function deleteJobPost(id: string): Promise<void> {
  try {
    await deleteDoc(doc(jobPostsCollection, id));
  } catch (error) {
    console.error("Error deleting job post:", error);
    throw error;
  }
}

export async function createBusinessOpportunity(
  opportunity: Omit<FirestoreBusinessOpportunity, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(businessOpportunitiesCollection, {
      ...opportunity,
      interestedInvestors: [],
      status: "open",
      approvalStatus: "pending",
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error("Error creating business opportunity:", error);
    throw error;
  }
}

export async function getBusinessOpportunity(
  id: string
): Promise<FirestoreBusinessOpportunity | null> {
  try {
    const oppDoc = await getDoc(doc(businessOpportunitiesCollection, id));
    if (!oppDoc.exists()) return null;

    const data = oppDoc.data();
    return {
      ...data,
      id: oppDoc.id,
      createdAt: convertTimestamp(data.createdAt),
      updatedAt: convertTimestamp(data.updatedAt),
    } as FirestoreBusinessOpportunity;
  } catch (error) {
    console.error("Error fetching business opportunity:", error);
    return null;
  }
}

export async function getBusinessOpportunities(filters?: {
  ownerId?: string;
  type?: string;
  limit?: number;
}): Promise<FirestoreBusinessOpportunity[]> {
  try {
    let q = query(businessOpportunitiesCollection, orderBy("createdAt", "desc"));

    if (filters?.ownerId) {
      q = query(q, where("ownerId", "==", filters.ownerId));
    }
    if (filters?.type) {
      q = query(q, where("type", "==", filters.type));
    }
    if (filters?.limit) {
      q = query(q, limit(filters.limit));
    }

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as FirestoreBusinessOpportunity;
    });
  } catch (error) {
    console.error("Error fetching business opportunities:", error);
    return [];
  }
}

export async function updateBusinessOpportunity(
  id: string,
  data: Partial<FirestoreBusinessOpportunity>
): Promise<void> {
  try {
    const oppRef = doc(businessOpportunitiesCollection, id);
    await updateDoc(oppRef, {
      ...data,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating business opportunity:", error);
    throw error;
  }
}

export async function deleteBusinessOpportunity(id: string): Promise<void> {
  try {
    await deleteDoc(doc(businessOpportunitiesCollection, id));
  } catch (error) {
    console.error("Error deleting business opportunity:", error);
    throw error;
  }
}

export async function createApplication(
  application: Omit<FirestoreApplication, "id" | "appliedAt" | "updatedAt">
): Promise<string> {
  try {
    const docRef = await addDoc(applicationsCollection, {
      ...application,
      appliedAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    const jobRef = doc(jobPostsCollection, application.jobPostId);
    const jobDoc = await getDoc(jobRef);
    if (jobDoc.exists()) {
      const currentApplicants = jobDoc.data().applicants || [];
      await updateDoc(jobRef, {
        applicants: [...currentApplicants, application.userId],
      });
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating application:", error);
    throw error;
  }
}

export async function getApplicationsByUser(
  userId: string
): Promise<FirestoreApplication[]> {
  try {
    const q = query(
      applicationsCollection,
      where("userId", "==", userId),
      orderBy("appliedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        appliedAt: convertTimestamp(data.appliedAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as FirestoreApplication;
    });
  } catch (error) {
    console.error("Error fetching user applications:", error);
    return [];
  }
}

export async function getApplicationsByJobPost(
  jobPostId: string
): Promise<FirestoreApplication[]> {
  try {
    const q = query(
      applicationsCollection,
      where("jobPostId", "==", jobPostId),
      orderBy("appliedAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        appliedAt: convertTimestamp(data.appliedAt),
        updatedAt: convertTimestamp(data.updatedAt),
      } as FirestoreApplication;
    });
  } catch (error) {
    console.error("Error fetching job applications:", error);
    return [];
  }
}

export async function updateApplicationStatus(
  id: string,
  status: FirestoreApplication["status"]
): Promise<void> {
  try {
    const appRef = doc(applicationsCollection, id);
    await updateDoc(appRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error updating application status:", error);
    throw error;
  }
}

export async function createInvestorInterest(
  interest: Omit<FirestoreInvestorInterest, "id" | "createdAt">
): Promise<string> {
  try {
    const docRef = await addDoc(investorInterestsCollection, {
      ...interest,
      createdAt: serverTimestamp(),
    });

    const oppRef = doc(businessOpportunitiesCollection, interest.opportunityId);
    const oppDoc = await getDoc(oppRef);
    if (oppDoc.exists()) {
      const currentInvestors = oppDoc.data().interestedInvestors || [];
      if (!currentInvestors.includes(interest.userId)) {
        await updateDoc(oppRef, {
          interestedInvestors: [...currentInvestors, interest.userId],
        });
      }
    }

    return docRef.id;
  } catch (error) {
    console.error("Error creating investor interest:", error);
    throw error;
  }
}

export async function getInvestorInterestsByOpportunity(
  opportunityId: string
): Promise<FirestoreInvestorInterest[]> {
  try {
    const q = query(
      investorInterestsCollection,
      where("opportunityId", "==", opportunityId),
      orderBy("createdAt", "desc")
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        id: doc.id,
        createdAt: convertTimestamp(data.createdAt),
      } as FirestoreInvestorInterest;
    });
  } catch (error) {
    console.error("Error fetching investor interests:", error);
    return [];
  }
}

export async function getAllUsers(): Promise<FirestoreUser[]> {
  try {
    const snapshot = await getDocs(usersCollection);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        lastUpdated: convertTimestamp(data.lastUpdated),
      } as FirestoreUser;
    });
  } catch (error) {
    console.error("Error fetching all users:", error);
    return [];
  }
}

export async function getUsersByRole(role: keyof FirestoreUser["roles"]): Promise<FirestoreUser[]> {
  try {
    const q = query(usersCollection, where(`roles.${role}`, "==", true));
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        ...data,
        uid: doc.id,
        createdAt: convertTimestamp(data.createdAt),
        lastUpdated: convertTimestamp(data.lastUpdated),
      } as FirestoreUser;
    });
  } catch (error) {
    console.error(`Error fetching users by role ${role}:`, error);
    return [];
  }
}
