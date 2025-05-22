import { pgTable, text, integer, serial, timestamp, json } from "drizzle-orm/pg-core";

import { targetLists } from "@/lib/tables/target-lists";


// NEW: Company Lists
export const targetListCompanies = pgTable('target_list_companies', {
  id: serial('id').primaryKey(),
  targetListId: integer('target_list_id').notNull().references(() => targetLists.id, { onDelete: 'cascade' }),
  apolloCompanyId: text('apollo_company_id').notNull(),
  companyName: text('company_name').notNull(),
  industry: text('industry'),
  employeeCount: text('employee_count'),
  domain: text('domain'),
  location: text('location'),
  description: text('description'),
  additionalData: json('additional_data').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastSynced: timestamp('last_synced'),
});