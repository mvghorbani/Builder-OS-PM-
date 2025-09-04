import {
  users,
  properties,
  milestones,
  vendors,
  budgetLines,
  rfqs,
  rfqVendors,
  bids,
  permits,
  risks,
  documents,
  activities,
  auditLogs,
  type User,
  type UpsertUser,
  type Property,
  type InsertProperty,
  type Milestone,
  type InsertMilestone,
  type Vendor,
  type InsertVendor,
  type BudgetLine,
  type InsertBudgetLine,
  type RFQ,
  type InsertRFQ,
  type Bid,
  type InsertBid,
  type Permit,
  type InsertPermit,
  type Risk,
  type InsertRisk,
  type Document,
  type InsertDocument,
  type Activity,
  type InsertActivity,
  type AuditLog,
  type InsertAuditLog,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  findUserByEmail(email: string): Promise<User | null>; // Added for clarity
  createUser(user: { email: string; firstName: string; lastName: string; profileImageUrl: string; role: string }): Promise<string>; // Added for Replit Auth

  // Property operations
  getProperties(): Promise<Property[]>;
  getPropertiesByPmId(pmId: string): Promise<Property[]>;
  getProperty(id: string): Promise<Property | undefined>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: string): Promise<boolean>;

  // Milestone operations
  getMilestones(propertyId: string): Promise<Milestone[]>;
  getMilestone(id: string): Promise<Milestone | undefined>;
  createMilestone(milestone: InsertMilestone): Promise<Milestone>;
  updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined>;
  deleteMilestone(id: string): Promise<boolean>;

  // Vendor operations
  getVendors(): Promise<Vendor[]>;
  getVendor(id: string): Promise<Vendor | undefined>;
  createVendor(vendor: InsertVendor): Promise<Vendor>;
  updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined>;
  deleteVendor(id: string): Promise<boolean>;

  // Budget operations
  getBudgetLines(propertyId: string): Promise<BudgetLine[]>;
  getBudgetLine(id: string): Promise<BudgetLine | undefined>;
  createBudgetLine(budgetLine: InsertBudgetLine): Promise<BudgetLine>;
  updateBudgetLine(id: string, updates: Partial<InsertBudgetLine>): Promise<BudgetLine | undefined>;
  deleteBudgetLine(id: string): Promise<boolean>;

  // RFQ operations
  getRFQs(propertyId?: string): Promise<RFQ[]>;
  getRFQ(id: string): Promise<RFQ | undefined>;
  createRFQ(rfq: InsertRFQ): Promise<RFQ>;
  updateRFQ(id: string, updates: Partial<InsertRFQ>): Promise<RFQ | undefined>;
  deleteRFQ(id: string): Promise<boolean>;
  addVendorToRFQ(rfqId: string, vendorId: string): Promise<boolean>;
  removeVendorFromRFQ(rfqId: string, vendorId: string): Promise<boolean>;

  // Bid operations
  getBids(rfqId: string): Promise<Bid[]>;
  getBid(id: string): Promise<Bid | undefined>;
  createBid(bid: InsertBid): Promise<Bid>;
  updateBid(id: string, updates: Partial<InsertBid>): Promise<Bid | undefined>;
  awardBid(id: string): Promise<Bid | undefined>;

  // Permit operations
  getPermits(propertyId: string): Promise<Permit[]>;
  getPermit(id: string): Promise<Permit | undefined>;
  createPermit(permit: InsertPermit): Promise<Permit>;
  updatePermit(id: string, updates: Partial<InsertPermit>): Promise<Permit | undefined>;
  deletePermit(id: string): Promise<boolean>;

  // Risk operations
  getRisks(propertyId: string): Promise<Risk[]>;
  getRisk(id: string): Promise<Risk | undefined>;
  createRisk(risk: InsertRisk): Promise<Risk>;
  updateRisk(id: string, updates: Partial<InsertRisk>): Promise<Risk | undefined>;
  deleteRisk(id: string): Promise<boolean>;

  // Document operations
  getDocuments(propertyId?: string, milestoneId?: string): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  deleteDocument(id: string): Promise<boolean>;

  // Activity operations
  getActivities(propertyId?: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Audit operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: string, limit?: number): Promise<AuditLog[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user;
  }

  async upsertUser(user: UpsertUser): Promise<User> {
    // Try to find existing user by email first
    const existingUser = await this.findUserByEmail(user.email || "");

    if (existingUser) {
      // Update existing user
      const result = await db
        .update(users)
        .set({
          firstName: user.firstName,
          lastName: user.lastName,
          profileImageUrl: user.profileImageUrl,
          updatedAt: new Date(),
        })
        .where(eq(users.email, user.email!))
        .returning();

      return result[0];
    } else {
      // Insert new user with conflict resolution on ID
      const result = await db
        .insert(users)
        .values(user)
        .onConflictDoUpdate({
          target: users.id,
          set: {
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            profileImageUrl: user.profileImageUrl,
            updatedAt: new Date(),
          },
        })
        .returning();

      if (!result[0]) {
        throw new Error("Failed to upsert user");
      }

      return result[0];
    }
  }

  async findUserByEmail(email: string): Promise<User | null> {
    const result = await db
      .select()
      .from(users)
      .where(eq(users.email, email))
      .limit(1);

    return result[0] || null;
  }

  async createUser(user: { email: string; firstName: string; lastName: string; profileImageUrl: string; role: string }): Promise<string> {
    const result = await db.insert(users).values({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      profileImageUrl: user.profileImageUrl,
      role: user.role,
    }).returning({ id: users.id });

    if (!result[0]) {
      throw new Error("Failed to create user");
    }

    return result[0].id;
  }

  // Property operations
  async getProperties(): Promise<Property[]> {
    return await db.select().from(properties).orderBy(asc(properties.createdAt));
  }

  async getPropertiesByPmId(pmId: string): Promise<Property[]> {
    return await db.select().from(properties).where(eq(properties.pmId, pmId)).orderBy(asc(properties.createdAt));
  }

  async getProperty(id: string): Promise<Property | undefined> {
    const [property] = await db.select().from(properties).where(eq(properties.id, id));
    return property;
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const [newProperty] = await db.insert(properties).values(property).returning();
    return newProperty;
  }

  async updateProperty(id: string, updates: Partial<InsertProperty>): Promise<Property | undefined> {
    const [updatedProperty] = await db
      .update(properties)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(properties.id, id))
      .returning();
    return updatedProperty;
  }

  async deleteProperty(id: string): Promise<boolean> {
    const result = await db.delete(properties).where(eq(properties.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Milestone operations
  async getMilestones(propertyId: string): Promise<Milestone[]> {
    return await db
      .select()
      .from(milestones)
      .where(eq(milestones.propertyId, propertyId))
      .orderBy(asc(milestones.order));
  }

  async getMilestone(id: string): Promise<Milestone | undefined> {
    const [milestone] = await db.select().from(milestones).where(eq(milestones.id, id));
    return milestone;
  }

  async createMilestone(milestone: InsertMilestone): Promise<Milestone> {
    const [newMilestone] = await db.insert(milestones).values(milestone).returning();
    return newMilestone;
  }

  async updateMilestone(id: string, updates: Partial<InsertMilestone>): Promise<Milestone | undefined> {
    const [updatedMilestone] = await db
      .update(milestones)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(milestones.id, id))
      .returning();
    return updatedMilestone;
  }

  async deleteMilestone(id: string): Promise<boolean> {
    const result = await db.delete(milestones).where(eq(milestones.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Vendor operations
  async getVendors(): Promise<Vendor[]> {
    return await db.select().from(vendors).orderBy(asc(vendors.name));
  }

  async getVendor(id: string): Promise<Vendor | undefined> {
    const [vendor] = await db.select().from(vendors).where(eq(vendors.id, id));
    return vendor;
  }

  async createVendor(vendor: InsertVendor): Promise<Vendor> {
    const [newVendor] = await db.insert(vendors).values(vendor).returning();
    return newVendor;
  }

  async updateVendor(id: string, updates: Partial<InsertVendor>): Promise<Vendor | undefined> {
    const [updatedVendor] = await db
      .update(vendors)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(vendors.id, id))
      .returning();
    return updatedVendor;
  }

  async deleteVendor(id: string): Promise<boolean> {
    const result = await db.delete(vendors).where(eq(vendors.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Budget operations
  async getBudgetLines(propertyId: string): Promise<BudgetLine[]> {
    return await db
      .select()
      .from(budgetLines)
      .where(eq(budgetLines.propertyId, propertyId))
      .orderBy(asc(budgetLines.scope));
  }

  async getBudgetLine(id: string): Promise<BudgetLine | undefined> {
    const [budgetLine] = await db.select().from(budgetLines).where(eq(budgetLines.id, id));
    return budgetLine;
  }

  async createBudgetLine(budgetLine: InsertBudgetLine): Promise<BudgetLine> {
    const [newBudgetLine] = await db.insert(budgetLines).values(budgetLine).returning();
    return newBudgetLine;
  }

  async updateBudgetLine(id: string, updates: Partial<InsertBudgetLine>): Promise<BudgetLine | undefined> {
    const [updatedBudgetLine] = await db
      .update(budgetLines)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(budgetLines.id, id))
      .returning();
    return updatedBudgetLine;
  }

  async deleteBudgetLine(id: string): Promise<boolean> {
    const result = await db.delete(budgetLines).where(eq(budgetLines.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // RFQ operations
  async getRFQs(propertyId?: string): Promise<RFQ[]> {
    const query = db.select().from(rfqs);
    if (propertyId) {
      return await query.where(eq(rfqs.propertyId, propertyId)).orderBy(desc(rfqs.createdAt));
    }
    return await query.orderBy(desc(rfqs.createdAt));
  }

  async getRFQ(id: string): Promise<RFQ | undefined> {
    const [rfq] = await db.select().from(rfqs).where(eq(rfqs.id, id));
    return rfq;
  }

  async createRFQ(rfq: InsertRFQ): Promise<RFQ> {
    const [newRFQ] = await db.insert(rfqs).values(rfq).returning();
    return newRFQ;
  }

  async updateRFQ(id: string, updates: Partial<InsertRFQ>): Promise<RFQ | undefined> {
    const [updatedRFQ] = await db
      .update(rfqs)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(rfqs.id, id))
      .returning();
    return updatedRFQ;
  }

  async deleteRFQ(id: string): Promise<boolean> {
    const result = await db.delete(rfqs).where(eq(rfqs.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  async addVendorToRFQ(rfqId: string, vendorId: string): Promise<boolean> {
    try {
      await db.insert(rfqVendors).values({ rfqId, vendorId });
      return true;
    } catch (error) {
      return false;
    }
  }

  async removeVendorFromRFQ(rfqId: string, vendorId: string): Promise<boolean> {
    const result = await db
      .delete(rfqVendors)
      .where(and(eq(rfqVendors.rfqId, rfqId), eq(rfqVendors.vendorId, vendorId)));
    return (result.rowCount ?? 0) > 0;
  }

  // Bid operations
  async getBids(rfqId: string): Promise<Bid[]> {
    return await db
      .select()
      .from(bids)
      .where(eq(bids.rfqId, rfqId))
      .orderBy(desc(bids.submittedAt));
  }

  async getBid(id: string): Promise<Bid | undefined> {
    const [bid] = await db.select().from(bids).where(eq(bids.id, id));
    return bid;
  }

  async createBid(bid: InsertBid): Promise<Bid> {
    const [newBid] = await db.insert(bids).values(bid).returning();
    return newBid;
  }

  async updateBid(id: string, updates: Partial<InsertBid>): Promise<Bid | undefined> {
    const [updatedBid] = await db
      .update(bids)
      .set(updates)
      .where(eq(bids.id, id))
      .returning();
    return updatedBid;
  }

  async awardBid(id: string): Promise<Bid | undefined> {
    const [awardedBid] = await db
      .update(bids)
      .set({ status: 'awarded', awardedAt: new Date() })
      .where(eq(bids.id, id))
      .returning();
    return awardedBid;
  }

  // Permit operations
  async getPermits(propertyId: string): Promise<Permit[]> {
    return await db
      .select()
      .from(permits)
      .where(eq(permits.propertyId, propertyId))
      .orderBy(asc(permits.createdAt));
  }

  async getPermit(id: string): Promise<Permit | undefined> {
    const [permit] = await db.select().from(permits).where(eq(permits.id, id));
    return permit;
  }

  async createPermit(permit: InsertPermit): Promise<Permit> {
    const [newPermit] = await db.insert(permits).values(permit).returning();
    return newPermit;
  }

  async updatePermit(id: string, updates: Partial<InsertPermit>): Promise<Permit | undefined> {
    const [updatedPermit] = await db
      .update(permits)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(permits.id, id))
      .returning();
    return updatedPermit;
  }

  async deletePermit(id: string): Promise<boolean> {
    const result = await db.delete(permits).where(eq(permits.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Risk operations
  async getRisks(propertyId: string): Promise<Risk[]>{
    return await db
      .select()
      .from(risks)
      .where(eq(risks.propertyId, propertyId))
      .orderBy(desc(risks.createdAt));
  }

  async getRisk(id: string): Promise<Risk | undefined> {
    const [risk] = await db.select().from(risks).where(eq(risks.id, id));
    return risk;
  }

  async createRisk(risk: InsertRisk): Promise<Risk> {
    const [newRisk] = await db.insert(risks).values(risk).returning();
    return newRisk;
  }

  async updateRisk(id: string, updates: Partial<InsertRisk>): Promise<Risk | undefined> {
    const [updatedRisk] = await db
      .update(risks)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(risks.id, id))
      .returning();
    return updatedRisk;
  }

  async deleteRisk(id: string): Promise<boolean> {
    const result = await db.delete(risks).where(eq(risks.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Document operations
  async getDocuments(propertyId?: string, milestoneId?: string): Promise<Document[]> {
    if (propertyId && milestoneId) {
      return await db
        .select()
        .from(documents)
        .where(and(eq(documents.propertyId, propertyId), eq(documents.milestoneId, milestoneId)))
        .orderBy(desc(documents.createdAt));
    } else if (propertyId) {
      return await db
        .select()
        .from(documents)
        .where(eq(documents.propertyId, propertyId))
        .orderBy(desc(documents.createdAt));
    } else if (milestoneId) {
      return await db
        .select()
        .from(documents)
        .where(eq(documents.milestoneId, milestoneId))
        .orderBy(desc(documents.createdAt));
    }

    return await db.select().from(documents).orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Activity operations
  async getActivities(propertyId?: string, limit: number = 50): Promise<Activity[]> {
    if (propertyId) {
      return await db
        .select()
        .from(activities)
        .where(eq(activities.propertyId, propertyId))
        .orderBy(desc(activities.createdAt))
        .limit(limit);
    }

    return await db
      .select()
      .from(activities)
      .orderBy(desc(activities.createdAt))
      .limit(limit);
  }

  async createActivity(activity: InsertActivity): Promise<Activity> {
    const [newActivity] = await db.insert(activities).values(activity).returning();
    return newActivity;
  }

  // Audit operations
  async createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog> {
    const [newAuditLog] = await db.insert(auditLogs).values(auditLog).returning();
    return newAuditLog;
  }

  async getAuditLogs(entityType?: string, entityId?: string, limit: number = 100): Promise<AuditLog[]> {
    if (entityType && entityId) {
      return await db
        .select()
        .from(auditLogs)
        .where(and(eq(auditLogs.entityType, entityType), eq(auditLogs.entityId, entityId)))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
    } else if (entityType) {
      return await db
        .select()
        .from(auditLogs)
        .where(eq(auditLogs.entityType, entityType))
        .orderBy(desc(auditLogs.createdAt))
        .limit(limit);
    }

    return await db
      .select()
      .from(auditLogs)
      .orderBy(desc(auditLogs.createdAt))
      .limit(limit);
  }
}

export const storage = new DatabaseStorage();