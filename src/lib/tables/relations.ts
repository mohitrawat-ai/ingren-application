import { relations } from "drizzle-orm";

import { targetLists } from "@/lib/tables/target-lists";
import { targetListProfiles } from "@/lib/tables/target-list-profiles";
import { campaignEnrollments } from "@/lib/tables/campaign-enrollments";
import { campaignEnrollmentProfiles } from "@/lib/tables/campaign-enrollment-profiles";
import { campaignProfileOperations } from "@/lib/tables/campaign-profile-operations";
import { users, campaigns } from "@/lib/schema";
// NEW RELATIONS
export const targetListRelations = relations(targetLists, ({ one, many }) => ({
  user: one(users, {
    fields: [targetLists.userId],
    references: [users.id],
  }),
  profiles: many(targetListProfiles),
  enrollments: many(campaignEnrollments),
  sourceList: one(targetLists, {
    fields: [targetLists.sourceListId],
    references: [targetLists.id],
  }),
  derivedLists: many(targetLists),
}));

export const targetListContactRelations = relations(targetListProfiles, ({ one }) => ({
  targetList: one(targetLists, {
    fields: [targetListProfiles.targetListId],
    references: [targetLists.id],
  }),
}));

export const campaignEnrollmentRelations = relations(campaignEnrollments, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [campaignEnrollments.campaignId],
    references: [campaigns.id],
  }),
  sourceTargetList: one(targetLists, {
    fields: [campaignEnrollments.sourceTargetListId],
    references: [targetLists.id],
  }),
  enrolledProfiles: many(campaignEnrollmentProfiles),
}));

// Campaign Enrollment Profiles Relations
export const campaignEnrollmentProfileRelations = relations(campaignEnrollmentProfiles, ({ one }) => ({
  enrollment: one(campaignEnrollments, {
    fields: [campaignEnrollmentProfiles.campaignEnrollmentId],
    references: [campaignEnrollments.id],
  }),
  operations: one(campaignProfileOperations, {
    fields: [campaignEnrollmentProfiles.id],
    references: [campaignProfileOperations.enrollmentProfileId],
  }),
}));

// Campaign Profile Operations Relations
export const campaignProfileOperationsRelations = relations(campaignProfileOperations, ({ one }) => ({
  enrollmentProfile: one(campaignEnrollmentProfiles, {
    fields: [campaignProfileOperations.enrollmentProfileId],
    references: [campaignEnrollmentProfiles.id],
  }),
}));