import { sql } from "drizzle-orm";
import { 
  pgTable, 
  text, 
  varchar, 
  timestamp, 
  boolean, 
  integer,
  json,
  pgEnum
} from "drizzle-orm/pg-core";
import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { z } from "zod";

export const approvalStatusEnum = pgEnum("approval_status", ["pending", "approved", "rejected"]);
export const employmentTypeEnum = pgEnum("employment_type", ["full-time", "part-time", "remote", "contract"]);
export const availabilityEnum = pgEnum("availability", ["immediately", "30-days", "60-days"]);
export const hiringUrgencyEnum = pgEnum("hiring_urgency", ["low", "medium", "high"]);
export const investmentStageEnum = pgEnum("investment_stage", ["idea", "startup", "growth", "mature"]);
export const investmentTypeEnum = pgEnum("investment_type", ["equity", "partnership", "joint-venture"]);
export const opportunityTypeEnum = pgEnum("opportunity_type", ["job", "investment", "partnership", "collaboration"]);
export const opportunityStatusEnum = pgEnum("opportunity_status", ["open", "closed"]);

export const users = pgTable("users", {
  id: varchar("id", { length: 128 }).primaryKey(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  displayName: text("display_name"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  lastLogin: timestamp("last_login"),
  approvalStatus: approvalStatusEnum("approval_status").default("pending").notNull(),
});

export const userProfiles = pgTable("user_profiles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  phone: varchar("phone", { length: 50 }),
  country: varchar("country", { length: 100 }).notNull(),
  city: varchar("city", { length: 100 }),
  languages: text("languages").array(),
  headline: text("headline"),
  bio: text("bio"),
  linkedinUrl: text("linkedin_url"),
  websiteUrl: text("website_url"),
  portfolioUrl: text("portfolio_url"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const userRoles = pgTable("user_roles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  isProfessional: boolean("is_professional").default(false).notNull(),
  isJobSeeker: boolean("is_job_seeker").default(false).notNull(),
  isEmployer: boolean("is_employer").default(false).notNull(),
  isBusinessOwner: boolean("is_business_owner").default(false).notNull(),
  isInvestor: boolean("is_investor").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const professionalProfiles = pgTable("professional_profiles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  yearsOfExperience: integer("years_of_experience"),
  industry: varchar("industry", { length: 255 }),
  skills: text("skills").array(),
  certifications: text("certifications").array(),
  currentJobTitle: text("current_job_title"),
  currentEmployer: text("current_employer"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const jobSeekerProfiles = pgTable("job_seeker_profiles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  targetJobTitles: text("target_job_titles").array(),
  preferredIndustries: text("preferred_industries").array(),
  employmentType: employmentTypeEnum("employment_type"),
  salaryExpectationMin: integer("salary_expectation_min"),
  salaryExpectationMax: integer("salary_expectation_max"),
  availability: availabilityEnum("availability"),
  willingToRelocate: boolean("willing_to_relocate"),
  targetCountries: text("target_countries").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const employerProfiles = pgTable("employer_profiles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  companyName: text("company_name").notNull(),
  industry: varchar("industry", { length: 255 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const businessOwnerProfiles = pgTable("business_owner_profiles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  businessName: text("business_name").notNull(),
  industry: varchar("industry", { length: 255 }),
  companySize: varchar("company_size", { length: 50 }),
  yearsInOperation: integer("years_in_operation"),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  lookingFor: text("looking_for").array(),
  revenueRange: varchar("revenue_range", { length: 100 }),
  capitalRequired: varchar("capital_required", { length: 100 }),
  expansionCountries: text("expansion_countries").array(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const investorProfiles = pgTable("investor_profiles", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  investmentRangeMin: integer("investment_range_min"),
  investmentRangeMax: integer("investment_range_max"),
  preferredSectors: text("preferred_sectors").array(),
  preferredCountries: text("preferred_countries").array(),
  investmentStage: investmentStageEnum("investment_stage"),
  investmentType: investmentTypeEnum("investment_type"),
  investmentThesis: text("investment_thesis"),
  contactPreference: text("contact_preference"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const opportunities = pgTable("opportunities", {
  id: varchar("id", { length: 128 }).primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id", { length: 128 }).notNull().references(() => users.id, { onDelete: "cascade" }),
  type: opportunityTypeEnum("type").notNull(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  sector: varchar("sector", { length: 255 }),
  country: varchar("country", { length: 100 }),
  city: varchar("city", { length: 100 }),
  budgetOrSalary: varchar("budget_or_salary", { length: 100 }),
  contactPreference: text("contact_preference"),
  status: opportunityStatusEnum("status").default("open").notNull(),
  approvalStatus: approvalStatusEnum("approval_status").default("pending").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).omit({ id: true, createdAt: true, lastLogin: true });
export const selectUserSchema = createSelectSchema(users);

export const insertUserProfileSchema = createInsertSchema(userProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectUserProfileSchema = createSelectSchema(userProfiles);

export const insertUserRolesSchema = createInsertSchema(userRoles).omit({ id: true, createdAt: true });
export const selectUserRolesSchema = createSelectSchema(userRoles);

export const insertProfessionalProfileSchema = createInsertSchema(professionalProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectProfessionalProfileSchema = createSelectSchema(professionalProfiles);

export const insertJobSeekerProfileSchema = createInsertSchema(jobSeekerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectJobSeekerProfileSchema = createSelectSchema(jobSeekerProfiles);

export const insertEmployerProfileSchema = createInsertSchema(employerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectEmployerProfileSchema = createSelectSchema(employerProfiles);

export const insertBusinessOwnerProfileSchema = createInsertSchema(businessOwnerProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectBusinessOwnerProfileSchema = createSelectSchema(businessOwnerProfiles);

export const insertInvestorProfileSchema = createInsertSchema(investorProfiles).omit({ id: true, createdAt: true, updatedAt: true });
export const selectInvestorProfileSchema = createSelectSchema(investorProfiles);

export const insertOpportunitySchema = createInsertSchema(opportunities).omit({ id: true, createdAt: true, updatedAt: true });
export const selectOpportunitySchema = createSelectSchema(opportunities);

export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type UserProfile = typeof userProfiles.$inferSelect;
export type InsertUserProfile = z.infer<typeof insertUserProfileSchema>;

export type UserRoles = typeof userRoles.$inferSelect;
export type InsertUserRoles = z.infer<typeof insertUserRolesSchema>;

export type ProfessionalProfile = typeof professionalProfiles.$inferSelect;
export type InsertProfessionalProfile = z.infer<typeof insertProfessionalProfileSchema>;

export type JobSeekerProfile = typeof jobSeekerProfiles.$inferSelect;
export type InsertJobSeekerProfile = z.infer<typeof insertJobSeekerProfileSchema>;

export type EmployerProfile = typeof employerProfiles.$inferSelect;
export type InsertEmployerProfile = z.infer<typeof insertEmployerProfileSchema>;

export type BusinessOwnerProfile = typeof businessOwnerProfiles.$inferSelect;
export type InsertBusinessOwnerProfile = z.infer<typeof insertBusinessOwnerProfileSchema>;

export type InvestorProfile = typeof investorProfiles.$inferSelect;
export type InsertInvestorProfile = z.infer<typeof insertInvestorProfileSchema>;

export type Opportunity = typeof opportunities.$inferSelect;
export type InsertOpportunity = z.infer<typeof insertOpportunitySchema>;
