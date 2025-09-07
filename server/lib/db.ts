import { drizzle } from 'drizzle-orm/node-postgres';
import { 
  pgTable, 
  varchar, 
  text, 
  timestamp, 
  integer,
  real
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';
import { Pool } from 'pg';

// Import existing tables
import { documents } from './documents';
import { users } from './users';

// Create the connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create tables
export const annotations = pgTable('annotations', {
  id: varchar('id').primaryKey(),
  documentId: varchar('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type', { length: 50 }).notNull(),
  content: text('content').notNull(),
  positionX: real('position_x').notNull(),
  positionY: real('position_y').notNull(),
  pageNumber: integer('page_number').notNull(),
  stampType: varchar('stamp_type'),
  color: varchar('color', { length: 50 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const signatures = pgTable('signatures', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  preview: varchar('preview').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const stamps = pgTable('stamps', {
  id: varchar('id').primaryKey(),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  type: varchar('type').notNull(),
  preview: varchar('preview').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const signingSession = pgTable('signing_sessions', {
  id: varchar('id').primaryKey(),
  documentId: varchar('document_id').notNull().references(() => documents.id, { onDelete: 'cascade' }),
  userId: varchar('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

// Initialize drizzle with the connection pool
export const db = drizzle(pool);
