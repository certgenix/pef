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
  addDoc,
  serverTimestamp
} from "firebase/firestore";
import { db } from "./firebase-admin";
import { 
  type User,
  type UserProfile,
  type UserRoles,
  type Opportunity,
  type Application,
  type InsertUser,
  type InsertUserProfile,
  type InsertUserRoles,
  type InsertOpportunity,
  type InsertApplication,
  type InsertProfessionalProfile,
  type InsertJobSeekerProfile,
  type InsertEmployerProfile,
  type InsertBusinessOwnerProfile,
  type InsertInvestorProfile,
  type ProfessionalProfile,
  type JobSeekerProfile,
  type Video,
  type InsertVideo,
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
  if (data.appliedAt) normalized.appliedAt = normalizeDate(data.appliedAt);
  if (data.publishedAt) normalized.publishedAt = normalizeDate(data.publishedAt);
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
  
  createApplication(application: InsertApplication): Promise<Application>;
  getApplicationsByUser(userId: string): Promise<Array<Application & { opportunity: Opportunity }>>;
  getApplicationsByOpportunity(opportunityId: string): Promise<Array<Application & { user: User }>>;
  updateApplicationStatus(id: string, status: Application['status']): Promise<Application | undefined>;
  checkExistingApplication(userId: string, opportunityId: string): Promise<Application | undefined>;
  
  getTalentByRole(role: "professional" | "jobSeeker"): Promise<TalentProfile[]>;
  
  createVideo(video: InsertVideo): Promise<Video>;
  getAllVideos(): Promise<Video[]>;
  getVideoById(id: string): Promise<Video | undefined>;
  updateVideo(id: string, data: Partial<InsertVideo>): Promise<Video | undefined>;
  deleteVideo(id: string): Promise<void>;
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

    // Get roles from nested field in user document (consolidated structure)
    let roles: UserRoles | null = null;
    
    if (userData.roles) {
      // Roles embedded in user document
      // Support both naming conventions: isProfessional (backend) and professional (Firestore)
      roles = {
        id,
        userId: id,
        isProfessional: userData.roles.isProfessional || userData.roles.professional || false,
        isJobSeeker: userData.roles.isJobSeeker || userData.roles.jobSeeker || false,
        isEmployer: userData.roles.isEmployer || userData.roles.employer || false,
        isBusinessOwner: userData.roles.isBusinessOwner || userData.roles.businessOwner || false,
        isInvestor: userData.roles.isInvestor || userData.roles.investor || false,
        isAdmin: userData.roles.isAdmin || userData.roles.admin || false,
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
      preRegistered: insertUser.preRegistered || false,
      preRegisteredAt: insertUser.preRegisteredAt || null,
      registrationSource: insertUser.registrationSource || null,
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
      // Get existing user document to preserve fields like name, status, lastUpdated
      const existingUserSnap = await getDoc(doc(db, "users", data.userId));
      const existingUserData = existingUserSnap.exists() ? existingUserSnap.data() : {};
      
      // Consolidated structure: everything in one users document
      // Use merge to preserve existing fields set during registration
      const consolidatedUserData = {
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        createdAt: new Date(),
        lastLogin: null,
        approvalStatus: "approved",
        // Preserve existing fields
        name: existingUserData.name || data.profile.fullName,
        status: existingUserData.status || "pending",
        lastUpdated: new Date(),
        profile: {
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
        },
        roles: {
          isProfessional: data.roles.isProfessional || false,
          isJobSeeker: data.roles.isJobSeeker || false,
          isEmployer: data.roles.isEmployer || false,
          isBusinessOwner: data.roles.isBusinessOwner || false,
          isInvestor: data.roles.isInvestor || false,
          isAdmin: data.roles.isAdmin || false,
        },
        professionalData: existingUserData.professionalData || {},
        jobSeekerData: existingUserData.jobSeekerData || {},
        employerData: existingUserData.employerData || {},
        businessOwnerData: existingUserData.businessOwnerData || {},
        investorData: existingUserData.investorData || {},
      };
      
      // Use merge to preserve any existing fields
      await setDoc(doc(db, "users", data.userId), consolidatedUserData, { merge: true });

      const user: User = {
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        createdAt: new Date(),
        lastLogin: null,
        approvalStatus: "approved",
        preRegistered: false,
        preRegisteredAt: null,
        registrationSource: null,
      };

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

      return { user, profile };
    } catch (error) {
      console.error("Registration error:", error);
      throw error;
    }
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    // Update nested profile field in user document (consolidated structure)
    const userRef = doc(db, "users", insertProfile.userId);
    await updateDoc(userRef, {
      profile: {
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
      }
    });
    
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
    
    return profile;
  }

  async createUserRoles(insertRoles: InsertUserRoles): Promise<UserRoles> {
    // Update nested roles field in user document (consolidated structure)
    const userRef = doc(db, "users", insertRoles.userId);
    await updateDoc(userRef, {
      "roles.isProfessional": insertRoles.isProfessional || false,
      "roles.isJobSeeker": insertRoles.isJobSeeker || false,
      "roles.isEmployer": insertRoles.isEmployer || false,
      "roles.isBusinessOwner": insertRoles.isBusinessOwner || false,
      "roles.isInvestor": insertRoles.isInvestor || false,
    });
    
    const roles: UserRoles = {
      id: insertRoles.userId,
      userId: insertRoles.userId,
      isProfessional: insertRoles.isProfessional || false,
      isJobSeeker: insertRoles.isJobSeeker || false,
      isEmployer: insertRoles.isEmployer || false,
      isBusinessOwner: insertRoles.isBusinessOwner || false,
      isInvestor: insertRoles.isInvestor || false,
      isAdmin: insertRoles.isAdmin || false,
      createdAt: new Date(),
    };
    
    return roles;
  }

  async updateUserRoles(userId: string, roles: Omit<InsertUserRoles, "userId">): Promise<void> {
    // Update nested roles field in user document (consolidated structure)
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      "roles.isProfessional": roles.isProfessional || false,
      "roles.isJobSeeker": roles.isJobSeeker || false,
      "roles.isEmployer": roles.isEmployer || false,
      "roles.isBusinessOwner": roles.isBusinessOwner || false,
      "roles.isInvestor": roles.isInvestor || false,
    });
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<void> {
    // Store in nested field within user document (consolidated structure)
    const userRef = doc(db, "users", profile.userId);
    await updateDoc(userRef, {
      professionalData: {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<void> {
    // Store in nested field within user document (consolidated structure)
    const userRef = doc(db, "users", profile.userId);
    await updateDoc(userRef, {
      jobSeekerData: {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async createEmployerProfile(profile: InsertEmployerProfile): Promise<void> {
    // Store in nested field within user document (consolidated structure)
    const userRef = doc(db, "users", profile.userId);
    await updateDoc(userRef, {
      employerData: {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async createBusinessOwnerProfile(profile: InsertBusinessOwnerProfile): Promise<void> {
    // Store in nested field within user document (consolidated structure)
    const userRef = doc(db, "users", profile.userId);
    await updateDoc(userRef, {
      businessOwnerData: {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
  }

  async createInvestorProfile(profile: InsertInvestorProfile): Promise<void> {
    // Store in nested field within user document (consolidated structure)
    const userRef = doc(db, "users", profile.userId);
    await updateDoc(userRef, {
      investorData: {
        ...profile,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
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
      approvalStatus: opportunity.approvalStatus || "approved",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    console.log("Creating opportunity with approvalStatus:", newOpportunity.approvalStatus, "status:", newOpportunity.status);
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
    const opportunities = querySnapshot.docs.map(doc => 
      normalizeDocData<Opportunity>({ id: doc.id, ...doc.data() })
    );
    
    console.log(`Found ${opportunities.length} public opportunities (type: ${type || 'all'})`);
    opportunities.forEach(opp => {
      console.log(`  - ${opp.title} | status: ${opp.status} | approvalStatus: ${opp.approvalStatus}`);
    });
    
    return opportunities;
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

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const applicationId = this.generateId();
    const newApplication: Application = {
      id: applicationId,
      userId: insertApplication.userId,
      opportunityId: insertApplication.opportunityId,
      status: insertApplication.status || "applied",
      metadata: insertApplication.metadata || null,
      appliedAt: new Date(),
      updatedAt: new Date(),
    };
    
    await setDoc(doc(db, "applications", applicationId), newApplication);
    return newApplication;
  }

  async getApplicationsByUser(userId: string): Promise<Array<Application & { opportunity: Opportunity }>> {
    const q = query(collection(db, "applications"), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    const results: Array<Application & { opportunity: Opportunity }> = [];
    
    for (const appDoc of querySnapshot.docs) {
      const application = normalizeDocData<Application>({ id: appDoc.id, ...appDoc.data() });
      const opportunity = await this.getOpportunityById(application.opportunityId);
      
      if (opportunity) {
        results.push({ ...application, opportunity });
      }
    }
    
    return results;
  }

  async getApplicationsByOpportunity(opportunityId: string): Promise<Array<Application & { user: User }>> {
    const q = query(collection(db, "applications"), where("opportunityId", "==", opportunityId));
    const querySnapshot = await getDocs(q);
    
    const results: Array<Application & { user: User }> = [];
    
    for (const appDoc of querySnapshot.docs) {
      const application = normalizeDocData<Application>({ id: appDoc.id, ...appDoc.data() });
      const user = await this.getUserById(application.userId);
      
      if (user) {
        results.push({ ...application, user });
      }
    }
    
    return results;
  }

  async updateApplicationStatus(id: string, status: Application['status']): Promise<Application | undefined> {
    const docRef = doc(db, "applications", id);
    await updateDoc(docRef, {
      status,
      updatedAt: new Date(),
    });
    
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return normalizeDocData<Application>({ id: docSnap.id, ...docSnap.data() });
    }
    return undefined;
  }

  async checkExistingApplication(userId: string, opportunityId: string): Promise<Application | undefined> {
    const q = query(
      collection(db, "applications"),
      where("userId", "==", userId),
      where("opportunityId", "==", opportunityId)
    );
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const doc = querySnapshot.docs[0];
      return normalizeDocData<Application>({ id: doc.id, ...doc.data() });
    }
    return undefined;
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

  async getInvestors(): Promise<Array<{user: User; investorData: any}>> {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const results: Array<{user: User; investorData: any}> = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user has investor role
      if (userData.roles?.isInvestor || userData.roles?.investor) {
        const user = normalizeDocData<User>({ id: userDoc.id, ...userData });
        
        // Only include approved users
        if (user.approvalStatus === "approved") {
          results.push({
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              approvalStatus: user.approvalStatus,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin,
              preRegistered: user.preRegistered,
              preRegisteredAt: user.preRegisteredAt,
              registrationSource: user.registrationSource,
            },
            investorData: userData.investorData || {}
          });
        }
      }
    }
    
    return results;
  }

  async getBusinessOwners(): Promise<Array<{user: User; businessOwnerData: any}>> {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const results: Array<{user: User; businessOwnerData: any}> = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      
      // Check if user has business owner role
      if (userData.roles?.isBusinessOwner || userData.roles?.businessOwner) {
        const user = normalizeDocData<User>({ id: userDoc.id, ...userData });
        
        // Only include approved users
        if (user.approvalStatus === "approved") {
          results.push({
            user: {
              id: user.id,
              email: user.email,
              displayName: user.displayName,
              approvalStatus: user.approvalStatus,
              createdAt: user.createdAt,
              lastLogin: user.lastLogin,
              preRegistered: user.preRegistered,
              preRegisteredAt: user.preRegisteredAt,
              registrationSource: user.registrationSource,
            },
            businessOwnerData: userData.businessOwnerData || {}
          });
        }
      }
    }
    
    return results;
  }

  async getAllUsers(): Promise<Array<any>> {
    const usersSnapshot = await getDocs(collection(db, "users"));
    const users: Array<any> = [];
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      users.push({
        uid: userDoc.id,
        ...userData,
        createdAt: normalizeDate(userData.createdAt),
        lastUpdated: normalizeDate(userData.lastUpdated),
      });
    }
    
    return users;
  }

  async getAdminStats(): Promise<any> {
    const usersSnapshot = await getDocs(collection(db, "users"));
    
    const stats = {
      totalUsers: 0,
      professionals: 0,
      jobSeekers: 0,
      employers: 0,
      businessOwners: 0,
      investors: 0,
      admins: 0,
      pendingApprovals: 0,
      approved: 0,
      rejected: 0,
    };
    
    for (const userDoc of usersSnapshot.docs) {
      const userData = userDoc.data();
      stats.totalUsers++;
      
      if (userData.roles?.isProfessional || userData.roles?.professional) stats.professionals++;
      if (userData.roles?.isJobSeeker || userData.roles?.jobSeeker) stats.jobSeekers++;
      if (userData.roles?.isEmployer || userData.roles?.employer) stats.employers++;
      if (userData.roles?.isBusinessOwner || userData.roles?.businessOwner) stats.businessOwners++;
      if (userData.roles?.isInvestor || userData.roles?.investor) stats.investors++;
      if (userData.roles?.isAdmin || userData.roles?.admin) stats.admins++;
      
      if (userData.status === "pending") stats.pendingApprovals++;
      if (userData.status === "approved") stats.approved++;
      if (userData.status === "rejected") stats.rejected++;
    }
    
    return stats;
  }

  async updateUserStatus(userId: string, status: string): Promise<void> {
    const userRef = doc(db, "users", userId);
    await updateDoc(userRef, {
      status,
      lastUpdated: new Date(),
    });
  }

  async createVideo(video: InsertVideo): Promise<Video> {
    const videoData = {
      title: video.title,
      description: video.description || null,
      youtubeId: video.youtubeId,
      thumbnailUrl: video.thumbnailUrl || null,
      publishedAt: video.publishedAt || null,
      featured: video.featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const docRef = await addDoc(collection(db, "videos"), videoData);
    
    return {
      id: docRef.id,
      ...videoData,
    };
  }

  async getAllVideos(): Promise<Video[]> {
    const videosSnapshot = await getDocs(collection(db, "videos"));
    const videos: Video[] = [];
    
    for (const videoDoc of videosSnapshot.docs) {
      const videoData = videoDoc.data();
      videos.push(normalizeDocData<Video>({
        id: videoDoc.id,
        ...videoData,
      }));
    }
    
    return videos.sort((a, b) => {
      const dateA = a.publishedAt || a.createdAt;
      const dateB = b.publishedAt || b.createdAt;
      return dateB.getTime() - dateA.getTime();
    });
  }

  async getVideoById(id: string): Promise<Video | undefined> {
    const docRef = doc(db, "videos", id);
    const docSnap = await getDoc(docRef);
    
    if (docSnap.exists()) {
      return normalizeDocData<Video>({ id: docSnap.id, ...docSnap.data() });
    }
    return undefined;
  }

  async updateVideo(id: string, data: Partial<InsertVideo>): Promise<Video | undefined> {
    const docRef = doc(db, "videos", id);
    
    const updateData: any = {
      updatedAt: Timestamp.now(),
    };
    
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.youtubeId !== undefined) updateData.youtubeId = data.youtubeId;
    if (data.thumbnailUrl !== undefined) updateData.thumbnailUrl = data.thumbnailUrl || null;
    if (data.featured !== undefined) updateData.featured = data.featured;
    
    if (data.publishedAt !== undefined) {
      updateData.publishedAt = data.publishedAt || null;
    }
    
    await updateDoc(docRef, updateData);
    
    const updatedDoc = await getDoc(docRef);
    if (updatedDoc.exists()) {
      return normalizeDocData<Video>({ id: updatedDoc.id, ...updatedDoc.data() });
    }
    return undefined;
  }

  async deleteVideo(id: string): Promise<void> {
    const docRef = doc(db, "videos", id);
    await deleteDoc(docRef);
  }
}

export const storage = new FirestoreStorage();
