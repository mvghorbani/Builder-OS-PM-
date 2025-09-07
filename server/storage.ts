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
  documentComments,
  documentShares,
  activities,
  auditLogs,
  discussions,
  discussionComments as discussionComments,
  discussionReactions,
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
  type DocumentComment,
  type InsertDocumentComment,
  type DocumentShare,
  type InsertDocumentShare,
  type Activity,
  type InsertActivity,
  type AuditLog,
  type InsertAuditLog,
  type Discussion,
  type InsertDiscussion,
  type DiscussionComment as DiscussionCommentType,
  type InsertDiscussionComment as InsertDiscussionComment,
  type DiscussionReaction,
  type InsertDiscussionReaction,
} from "@shared/schema";
import { db } from "./db";
import { eq, and, desc, asc, sql, like, or, ilike, isNull, not } from "drizzle-orm";

export interface IStorage {
  // User operations (required for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  updateUserRole(id: string, role: string): Promise<User | undefined>;
  findUserByEmail(email: string): Promise<User | null>; // Added for clarity
  createUser(user: { email: string; firstName: string; lastName: string; profileImageUrl: string; role: string }): Promise<string>; // Added for Replit Auth
  createUserWithPassword(user: { email: string; firstName: string; lastName: string; passwordHash: string; role: string }): Promise<User>; // Added for direct user creation

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
  searchDocuments(query: string, filters?: {
    propertyId?: string;
    category?: string;
    type?: string;
    status?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    uploadedBy?: string;
  }): Promise<Document[]>;
  getDocument(id: string): Promise<Document | undefined>;
  getDocumentVersions(parentDocumentId: string): Promise<Document[]>;
  getLatestDocumentVersion(parentDocumentId: string): Promise<Document | undefined>;
  createDocument(document: InsertDocument): Promise<Document>;
  updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined>;
  createDocumentVersion(originalDocumentId: string, newDocument: InsertDocument): Promise<Document>;
  approveDocument(id: string, approvedBy: string, comments?: string): Promise<Document | undefined>;
  rejectDocument(id: string, reviewedBy: string, comments: string): Promise<Document | undefined>;
  archiveDocument(id: string, reason: string): Promise<Document | undefined>;
  deleteDocument(id: string): Promise<boolean>;
  
  // Document comments
  getDocumentComments(documentId: string): Promise<DocumentComment[]>;
  createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment>;
  resolveComment(commentId: string): Promise<DocumentComment | undefined>;
  
  // Document sharing
  createDocumentShare(share: InsertDocumentShare): Promise<DocumentShare>;
  getDocumentShare(shareToken: string): Promise<DocumentShare | undefined>;
  updateShareAccess(shareId: string): Promise<DocumentShare | undefined>;
  deactivateShare(shareId: string): Promise<boolean>;
  
  // Document exports and backup
  getDocumentsByCategory(category: string, propertyId?: string): Promise<Document[]>;
  getDocumentsForBackup(lastBackupDate?: Date): Promise<Document[]>;

  // Activity operations
  getActivities(propertyId?: string, limit?: number): Promise<Activity[]>;
  createActivity(activity: InsertActivity): Promise<Activity>;

  // Audit operations
  createAuditLog(auditLog: InsertAuditLog): Promise<AuditLog>;
  getAuditLogs(entityType?: string, entityId?: string, limit?: number): Promise<AuditLog[]>;

  // Discussion operations
  getDiscussions(params?: { propertyId?: string; limit?: number; cursor?: string }): Promise<import("@shared/schema").Discussion[]>;
  getDiscussion(id: string): Promise<import("@shared/schema").Discussion | undefined>;
  createDiscussion(discussion: import("@shared/schema").InsertDiscussion): Promise<import("@shared/schema").Discussion>;
  createDiscussionComment(comment: import("@shared/schema").InsertDiscussionComment): Promise<import("@shared/schema").DiscussionComment>;
  getDiscussionComments(discussionId: string, limit?: number): Promise<import("@shared/schema").DiscussionComment[]>;
  toggleDiscussionReaction(discussionId: string, userId: string, type: import("@shared/schema").DiscussionReaction["type"]): Promise<{ added: boolean }>;
  getDiscussionReactionCounts(discussionId: string): Promise<Record<string, number>>;
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

  async updateUserRole(id: string, role: string): Promise<User | undefined> {
    const result = await db
      .update(users)
      .set({ role, updatedAt: new Date() })
      .where(eq(users.id, id))
      .returning();

    return result[0];
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

  async createUserWithPassword(user: { email: string; firstName: string; lastName: string; passwordHash: string; role: string }): Promise<User> {
    const result = await db.insert(users).values({
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      passwordHash: user.passwordHash,
      role: user.role,
      profileImageUrl: '',
    }).returning();

    if (!result[0]) {
      throw new Error("Failed to create user");
    }

    return result[0];
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
        .where(and(
          eq(documents.propertyId, propertyId), 
          eq(documents.milestoneId, milestoneId),
          eq(documents.isArchived, false)
        ))
        .orderBy(desc(documents.createdAt));
    } else if (propertyId) {
      return await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.propertyId, propertyId),
          eq(documents.isArchived, false)
        ))
        .orderBy(desc(documents.createdAt));
    } else if (milestoneId) {
      return await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.milestoneId, milestoneId),
          eq(documents.isArchived, false)
        ))
        .orderBy(desc(documents.createdAt));
    }

    return await db
      .select()
      .from(documents)
      .where(eq(documents.isArchived, false))
      .orderBy(desc(documents.createdAt));
  }

  async searchDocuments(query: string, filters?: {
    propertyId?: string;
    category?: string;
    type?: string;
    status?: string;
    tags?: string[];
    dateFrom?: Date;
    dateTo?: Date;
    uploadedBy?: string;
  }): Promise<Document[]> {
    const conditions = [eq(documents.isArchived, false)];
    
    // Text search in name, description, and tags
    if (query) {
      conditions.push(
        or(
          ilike(documents.name, `%${query}%`),
          ilike(documents.description, `%${query}%`)
        )!
      );
    }
    
    // Apply filters
    if (filters) {
      if (filters.propertyId) conditions.push(eq(documents.propertyId, filters.propertyId));
      if (filters.category) conditions.push(eq(documents.category, filters.category));
      if (filters.type) conditions.push(eq(documents.type, filters.type));
      if (filters.uploadedBy) conditions.push(eq(documents.uploadedBy, filters.uploadedBy));
    }
    
    return await db
      .select()
      .from(documents)
      .where(and(...conditions))
      .orderBy(desc(documents.createdAt));
  }

  async getDocument(id: string): Promise<Document | undefined> {
    const [document] = await db.select().from(documents).where(eq(documents.id, id));
    return document;
  }

  async getDocumentVersions(parentDocumentId: string): Promise<Document[]> {
    return await db
      .select()
      .from(documents)
      .where(eq(documents.parentDocumentId, parentDocumentId))
      .orderBy(desc(documents.version));
  }

  async getLatestDocumentVersion(parentDocumentId: string): Promise<Document | undefined> {
    const [document] = await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.parentDocumentId, parentDocumentId),
        eq(documents.isLatestVersion, true)
      ));
    return document;
  }

  async createDocument(document: InsertDocument): Promise<Document> {
    const [newDocument] = await db.insert(documents).values(document).returning();
    return newDocument;
  }

  async updateDocument(id: string, updates: Partial<InsertDocument>): Promise<Document | undefined> {
    const [updatedDocument] = await db
      .update(documents)
      .set({ ...updates, updatedAt: new Date() })
      .where(eq(documents.id, id))
      .returning();
    return updatedDocument;
  }

  async createDocumentVersion(originalDocumentId: string, newDocument: Partial<InsertDocument>): Promise<Document> {
    // Get the original document to inherit properties
    const originalDoc = await this.getDocument(originalDocumentId);
    if (!originalDoc) {
      throw new Error('Original document not found');
    }

    // Mark all versions of the original as not latest
    await db
      .update(documents)
      .set({ isLatestVersion: false })
      .where(eq(documents.parentDocumentId, originalDocumentId));
    
    // Mark the original as not latest
    await db
      .update(documents)
      .set({ isLatestVersion: false })
      .where(eq(documents.id, originalDocumentId));

    // Create new version with inherited properties
    const newVersion = originalDoc.version + 1;
    const versionData = {
      // Inherit from original document
      name: originalDoc.name,
      type: originalDoc.type,
      category: originalDoc.category,
      filePath: originalDoc.filePath,
      fileName: originalDoc.fileName,
      uploadedBy: originalDoc.uploadedBy,
      propertyId: originalDoc.propertyId,
      milestoneId: originalDoc.milestoneId,
      tags: originalDoc.tags || [],
      accessLevel: originalDoc.accessLevel,
      
      // Override with new document data
      ...(newDocument as any),
      
      // Version-specific properties
      parentDocumentId: originalDocumentId,
      version: newVersion,
      isLatestVersion: true,
    } as any;
    
    const [versionedDocument] = await db.insert(documents).values(versionData).returning();
    
    return versionedDocument;
  }

  async approveDocument(id: string, approvedBy: string, comments?: string): Promise<Document | undefined> {
    const [approvedDocument] = await db
      .update(documents)
      .set({ 
        status: 'approved',
        approvedBy,
        approvedAt: new Date(),
        reviewComments: comments,
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    return approvedDocument;
  }

  async rejectDocument(id: string, reviewedBy: string, comments: string): Promise<Document | undefined> {
    const [rejectedDocument] = await db
      .update(documents)
      .set({ 
        status: 'rejected',
        reviewedBy,
        reviewedAt: new Date(),
        reviewComments: comments,
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    return rejectedDocument;
  }

  async archiveDocument(id: string, reason: string): Promise<Document | undefined> {
    const [archivedDocument] = await db
      .update(documents)
      .set({ 
        isArchived: true,
        archiveReason: reason,
        updatedAt: new Date()
      })
      .where(eq(documents.id, id))
      .returning();
    return archivedDocument;
  }
  async deleteDocument(id: string): Promise<boolean> {
    const result = await db.delete(documents).where(eq(documents.id, id));
    return (result.rowCount ?? 0) > 0;
  }

  // Document comments
  async getDocumentComments(documentId: string): Promise<DocumentComment[]> {
    return await db
      .select()
      .from(documentComments)
      .where(eq(documentComments.documentId, documentId))
      .orderBy(asc(documentComments.createdAt));
  }

  async createDocumentComment(comment: InsertDocumentComment): Promise<DocumentComment> {
    const [newComment] = await db.insert(documentComments).values(comment).returning();
    return newComment;
  }

  async resolveComment(commentId: string): Promise<DocumentComment | undefined> {
    const [resolvedComment] = await db
      .update(documentComments)
      .set({ isResolved: true })
      .where(eq(documentComments.id, commentId))
      .returning();
    return resolvedComment;
  }

  // Document sharing
  async createDocumentShare(share: InsertDocumentShare): Promise<DocumentShare> {
    const [newShare] = await db.insert(documentShares).values(share).returning();
    return newShare;
  }

  async getDocumentShare(shareToken: string): Promise<DocumentShare | undefined> {
    const [share] = await db
      .select()
      .from(documentShares)
      .where(and(
        eq(documentShares.shareToken, shareToken),
        eq(documentShares.isActive, true)
      ));
    return share;
  }

  async updateShareAccess(shareId: string): Promise<DocumentShare | undefined> {
    const [updatedShare] = await db
      .update(documentShares)
      .set({ 
        accessCount: sql`${documentShares.accessCount} + 1`
      })
      .where(eq(documentShares.id, shareId))
      .returning();
    return updatedShare;
  }

  async deactivateShare(shareId: string): Promise<boolean> {
    const result = await db
      .update(documentShares)
      .set({ isActive: false })
      .where(eq(documentShares.id, shareId));
    return (result.rowCount ?? 0) > 0;
  }

  // Document exports and backup
  async getDocumentsByCategory(category: string, propertyId?: string): Promise<Document[]> {
    if (propertyId) {
      return await db
        .select()
        .from(documents)
        .where(and(
          eq(documents.category, category),
          eq(documents.propertyId, propertyId),
          eq(documents.isArchived, false)
        ))
        .orderBy(desc(documents.createdAt));
    }
    
    return await db
      .select()
      .from(documents)
      .where(and(
        eq(documents.category, category),
        eq(documents.isArchived, false)
      ))
      .orderBy(desc(documents.createdAt));
  }

  async getDocumentsForBackup(lastBackupDate?: Date): Promise<Document[]> {
    if (lastBackupDate) {
      return await db
        .select()
        .from(documents)
        .where(sql`${documents.updatedAt} > ${lastBackupDate}`)
        .orderBy(desc(documents.updatedAt));
    }
    
    return await db
      .select()
      .from(documents)
      .orderBy(desc(documents.updatedAt));
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

  // Discussion operations
  async getDiscussions(params?: { propertyId?: string; limit?: number; cursor?: string }) {
    const { propertyId, limit = 20, cursor } = params || {};
    const filters = [] as any[];
    if (propertyId) filters.push(eq(discussions.propertyId, propertyId));

    const where = filters.length ? and(...filters) : undefined as any;

    const q = db.select().from(discussions)
      .where(where || sql`true`)
      .orderBy(desc(discussions.createdAt))
      .limit(limit);
    return await q;
  }

  async getDiscussion(id: string) {
    const [row] = await db.select().from(discussions).where(eq(discussions.id, id));
    return row;
  }

  async createDiscussion(discussion: InsertDiscussion) {
    const [row] = await db.insert(discussions).values(discussion).returning();
    return row;
  }

  async createDiscussionComment(comment: InsertDiscussionComment) {
    const [row] = await db.insert(discussionComments).values(comment).returning();
    return row;
  }

  async getDiscussionComments(discussionId: string, limit: number = 100) {
    return await db
      .select()
      .from(discussionComments)
      .where(eq(discussionComments.discussionId, discussionId))
      .orderBy(asc(discussionComments.createdAt))
      .limit(limit);
  }

  async toggleDiscussionReaction(discussionId: string, userId: string, type: any) {
    const existing = await db
      .select()
      .from(discussionReactions)
      .where(and(
        eq(discussionReactions.discussionId, discussionId),
        eq(discussionReactions.userId, userId),
        eq(discussionReactions.type, type as any)
      ))
      .limit(1);

    if (existing[0]) {
      await db
        .delete(discussionReactions)
        .where(eq(discussionReactions.id, existing[0].id));
      return { added: false };
    } else {
      await db.insert(discussionReactions).values({ discussionId, userId, type });
      return { added: true };
    }
  }

  async getDiscussionReactionCounts(discussionId: string) {
    const rows = await db
      .select({ type: discussionReactions.type, count: sql<number>`count(*)`.as("count") })
      .from(discussionReactions)
      .where(eq(discussionReactions.discussionId, discussionId))
      .groupBy(discussionReactions.type);
    const result: Record<string, number> = {};
    rows.forEach(r => { result[String(r.type)] = Number((r as any).count); });
    return result;
  }
}

export const storage = new DatabaseStorage();
