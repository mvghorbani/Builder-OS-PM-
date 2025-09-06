import type { Express, Request, Response, NextFunction } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated, requireAuth } from "./replitAuth";
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
  permitLookupSchema,
} from "@shared/schema";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import multer from "multer";
import cookieParser from "cookie-parser";
import { geminiService } from "./geminiService";

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});


// JWT authentication middleware
const authenticateJWT = (req: any, res: Response, next: NextFunction) => {
  // Try to get token from Authorization header first, then from cookie
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : req.cookies?.auth_token;

  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

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
  // Add cookie parser
  app.use(cookieParser());


  // Health check endpoint
  app.get('/health', (req, res) => {
    res.status(200).json({
      status: "ok",
      timestamp: new Date().toISOString()
    });
  });

  // Removed duplicate - using the better implementation below at line 1028

  // Permit CRUD Endpoints for Tracking Ledger
  app.get('/api/v1/projects/:projectId/permits', isAuthenticated, async (req, res) => {
    try {
      const permits = await storage.getPermits(req.params.projectId);
      res.json(permits);
    } catch (error) {
      console.error("Error fetching permits:", error);
      res.status(500).json({ message: "Failed to fetch permits" });
    }
  });

  app.post('/api/v1/projects/:projectId/permits', isAuthenticated, async (req: any, res) => {
    try {
      const validatedData = insertPermitSchema.parse({
        ...req.body,
        propertyId: req.params.projectId
      });
      const permit = await storage.createPermit(validatedData);

      await createAuditLog(req, 'create', 'permit', permit.id, null, permit);
      await createActivity(req.user.claims.sub, req.params.projectId, 'created', `Created permit ${permit.type}`, 'permit', permit.id);

      res.status(201).json(permit);
    } catch (error) {
      console.error("Error creating permit:", error);
      res.status(500).json({ message: "Failed to create permit" });
    }
  });

  app.put('/api/v1/permits/:permitId', isAuthenticated, async (req: any, res) => {
    try {
      const oldPermit = await storage.getPermit(req.params.permitId);
      if (!oldPermit) {
        return res.status(404).json({ message: "Permit not found" });
      }

      const validatedData = insertPermitSchema.partial().parse(req.body);
      const permit = await storage.updatePermit(req.params.permitId, validatedData);

      await createAuditLog(req, 'update', 'permit', req.params.permitId, oldPermit, permit);
      await createActivity(req.user.claims.sub, oldPermit.propertyId, 'updated', `Updated permit ${permit?.type}`, 'permit', req.params.permitId);

      res.json(permit);
    } catch (error) {
      console.error("Error updating permit:", error);
      res.status(500).json({ message: "Failed to update permit" });
    }
  });

  // Simple admin login for testing
  app.post('/api/admin/login', async (req, res) => {
    try {
      const { email } = req.body;

      if (!email) {
        return res.status(400).json({ message: "Email is required" });
      }

      // Find or create user
      let user = await storage.findUserByEmail(email);

      if (!user) {
        // Create new admin user
        user = await storage.upsertUser({
          id: `admin-${Date.now()}`,
          email,
          firstName: "Admin",
          lastName: "User"
        });
        // Update role separately
        await storage.updateUserRole(user.id, "admin");
        user = await storage.getUser(user.id) || null;
      } else {
        // Update existing user to admin role
        user = await storage.updateUserRole(user.id, "admin") || null;
      }

      if (!user) {
        return res.status(500).json({ message: "Failed to create/update user" });
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

      // Set JWT as httpOnly cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      res.json({ 
        message: "Admin login successful",
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
        }
      });
    } catch (error) {
      console.error("Admin login error:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });


  // Traditional login route
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

      // Set JWT as httpOnly cookie
      res.cookie('auth_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 24 * 60 * 60 * 1000 // 24 hours
      });

      // Return success response
      res.status(200).json({
        message: "Login successful",
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



  // JWT logout endpoint  
  app.post('/api/v1/auth/logout', (req, res) => {
    res.clearCookie('auth_token');
    res.status(200).json({ message: "Logged out successfully" });
  });

  // Get projects endpoint
  app.get('/api/v1/projects', requireAuth, async (req: any, res) => {
    try {
      const projects = await storage.getPropertiesByPmId(req.user.id);
      res.status(200).json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create milestone endpoint
  app.post('/api/v1/projects/:projectId/milestones', requireAuth, async (req: any, res) => {
    try {
      const { name, milestone_type, planned_end } = req.body;
      const projectId = req.params.projectId;

      if (!name || !milestone_type || !planned_end) {
        return res.status(400).json({ 
          message: "Missing required fields: name, milestone_type, and planned_end" 
        });
      }

      // Verify the project exists and user has access
      const project = await storage.getProperty(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.pmId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      const milestoneData = {
        propertyId: projectId,
        name,
        description: milestone_type,
        status: 'pending' as const,
        targetDate: new Date(planned_end),
        order: 0,
      };

      const milestone = await storage.createMilestone(milestoneData);

      // Create activity log
      await storage.createActivity({
        userId: req.user.id,
        propertyId: projectId,
        action: 'milestone_created',
        description: `Created milestone ${milestone.name}`,
        entityType: 'milestone',
        entityId: milestone.id,
      });

      res.status(201).json(milestone);
    } catch (error) {
      console.error("Error creating milestone:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Update milestone endpoint
  app.put('/api/v1/milestones/:milestoneId', requireAuth, async (req: any, res) => {
    try {
      const { status, actual_end } = req.body;
      const milestoneId = req.params.milestoneId;

      // Get the milestone to check ownership
      const existingMilestone = await storage.getMilestone(milestoneId);
      if (!existingMilestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      // Verify the user has access to the project
      const project = await storage.getProperty(existingMilestone.propertyId);
      if (!project || project.pmId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Prepare update data
      const updateData: any = {};
      if (status !== undefined) {
        updateData.status = status;
      }
      if (actual_end !== undefined) {
        updateData.actualDate = new Date(actual_end);
      }

      // Update the milestone
      const updatedMilestone = await storage.updateMilestone(milestoneId, updateData);

      if (!updatedMilestone) {
        return res.status(500).json({ message: "Failed to update milestone" });
      }

      // Create activity log for status changes
      if (status && status !== existingMilestone.status) {
        let activityDescription = `Updated milestone ${updatedMilestone.name} status to ${status}`;
        if (status === 'complete') {
          activityDescription = `Completed milestone ${updatedMilestone.name}`;
        }

        await storage.createActivity({
          userId: req.user.id,
          propertyId: existingMilestone.propertyId,
          action: status === 'complete' ? 'milestone_completed' : 'milestone_updated',
          description: activityDescription,
          entityType: 'milestone',
          entityId: milestoneId,
        });
      }

      res.status(200).json(updatedMilestone);
    } catch (error) {
      console.error("Error updating milestone:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create company (vendor) endpoint
  app.post('/api/v1/companies', requireAuth, async (req: any, res) => {
    try {
      const { name, type } = req.body;

      if (!name || !type) {
        return res.status(400).json({ 
          message: "Missing required fields: name and type" 
        });
      }

      const vendorData = {
        name,
        trades: [type], // Store company type in trades array
        isLicensed: false,
        isBonded: false,
      };

      const vendor = await storage.createVendor(vendorData);

      res.status(201).json(vendor);
    } catch (error) {
      console.error("Error creating company:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create budget line endpoint
  app.post('/api/v1/projects/:projectId/budget_lines', requireAuth, async (req: any, res) => {
    try {
      const { category, scope_description, budgeted_amount, vendor_id } = req.body;
      const projectId = req.params.projectId;

      if (!category || !scope_description || !budgeted_amount) {
        return res.status(400).json({ 
          message: "Missing required fields: category, scope_description, and budgeted_amount" 
        });
      }

      // Verify the project exists and user has access
      const project = await storage.getProperty(projectId);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }

      if (project.pmId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // If vendor_id is provided, verify it exists
      if (vendor_id) {
        const vendor = await storage.getVendor(vendor_id);
        if (!vendor) {
          return res.status(400).json({ message: "Invalid vendor_id" });
        }
      }

      const budgetLineData = {
        propertyId: projectId,
        scope: `${category}: ${scope_description}`,
        vendorId: vendor_id || null,
        contractAmount: budgeted_amount.toString(),
        spentAmount: '0',
        percentComplete: 0,
        bidCount: 0,
        coiValid: false,
        paymentBlocked: false,
      };

      const budgetLine = await storage.createBudgetLine(budgetLineData);

      // Create activity log
      await storage.createActivity({
        userId: req.user.id,
        propertyId: projectId,
        action: 'budget_line_created',
        description: `Added budget line: ${budgetLine.scope}`,
        entityType: 'budget_line',
        entityId: budgetLine.id,
      });

      res.status(201).json(budgetLine);
    } catch (error) {
      console.error("Error creating budget line:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Document upload endpoint
  app.post('/api/v1/milestones/:milestoneId/documents', requireAuth, upload.single('file'), async (req: any, res) => {
    try {
      const milestoneId = req.params.milestoneId;
      const file = req.file;

      if (!file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      // Get the milestone to verify it exists and get property info
      const milestone = await storage.getMilestone(milestoneId);
      if (!milestone) {
        return res.status(404).json({ message: "Milestone not found" });
      }

      // Verify user has access to the project
      const project = await storage.getProperty(milestone.propertyId);
      if (!project || project.pmId !== req.user.id) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Create document record
      const documentData = {
        name: file.originalname,
        type: file.mimetype.split('/')[0] as 'image' | 'document' | 'video' | 'other', // Extract main type
        fileSize: file.size,
        mimeType: file.mimetype,
        filePath: `/uploads/milestone_${milestoneId}/${file.originalname}`, // Placeholder path
        uploadedBy: req.user.id,
        propertyId: milestone.propertyId,
        milestoneId: milestoneId,
      };

      const document = await storage.createDocument(documentData);

      // Create activity log
      await storage.createActivity({
        userId: req.user.id,
        propertyId: milestone.propertyId,
        action: 'document_uploaded',
        description: `Uploaded document ${document.name} to milestone ${milestone.name}`,
        entityType: 'document',
        entityId: document.id,
      });

      res.status(201).json(document);
    } catch (error) {
      console.error("Error uploading document:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Create project endpoint
  app.post('/api/v1/projects', requireAuth, async (req: any, res) => {
    try {
      const { address, project_type } = req.body;

      if (!address || !project_type) {
        return res.status(400).json({ 
          message: "Missing required fields: address and project_type" 
        });
      }

      const projectData = {
        name: address, // Use address as name for now
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
  app.get('/api/auth/user', requireAuth, async (req: any, res) => {
    try {
      const userId = req.user.id; // JWT contains user.id directly
      const user = await storage.getUser(userId);

      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

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
  app.get('/api/properties', requireAuth, async (req, res) => {
    try {
      const properties = await storage.getProperties();
      res.json(properties);
    } catch (error) {
      console.error("Error fetching properties:", error);
      res.status(500).json({ message: "Failed to fetch properties" });
    }
  });

  app.get('/api/properties/:id', requireAuth, async (req, res) => {
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

  app.post('/api/properties', requireAuth, async (req: any, res) => {
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

  app.patch('/api/properties/:id', requireAuth, async (req: any, res) => {
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

  app.delete('/api/properties/:id', requireAuth, async (req: any, res) => {
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
  app.get('/api/properties/:propertyId/milestones', requireAuth, async (req, res) => {
    try {
      const milestones = await storage.getMilestones(req.params.propertyId);
      res.json(milestones);
    } catch (error) {
      console.error("Error fetching milestones:", error);
      res.status(500).json({ message: "Failed to fetch milestones" });
    }
  });

  app.post('/api/properties/:propertyId/milestones', requireAuth, async (req: any, res) => {
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

  app.patch('/api/milestones/:id', requireAuth, async (req: any, res) => {
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
  app.get('/api/vendors', requireAuth, async (req, res) => {
    try {
      const vendors = await storage.getVendors();
      res.json(vendors);
    } catch (error) {
      console.error("Error fetching vendors:", error);
      res.status(500).json({ message: "Failed to fetch vendors" });
    }
  });

  app.post('/api/vendors', requireAuth, async (req: any, res) => {
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
  app.get('/api/properties/:propertyId/budget', requireAuth, async (req, res) => {
    try {
      const budgetLines = await storage.getBudgetLines(req.params.propertyId);
      res.json(budgetLines);
    } catch (error) {
      console.error("Error fetching budget:", error);
      res.status(500).json({ message: "Failed to fetch budget" });
    }
  });

  app.post('/api/properties/:propertyId/budget', requireAuth, async (req: any, res) => {
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
  app.get('/api/rfqs', requireAuth, async (req, res) => {
    try {
      const propertyId = req.query.propertyId as string;
      const rfqs = await storage.getRFQs(propertyId);
      res.json(rfqs);
    } catch (error) {
      console.error("Error fetching RFQs:", error);
      res.status(500).json({ message: "Failed to fetch RFQs" });
    }
  });

  app.post('/api/rfqs', requireAuth, async (req: any, res) => {
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
  app.get('/api/rfqs/:rfqId/bids', requireAuth, async (req, res) => {
    try {
      const bids = await storage.getBids(req.params.rfqId);
      res.json(bids);
    } catch (error) {
      console.error("Error fetching bids:", error);
      res.status(500).json({ message: "Failed to fetch bids" });
    }
  });

  app.post('/api/rfqs/:rfqId/bids', requireAuth, async (req: any, res) => {
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

  app.patch('/api/bids/:id/award', requireAuth, async (req: any, res) => {
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
  app.get('/api/properties/:propertyId/permits', requireAuth, async (req, res) => {
    try {
      const permits = await storage.getPermits(req.params.propertyId);
      res.json(permits);
    } catch (error) {
      console.error("Error fetching permits:", error);
      res.status(500).json({ message: "Failed to fetch permits" });
    }
  });

  app.post('/api/properties/:propertyId/permits', requireAuth, async (req: any, res) => {
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

  app.put('/api/permits/:permitId', requireAuth, async (req: any, res) => {
    try {
      const permitId = req.params.permitId;
      const updatedPermit = await storage.updatePermit(permitId, req.body);

      await createAuditLog(req, 'update', 'permit', permitId, null, updatedPermit);
      await createActivity(req.user.claims.sub, updatedPermit?.propertyId || '', 'permit_updated', `Updated permit status`, 'permit', permitId);

      res.json(updatedPermit);
    } catch (error) {
      console.error("Error updating permit:", error);
      res.status(500).json({ message: "Failed to update permit" });
    }
  });

  // AI-powered permit lookup endpoint using existing GEMINI_API_KEY
  app.post('/api/v1/permits/lookup', requireAuth, async (req: any, res) => {
    try {
      const { projectAddress, scopeOfWork } = req.body;

      if (!projectAddress || !scopeOfWork) {
        return res.status(400).json({ 
          message: "Both projectAddress and scopeOfWork are required" 
        });
      }

      console.log('Permit lookup request:', { projectAddress, scopeOfWork });

      // Use your existing Gemini service with GEMINI_API_KEY
      const permitInfo = await geminiService.lookupPermitRequirements(
        projectAddress,
        scopeOfWork
      );

      // Log activity
      try {
        await createActivity(req.user.id || req.user.claims?.sub, '', 'permit_lookup', `AI permit lookup for ${projectAddress}`, 'permit_lookup', undefined);
      } catch (activityError) {
        console.warn('Failed to create activity log:', activityError);
      }

      res.json(permitInfo);
    } catch (error) {
      console.error("Error in permit lookup:", error);
      res.status(500).json({ 
        message: "Failed to lookup permit requirements",
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  // Risk routes
  app.get('/api/properties/:propertyId/risks', requireAuth, async (req, res) => {
    try {
      const risks = await storage.getRisks(req.params.propertyId);
      res.json(risks);
    } catch (error) {
      console.error("Error fetching risks:", error);
      res.status(500).json({ message: "Failed to fetch risks" });
    }
  });

  app.post('/api/properties/:propertyId/risks', requireAuth, async (req: any, res) => {
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
  app.get('/api/documents', requireAuth, async (req, res) => {
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

  app.post('/api/documents', requireAuth, async (req: any, res) => {
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
  app.get('/api/activities', requireAuth, async (req, res) => {
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
  app.get("/objects/:objectPath(*)", requireAuth, async (req: any, res) => {
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

  app.post("/api/objects/upload", requireAuth, async (req, res) => {
    const objectStorageService = new ObjectStorageService();
    try {
      const uploadURL = await objectStorageService.getObjectEntityUploadURL();
      res.json({ uploadURL });
    } catch (error) {
      console.error("Error getting upload URL:", error);
      res.status(500).json({ error: "Failed to get upload URL" });
    }
  });

  app.put("/api/objects", requireAuth, async (req: any, res) => {
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

  // Analytics endpoints for dashboard
  app.get("/api/v1/analytics/gantt", requireAuth, (_req, res) => {
    res.json({
      projects: [
        {
          id: '1',
          name: 'Downtown Office Complex',
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          progress: 65,
          status: 'on-track',
          milestones: [
            { id: '1-1', name: 'Foundation Complete', date: '2024-03-15', status: 'complete' },
            { id: '1-2', name: 'Frame Construction', date: '2024-06-30', status: 'complete' },
            { id: '1-3', name: 'Interior Finishing', date: '2024-09-15', status: 'pending' },
            { id: '1-4', name: 'Final Inspection', date: '2024-11-30', status: 'pending' },
          ]
        },
        {
          id: '2',
          name: 'Residential Tower A',
          startDate: '2024-02-01',
          endDate: '2025-01-31',
          progress: 45,
          status: 'at-risk',
          milestones: [
            { id: '2-1', name: 'Site Preparation', date: '2024-03-01', status: 'complete' },
            { id: '2-2', name: 'Foundation Pour', date: '2024-05-15', status: 'overdue' },
            { id: '2-3', name: 'Structural Work', date: '2024-08-30', status: 'pending' },
          ]
        },
        {
          id: '3',
          name: 'Shopping Center Renovation',
          startDate: '2024-03-01',
          endDate: '2024-10-31',
          progress: 80,
          status: 'on-track',
          milestones: [
            { id: '3-1', name: 'Demolition', date: '2024-04-15', status: 'complete' },
            { id: '3-2', name: 'New Construction', date: '2024-07-31', status: 'complete' },
            { id: '3-3', name: 'Tenant Fit-out', date: '2024-09-30', status: 'pending' },
          ]
        }
      ]
    });
  });

  app.get("/api/v1/analytics/financials", requireAuth, (_req, res) => {
    res.json({
      budgetVariance: [
        { category: 'Labor', planned: 500000, actual: 520000, variance: 20000 },
        { category: 'Materials', planned: 800000, actual: 750000, variance: -50000 },
        { category: 'Equipment', planned: 200000, actual: 230000, variance: 30000 },
        { category: 'Permits', planned: 50000, actual: 45000, variance: -5000 },
        { category: 'Overhead', planned: 100000, actual: 115000, variance: 15000 },
      ],
      cashFlow: [
        { date: '2024-09-01', projected: 150000, actual: 145000 },
        { date: '2024-09-15', projected: 220000, actual: 210000 },
        { date: '2024-10-01', projected: 280000, actual: 0 },
        { date: '2024-10-15', projected: 350000, actual: 0 },
        { date: '2024-11-01', projected: 420000, actual: 0 },
        { date: '2024-11-15', projected: 480000, actual: 0 },
        { date: '2024-12-01', projected: 520000, actual: 0 },
      ]
    });
  });

  app.get("/api/v1/analytics/ai-insights", requireAuth, (_req, res) => {
    res.json({
      riskScores: [
        {
          projectId: '2',
          projectName: 'Residential Tower A',
          riskScore: 85,
          riskFactors: ['Weather delays', 'Material shortages', 'Permit issues'],
        },
        {
          projectId: '1',
          projectName: 'Downtown Office Complex',
          riskScore: 35,
          riskFactors: ['Minor scheduling conflicts'],
        },
        {
          projectId: '3',
          projectName: 'Shopping Center Renovation',
          riskScore: 20,
          riskFactors: ['On track'],
        },
      ]
    });
  });

  app.post("/api/v1/analytics/ai-recommendation", requireAuth, (_req, res) => {
    res.json({
      recommendation: "Based on the risk factors for this project, we recommend: 1) Implement weather contingency plans with indoor work alternatives, 2) Establish backup material suppliers to mitigate shortages, 3) Expedite permit processing through dedicated liaison, 4) Consider schedule buffer of 2-3 weeks for critical path activities."
    });
  });

  // Statistics and dashboard data
  app.get('/api/dashboard/stats', requireAuth, async (req, res) => {
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