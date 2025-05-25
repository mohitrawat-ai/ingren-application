// src/lib/tables/profile-relations.ts
import { relations } from "drizzle-orm";
import { users } from "@/lib/schema";
import { targetLists } from "@/lib/tables/target-lists";
import { 
  profileListContacts, 
  profileSearchCache, 
  profileEnrichmentQueue, 
  profileActivityLog 
} from "@/lib/tables/profile";

// Profile List Contacts Relations
export const profileListContactRelations = relations(profileListContacts, ({ one }) => ({
  targetList: one(targetLists, {
    fields: [profileListContacts.targetListId],
    references: [targetLists.id],
  }),
}));

// Profile Search Cache Relations
export const profileSearchCacheRelations = relations(profileSearchCache, ({ one }) => ({
  user: one(users, {
    fields: [profileSearchCache.userId],
    references: [users.id],
  }),
}));

// Profile Enrichment Queue Relations
export const profileEnrichmentQueueRelations = relations(profileEnrichmentQueue, ({ one }) => ({
  user: one(users, {
    fields: [profileEnrichmentQueue.userId],
    references: [users.id],
  }),
}));

// Profile Activity Log Relations
export const profileActivityLogRelations = relations(profileActivityLog, ({ one }) => ({
  user: one(users, {
    fields: [profileActivityLog.userId],
    references: [users.id],
  }),
}));

// Extended Target Lists Relations for Profiles
export const targetListProfileRelations = relations(targetLists, ({ many }) => ({
  profileContacts: many(profileListContacts),
}));