import { pgTable, text, integer, serial, timestamp, boolean, json, AnyPgColumn } from "drizzle-orm/pg-core";

import { users } from "@/lib/schema";

// NEW: Universal Target Lists Table
export const targetLists = pgTable('target_lists', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'company' or 'prospect'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  lastSynced: timestamp('last_synced'),
  usedInCampaigns: boolean('used_in_campaigns').notNull().default(false),
  campaignCount: integer('campaign_count').notNull().default(0),
  sourceListId: integer('source_list_id').references(() : AnyPgColumn => targetLists.id), // For derived lists
  visibility: text('visibility').notNull().default('private'), // 'private', 'team', 'organization'
  createdBy: text('created_by').references(() => users.id),
  sharedWith: json('shared_with').$type<string[]>().default([]), // Array of user IDs
});