// src/lib/schema/resources/tables.ts
import { pgTable, text, integer, serial, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { users, tenants } from "@/lib/schema/auth/tables";

export const resources = pgTable('resources', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'set null' }),
  tenantId: text('tenant_id').notNull().references(() => tenants.id, { onDelete: 'cascade' }),
  
  // Resource details
  type: text('type').notNull(), // 'company', 'blog', 'product', 'pitch-deck', 'marketing'
  title: text('title').notNull(),
  url: text('url').notNull(),
  description: text('description'),
  tags: json('tags').$type<string[]>().default([]),
  
  // File upload details
  isUploaded: boolean('is_uploaded').notNull().default(false),
  fileType: text('file_type'), // MIME type for uploaded files
  fileName: text('file_name'), // Original filename
  fileSize: integer('file_size'), // File size in bytes
  
  // Metadata
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

// Type exports
export type Resource = typeof resources.$inferSelect;
export type NewResource = typeof resources.$inferInsert;