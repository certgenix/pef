import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserProfileSchema, insertUserRolesSchema, insertOpportunitySchema, jobDetailsSchema } from "@shared/schema";

const AUTO_APPROVE_JOBS = true;

const completeRegistrationSchema = z.object({
  profile: insertUserProfileSchema.omit({ userId: true }),
  roles: z.object({
    professional: z.boolean().optional(),
    jobSeeker: z.boolean().optional(),
    employer: z.boolean().optional(),
    businessOwner: z.boolean().optional(),
    investor: z.boolean().optional(),
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
      if (!userWithRoles || !userWithRoles.roles?.isEmployer) {
        return res.status(403).json({ error: "Only employers can post job opportunities" });
      }

      if (req.body.details) {
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
        if (!userWithRoles || !userWithRoles.roles?.isEmployer) {
          return res.status(403).json({ error: "Only employers can view their posted opportunities" });
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

  const httpServer = createServer(app);

  return httpServer;
}
