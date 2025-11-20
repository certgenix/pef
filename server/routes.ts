import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserProfileSchema, insertUserRolesSchema, insertOpportunitySchema, insertApplicationSchema, jobDetailsSchema, insertVideoSchema, insertLeaderSchema, insertGalleryImageSchema, insertMembershipTierSchema, insertMembershipApplicationSchema } from "@shared/schema";
import { Resend } from "resend";
import { db } from "./firebase-admin";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

const AUTO_APPROVE_JOBS = true;

async function getResendClient() {
  const apiKey = process.env.RESEND_API_KEY;
  
  if (!apiKey) {
    throw new Error('RESEND_API_KEY environment variable not set');
  }
  
  return {
    client: new Resend(apiKey),
    fromEmail: "onboarding@resend.dev"
  };
}

const completeRegistrationSchema = z.object({
  profile: insertUserProfileSchema.omit({ userId: true }),
  roles: z.object({
    professional: z.boolean().optional(),
    jobSeeker: z.boolean().optional(),
    employer: z.boolean().optional(),
    businessOwner: z.boolean().optional(),
    investor: z.boolean().optional(),
    admin: z.boolean().optional(),
  }),
});

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/auth/complete-registration", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const validationResult = completeRegistrationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.issues 
        });
      }

      const { profile, roles } = validationResult.data;

      const token = authHeader.substring(7);
      
      let uid: string;
      let email: string;
      let displayName: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        console.warn("WARNING: Firebase Admin SDK not configured. Token verification is DISABLED. This is INSECURE for production!");
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
          email = decodedToken.email;
          displayName = profile.fullName;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet. Please contact support." });
      }

      const existingUser = await storage.getUserById(uid);
      if (existingUser) {
        return res.status(400).json({ error: "User already registered" });
      }

      const result = await storage.completeRegistration({
        userId: uid,
        email,
        displayName,
        profile,
        roles: {
          isProfessional: roles.professional || false,
          isJobSeeker: roles.jobSeeker || false,
          isEmployer: roles.employer || false,
          isBusinessOwner: roles.businessOwner || false,
          isInvestor: roles.investor || false,
          isAdmin: roles.admin || false,
        },
      });

      return res.json({
        success: true,
        message: "Registration completed successfully. Your account is pending admin approval.",
        user: result.user,
        profile: result.profile,
      });
    } catch (error) {
      console.error("Registration error:", error);
      return res.status(500).json({ 
        error: "Registration failed",
        message: error instanceof Error ? error.message : "Unknown error"
      });
    }
  });

  app.get("/api/auth/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const result = await storage.getUserWithRoles(uid);
      if (!result) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUserLastLogin(uid);

      return res.json({ 
        user: result.user,
        roles: result.roles 
      });
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  });

  app.post("/api/opportunities", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || (!userWithRoles.roles?.isEmployer && !userWithRoles.roles?.isBusinessOwner)) {
        return res.status(403).json({ error: "Only employers and business owners can post opportunities" });
      }

      const opportunityType = req.body.type as string;
      
      if (userWithRoles.roles?.isEmployer && !userWithRoles.roles?.isBusinessOwner && opportunityType !== "job") {
        return res.status(403).json({ error: "Employers can only post job opportunities" });
      }

      if (userWithRoles.roles?.isBusinessOwner && !userWithRoles.roles?.isEmployer && opportunityType === "job") {
        return res.status(403).json({ error: "Business owners cannot post job opportunities (select employer role to post jobs)" });
      }

      if (req.body.details && opportunityType === "job") {
        const detailsValidation = jobDetailsSchema.safeParse(req.body.details);
        if (!detailsValidation.success) {
          return res.status(400).json({
            error: "Invalid job details",
            details: detailsValidation.error.issues
          });
        }
      }

      const approvalStatus = AUTO_APPROVE_JOBS ? "approved" : "pending";

      const opportunityData = {
        ...req.body,
        userId: uid,
      };

      const validationResult = insertOpportunitySchema.safeParse({
        ...opportunityData,
        approvalStatus,
      });

      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.issues 
        });
      }

      const opportunity = await storage.createOpportunity(validationResult.data);
      return res.json(opportunity);
    } catch (error) {
      console.error("Opportunity creation error:", error);
      return res.status(500).json({ error: "Failed to create opportunity" });
    }
  });

  app.get("/api/opportunities", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      const type = req.query.type as string | undefined;
      const myOpportunities = req.query.myOpportunities === "true";

      if (myOpportunities) {
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
          return res.status(401).json({ error: "Unauthorized" });
        }

        const token = authHeader.substring(7);
        let uid: string;

        if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } else {
          return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
        }

        const userWithRoles = await storage.getUserWithRoles(uid);
        if (!userWithRoles || (!userWithRoles.roles?.isEmployer && !userWithRoles.roles?.isBusinessOwner)) {
          return res.status(403).json({ error: "Only employers and business owners can view their posted opportunities" });
        }

        const opportunities = await storage.getOpportunitiesByUserId(uid);
        return res.json(opportunities);
      }

      const opportunities = await storage.getPublicOpportunities(type);
      return res.json(opportunities);
    } catch (error) {
      console.error("Opportunities fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch opportunities" });
    }
  });

  app.patch("/api/opportunities/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const { id } = req.params;
      const opportunity = await storage.getOpportunityById(id);

      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      if (opportunity.userId !== uid) {
        return res.status(403).json({ error: "Not authorized to update this opportunity" });
      }

      const updateData = { ...req.body };
      delete updateData.approvalStatus;
      delete updateData.userId;
      delete updateData.id;

      if (updateData.details) {
        const detailsValidation = jobDetailsSchema.safeParse(updateData.details);
        if (!detailsValidation.success) {
          return res.status(400).json({
            error: "Invalid job details",
            details: detailsValidation.error.issues
          });
        }
      }

      const updated = await storage.updateOpportunity(id, updateData);
      return res.json(updated);
    } catch (error) {
      console.error("Opportunity update error:", error);
      return res.status(500).json({ error: "Failed to update opportunity" });
    }
  });

  app.delete("/api/opportunities/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const { id } = req.params;
      const opportunity = await storage.getOpportunityById(id);

      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      if (opportunity.userId !== uid) {
        return res.status(403).json({ error: "Not authorized to delete this opportunity" });
      }

      await storage.deleteOpportunity(id);
      return res.json({ success: true });
    } catch (error) {
      console.error("Opportunity deletion error:", error);
      return res.status(500).json({ error: "Failed to delete opportunity" });
    }
  });

  app.post("/api/applications", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const validationResult = insertApplicationSchema.safeParse({
        opportunityId: req.body.opportunityId,
        userId: uid,
        status: req.body.status || "applied",
        metadata: req.body.metadata,
      });

      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues
        });
      }

      const opportunity = await storage.getOpportunityById(validationResult.data.opportunityId);

      if (!opportunity) {
        return res.status(404).json({ error: "Opportunity not found" });
      }

      if (opportunity.type !== "job") {
        return res.status(400).json({ error: "Can only apply to job opportunities" });
      }

      if (opportunity.status !== "open") {
        return res.status(400).json({ error: "This opportunity is no longer open" });
      }

      if (opportunity.approvalStatus !== "approved") {
        return res.status(400).json({ error: "This opportunity is not yet approved" });
      }

      const existingApplication = await storage.checkExistingApplication(
        uid,
        validationResult.data.opportunityId
      );

      if (existingApplication) {
        return res.status(409).json({ error: "You have already applied to this opportunity" });
      }

      const application = await storage.createApplication(validationResult.data);
      return res.json(application);
    } catch (error) {
      console.error("Application creation error:", error);
      
      if (error instanceof Error && error.message.includes("duplicate key")) {
        return res.status(409).json({ error: "You have already applied to this opportunity" });
      }
      
      return res.status(500).json({ error: "Failed to create application" });
    }
  });

  app.get("/api/applications/me", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const applications = await storage.getApplicationsByUser(uid);
      return res.json(applications);
    } catch (error) {
      console.error("Applications fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch applications" });
    }
  });

  app.get("/api/talent", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isEmployer) {
        return res.status(403).json({ error: "Only employers can browse talent" });
      }

      const role = req.query.role as "professional" | "jobSeeker";
      if (!role || (role !== "professional" && role !== "jobSeeker")) {
        return res.status(400).json({ error: "Valid role parameter required (professional or jobSeeker)" });
      }

      const talent = await storage.getTalentByRole(role);
      return res.json(talent);
    } catch (error) {
      console.error("Talent fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch talent" });
    }
  });

  app.get("/api/investors", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isBusinessOwner) {
        return res.status(403).json({ error: "Only business owners can view investors" });
      }

      const investors = await storage.getInvestors();
      return res.json(investors);
    } catch (error) {
      console.error("Investors fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch investors" });
    }
  });

  app.get("/api/business-owners", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isInvestor) {
        return res.status(403).json({ error: "Only investors can view business owners" });
      }

      const businessOwners = await storage.getBusinessOwners();
      return res.json(businessOwners);
    } catch (error) {
      console.error("Business owners fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch business owners" });
    }
  });

  app.post("/api/users/assign-roles", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const { roles } = req.body;
      if (!roles || typeof roles !== "object") {
        return res.status(400).json({ error: "Roles object is required" });
      }

      await storage.updateUserRoles(uid, {
        isProfessional: roles.professional || false,
        isJobSeeker: roles.jobSeeker || false,
        isEmployer: roles.employer || false,
        isBusinessOwner: roles.businessOwner || false,
        isInvestor: roles.investor || false,
      });

      return res.json({ success: true, message: "Roles updated successfully" });
    } catch (error) {
      console.error("Role assignment error:", error);
      return res.status(500).json({ error: "Failed to assign roles" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const users = await storage.getAllUsers();
      return res.json(users);
    } catch (error) {
      console.error("Admin users fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch users" });
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const stats = await storage.getAdminStats();
      return res.json(stats);
    } catch (error) {
      console.error("Admin stats fetch error:", error);
      return res.status(500).json({ error: "Failed to fetch stats" });
    }
  });

  app.post("/api/admin/users/:userId/status", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId } = req.params;
      const { status } = req.body;

      if (!["pending", "approved", "rejected"].includes(status)) {
        return res.status(400).json({ error: "Invalid status" });
      }

      await storage.updateUserStatus(userId, status);
      return res.json({ success: true, message: "User status updated successfully" });
    } catch (error) {
      console.error("Admin status update error:", error);
      return res.status(500).json({ error: "Failed to update user status" });
    }
  });

  app.post("/api/admin/users/:userId/roles", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
        uid = decodedToken.user_id;
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not configured yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const { userId } = req.params;
      const { roles } = req.body;

      if (!roles || typeof roles !== "object") {
        return res.status(400).json({ error: "Roles object is required" });
      }

      await storage.updateUserRoles(userId, {
        isProfessional: roles.professional || false,
        isJobSeeker: roles.jobSeeker || false,
        isEmployer: roles.employer || false,
        isBusinessOwner: roles.businessOwner || false,
        isInvestor: roles.investor || false,
        isAdmin: roles.admin || false,
      });

      return res.json({ success: true, message: "User roles updated successfully" });
    } catch (error) {
      console.error("Admin role update error:", error);
      return res.status(500).json({ error: "Failed to update user roles" });
    }
  });

  app.post("/api/public-opportunities", async (req, res) => {
    try {
      const publicOpportunitySchema = z.object({
        name: z.string().trim().min(1, "Name is required"),
        email: z.string().trim().email("Valid email is required"),
        type: z.enum(["job", "investment", "partnership", "collaboration"], {
          errorMap: () => ({ message: "Please select a valid opportunity type" }),
        }),
        title: z.string().trim().min(10, "Title must be at least 10 characters"),
        description: z.string().trim().min(20, "Description must be at least 20 characters"),
        sector: z.string().trim().optional(),
        country: z.string().trim().min(1, "Country is required"),
        city: z.string().trim().optional(),
        budgetOrSalary: z.string().trim().optional(),
        contactPreference: z.string().trim().optional(),
        employmentType: z.enum(["full-time", "part-time", "remote", "contract"]).optional(),
        experienceRequired: z.string().trim().optional(),
        skills: z.string().trim().optional(),
        benefits: z.string().trim().optional(),
        applicationEmail: z.union([z.string().trim().email(), z.literal("")]).optional(),
        investmentAmount: z.string().trim().optional(),
        investmentType: z.string().trim().optional(),
        partnershipType: z.string().trim().optional(),
      });

      const validationResult = publicOpportunitySchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({
          error: "Invalid request data",
          details: validationResult.error.issues,
        });
      }

      const { 
        name, 
        email, 
        type, 
        title, 
        description,
        sector,
        country,
        city,
        budgetOrSalary,
        contactPreference,
        employmentType,
        experienceRequired,
        skills,
        benefits,
        applicationEmail,
        investmentAmount,
        investmentType,
        partnershipType,
      } = validationResult.data;

      if (type === "job") {
        if (!applicationEmail) {
          return res.status(400).json({
            error: "Application email is required for job postings",
          });
        }
        if (!employmentType) {
          return res.status(400).json({
            error: "Employment type is required for job postings",
          });
        }
      }

      const details: any = {};
      
      if (type === "job") {
        if (employmentType) details.employmentType = employmentType;
        if (experienceRequired) details.experienceRequired = experienceRequired;
        if (skills) details.skills = skills.split(",").map(s => s.trim()).filter(Boolean);
        if (benefits) details.benefits = benefits.split(",").map(b => b.trim()).filter(Boolean);
        if (applicationEmail) details.applicationEmail = applicationEmail;
      } else if (type === "investment") {
        if (investmentAmount) details.investmentAmount = investmentAmount;
        if (investmentType) details.investmentType = investmentType;
      } else if (type === "partnership") {
        if (partnershipType) details.partnershipType = partnershipType;
      }

      const opportunitiesRef = collection(db, "opportunities");
      const newOpportunity = {
        submitterName: name,
        submitterEmail: email,
        type,
        title,
        description,
        sector: sector || null,
        country,
        city: city || null,
        budgetOrSalary: budgetOrSalary || null,
        contactPreference: contactPreference || null,
        details: Object.keys(details).length > 0 ? details : null,
        status: "open",
        approvalStatus: AUTO_APPROVE_JOBS ? "approved" : "pending",
        views: 0,
        interested: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      };

      const docRef = await addDoc(opportunitiesRef, newOpportunity);

      console.log("=== OPPORTUNITY SUBMISSION ===");
      console.log("Submitter:", name, "-", email);
      console.log("Type:", type);
      console.log("Title:", title);
      console.log("Description:", description);
      console.log("Country:", country, city ? `(${city})` : "");
      console.log("Status:", newOpportunity.status);
      console.log("Approval Status:", newOpportunity.approvalStatus);
      console.log("Document ID:", docRef.id);
      console.log("==============================");

      // Send email notification
      try {
        const { client: resend, fromEmail } = await getResendClient();
        
        const opportunityTypeLabels: Record<string, string> = {
          job: "Job Opening",
          investment: "Investment Opportunity",
          partnership: "Sponsorship",
          collaboration: "Business Collaboration",
        };

        let detailsHtml = "";
        if (type === "job" && Object.keys(details).length > 0) {
          detailsHtml = `
            <div style="margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Job Details</h3>
              ${details.employmentType ? `<p style="margin: 5px 0;"><strong>Employment Type:</strong> ${details.employmentType}</p>` : ""}
              ${details.experienceRequired ? `<p style="margin: 5px 0;"><strong>Experience Required:</strong> ${details.experienceRequired}</p>` : ""}
              ${details.skills && details.skills.length > 0 ? `<p style="margin: 5px 0;"><strong>Skills:</strong> ${details.skills.join(", ")}</p>` : ""}
              ${details.benefits && details.benefits.length > 0 ? `<p style="margin: 5px 0;"><strong>Benefits:</strong> ${details.benefits.join(", ")}</p>` : ""}
              ${details.applicationEmail ? `<p style="margin: 5px 0;"><strong>Application Email:</strong> ${details.applicationEmail}</p>` : ""}
            </div>
          `;
        } else if (type === "investment" && Object.keys(details).length > 0) {
          detailsHtml = `
            <div style="margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Investment Details</h3>
              ${details.investmentAmount ? `<p style="margin: 5px 0;"><strong>Investment Amount:</strong> ${details.investmentAmount}</p>` : ""}
              ${details.investmentType ? `<p style="margin: 5px 0;"><strong>Investment Type:</strong> ${details.investmentType}</p>` : ""}
            </div>
          `;
        } else if (type === "partnership" && Object.keys(details).length > 0) {
          detailsHtml = `
            <div style="margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Partnership Details</h3>
              ${details.partnershipType ? `<p style="margin: 5px 0;"><strong>Partnership Type:</strong> ${details.partnershipType}</p>` : ""}
            </div>
          `;
        }

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
              New Opportunity Submission
            </h2>
            
            <div style="margin: 20px 0; background: #f0f9ff; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Type:</strong> ${opportunityTypeLabels[type] || type}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Submitter Information</h3>
              <p style="margin: 5px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 5px 0;"><strong>Email:</strong> ${email}</p>
            </div>

            <div style="margin: 20px 0;">
              <h3 style="color: #1e40af; margin-bottom: 10px;">Opportunity Information</h3>
              <p style="margin: 5px 0;"><strong>Title:</strong> ${title}</p>
              ${sector ? `<p style="margin: 5px 0;"><strong>Sector:</strong> ${sector}</p>` : ""}
              <p style="margin: 5px 0;"><strong>Country:</strong> ${country}</p>
              ${city ? `<p style="margin: 5px 0;"><strong>City:</strong> ${city}</p>` : ""}
              ${budgetOrSalary ? `<p style="margin: 5px 0;"><strong>Budget/Salary:</strong> ${budgetOrSalary}</p>` : ""}
            </div>

            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Description:</strong></p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
                ${description}
              </div>
            </div>

            ${detailsHtml}

            ${contactPreference ? `
              <div style="margin: 20px 0;">
                <h3 style="color: #1e40af; margin-bottom: 10px;">Additional Contact Information</h3>
                <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
                  ${contactPreference}
                </div>
              </div>
            ` : ""}
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>This opportunity was submitted on ${new Date().toLocaleString()}</p>
              <p>Status: Pending Review</p>
            </div>
          </div>
        `;

        const recipientEmail = "abdulmoiz.cloud25@gmail.com";
        
        await resend.emails.send({
          from: fromEmail || "PEF Opportunities <onboarding@resend.dev>",
          to: recipientEmail,
          subject: `New ${opportunityTypeLabels[type]} Submission - ${title}`,
          html: emailHtml,
        });

        console.log(`Opportunity notification email sent successfully to ${recipientEmail}`);
      } catch (emailError: any) {
        console.error("Failed to send opportunity notification email:", emailError);
        console.log("Note: Check server logs above for full opportunity details");
      }

      return res.json({
        success: true,
        message: "Opportunity submitted successfully. It will be reviewed and published soon.",
      });
    } catch (error) {
      console.error("Public opportunity submission error:", error);
      return res.status(500).json({ error: "Failed to submit opportunity" });
    }
  });

  app.post("/api/contact", async (req, res) => {
    try {
      const contactSchema = z.object({
        name: z.string().min(1, "Name is required"),
        email: z.string().email("Valid email is required"),
        country: z.string().min(1, "Country is required"),
        message: z.string().min(10, "Message must be at least 10 characters"),
      });

      const validationResult = contactSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid request data", 
          details: validationResult.error.issues 
        });
      }

      const { name, email, country, message } = validationResult.data;

      console.log("=== CONTACT FORM SUBMISSION ===");
      console.log("Name:", name);
      console.log("Email:", email);
      console.log("Country:", country);
      console.log("Message:", message);
      console.log("===============================");

      try {
        const { client: resend, fromEmail } = await getResendClient();

        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #1e40af; border-bottom: 2px solid #1e40af; padding-bottom: 10px;">
              New Contact Form Submission
            </h2>
            
            <div style="margin: 20px 0; background: #f0f9ff; padding: 15px; border-radius: 5px;">
              <p style="margin: 5px 0;"><strong>Reply To:</strong> <a href="mailto:${email}" style="color: #1e40af;">${email}</a></p>
            </div>
            
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Name:</strong> ${name}</p>
              <p style="margin: 10px 0;"><strong>Email:</strong> ${email}</p>
              <p style="margin: 10px 0;"><strong>Country:</strong> ${country}</p>
            </div>
            
            <div style="margin: 20px 0;">
              <p style="margin: 10px 0;"><strong>Message:</strong></p>
              <div style="background: #f3f4f6; padding: 15px; border-radius: 5px; white-space: pre-wrap;">
                ${message}
              </div>
            </div>
            
            <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb; color: #6b7280; font-size: 12px;">
              <p>This email was sent from the PEF contact form at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        `;

        const recipientEmail = "abdulmoiz.cloud25@gmail.com";
        const senderEmail = "PEF Contact Form <onboarding@resend.dev>";
        
        console.log(`📧 Attempting to send email FROM: ${senderEmail} TO: ${recipientEmail}`);
        
        const result = await resend.emails.send({
          from: senderEmail,
          to: recipientEmail,
          subject: `New Contact Form Submission from ${name}`,
          html: emailHtml,
        });

        console.log(`✅ Email sent successfully! Resend Response:`, JSON.stringify(result, null, 2));
        console.log(`⚠️  NOTE: If using onboarding@resend.dev, emails may not be delivered. Please verify your domain in Resend.`);
      } catch (emailError: any) {
        console.error("❌ Failed to send contact form email:", emailError);
        console.error("Error details:", JSON.stringify(emailError, null, 2));
        console.log("Note: Check server logs above for full contact details");
      }

      return res.json({ 
        success: true, 
        message: "Contact form submitted successfully. We'll get back to you soon!" 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      return res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  // TEMPORARY ADMIN ENDPOINT - Delete all opportunities
  app.delete("/api/admin/delete-all-opportunities", async (req, res) => {
    try {
      const { getDocs, query, collection, deleteDoc, doc } = await import("firebase/firestore");
      const q = query(collection(db, "opportunities"));
      const querySnapshot = await getDocs(q);
      
      let deleteCount = 0;
      for (const document of querySnapshot.docs) {
        await deleteDoc(doc(db, "opportunities", document.id));
        deleteCount++;
      }
      
      console.log(`Deleted ${deleteCount} opportunities`);
      return res.json({ success: true, message: `Deleted ${deleteCount} opportunities` });
    } catch (error) {
      console.error("Error deleting opportunities:", error);
      return res.status(500).json({ error: "Failed to delete opportunities" });
    }
  });

  // Video endpoints
  app.get("/api/videos", async (req, res) => {
    try {
      const videos = await storage.getAllVideos();
      return res.json(videos);
    } catch (error) {
      console.error("Error fetching videos:", error);
      return res.status(500).json({ error: "Failed to fetch videos" });
    }
  });

  app.get("/api/videos/:id", async (req, res) => {
    try {
      const video = await storage.getVideoById(req.params.id);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      return res.json(video);
    } catch (error) {
      console.error("Error fetching video:", error);
      return res.status(500).json({ error: "Failed to fetch video" });
    }
  });

  app.post("/api/videos", async (req, res) => {
    try {
      const validationResult = insertVideoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid video data", 
          details: validationResult.error.issues 
        });
      }

      const video = await storage.createVideo(validationResult.data);
      return res.status(201).json(video);
    } catch (error) {
      console.error("Error creating video:", error);
      return res.status(500).json({ error: "Failed to create video" });
    }
  });

  app.patch("/api/videos/:id", async (req, res) => {
    try {
      const partialVideoSchema = insertVideoSchema.partial();
      const validationResult = partialVideoSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid video data", 
          details: validationResult.error.issues 
        });
      }

      const video = await storage.updateVideo(req.params.id, validationResult.data);
      if (!video) {
        return res.status(404).json({ error: "Video not found" });
      }
      return res.json(video);
    } catch (error) {
      console.error("Error updating video:", error);
      return res.status(500).json({ error: "Failed to update video" });
    }
  });

  app.delete("/api/videos/:id", async (req, res) => {
    try {
      await storage.deleteVideo(req.params.id);
      return res.json({ success: true, message: "Video deleted successfully" });
    } catch (error) {
      console.error("Error deleting video:", error);
      return res.status(500).json({ error: "Failed to delete video" });
    }
  });

  // Leader endpoints
  app.get("/api/leaders", async (req, res) => {
    try {
      const leaders = await storage.getAllLeaders();
      return res.json(leaders);
    } catch (error) {
      console.error("Error fetching leaders:", error);
      return res.status(500).json({ error: "Failed to fetch leaders" });
    }
  });

  app.get("/api/leaders/:id", async (req, res) => {
    try {
      const leader = await storage.getLeaderById(req.params.id);
      if (!leader) {
        return res.status(404).json({ error: "Leader not found" });
      }
      return res.json(leader);
    } catch (error) {
      console.error("Error fetching leader:", error);
      return res.status(500).json({ error: "Failed to fetch leader" });
    }
  });

  app.post("/api/leaders", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validationResult = insertLeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid leader data", 
          details: validationResult.error.issues 
        });
      }

      const leader = await storage.createLeader(validationResult.data);
      return res.status(201).json(leader);
    } catch (error) {
      console.error("Error creating leader:", error);
      return res.status(500).json({ error: "Failed to create leader" });
    }
  });

  app.patch("/api/leaders/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const partialLeaderSchema = insertLeaderSchema.partial();
      const validationResult = partialLeaderSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid leader data", 
          details: validationResult.error.issues 
        });
      }

      const leader = await storage.updateLeader(req.params.id, validationResult.data);
      if (!leader) {
        return res.status(404).json({ error: "Leader not found" });
      }
      return res.json(leader);
    } catch (error) {
      console.error("Error updating leader:", error);
      return res.status(500).json({ error: "Failed to update leader" });
    }
  });

  app.delete("/api/leaders/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteLeader(req.params.id);
      return res.json({ success: true, message: "Leader deleted successfully" });
    } catch (error) {
      console.error("Error deleting leader:", error);
      return res.status(500).json({ error: "Failed to delete leader" });
    }
  });

  // Gallery endpoints
  app.get("/api/gallery", async (req, res) => {
    try {
      const images = await storage.getAllGalleryImages();
      return res.json(images);
    } catch (error) {
      console.error("Error fetching gallery images:", error);
      return res.status(500).json({ error: "Failed to fetch gallery images" });
    }
  });

  app.get("/api/gallery/:id", async (req, res) => {
    try {
      const image = await storage.getGalleryImageById(req.params.id);
      if (!image) {
        return res.status(404).json({ error: "Gallery image not found" });
      }
      return res.json(image);
    } catch (error) {
      console.error("Error fetching gallery image:", error);
      return res.status(500).json({ error: "Failed to fetch gallery image" });
    }
  });

  app.post("/api/gallery", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validationResult = insertGalleryImageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid gallery image data", 
          details: validationResult.error.issues 
        });
      }

      const image = await storage.createGalleryImage(validationResult.data);
      return res.status(201).json(image);
    } catch (error) {
      console.error("Error creating gallery image:", error);
      return res.status(500).json({ error: "Failed to create gallery image" });
    }
  });

  app.patch("/api/gallery/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const partialGalleryImageSchema = insertGalleryImageSchema.partial();
      const validationResult = partialGalleryImageSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid gallery image data", 
          details: validationResult.error.issues 
        });
      }

      const image = await storage.updateGalleryImage(req.params.id, validationResult.data);
      if (!image) {
        return res.status(404).json({ error: "Gallery image not found" });
      }
      return res.json(image);
    } catch (error) {
      console.error("Error updating gallery image:", error);
      return res.status(500).json({ error: "Failed to update gallery image" });
    }
  });

  app.delete("/api/gallery/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteGalleryImage(req.params.id);
      return res.json({ success: true, message: "Gallery image deleted successfully" });
    } catch (error) {
      console.error("Error deleting gallery image:", error);
      return res.status(500).json({ error: "Failed to delete gallery image" });
    }
  });

  // Membership Tier endpoints
  app.get("/api/membership-tiers", async (req, res) => {
    try {
      const tiers = await storage.getAllMembershipTiers();
      return res.json(tiers);
    } catch (error) {
      console.error("Error fetching membership tiers:", error);
      return res.status(500).json({ error: "Failed to fetch membership tiers" });
    }
  });

  app.get("/api/membership-tiers/:id", async (req, res) => {
    try {
      const tier = await storage.getMembershipTierById(req.params.id);
      if (!tier) {
        return res.status(404).json({ error: "Membership tier not found" });
      }
      return res.json(tier);
    } catch (error) {
      console.error("Error fetching membership tier:", error);
      return res.status(500).json({ error: "Failed to fetch membership tier" });
    }
  });

  app.post("/api/membership-tiers", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const validationResult = insertMembershipTierSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid membership tier data", 
          details: validationResult.error.issues 
        });
      }

      const tier = await storage.createMembershipTier(validationResult.data);
      return res.status(201).json(tier);
    } catch (error) {
      console.error("Error creating membership tier:", error);
      return res.status(500).json({ error: "Failed to create membership tier" });
    }
  });

  app.patch("/api/membership-tiers/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const partialMembershipTierSchema = insertMembershipTierSchema.partial();
      const validationResult = partialMembershipTierSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid membership tier data", 
          details: validationResult.error.issues 
        });
      }

      const tier = await storage.updateMembershipTier(req.params.id, validationResult.data);
      if (!tier) {
        return res.status(404).json({ error: "Membership tier not found" });
      }
      return res.json(tier);
    } catch (error) {
      console.error("Error updating membership tier:", error);
      return res.status(500).json({ error: "Failed to update membership tier" });
    }
  });

  app.delete("/api/membership-tiers/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteMembershipTier(req.params.id);
      return res.json({ success: true, message: "Membership tier deleted successfully" });
    } catch (error) {
      console.error("Error deleting membership tier:", error);
      return res.status(500).json({ error: "Failed to delete membership tier" });
    }
  });

  // Membership Application endpoints
  app.get("/api/membership-applications", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const applications = await storage.getAllMembershipApplications();
      return res.json(applications);
    } catch (error) {
      console.error("Error fetching membership applications:", error);
      return res.status(500).json({ error: "Failed to fetch membership applications" });
    }
  });

  app.get("/api/membership-applications/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const application = await storage.getMembershipApplicationById(req.params.id);
      if (!application) {
        return res.status(404).json({ error: "Membership application not found" });
      }
      return res.json(application);
    } catch (error) {
      console.error("Error fetching membership application:", error);
      return res.status(500).json({ error: "Failed to fetch membership application" });
    }
  });

  app.post("/api/membership-applications", async (req, res) => {
    try {
      const validationResult = insertMembershipApplicationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid membership application data", 
          details: validationResult.error.issues 
        });
      }

      const application = await storage.createMembershipApplication(validationResult.data);
      return res.status(201).json(application);
    } catch (error) {
      console.error("Error creating membership application:", error);
      return res.status(500).json({ error: "Failed to create membership application" });
    }
  });

  app.patch("/api/membership-applications/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      const partialMembershipApplicationSchema = insertMembershipApplicationSchema.partial();
      const validationResult = partialMembershipApplicationSchema.safeParse(req.body);
      if (!validationResult.success) {
        return res.status(400).json({ 
          error: "Invalid membership application data", 
          details: validationResult.error.issues 
        });
      }

      const application = await storage.updateMembershipApplication(req.params.id, validationResult.data);
      if (!application) {
        return res.status(404).json({ error: "Membership application not found" });
      }
      return res.json(application);
    } catch (error) {
      console.error("Error updating membership application:", error);
      return res.status(500).json({ error: "Failed to update membership application" });
    }
  });

  app.delete("/api/membership-applications/:id", async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({ error: "Unauthorized" });
      }

      const token = authHeader.substring(7);
      let uid: string;

      if (!process.env.FIREBASE_ADMIN_SERVICE_ACCOUNT) {
        try {
          const decodedToken = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString());
          uid = decodedToken.user_id;
        } catch (decodeError) {
          return res.status(401).json({ error: "Invalid token format" });
        }
      } else {
        return res.status(500).json({ error: "Firebase Admin SDK not implemented yet" });
      }

      const userWithRoles = await storage.getUserWithRoles(uid);
      if (!userWithRoles || !userWithRoles.roles?.isAdmin) {
        return res.status(403).json({ error: "Admin access required" });
      }

      await storage.deleteMembershipApplication(req.params.id);
      return res.json({ success: true, message: "Membership application deleted successfully" });
    } catch (error) {
      console.error("Error deleting membership application:", error);
      return res.status(500).json({ error: "Failed to delete membership application" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
