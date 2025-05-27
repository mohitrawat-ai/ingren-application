import { relations } from "drizzle-orm";

import { targetLists } from "@/lib/tables/target-lists";
import { targetListCompanies } from "@/lib/tables/company-lists";
import { targetListContacts } from "@/lib/tables/target-list-contacts";
import { campaignEnrollments } from "@/lib/tables/campaign-enrollments";
import { campaignEnrolledContacts } from "@/lib/tables/campaign-enrolled-contacts";
import { campaignEnrollmentProfiles } from "@/lib/tables/campaign-enrollment-profiles";
import { users, campaigns } from "@/lib/schema";
// NEW RELATIONS
export const targetListRelations = relations(targetLists, ({ one, many }) => ({
  user: one(users, {
    fields: [targetLists.userId],
    references: [users.id],
  }),
  companies: many(targetListCompanies),
  contacts: many(targetListContacts),
  enrollments: many(campaignEnrollments),
  sourceList: one(targetLists, {
    fields: [targetLists.sourceListId],
    references: [targetLists.id],
  }),
  derivedLists: many(targetLists),
}));

export const targetListCompanyRelations = relations(targetListCompanies, ({ one }) => ({
  targetList: one(targetLists, {
    fields: [targetListCompanies.targetListId],
    references: [targetLists.id],
  }),
}));

export const targetListContactRelations = relations(targetListContacts, ({ one }) => ({
  targetList: one(targetLists, {
    fields: [targetListContacts.targetListId],
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
  enrolledContacts: many(campaignEnrolledContacts),
  enrolledProfiles: many(campaignEnrollmentProfiles),
}));

export const campaignEnrolledContactRelations = relations(campaignEnrolledContacts, ({ one }) => ({
  enrollment: one(campaignEnrollments, {
    fields: [campaignEnrolledContacts.campaignEnrollmentId],
    references: [campaignEnrollments.id],
  }),
}));

// NEW: Campaign Enrollment Profiles Relations
export const campaignEnrollmentProfileRelations = relations(campaignEnrollmentProfiles, ({ one }) => ({
  enrollment: one(campaignEnrollments, {
    fields: [campaignEnrollmentProfiles.campaignEnrollmentId],
    references: [campaignEnrollments.id],
  }),
}));