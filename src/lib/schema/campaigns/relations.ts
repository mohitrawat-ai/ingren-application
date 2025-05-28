import { relations } from "drizzle-orm";
import { users } from "@/lib/schema/auth/tables";
import { campaigns, campaignSettings, campaignSendingDays } from "@/lib/schema/campaigns/tables";
import { campaignEnrollments } from "@/lib/schema/enrollments/tables";

export const campaignRelations = relations(campaigns, ({ one, many }) => ({
  user: one(users, {
    fields: [campaigns.userId],
    references: [users.id],
  }),
  settings: one(campaignSettings, {
    fields: [campaigns.id],
    references: [campaignSettings.campaignId],
  }),
  sendingDays: one(campaignSendingDays, {
    fields: [campaigns.id],
    references: [campaignSendingDays.campaignId],
  }),
  enrollments: many(campaignEnrollments),
}));

export const campaignSettingsRelations = relations(campaignSettings, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignSettings.campaignId],
    references: [campaigns.id],
  }),
}));

export const campaignSendingDaysRelations = relations(campaignSendingDays, ({ one }) => ({
  campaign: one(campaigns, {
    fields: [campaignSendingDays.campaignId],
    references: [campaigns.id],
  }),
}));