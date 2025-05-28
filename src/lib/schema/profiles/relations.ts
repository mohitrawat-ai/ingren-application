import { relations } from "drizzle-orm";
import { users } from "@/lib/schema/auth/tables";
import { targetLists, targetListProfiles } from "@/lib/schema/profiles/tables";
import { campaignEnrollments } from "@/lib/schema/enrollments/tables";

export const targetListRelations = relations(targetLists, ({ one, many }) => ({
  user: one(users, {
    fields: [targetLists.userId],
    references: [users.id],
  }),
  createdByUser: one(users, {
    fields: [targetLists.createdBy],
    references: [users.id],
  }),
  profiles: many(targetListProfiles),
  enrollments: many(campaignEnrollments, {
    relationName: "targetListEnrollments"
  }),
}));

export const targetListProfileRelations = relations(targetListProfiles, ({ one }) => ({
  targetList: one(targetLists, {
    fields: [targetListProfiles.targetListId],
    references: [targetLists.id],
  }),
}));