import { relations } from "drizzle-orm";
import { campaigns } from "@/lib/schema/campaigns/tables";
import { targetLists } from "@/lib/schema/profiles/tables";
import { 
  campaignEnrollments, 
  campaignEnrollmentProfiles, 
  campaignProfileOperations 
} from "./tables";

export const campaignEnrollmentRelations = relations(campaignEnrollments, ({ one, many }) => ({
  campaign: one(campaigns, {
    fields: [campaignEnrollments.campaignId],
    references: [campaigns.id],
  }),
   sourceTargetList: one(targetLists, {
    fields: [campaignEnrollments.sourceTargetListId],
    references: [targetLists.id],
    relationName: "targetListEnrollments" // Match the relationName from targetLists
  }),
  
  enrolledProfiles: many(campaignEnrollmentProfiles),
}));

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

export const campaignProfileOperationsRelations = relations(campaignProfileOperations, ({ one }) => ({
  enrollmentProfile: one(campaignEnrollmentProfiles, {
    fields: [campaignProfileOperations.enrollmentProfileId],
    references: [campaignEnrollmentProfiles.id],
  }),
}));