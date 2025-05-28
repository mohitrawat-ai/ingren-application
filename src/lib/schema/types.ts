import type {
  // Auth types
  tenants,
  users,
  
  // Campaign types
  campaigns,
  campaignSettings,
  campaignSendingDays,
  
  // Profile types
  targetLists,
  targetListProfiles,
  
  // Enrollment types
  campaignEnrollments,
  campaignEnrollmentProfiles,
  campaignProfileOperations,
} from "./index";

// Auth types
export type Tenant = typeof tenants.$inferSelect;
export type User = typeof users.$inferSelect;

// Campaign types
export type Campaign = typeof campaigns.$inferSelect;
export type CampaignSettings = typeof campaignSettings.$inferSelect;
export type CampaignSendingDays = typeof campaignSendingDays.$inferSelect;

// Profile types
export type TargetList = typeof targetLists.$inferSelect;
export type TargetListProfile = typeof targetListProfiles.$inferSelect;

// Enrollment types
export type CampaignEnrollment = typeof campaignEnrollments.$inferSelect;
export type CampaignEnrollmentProfile = typeof campaignEnrollmentProfiles.$inferSelect;
export type CampaignProfileOperation = typeof campaignProfileOperations.$inferSelect;

// Insert types
export type NewCampaign = typeof campaigns.$inferInsert;
export type NewTargetList = typeof targetLists.$inferInsert;
export type NewTargetListProfile = typeof targetListProfiles.$inferInsert;