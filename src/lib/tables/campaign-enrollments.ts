import { pgTable, text, integer, serial, timestamp, json } from "drizzle-orm/pg-core";

import { campaigns } from "@/lib/schema";
import { targetLists } from "./target-lists";


export const campaignEnrollments = pgTable('campaign_enrollments', {
  id: serial('id').primaryKey(),
  campaignId: integer('campaign_id').references(() => campaigns.id, { onDelete: 'cascade' }).notNull(),
  sourceTargetListId: integer('source_target_list_id').references(() => targetLists.id).notNull(),
  enrollmentDate: timestamp('enrollment_date').notNull().defaultNow(),
  status: text('status').notNull().default('active'), // 'active', 'paused', 'completed'
  snapshotData: json('snapshot_data').$type<Record<string, unknown>>().default({}),
});
