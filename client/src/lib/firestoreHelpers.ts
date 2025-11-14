import {
  doc,
  updateDoc,
  collection,
  addDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
  deleteDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "./firebase";
import {
  ProfessionalData,
  JobSeekerData,
  EmployerData,
  BusinessOwnerData,
  InvestorData,
  JobListing,
  Opportunity,
  BusinessListing,
  InvestmentListing,
} from "../../../shared/types";

export async function updateUserProfessionalData(
  userId: string,
  data: ProfessionalData
) {
  await updateDoc(doc(db, "users", userId), {
    professionalData: data,
    lastUpdated: serverTimestamp(),
  });
}

export async function updateUserJobSeekerData(
  userId: string,
  data: JobSeekerData
) {
  await updateDoc(doc(db, "users", userId), {
    jobSeekerData: data,
    lastUpdated: serverTimestamp(),
  });
}

export async function updateUserEmployerData(
  userId: string,
  data: EmployerData
) {
  await updateDoc(doc(db, "users", userId), {
    employerData: data,
    lastUpdated: serverTimestamp(),
  });
}

export async function updateUserBusinessOwnerData(
  userId: string,
  data: BusinessOwnerData
) {
  await updateDoc(doc(db, "users", userId), {
    businessOwnerData: data,
    lastUpdated: serverTimestamp(),
  });
}

export async function updateUserInvestorData(
  userId: string,
  data: InvestorData
) {
  await updateDoc(doc(db, "users", userId), {
    investorData: data,
    lastUpdated: serverTimestamp(),
  });
}

export async function createJobListing(
  data: Omit<JobListing, "id" | "createdAt" | "lastUpdated">
) {
  const docRef = await addDoc(collection(db, "jobs"), {
    ...data,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
  return docRef.id;
}

export async function getJobListings(status?: "pending" | "approved" | "rejected") {
  const jobsRef = collection(db, "jobs");
  let q = status
    ? query(jobsRef, where("status", "==", status))
    : query(jobsRef);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  })) as JobListing[];
}

export async function getApprovedJobListings() {
  return getJobListings("approved");
}

export async function createOpportunity(
  data: Omit<Opportunity, "id" | "createdAt" | "lastUpdated">
) {
  const docRef = await addDoc(collection(db, "opportunities"), {
    ...data,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
  return docRef.id;
}

export async function getOpportunities(status?: "pending" | "approved" | "rejected") {
  const oppsRef = collection(db, "opportunities");
  let q = status
    ? query(oppsRef, where("status", "==", status))
    : query(oppsRef);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  })) as Opportunity[];
}

export async function createBusinessListing(
  data: Omit<BusinessListing, "id" | "createdAt" | "lastUpdated">
) {
  const docRef = await addDoc(collection(db, "businessListings"), {
    ...data,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
  return docRef.id;
}

export async function getBusinessListings(status?: "pending" | "approved" | "rejected") {
  const bizRef = collection(db, "businessListings");
  let q = status
    ? query(bizRef, where("status", "==", status))
    : query(bizRef);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  })) as BusinessListing[];
}

export async function createInvestmentListing(
  data: Omit<InvestmentListing, "id" | "createdAt" | "lastUpdated">
) {
  const docRef = await addDoc(collection(db, "investmentListings"), {
    ...data,
    createdAt: serverTimestamp(),
    lastUpdated: serverTimestamp(),
  });
  return docRef.id;
}

export async function getInvestmentListings(status?: "pending" | "approved" | "rejected") {
  const invRef = collection(db, "investmentListings");
  let q = status
    ? query(invRef, where("status", "==", status))
    : query(invRef);

  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  })) as InvestmentListing[];
}

export async function approveUserRegistration(userId: string) {
  await updateDoc(doc(db, "users", userId), {
    status: "approved",
    lastUpdated: serverTimestamp(),
  });
}

export async function rejectUserRegistration(userId: string) {
  await updateDoc(doc(db, "users", userId), {
    status: "rejected",
    lastUpdated: serverTimestamp(),
  });
}

export async function approveJobListing(jobId: string) {
  await updateDoc(doc(db, "jobs", jobId), {
    status: "approved",
    lastUpdated: serverTimestamp(),
  });
}

export async function rejectJobListing(jobId: string) {
  await updateDoc(doc(db, "jobs", jobId), {
    status: "rejected",
    lastUpdated: serverTimestamp(),
  });
}

export async function deleteJobListing(jobId: string) {
  await deleteDoc(doc(db, "jobs", jobId));
}

export async function getAllPendingUsers() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("status", "==", "pending"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  }));
}

export async function getAllApprovedUsers() {
  const usersRef = collection(db, "users");
  const q = query(usersRef, where("status", "==", "approved"));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    uid: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  }));
}

export async function getJobsByUserId(userId: string) {
  const jobsRef = collection(db, "jobs");
  const q = query(jobsRef, where("userId", "==", userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map((doc) => ({
    ...doc.data(),
    id: doc.id,
    createdAt: doc.data().createdAt?.toDate(),
    lastUpdated: doc.data().lastUpdated?.toDate(),
  })) as JobListing[];
}

export async function getJobById(jobId: string) {
  const docRef = doc(db, "jobs", jobId);
  const docSnap = await getDoc(docRef);
  
  if (docSnap.exists()) {
    return {
      ...docSnap.data(),
      id: docSnap.id,
      createdAt: docSnap.data().createdAt?.toDate(),
      lastUpdated: docSnap.data().lastUpdated?.toDate(),
    } as JobListing;
  }
  
  return null;
}
