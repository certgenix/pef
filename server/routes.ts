import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { z } from "zod";
import { insertUserProfileSchema, insertUserRolesSchema } from "@shared/schema";

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

      const user = await storage.getUserById(uid);
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      await storage.updateUserLastLogin(uid);

      return res.json({ user });
    } catch (error) {
      console.error("Auth error:", error);
      return res.status(500).json({ error: "Authentication failed" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
