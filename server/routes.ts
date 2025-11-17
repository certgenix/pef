import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserProfileSchema, insertUserRolesSchema, insertOpportunitySchema, insertApplicationSchema, jobDetailsSchema } from "@shared/schema";

const AUTO_APPROVE_JOBS = true;

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

      console.log("Contact form submission:", {
        name,
        email,
        country,
        message,
        timestamp: new Date().toISOString(),
      });

      return res.json({ 
        success: true, 
        message: "Contact form submitted successfully" 
      });
    } catch (error) {
      console.error("Contact form error:", error);
      return res.status(500).json({ error: "Failed to submit contact form" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
