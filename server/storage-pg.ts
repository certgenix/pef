import { eq, and } from "drizzle-orm";
import { db } from "./db";
import {
  users,
  userProfiles,
  userRoles,
  professionalProfiles,
  jobSeekerProfiles,
  employerProfiles,
  businessOwnerProfiles,
  investorProfiles,
  opportunities,
  applications,
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
} from "@shared/schema";

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
}

export class PostgresStorage implements IStorage {
  async getUserById(id: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
    return result[0];
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const result = await db.select().from(users).where(eq(users.email, email)).limit(1);
    return result[0];
  }

  async getUserWithRoles(id: string): Promise<{ user: User; roles: UserRoles | null } | undefined> {
    const user = await this.getUserById(id);
    if (!user) return undefined;

    const rolesResult = await db.select().from(userRoles).where(eq(userRoles.userId, id)).limit(1);
    
    return {
      user,
      roles: rolesResult[0] || null,
    };
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const result = await db.insert(users).values(insertUser).returning();
    return result[0];
  }

  async updateUserLastLogin(id: string): Promise<void> {
    await db.update(users)
      .set({ lastLogin: new Date() })
      .where(eq(users.id, id));
  }

  async completeRegistration(data: RegistrationData): Promise<{ user: User; profile: UserProfile }> {
    const user = await db.insert(users).values({
      id: data.userId,
      email: data.email,
      displayName: data.displayName,
      approvalStatus: "approved",
    }).returning();

    const profile = await db.insert(userProfiles).values({
      userId: data.userId,
      ...data.profile,
    }).returning();

    await db.insert(userRoles).values({
      userId: data.userId,
      ...data.roles,
    });

    return { user: user[0], profile: profile[0] };
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const result = await db.insert(userProfiles).values(insertProfile).returning();
    return result[0];
  }

  async createUserRoles(insertRoles: InsertUserRoles): Promise<UserRoles> {
    const result = await db.insert(userRoles).values(insertRoles).returning();
    return result[0];
  }

  async updateUserRoles(userId: string, roles: Omit<InsertUserRoles, "userId">): Promise<void> {
    await db.update(userRoles)
      .set(roles)
      .where(eq(userRoles.userId, userId));
  }

  async createProfessionalProfile(profile: InsertProfessionalProfile): Promise<void> {
    await db.insert(professionalProfiles).values(profile);
  }

  async createJobSeekerProfile(profile: InsertJobSeekerProfile): Promise<void> {
    await db.insert(jobSeekerProfiles).values(profile);
  }

  async createEmployerProfile(profile: InsertEmployerProfile): Promise<void> {
    await db.insert(employerProfiles).values(profile);
  }

  async createBusinessOwnerProfile(profile: InsertBusinessOwnerProfile): Promise<void> {
    await db.insert(businessOwnerProfiles).values(profile);
  }

  async createInvestorProfile(profile: InsertInvestorProfile): Promise<void> {
    await db.insert(investorProfiles).values(profile);
  }

  async createOpportunity(opportunity: InsertOpportunity): Promise<Opportunity> {
    const result = await db.insert(opportunities).values(opportunity).returning();
    return result[0];
  }

  async getOpportunityById(id: string): Promise<Opportunity | undefined> {
    const result = await db.select().from(opportunities).where(eq(opportunities.id, id)).limit(1);
    return result[0];
  }

  async getOpportunitiesByUserId(userId: string): Promise<Opportunity[]> {
    return await db.select().from(opportunities).where(eq(opportunities.userId, userId));
  }

  async getPublicOpportunities(type?: string): Promise<Opportunity[]> {
    if (type) {
      return await db.select()
        .from(opportunities)
        .where(
          and(
            eq(opportunities.approvalStatus, "approved"),
            eq(opportunities.status, "open"),
            eq(opportunities.type, type as any)
          )
        );
    }
    
    return await db.select()
      .from(opportunities)
      .where(
        and(
          eq(opportunities.approvalStatus, "approved"),
          eq(opportunities.status, "open")
        )
      );
  }

  async updateOpportunity(id: string, data: Partial<InsertOpportunity>): Promise<Opportunity | undefined> {
    const result = await db.update(opportunities)
      .set({ ...data, updatedAt: new Date() })
      .where(eq(opportunities.id, id))
      .returning();
    
    return result[0];
  }

  async deleteOpportunity(id: string): Promise<void> {
    await db.delete(opportunities).where(eq(opportunities.id, id));
  }

  async createApplication(insertApplication: InsertApplication): Promise<Application> {
    const result = await db.insert(applications).values(insertApplication).returning();
    return result[0];
  }

  async getApplicationsByUser(userId: string): Promise<Array<Application & { opportunity: Opportunity }>> {
    const result = await db.select({
      application: applications,
      opportunity: opportunities,
    })
      .from(applications)
      .innerJoin(opportunities, eq(applications.opportunityId, opportunities.id))
      .where(eq(applications.userId, userId));
    
    return result.map(row => ({ ...row.application, opportunity: row.opportunity }));
  }

  async getApplicationsByOpportunity(opportunityId: string): Promise<Array<Application & { user: User }>> {
    const result = await db.select({
      application: applications,
      user: users,
    })
      .from(applications)
      .innerJoin(users, eq(applications.userId, users.id))
      .where(eq(applications.opportunityId, opportunityId));
    
    return result.map(row => ({ ...row.application, user: row.user }));
  }

  async updateApplicationStatus(id: string, status: Application['status']): Promise<Application | undefined> {
    const result = await db.update(applications)
      .set({ status, updatedAt: new Date() })
      .where(eq(applications.id, id))
      .returning();
    
    return result[0];
  }

  async checkExistingApplication(userId: string, opportunityId: string): Promise<Application | undefined> {
    const result = await db.select()
      .from(applications)
      .where(and(
        eq(applications.userId, userId),
        eq(applications.opportunityId, opportunityId)
      ))
      .limit(1);
    
    return result[0];
  }

  async getTalentByRole(role: "professional" | "jobSeeker"): Promise<TalentProfile[]> {
    const roleField = role === "professional" ? "isProfessional" : "isJobSeeker";
    
    const rolesData = await db.select()
      .from(userRoles)
      .where(eq(userRoles[roleField], true));
    
    const results: TalentProfile[] = [];
    
    for (const roleData of rolesData) {
      const user = await this.getUserById(roleData.userId);
      if (!user || user.approvalStatus !== "approved") {
        continue;
      }
      
      const profileResult = await db.select()
        .from(userProfiles)
        .where(eq(userProfiles.userId, roleData.userId))
        .limit(1);
      
      if (!profileResult[0]) {
        continue;
      }
      
      let roleSpecificProfile = null;
      
      if (role === "professional") {
        const profResult = await db.select()
          .from(professionalProfiles)
          .where(eq(professionalProfiles.userId, roleData.userId))
          .limit(1);
        roleSpecificProfile = profResult[0] || null;
      } else {
        const jobSeekerResult = await db.select()
          .from(jobSeekerProfiles)
          .where(eq(jobSeekerProfiles.userId, roleData.userId))
          .limit(1);
        roleSpecificProfile = jobSeekerResult[0] || null;
      }
      
      results.push({
        user,
        profile: profileResult[0],
        roleSpecificProfile
      });
    }
    
    return results;
  }
}

export const storage = new PostgresStorage();
