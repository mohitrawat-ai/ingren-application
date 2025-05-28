import { pgTable, text, integer, serial, timestamp, boolean, json } from "drizzle-orm/pg-core";
import { users } from "@/lib/schema/auth/tables";
import * as common from "@/lib/schema/common/columns";

export const targetLists = pgTable('target_lists', {
  id: serial('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  description: text('description'),
  type: text('type').notNull(), // 'profile' | 'company'
  createdAt: timestamp('created_at').notNull().defaultNow(),
  updatedAt: timestamp('updated_at').notNull().defaultNow(),
  usedInCampaigns: boolean('used_in_campaigns').notNull().default(false),
  campaignCount: integer('campaign_count').notNull().default(0),
  visibility: text('visibility').notNull().default('private'),
  createdBy: text('created_by').references(() => users.id),
  sharedWith: json('shared_with').$type<string[]>().default([]),
});

export const targetListProfiles = pgTable('target_list_profiles', {
  id: serial('id').primaryKey(),
  targetListId: integer('target_list_id').notNull().references(() => targetLists.id, { onDelete: 'cascade' }),
  lastSynced: timestamp('last_synced'),
  ...common.profileColumns
});