import { eq, and, or } from "drizzle-orm";
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

export class DatabaseStorage implements IStorage {
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
    if (!user) {
      return undefined;
    }

    const rolesResult = await db
      .select()
      .from(userRoles)
      .where(eq(userRoles.userId, id))
      .limit(1);

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
    try {
      const [user] = await db.insert(users).values({
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        approvalStatus: "approved",
      }).returning();

      const [profile] = await db.insert(userProfiles).values({
        userId: user.id,
        ...data.profile,
      }).returning();

      await db.insert(userRoles).values({
        userId: user.id,
        ...data.roles,
      });

      return { user, profile };
    } catch (error) {
      console.error("Registration error:", error);
      try {
        await db.delete(userRoles).where(eq(userRoles.userId, data.userId));
        await db.delete(userProfiles).where(eq(userProfiles.userId, data.userId));
        await db.delete(users).where(eq(users.id, data.userId));
      } catch (cleanupError) {
        console.error("Cleanup error during registration rollback:", cleanupError);
      }
      throw error;
    }
  }

  async createUserProfile(insertProfile: InsertUserProfile): Promise<UserProfile> {
    const result = await db.insert(userProfiles).values(insertProfile).returning();
    return result[0];
  }

  async createUserRoles(insertRoles: InsertUserRoles): Promise<UserRoles> {
    const result = await db.insert(userRoles).values(insertRoles).returning();
    return result[0];
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
    const conditions = [
      eq(opportunities.approvalStatus, "approved"),
      eq(opportunities.status, "open")
    ];
    
    if (type) {
      conditions.push(eq(opportunities.type, type as any));
    }
    
    return await db.select().from(opportunities).where(and(...conditions));
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

  async getTalentByRole(role: "professional" | "jobSeeker"): Promise<TalentProfile[]> {
    const roleField = role === "professional" ? "isProfessional" : "isJobSeeker";
    
    const usersWithRoles = await db
      .select()
      .from(users)
      .innerJoin(userRoles, eq(users.id, userRoles.userId))
      .innerJoin(userProfiles, eq(users.id, userProfiles.userId))
      .where(and(
        eq(users.approvalStatus, "approved"),
        eq(userRoles[roleField], true)
      ));

    const results: TalentProfile[] = [];
    
    for (const row of usersWithRoles) {
      let roleSpecificProfile = null;
      
      if (role === "professional") {
        const profProfile = await db
          .select()
          .from(professionalProfiles)
          .where(eq(professionalProfiles.userId, row.users.id))
          .limit(1);
        roleSpecificProfile = profProfile[0] || null;
      } else {
        const jobSeekerProfile = await db
          .select()
          .from(jobSeekerProfiles)
          .where(eq(jobSeekerProfiles.userId, row.users.id))
          .limit(1);
        roleSpecificProfile = jobSeekerProfile[0] || null;
      }
      
      results.push({
        user: row.users,
        profile: row.user_profiles,
        roleSpecificProfile
      });
    }
    
    return results;
  }
}

export const storage = new DatabaseStorage();
