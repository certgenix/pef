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
  Timestamp,
  addDoc
} from "firebase/firestore";
import { db } from "./firebase-admin";
import { 
  type User,
  type UserProfile,
  type UserRoles,
  type Opportunity,
  type InsertUser,
  type InsertUserProfile,
  type InsertUserRoles,
  type InsertOpportunity,
  type InsertProfessionalProfile,
  type InsertJobSeekerProfile,
  type InsertEmployerProfile,
  type InsertBusinessOwnerProfile,
  type InsertInvestorProfile,
  type ProfessionalProfile,
  type JobSeekerProfile,
} from "@shared/schema";

// Helper function to convert Firestore Timestamps to Date objects
function normalizeDate(value: any): Date {
  if (value?.toDate) return value.toDate();
  if (value instanceof Date) return value;
  return new Date();
}

// Helper function to normalize document data with dates
function normalizeDocData<T>(data: any): T {
  const normalized = { ...data };
  if (data.createdAt) normalized.createdAt = normalizeDate(data.createdAt);
  if (data.updatedAt) normalized.updatedAt = normalizeDate(data.updatedAt);
  if (data.lastLogin) normalized.lastLogin = normalizeDate(data.lastLogin);
  return normalized as T;
}

export interface RegistrationData {
  userId: string;
  email: string;
  displayName: string;
  profile: Omit<InsertUserProfile, "userId">;
  roles: Omit<InsertUserRoles, "userId">;
}

export interface TalentProfile {
  user: User;
  profile: UserProfile;
  roleSpecificProfile: ProfessionalProfile | JobSeekerProfile | null;
}

export interface IStorage {
  getUserById(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  getUserWithRoles(id: string): Promise<{ user: User; roles: UserRoles | null } | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUserLastLogin(id: string): Promise<void>;
  
  completeRegistration(data: RegistrationData): Promise<{ user: User; profile: UserProfile }>;
  
  createUserProfile(profile: InsertUserProfile): Promise<UserProfile>;
  createUserRoles(roles: InsertUserRoles): Promise<UserRoles>;
  updateUserRoles(userId: string, roles: Omit<InsertUserRoles, "userId">): Promise<void>;
  
  createProfessionalProfile(profile: InsertProfessionalProfile): Promise<void>;
  createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<void>;
  createEmployerProfile(profile: InsertEmployerProfile): Promise<void>;
  createBusinessOwnerProfile(profile: InsertBusinessOwnerProfile): Promise<void>;
  createInvestorProfile(profile: InsertInvestorProfile): Promise<void>;
  
  createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity>;
  getOpportunityById(id: string): Promise<Opportunity | undefined>;
  getOpportunitiesByUserId(userId: string): Promise<Opportunity[]>;
  getPublicOpportunities(type?: string): Promise<Opportunity[]>;
  updateOpportunity(id: string, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined>;
  deleteOpportunity(id: string): Promise<void>;
  
  getTalentByRole(role: "professional" | "jobSeeker"): Promise<TalentProfile[]>;
}

export class FirestoreStorage implements IStorage {
  private generateId(): string {
    return doc(collection(db, "temp")).id;
  }

  async getUserById(id: string): Promise<User | undefined> {
    const docRef = doc(db, "users", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return normalizeDocData<User>({ id: docSnap.id, ...docSnap.data() });
    }
    return undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const q = query(collection(db, "users"), where("email", "==", email));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return normalizeDocData<User>({ id: doc.id, ...doc.data() });
    }
    return undefined;
  }

  async getUserWithRoles(id: string): Promise<{ user: User; roles: UserRoles | null } | undefined> {
    const userDocRef = doc(db, "users", id);
    const userSnap = await getDoc(userDocRef);
    
    if (!userSnap.exists()) {
      return undefined;
    }
    
    const userData = userSnap.data();
    const user = normalizeDocData<User>({ id: userSnap.id, ...userData });

    // First check for roles in the userRoles collection
    const rolesDocRef = doc(db, "userRoles", id);
    const rolesSnap = await getDoc(rolesDocRef);
    
    let roles: UserRoles | null = null;
    
    if (rolesSnap.exists()) {
      // Roles exist in separate collection
      const rolesData = rolesSnap.data();
      roles = normalizeDocData<UserRoles>({ id: rolesSnap.id, ...rolesData });
    } else if (userData.roles) {
      // Fallback: Roles embedded in user document (legacy schema)
      // Support both naming conventions: isProfessional (backend) and professional (Firestore)
      roles = {
        id,
        userId: id,
        isProfessional: userData.roles.isProfessional || userData.roles.professional || false,
        isJobSeeker: userData.roles.isJobSeeker || userData.roles.jobSeeker || false,
        isEmployer: userData.roles.isEmployer || userData.roles.employer || false,
        isBusinessOwner: userData.roles.isBusinessOwner || userData.roles.businessOwner || false,
        isInvestor: userData.roles.isInvestor || userData.roles.investor || false,
        createdAt: normalizeDate(userData.createdAt),
      };
    }
    
    return {
      user,
      roles,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const userData: User = {
      id: insertUser.id,
      email: insertUser.email,
      displayName: insertUser.displayName || null,
      createdAt: new Date(),
      lastLogin: null,
      approvalStatus: insertUser.approvalStatus || "pending",
    };
    
    await setDoc(doc(db, "users", insertUser.id), userData);
    return userData;
  }

  async updateUserLastLogin(id: string): Promise<void> {
    const userRef = doc(db, "users", id);
    await updateDoc(userRef, {
      lastLogin: new Date(),
    });
  }

  async completeRegistration(data: RegistrationData): Promise<{ user: User; profile: UserProfile }> {
    try {
      const user: User = {
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        createdAt: new Date(),
        lastLogin: null,
        approvalStatus: "approved",
      };
      
      await setDoc(doc(db, "users", data.userId), user);

      const profileId = this.generateId();
      const profile: UserProfile = {
        id: profileId,
        userId: data.userId,
        fullName: data.profile.fullName,
        phone: data.profile.phone || null,
        country: data.profile.country,
        city: data.profile.city || null,
        languages: data.profile.languages || null,
        headline: data.profile.headline || null,
        bio: data.profile.bio || null,
        linkedinUrl: data.profile.linkedinUrl || null,
        websiteUrl: data.profile.websiteUrl || null,
        portfolioUrl: data.profile.portfolioUrl || null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      await setDoc(doc(db, "userProfiles", profileId), profile);

      const roles: UserRoles = {
        id: data.userId,
        userId: data.userId,
        isProfessional: data.roles.isProfessional || false,
        isJobSeeker: data.roles.isJobSeeker || false,
        isEmployer: data.roles.isEmployer || false,
        isBusinessOwner: data.roles.isBusinessOwner || false,
        isInvestor: data.roles.isInvestor || false,
        createdAt: new Date(),
      };
      
      await setDoc(doc(db, "userRoles", data.userId), roles);

      return { user, profile };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const profileId = this.generateId();
    const profile: UserProfile = {
      id: profileId,
      userId: insertProfile.userId,
      fullName: insertProfile.fullName,
      phone: insertProfile.phone || null,
      country: insertProfile.country,
      city: insertProfile.city || null,
      languages: insertProfile.languages || null,
      headline: insertProfile.headline || null,
      bio: insertProfile.bio || null,
      linkedinUrl: insertProfile.linkedinUrl || null,
      websiteUrl: insertProfile.websiteUrl || null,
      portfolioUrl: insertProfile.portfolioUrl || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, "userProfiles", profileId), profile);
    return profile;
  }

  async createUserRoles(insertRoles: InsertUserRoles): Promise<UserRoles> {
    const roles: UserRoles = {
      id: insertRoles.userId,
      userId: insertRoles.userId,
      isProfessional: insertRoles.isProfessional || false,
      isJobSeeker: insertRoles.isJobSeeker || false,
      isEmployer: insertRoles.isEmployer || false,
      isBusinessOwner: insertRoles.isBusinessOwner || false,
      isInvestor: insertRoles.isInvestor || false,
      createdAt: new Date(),
    };
    
    await setDoc(doc(db, "userRoles", insertRoles.userId), roles);
    return roles;
  }

  async updateUserRoles(userId: string, roles: Omit<InsertUserRoles, "userId">): Promise<void> {
    const rolesRef = doc(db, "userRoles", userId);
    await updateDoc(rolesRef, {
      isProfessional: roles.isProfessional || false,
      isJobSeeker: roles.isJobSeeker || false,
      isEmployer: roles.isEmployer || false,
      isBusinessOwner: roles.isBusinessOwner || false,
      isInvestor: roles.isInvestor || false,
    });
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<void> {
    const profileId = this.generateId();
    await setDoc(doc(db, "professionalProfiles", profileId), {
      id: profileId,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<void> {
    const profileId = this.generateId();
    await setDoc(doc(db, "jobSeekerProfiles", profileId), {
      id: profileId,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createEmployerProfile(profile: InsertEmployerProfile): Promise<void> {
    const profileId = this.generateId();
    await setDoc(doc(db, "employerProfiles", profileId), {
      id: profileId,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createBusinessOwnerProfile(profile: InsertBusinessOwnerProfile): Promise<void> {
    const profileId = this.generateId();
    await setDoc(doc(db, "businessOwnerProfiles", profileId), {
      id: profileId,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createInvestorProfile(profile: InsertInvestorProfile): Promise<void> {
    const profileId = this.generateId();
    await setDoc(doc(db, "investorProfiles", profileId), {
      id: profileId,
      ...profile,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const opportunityId = this.generateId();
    const newOpportunity: Opportunity = {
      id: opportunityId,
      userId: opportunity.userId,
      type: opportunity.type,
      title: opportunity.title,
      description: opportunity.description,
      sector: opportunity.sector || null,
      country: opportunity.country || null,
      city: opportunity.city || null,
      budgetOrSalary: opportunity.budgetOrSalary || null,
      contactPreference: opportunity.contactPreference || null,
      details: opportunity.details || null,
      status: opportunity.status || "open",
      approvalStatus: opportunity.approvalStatus || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, "opportunities", opportunityId), newOpportunity);
    return newOpportunity;
  }

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    const docRef = doc(db, "opportunities", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return normalizeDocData<Opportunity>({ id: docSnap.id, ...docSnap.data() });
    }
    return undefined;
  }

  async getOpportunitiesByUserId(userId: string): Promise<Opportunity[]> {
    const q = query(collection(db, "opportunities"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => 
      normalizeDocData<Opportunity>({ id: doc.id, ...doc.data() })
    );
  }

  async getPublicOpportunities(type?: string): Promise<Opportunity[]> {
    let q;
    if (type) {
      q = query(
        collection(db, "opportunities"),
        where("approvalStatus", "==", "approved"),
        where("status", "==", "open"),
        where("type", "==", type)
      );
    } else {
      q = query(
        collection(db, "opportunities"),
        where("approvalStatus", "==", "approved"),
        where("status", "==", "open")
      );
    }
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => 
      normalizeDocData<Opportunity>({ id: doc.id, ...doc.data() })
    );
  }

  async updateOpportunity(id: string, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const docRef = doc(db, "opportunities", id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: new Date(),
    });
    
    return this.getOpportunityById(id);
  }

  async deleteOpportunity(id: string): Promise<void> {
    const docRef = doc(db, "opportunities", id);
    await deleteDoc(docRef);
  }

  async getTalentByRole(role: "professional" | "jobSeeker"): Promise<TalentProfile[]> {
    const roleField = role === "professional" ? "isProfessional" : "isJobSeeker";
    
    const rolesQuery = query(
      collection(db, "userRoles"),
      where(roleField, "==", true)
    );
    
    const rolesSnapshot = await getDocs(rolesQuery);
    const results: TalentProfile[] = [];
    
    for (const roleDoc of rolesSnapshot.docs) {
      const userId = roleDoc.data().userId;
      
      const user = await this.getUserById(userId);
      if (!user || user.approvalStatus !== "approved") {
        continue;
      }
      
      const profileQuery = query(
        collection(db, "userProfiles"),
        where("userId", "==", userId)
      );
      const profileSnapshot = await getDocs(profileQuery);
      
      if (profileSnapshot.empty) {
        continue;
      }
      
      const profile = normalizeDocData<UserProfile>({ 
        id: profileSnapshot.docs[0].id, 
        ...profileSnapshot.docs[0].data() 
      });
      
      let roleSpecificProfile = null;
      
      if (role === "professional") {
        const profQuery = query(
          collection(db, "professionalProfiles"),
          where("userId", "==", userId)
        );
        const profSnapshot = await getDocs(profQuery);
        if (!profSnapshot.empty) {
          roleSpecificProfile = normalizeDocData<ProfessionalProfile>({ 
            id: profSnapshot.docs[0].id, 
            ...profSnapshot.docs[0].data() 
          });
        }
      } else {
        const jobSeekerQuery = query(
          collection(db, "jobSeekerProfiles"),
          where("userId", "==", userId)
        );
        const jobSeekerSnapshot = await getDocs(jobSeekerQuery);
        if (!jobSeekerSnapshot.empty) {
          roleSpecificProfile = normalizeDocData<JobSeekerProfile>({ 
            id: jobSeekerSnapshot.docs[0].id, 
            ...jobSeekerSnapshot.docs[0].data() 
          });
        }
      }
      
      results.push({
        user,
        profile,
        roleSpecificProfile
      });
    }
    
    return results;
  }
}

export const storage = new FirestoreStorage();
