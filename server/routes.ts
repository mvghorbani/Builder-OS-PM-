import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { ObjectStorageService, ObjectNotFoundError } from "./objectStorage";
import { ObjectPermission } from "./objectAcl";
import {
  insertPropertySchema,
  insertMilestoneSchema,
  insertVendorSchema,
  insertBudgetLineSchema,
  insertRFQSchema,
  insertBidSchema,
  insertPermitSchema,
  insertRiskSchema,
  insertDocumentSchema,
  insertActivitySchema,
  loginSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

// JWT authentication middleware
const authenticateJWT = (req: any, res: any, next: any) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const token = authHeader.substring(7);
  const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';

  try {
    const decoded = jwt.verify(token, jwtSecret) as any;
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ message: "Unauthorized" });
  }
};

export async function registerRoutes(app: Express): Promise<Server> {
  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  // Traditional login endpoint
  app.post('/api/v1/auth/login', async (req, res) => {
    try {
      const validatedData = loginSchema.parse(req.body);
      const { email, password } = validatedData;

      // Find user by email
      const user = await storage.findUserByEmail(email);
      if (!user || !user.passwordHash) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Compare password with hash
      const isValidPassword = await bcrypt.compare(password, user.passwordHash);
      if (!isValidPassword) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      // Generate JWT token
      const jwtSecret = process.env.JWT_SECRET || 'your-secret-key';
      const token = jwt.sign(
        { 
          id: user.id, 
          role: user.role,
          email: user.email 
        },
        jwtSecret,
        { expiresIn: '24h' }
      );

      // Return success response
      res.status(200).json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof Error && error.name === 'ZodError') {
        return res.status(400).json({ message: "Invalid request data" });
      }
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create project endpoint
  app.post('/api/v1/projects', authenticateJWT, async (req: any, res) => {
    try {
      const { address, project_type } = req.body;

      if (!address || !project_type) {
        return res.status(400).json({ 
          message: "Missing required fields: address and project_type" 
        });
      }

      const projectData = {
        address,
        type: project_type,
        pmId: req.user.id,
        totalBudget: '0',
        spentBudget: '0',
        committedBudget: '0',
        status: 'planning' as const,
        progress: 0,
        scheduleAdherence: 100,
        budgetVariance: '0',
        safetyIncidents: 0,
        permitSLA: 0,
      };

      const project = await storage.createProperty(projectData);

      // Create activity log
      await storage.createActivity({
        userId: req.user.id,
        propertyId: project.id,
        action: 'created',
        description: `Created project ${project.address}`,
        entityType: 'property',
        entityId: project.id,
      });

      res.status(201).json(project);
    } catch (error) {
      console.error("Error creating project:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Helper function for audit logging
  const createAuditLog = async (req: any, action: string, entityType: string, entityId: string, oldValues?: any, newValues?: any) => {
    if (req.user?.claims?.sub) {
      try {
        await storage.createAuditLog({
          userId: req.user.claims.sub,
          action: action as any,
          entityType,
          entityId,
          oldValues,
          newValues,
          ipAddress: req.ip,
          userAgent: req.get('User-Agent'),
        });
      } catch (error) {
        console.error("Failed to create audit log:", error);
      }
    }
  };

  // Helper function for activity logging
  const createActivity = async (userId: string, propertyId: string, action: string, description: string, entityType?: string, entityId?: string) => {
    try {
      await storage.createActivity({
        userId,
        propertyId,
        action,
        description,
        entityType,
        entityId,
      });
    } catch (error) {
      console.error("Failed to create activity:", error);
    }
  };

  // Property routes
  app.get('/api/properties', isAuthenticated, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', isAuthenticated, async (req, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      console.error("Error fetching property:", error);
      res.status(500).json({ message: "Failed to fetch property" });
    }
  });

  app.post('/api/properties', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storage.createProperty(validatedData);
      
      await createAuditLog(req, 'create', 'property', property.id, null, property);
      await createActivity(req.user.claims.sub, property.id, 'created', `Created property ${property.address}`, 'property', property.id);
      
      res.status(201).json(property);
    } catch (error) {
      console.error("Error creating property:", error);
      res.status(500).json({ message: "Failed to create property" });
    }
  });

  app.patch('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const oldProperty = await storage.getProperty(req.params.id);
      if (!oldProperty) {
        return res.status(404).json({ message: "Property not found" });
      }

      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storage.updateProperty(req.params.id, validatedData);
      
      await createAuditLog(req, 'update', 'property', req.params.id, oldProperty, property);
      await createActivity(req.user.claims.sub, req.params.id, 'updated', `Updated property ${property?.address}`, 'property', req.params.id);
      
      res.json(property);
    } catch (error) {
      console.error("Error updating property:", error);
      res.status(500).json({ message: "Failed to update property" });
    }
  });

  app.delete('/api/properties/:id', isAuthenticated, async (req: any, res) => {
    try {
      const property = await storage.getProperty(req.params.id);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }

      const deleted = await storage.deleteProperty(req.params.id);
      if (!deleted) {
        return res.status(500).json({ message: "Failed to delete property" });
      }
      
      await createAuditLog(req, 'delete', 'property', req.params.id, property, null);
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting property:", error);
      res.status(500).json({ message: "Failed to delete property" });
    }
  });

  // Milestone routes
  app.get('/api/properties/:propertyId/milestones', isAuthenticated, async (req, res) => {
    try {
      const milestones = await storage.getMilestones(req.params.propertyId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post('/api/properties/:propertyId/milestones', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertMilestoneSchema.parse({
        ...req.body,
        propertyId: req.params.propertyId,
      });
      const milestone = await storage.createMilestone(validatedData);
      
      await createAuditLog(req, 'create', 'milestone', milestone.id, null, milestone);
      await createActivity(req.user.claims.sub, req.params.propertyId, 'milestone_created', `Created milestone ${milestone.name}`, 'milestone', milestone.id);
      
      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Failed to create milestone" });
    }
  });

  app.patch('/api/milestones/:id', isAuthenticated, async (req: any, res) => {
    try {
      const oldMilestone = await storage.getMilestone(req.params.id);
      if (!oldMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      const validatedData = insertMilestoneSchema.partial().parse(req.body);
      const milestone = await storage.updateMilestone(req.params.id, validatedData);
      
      await createAuditLog(req, 'update', 'milestone', req.params.id, oldMilestone, milestone);
      
      if (milestone && milestone.status === 'complete' && oldMilestone.status !== 'complete') {
        await createActivity(req.user.claims.sub, milestone.propertyId, 'milestone_completed', `Completed milestone ${milestone.name}`, 'milestone', milestone.id);
      }
      
      res.json(milestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Failed to update milestone" });
    }
  });

  // Vendor routes
  app.get('/api/vendors', isAuthenticated, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/vendors', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertVendorSchema.parse(req.body);
      const vendor = await storage.createVendor(validatedData);
      
      await createAuditLog(req, 'create', 'vendor', vendor.id, null, vendor);
      
      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating vendor:", error);
      res.status(500).json({ message: "Failed to create vendor" });
    }
  });

  // Budget routes
  app.get('/api/properties/:propertyId/budget', isAuthenticated, async (req, res) => {
    try {
      const budgetLines = await storage.getBudgetLines(req.params.propertyId);
      res.json(budgetLines);
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post('/api/properties/:propertyId/budget', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertBudgetLineSchema.parse({
        ...req.body,
        propertyId: req.params.propertyId,
      });
      const budgetLine = await storage.createBudgetLine(validatedData);
      
      await createAuditLog(req, 'create', 'budget_line', budgetLine.id, null, budgetLine);
      await createActivity(req.user.claims.sub, req.params.propertyId, 'budget_added', `Added budget line ${budgetLine.scope}`, 'budget_line', budgetLine.id);
      
      res.status(201).json(budgetLine);
    } catch (error) {
      console.error("Error creating budget line:", error);
      res.status(500).json({ message: "Failed to create budget line" });
    }
  });

  // RFQ routes
  app.get('/api/rfqs', isAuthenticated, async (req, res) => {
    try {
      const propertyId = req.query.propertyId as string;
      const rfqs = await storage.getRFQs(propertyId);
      res.json(rfqs);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.post('/api/rfqs', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertRFQSchema.parse({
        ...req.body,
        createdBy: req.user.claims.sub,
      });
      const rfq = await storage.createRFQ(validatedData);
      
      await createAuditLog(req, 'create', 'rfq', rfq.id, null, rfq);
      await createActivity(req.user.claims.sub, rfq.propertyId, 'rfq_created', `Created RFQ ${rfq.title}`, 'rfq', rfq.id);
      
      res.status(201).json(rfq);
    } catch (error) {
      console.error("Error creating RFQ:", error);
      res.status(500).json({ message: "Failed to create RFQ" });
    }
  });

  // Bid routes
  app.get('/api/rfqs/:rfqId/bids', isAuthenticated, async (req, res) => {
    try {
      const bids = await storage.getBids(req.params.rfqId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post('/api/rfqs/:rfqId/bids', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertBidSchema.parse({
        ...req.body,
        rfqId: req.params.rfqId,
      });
      const bid = await storage.createBid(validatedData);
      
      await createAuditLog(req, 'create', 'bid', bid.id, null, bid);
      
      res.status(201).json(bid);
    } catch (error) {
      console.error("Error creating bid:", error);
      res.status(500).json({ message: "Failed to create bid" });
    }
  });

  app.patch('/api/bids/:id/award', isAuthenticated, async (req: any, res) => {
    try {
      const bid = await storage.awardBid(req.params.id);
      if (!bid) {
        return res.status(404).json({ message: "Bid not found" });
      }
      
      await createAuditLog(req, 'update', 'bid', req.params.id, null, bid);
      
      res.json(bid);
    } catch (error) {
      console.error("Error awarding bid:", error);
      res.status(500).json({ message: "Failed to award bid" });
    }
  });

  // Permit routes
  app.get('/api/properties/:propertyId/permits', isAuthenticated, async (req, res) => {
    try {
      const permits = await storage.getPermits(req.params.propertyId);
      res.json(permits);
    } catch (error) {
      console.error("Error fetching permits:", error);
      res.status(500).json({ message: "Failed to fetch permits" });
    }
  });

  app.post('/api/properties/:propertyId/permits', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPermitSchema.parse({
        ...req.body,
        propertyId: req.params.propertyId,
      });
      const permit = await storage.createPermit(validatedData);
      
      await createAuditLog(req, 'create', 'permit', permit.id, null, permit);
      await createActivity(req.user.claims.sub, req.params.propertyId, 'permit_created', `Created ${permit.type} permit`, 'permit', permit.id);
      
      res.status(201).json(permit);
    } catch (error) {
      console.error("Error creating permit:", error);
      res.status(500).json({ message: "Failed to create permit" });
    }
  });

  // Risk routes
  app.get('/api/properties/:propertyId/risks', isAuthenticated, async (req, res) => {
    try {
      const risks = await storage.getRisks(req.params.propertyId);
      res.json(risks);
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ message: "Failed to fetch risks" });
    }
  });

  app.post('/api/properties/:propertyId/risks', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertRiskSchema.parse({
        ...req.body,
        propertyId: req.params.propertyId,
      });
      const risk = await storage.createRisk(validatedData);
      
      await createAuditLog(req, 'create', 'risk', risk.id, null, risk);
      await createActivity(req.user.claims.sub, req.params.propertyId, 'risk_created', `Created ${risk.type}: ${risk.description}`, 'risk', risk.id);
      
      res.status(201).json(risk);
    } catch (error) {
      console.error("Error creating risk:", error);
      res.status(500).json({ message: "Failed to create risk" });
    }
  });

  // Document routes
  app.get('/api/documents', isAuthenticated, async (req, res) => {
    try {
      const propertyId = req.query.propertyId as string;
      const milestoneId = req.query.milestoneId as string;
      const documents = await storage.getDocuments(propertyId, milestoneId);
      res.json(documents);
    } catch (error) {
      console.error("Error fetching documents:", error);
      res.status(500).json({ message: "Failed to fetch documents" });
    }
  });

  app.post('/api/documents', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertDocumentSchema.parse({
        ...req.body,
        uploadedBy: req.user.claims.sub,
      });
      const document = await storage.createDocument(validatedData);
      
      await createAuditLog(req, 'create', 'document', document.id, null, document);
      
      if (document.propertyId) {
        await createActivity(req.user.claims.sub, document.propertyId, 'document_uploaded', `Uploaded ${document.name}`, 'document', document.id);
      }
      
      res.status(201).json(document);
    } catch (error) {
      console.error("Error creating document:", error);
      res.status(500).json({ message: "Failed to create document" });
    }
  });

  // Activity routes
  app.get('/api/activities', isAuthenticated, async (req, res) => {
    try {
      const propertyId = req.query.propertyId as string;
      const limit = parseInt(req.query.limit as string) || 50;
      const activities = await storage.getActivities(propertyId, limit);
      res.json(activities);
    } catch (error) {
      console.error("Error fetching activities:", error);
      res.status(500).json({ message: "Failed to fetch activities" });
    }
  });

  // Object storage routes for protected file uploading
  app.get("/objects/:objectPath(*)", isAuthenticated, async (req: any, res) => {
    const userId = req.user?.claims?.sub;
    const objectStorageService = new ObjectStorageService();
    try {
      const objectFile = await objectStorageService.getObjectEntityFile(req.path);
      const canAccess = await objectStorageService.canAccessObjectEntity({
        objectFile,
        userId: userId,
        requestedPermission: ObjectPermission.READ,
      });
      if (!canAccess) {
        return res.sendStatus(401);
      }
      objectStorageService.downloadObject(objectFile, res);
    } catch (error) {
      console.error("Error checking object access:", error);
      if (error instanceof ObjectNotFoundError) {
        return res.sendStatus(404);
      }
      return res.sendStatus(500);
    }
  });

  app.post("/api/objects/upload", isAuthenticated, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/objects", isAuthenticated, async (req: any, res) => {
    if (!req.body.documentURL) {
      return res.status(400).json({ error: "documentURL is required" });
    }

    const userId = req.user?.claims?.sub;

    try {
      const objectStorageService = new ObjectStorageService();
      const objectPath = await objectStorageService.trySetObjectEntityAclPolicy(
        req.body.documentURL,
        {
          owner: userId,
          visibility: "private", // Construction documents should be private
        },
      );

      res.status(200).json({
        objectPath: objectPath,
      });
    } catch (error) {
      console.error("Error setting document ACL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Statistics and dashboard data
  app.get('/api/dashboard/stats', isAuthenticated, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      const totalBudget = properties.reduce((sum, p) => sum + parseFloat(p.totalBudget), 0);
      const spentBudget = properties.reduce((sum, p) => sum + parseFloat(p.spentBudget), 0);
      const avgScheduleAdherence = properties.length > 0 
        ? Math.round(properties.reduce((sum, p) => sum + p.scheduleAdherence, 0) / properties.length)
        : 100;

      let pendingPermits = 0;
      for (const property of properties) {
        const permits = await storage.getPermits(property.id);
        pendingPermits += permits.filter(p => p.status === 'submitted' || p.status === 'under_review').length;
      }

      res.json({
        activeProjects: properties.length,
        totalBudget: Math.round(totalBudget / 1000) / 1000, // in millions
        spentBudget: Math.round(spentBudget / 1000), // in thousands
        avgScheduleAdherence,
        pendingPermits,
      });
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
