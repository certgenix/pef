import { eq } from "drizzle-orm";
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
  type User,
  type UserProfile,
  type UserRoles,
  type InsertUser,
  type InsertUserProfile,
  type InsertUserRoles,
  type InsertProfessionalProfile,
  type InsertJobSeekerProfile,
  type InsertEmployerProfile,
  type InsertBusinessOwnerProfile,
  type InsertInvestorProfile,
} from "@shared/schema";

export interface RegistrationData {
  userId: string;
  email: string;
  displayName: string;
  profile: Omit<InsertUserProfile, "userId">;
  roles: Omit<InsertUserRoles, "userId">;
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
    return await db.transaction(async (tx) => {
      const [user] = await tx.insert(users).values({
        id: data.userId,
        email: data.email,
        displayName: data.displayName,
        approvalStatus: "pending",
      }).returning();

      const [profile] = await tx.insert(userProfiles).values({
        userId: user.id,
        ...data.profile,
      }).returning();

      await tx.insert(userRoles).values({
        userId: user.id,
        ...data.roles,
      });

      return { user, profile };
    });
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
}

export const storage = new DatabaseStorage();
