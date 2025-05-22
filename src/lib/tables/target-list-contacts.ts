import { pgTable, text, integer, serial, timestamp, json } from "drizzle-orm/pg-core";
import { targetLists } from "@/lib/tables/target-lists";


// NEW: Prospect Lists (for future use)
export const targetListContacts = pgTable('target_list_contacts', {
  id: serial('id').primaryKey(),
  targetListId: integer('target_list_id').notNull().references(() => targetLists.id, { onDelete: 'cascade' }),
  apolloProspectId: text('apollo_prospect_id').notNull(),
  name: text('name').notNull(),
  email: text('email'),
  title: text('title'),
  companyName: text('company_name'),
  firstName: text('first_name'),
  lastName: text('last_name'),
  department: text('department'),
  city: text('city'),
  state: text('state'),
  country: text('country'),
  additionalData: json('additional_data').$type<Record<string, unknown>>().default({}),
  createdAt: timestamp('created_at').notNull().defaultNow(),
  lastSynced: timestamp('last_synced'),
});
