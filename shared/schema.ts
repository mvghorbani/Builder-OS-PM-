import { sql, relations } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgTable,
  timestamp,
  varchar,
  text,
  decimal,
  integer,
  boolean,
  pgEnum,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table (required for Replit Auth)
export const sessions = pgTable(
  "sessions",
  {
    sid: varchar("sid").primaryKey(),
    sess: jsonb("sess").notNull(),
    expire: timestamp("expire").notNull(),
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table (required for Replit Auth)
export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  email: varchar("email").unique(),
  firstName: varchar("first_name"),
  lastName: varchar("last_name"),
  profileImageUrl: varchar("profile_image_url"),
  passwordHash: varchar("password_hash"), // for traditional email/password auth
  role: varchar("role").notNull().default('viewer'), // admin, pm, owner, vendor, viewer
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Enums
export const propertyStatusEnum = pgEnum('property_status', ['planning', 'permits', 'assessment', 'active', 'completed', 'on_hold']);
export const milestoneStatusEnum = pgEnum('milestone_status', ['pending', 'active', 'complete', 'blocked', 'cancelled']);
export const riskTypeEnum = pgEnum('risk_type', ['risk', 'issue']);
export const riskImpactEnum = pgEnum('risk_impact', ['low', 'medium', 'high', 'critical']);
export const riskStatusEnum = pgEnum('risk_status', ['open', 'in_progress', 'resolved', 'closed']);
export const permitStatusEnum = pgEnum('permit_status', ['not_started', 'submitted', 'under_review', 'approved', 'rejected', 'expired']);
export const rfqStatusEnum = pgEnum('rfq_status', ['draft', 'sent', 'responses_received', 'awarded', 'cancelled']);
export const bidStatusEnum = pgEnum('bid_status', ['pending', 'submitted', 'awarded', 'rejected']);
export const auditActionEnum = pgEnum('audit_action', ['create', 'update', 'delete', 'view', 'approve', 'reject']);
export const documentStatusEnum = pgEnum('document_status', ['draft', 'review', 'approved', 'rejected', 'archived']);
export const accessLevelEnum = pgEnum('access_level', ['public', 'project_team', 'project_managers', 'owners_only', 'restricted']);
export const reactionTypeEnum = pgEnum('reaction_type', ['like', 'love', 'insight', 'question', 'celebrate']);

// Core tables
export const properties = pgTable("properties", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  address: text("address").notNull(),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  type: text("type").notNull(),
  status: propertyStatusEnum("status").notNull().default('planning'),
  progress: integer("progress").notNull().default(0),
  totalBudget: decimal("total_budget", { precision: 10, scale: 2 }).notNull(),
  spentBudget: decimal("spent_budget", { precision: 10, scale: 2 }).notNull().default('0'),
  committedBudget: decimal("committed_budget", { precision: 10, scale: 2 }).notNull().default('0'),
  dueDate: timestamp("due_date"),
  scheduleAdherence: integer("schedule_adherence").notNull().default(100),
  budgetVariance: decimal("budget_variance", { precision: 5, scale: 2 }).notNull().default('0'),
  safetyIncidents: integer("safety_incidents").notNull().default(0),
  permitSLA: integer("permit_sla").notNull().default(0),
  ownerId: varchar("owner_id").references(() => users.id),
  pmId: varchar("pm_id").references(() => users.id),
  description: text("description"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const milestones = pgTable("milestones", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  status: milestoneStatusEnum("status").notNull().default('pending'),
  targetDate: timestamp("target_date").notNull(),
  actualDate: timestamp("actual_date"),
  order: integer("order").notNull().default(0),
  blockers: text("blockers").array(),
  dependencies: varchar("dependencies").array(), // milestone IDs that must be complete first
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const vendors = pgTable("vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  contactEmail: text("contact_email"),
  contactPhone: text("contact_phone"),
  address: text("address"),
  trades: text("trades").array(), // specializations
  isLicensed: boolean("is_licensed").notNull().default(false),
  isBonded: boolean("is_bonded").notNull().default(false),
  insuranceExpiry: timestamp("insurance_expiry"),
  rating: decimal("rating", { precision: 3, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const budgetLines = pgTable("budget_lines", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  scope: text("scope").notNull(),
  vendorId: varchar("vendor_id").references(() => vendors.id),
  contractAmount: decimal("contract_amount", { precision: 10, scale: 2 }).notNull(),
  spentAmount: decimal("spent_amount", { precision: 10, scale: 2 }).notNull().default('0'),
  percentComplete: integer("percent_complete").notNull().default(0),
  bidCount: integer("bid_count").notNull().default(0),
  coiValid: boolean("coi_valid").notNull().default(false),
  paymentBlocked: boolean("payment_blocked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfqs = pgTable("rfqs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  title: text("title").notNull(),
  scope: text("scope").notNull(),
  description: text("description").notNull(),
  bidDueDate: timestamp("bid_due_date").notNull(),
  siteWalkthroughDate: timestamp("site_walkthrough_date"),
  status: rfqStatusEnum("status").notNull().default('draft'),
  createdBy: varchar("created_by").notNull().references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const rfqVendors = pgTable("rfq_vendors", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfqId: varchar("rfq_id").notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  invitedAt: timestamp("invited_at").defaultNow(),
  respondedAt: timestamp("responded_at"),
});

export const bids = pgTable("bids", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rfqId: varchar("rfq_id").notNull().references(() => rfqs.id, { onDelete: 'cascade' }),
  vendorId: varchar("vendor_id").notNull().references(() => vendors.id, { onDelete: 'cascade' }),
  baseBid: decimal("base_bid", { precision: 10, scale: 2 }).notNull(),
  timeline: text("timeline"),
  notes: text("notes"),
  status: bidStatusEnum("status").notNull().default('pending'),
  score: integer("score"),
  submittedAt: timestamp("submitted_at").defaultNow(),
  awardedAt: timestamp("awarded_at"),
});

export const permits = pgTable("permits", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  type: text("type").notNull(), // building, demo, electrical, plumbing, etc.
  permitNumber: text("permit_number"),
  status: permitStatusEnum("status").notNull().default('not_started'),
  submittedDate: timestamp("submitted_date"),
  approvedDate: timestamp("approved_date"),
  expiryDate: timestamp("expiry_date"),
  cost: decimal("cost", { precision: 8, scale: 2 }),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const risks = pgTable("risks", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").notNull().references(() => properties.id, { onDelete: 'cascade' }),
  type: riskTypeEnum("type").notNull(),
  description: text("description").notNull(),
  impact: riskImpactEnum("impact").notNull(),
  owner: varchar("owner").notNull().references(() => users.id),
  dueDate: timestamp("due_date"),
  status: riskStatusEnum("status").notNull().default('open'),
  resolution: text("resolution"),
  resolvedAt: timestamp("resolved_at"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documents = pgTable("documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'cascade' }),
  milestoneId: varchar("milestone_id").references(() => milestones.id, { onDelete: 'cascade' }),
  name: text("name").notNull(),
  description: text("description"),
  type: text("type").notNull(), // contract, permit, photo, plan, drawing, invoice, report, etc.
  category: text("category").notNull(), // permits, contracts, photos, plans, correspondence, reports
  tags: text("tags").array(), // searchable tags
  filePath: text("file_path").notNull(),
  fileName: text("file_name").notNull(),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  checksum: text("checksum"), // for integrity verification
  
  // Version Control
  version: integer("version").notNull().default(1),
  parentDocumentId: varchar("parent_document_id"),
  isLatestVersion: boolean("is_latest_version").notNull().default(true),
  versionNotes: text("version_notes"),
  
  // Access Control
  accessLevel: accessLevelEnum("access_level").notNull().default('project_team'),
  allowedUsers: varchar("allowed_users").array(), // specific user IDs for restricted access
  allowedRoles: text("allowed_roles").array(), // specific roles for access
  
  // Workflow & Approval
  status: documentStatusEnum("status").notNull().default('draft'),
  reviewedBy: varchar("reviewed_by").references(() => users.id),
  reviewedAt: timestamp("reviewed_at"),
  approvedBy: varchar("approved_by").references(() => users.id),
  approvedAt: timestamp("approved_at"),
  reviewComments: text("review_comments"),
  
  // Metadata
  uploadedBy: varchar("uploaded_by").notNull().references(() => users.id),
  lastModifiedBy: varchar("last_modified_by").references(() => users.id),
  expiryDate: timestamp("expiry_date"), // for permits, licenses, etc.
  isArchived: boolean("is_archived").notNull().default(false),
  archiveReason: text("archive_reason"),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const documentComments = pgTable("document_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  comment: text("comment").notNull(),
  parentCommentId: varchar("parent_comment_id"),
  isResolved: boolean("is_resolved").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const documentShares = pgTable("document_shares", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  documentId: varchar("document_id").notNull().references(() => documents.id, { onDelete: 'cascade' }),
  sharedBy: varchar("shared_by").notNull().references(() => users.id),
  sharedWith: varchar("shared_with").references(() => users.id), // null for public links
  shareToken: varchar("share_token").unique(),
  expiresAt: timestamp("expires_at"),
  canDownload: boolean("can_download").notNull().default(true),
  canComment: boolean("can_comment").notNull().default(false),
  accessCount: integer("access_count").notNull().default(0),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

export const activities = pgTable("activities", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: text("action").notNull(),
  description: text("description").notNull(),
  entityType: text("entity_type"), // milestone, budget, permit, etc.
  entityId: varchar("entity_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Discussions (Stakeholder feed)
export const discussions = pgTable("discussions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  propertyId: varchar("property_id").references(() => properties.id, { onDelete: 'set null' }),
  authorId: varchar("author_id").notNull().references(() => users.id),
  title: text("title"),
  body: text("body").notNull(),
  visibility: accessLevelEnum("visibility").notNull().default('project_team'),
  isPinned: boolean("is_pinned").notNull().default(false),
  isLocked: boolean("is_locked").notNull().default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const discussionComments = pgTable("discussion_comments", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discussionId: varchar("discussion_id").notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  body: text("body").notNull(),
  parentCommentId: varchar("parent_comment_id"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const discussionReactions = pgTable("discussion_reactions", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  discussionId: varchar("discussion_id").notNull().references(() => discussions.id, { onDelete: 'cascade' }),
  userId: varchar("user_id").notNull().references(() => users.id),
  type: reactionTypeEnum("type").notNull().default('like'),
  createdAt: timestamp("created_at").defaultNow(),
});

export const auditLogs = pgTable("audit_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id),
  action: auditActionEnum("action").notNull(),
  entityType: text("entity_type").notNull(),
  entityId: varchar("entity_id").notNull(),
  oldValues: jsonb("old_values"),
  newValues: jsonb("new_values"),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations
export const propertyRelations = relations(properties, ({ one, many }) => ({
  owner: one(users, { fields: [properties.ownerId], references: [users.id] }),
  projectManager: one(users, { fields: [properties.pmId], references: [users.id] }),
  milestones: many(milestones),
  budgetLines: many(budgetLines),
  permits: many(permits),
  risks: many(risks),
  documents: many(documents),
  activities: many(activities),
  rfqs: many(rfqs),
}));

export const milestoneRelations = relations(milestones, ({ one, many }) => ({
  property: one(properties, { fields: [milestones.propertyId], references: [properties.id] }),
  documents: many(documents),
}));

export const vendorRelations = relations(vendors, ({ many }) => ({
  budgetLines: many(budgetLines),
  rfqVendors: many(rfqVendors),
  bids: many(bids),
}));

export const budgetLineRelations = relations(budgetLines, ({ one }) => ({
  property: one(properties, { fields: [budgetLines.propertyId], references: [properties.id] }),
  vendor: one(vendors, { fields: [budgetLines.vendorId], references: [vendors.id] }),
}));

export const rfqRelations = relations(rfqs, ({ one, many }) => ({
  property: one(properties, { fields: [rfqs.propertyId], references: [properties.id] }),
  createdBy: one(users, { fields: [rfqs.createdBy], references: [users.id] }),
  rfqVendors: many(rfqVendors),
  bids: many(bids),
}));

export const rfqVendorRelations = relations(rfqVendors, ({ one }) => ({
  rfq: one(rfqs, { fields: [rfqVendors.rfqId], references: [rfqs.id] }),
  vendor: one(vendors, { fields: [rfqVendors.vendorId], references: [vendors.id] }),
}));

export const bidRelations = relations(bids, ({ one }) => ({
  rfq: one(rfqs, { fields: [bids.rfqId], references: [rfqs.id] }),
  vendor: one(vendors, { fields: [bids.vendorId], references: [vendors.id] }),
}));

export const permitRelations = relations(permits, ({ one }) => ({
  property: one(properties, { fields: [permits.propertyId], references: [properties.id] }),
}));

export const riskRelations = relations(risks, ({ one }) => ({
  property: one(properties, { fields: [risks.propertyId], references: [properties.id] }),
  owner: one(users, { fields: [risks.owner], references: [users.id] }),
}));

export const documentRelations = relations(documents, ({ one, many }) => ({
  property: one(properties, { fields: [documents.propertyId], references: [properties.id] }),
  milestone: one(milestones, { fields: [documents.milestoneId], references: [milestones.id] }),
  uploadedBy: one(users, { fields: [documents.uploadedBy], references: [users.id] }),
  lastModifiedBy: one(users, { fields: [documents.lastModifiedBy], references: [users.id] }),
  reviewedBy: one(users, { fields: [documents.reviewedBy], references: [users.id] }),
  approvedBy: one(users, { fields: [documents.approvedBy], references: [users.id] }),
  parentDocument: one(documents, { fields: [documents.parentDocumentId], references: [documents.id] }),
  childDocuments: many(documents),
  comments: many(documentComments),
  shares: many(documentShares),
}));

export const documentCommentRelations = relations(documentComments, ({ one, many }) => ({
  document: one(documents, { fields: [documentComments.documentId], references: [documents.id] }),
  user: one(users, { fields: [documentComments.userId], references: [users.id] }),
  parentComment: one(documentComments, { fields: [documentComments.parentCommentId], references: [documentComments.id] }),
  childComments: many(documentComments),
}));

export const documentShareRelations = relations(documentShares, ({ one }) => ({
  document: one(documents, { fields: [documentShares.documentId], references: [documents.id] }),
  sharedBy: one(users, { fields: [documentShares.sharedBy], references: [users.id] }),
  sharedWith: one(users, { fields: [documentShares.sharedWith], references: [users.id] }),
}));

export const activityRelations = relations(activities, ({ one }) => ({
  property: one(properties, { fields: [activities.propertyId], references: [properties.id] }),
  user: one(users, { fields: [activities.userId], references: [users.id] }),
}));

export const auditLogRelations = relations(auditLogs, ({ one }) => ({
  user: one(users, { fields: [auditLogs.userId], references: [users.id] }),
}));

export const discussionRelations = relations(discussions, ({ one, many }) => ({
  property: one(properties, { fields: [discussions.propertyId], references: [properties.id] }),
  author: one(users, { fields: [discussions.authorId], references: [users.id] }),
  comments: many(discussionComments),
  reactions: many(discussionReactions),
}));

export const discussionCommentRelations = relations(discussionComments, ({ one, many }) => ({
  discussion: one(discussions, { fields: [discussionComments.discussionId], references: [discussions.id] }),
  user: one(users, { fields: [discussionComments.userId], references: [users.id] }),
  parent: one(discussionComments, { fields: [discussionComments.parentCommentId], references: [discussionComments.id] }),
  children: many(discussionComments),
}));

export const discussionReactionRelations = relations(discussionReactions, ({ one }) => ({
  discussion: one(discussions, { fields: [discussionReactions.discussionId], references: [discussions.id] }),
  user: one(users, { fields: [discussionReactions.userId], references: [users.id] }),
}));

// Zod schemas
export const upsertUserSchema = createInsertSchema(users).pick({
  id: true,
  email: true,
  firstName: true,
  lastName: true,
  profileImageUrl: true,
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const permitLookupSchema = z.object({
  projectAddress: z.string().min(1, "Project address is required"),
  scopeOfWork: z.string().min(1, "Scope of work is required"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertMilestoneSchema = createInsertSchema(milestones).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVendorSchema = createInsertSchema(vendors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBudgetLineSchema = createInsertSchema(budgetLines).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRFQSchema = createInsertSchema(rfqs).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertBidSchema = createInsertSchema(bids).omit({
  id: true,
  submittedAt: true,
  awardedAt: true,
});

export const insertPermitSchema = createInsertSchema(permits).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertRiskSchema = createInsertSchema(risks).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  resolvedAt: true,
});

export const insertDocumentSchema = createInsertSchema(documents).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDocumentCommentSchema = createInsertSchema(documentComments).omit({
  id: true,
  createdAt: true,
});

export const insertDocumentShareSchema = createInsertSchema(documentShares).omit({
  id: true,
  createdAt: true,
});

export const insertActivitySchema = createInsertSchema(activities).omit({
  id: true,
  createdAt: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).omit({
  id: true,
  createdAt: true,
});

export const insertDiscussionSchema = createInsertSchema(discussions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDiscussionCommentSchema = createInsertSchema(discussionComments).omit({
  id: true,
  createdAt: true,
});

export const insertDiscussionReactionSchema = createInsertSchema(discussionReactions).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = z.infer<typeof upsertUserSchema>;
export type User = typeof users.$inferSelect;
export type Property = typeof properties.$inferSelect;
export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Milestone = typeof milestones.$inferSelect;
export type InsertMilestone = z.infer<typeof insertMilestoneSchema>;
export type Vendor = typeof vendors.$inferSelect;
export type InsertVendor = z.infer<typeof insertVendorSchema>;
export type BudgetLine = typeof budgetLines.$inferSelect;
export type InsertBudgetLine = z.infer<typeof insertBudgetLineSchema>;
export type RFQ = typeof rfqs.$inferSelect;
export type InsertRFQ = z.infer<typeof insertRFQSchema>;
export type Bid = typeof bids.$inferSelect;
export type InsertBid = z.infer<typeof insertBidSchema>;
export type Permit = typeof permits.$inferSelect;
export type InsertPermit = z.infer<typeof insertPermitSchema>;
export type Risk = typeof risks.$inferSelect;
export type InsertRisk = z.infer<typeof insertRiskSchema>;
export type Document = typeof documents.$inferSelect;
export type InsertDocument = z.infer<typeof insertDocumentSchema>;
export type DocumentComment = typeof documentComments.$inferSelect;
export type InsertDocumentComment = z.infer<typeof insertDocumentCommentSchema>;
export type DocumentShare = typeof documentShares.$inferSelect;
export type InsertDocumentShare = z.infer<typeof insertDocumentShareSchema>;
export type Activity = typeof activities.$inferSelect;
export type InsertActivity = z.infer<typeof insertActivitySchema>;
export type AuditLog = typeof auditLogs.$inferSelect;
export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type LoginRequest = z.infer<typeof loginSchema>;

export type Discussion = typeof discussions.$inferSelect;
export type InsertDiscussion = z.infer<typeof insertDiscussionSchema>;
export type DiscussionComment = typeof discussionComments.$inferSelect;
export type InsertDiscussionComment = z.infer<typeof insertDiscussionCommentSchema>;
export type DiscussionReaction = typeof discussionReactions.$inferSelect;
export type InsertDiscussionReaction = z.infer<typeof insertDiscussionReactionSchema>;
