import { CampaignSettingsType, SendingDayType } from "@/lib/schema";
import { Profile } from "@/types";

export type TargetingMethod = 'profile_list';

export type CampaignTargetingData = {
    method: TargetingMethod;
    profileListId?: number;
    profileListName?: string;
    profiles?: Array<Profile>;
    totalProfiles?: number;
}

export type SettingsFormData = {
  name: string;
  description?: string;
  emailSettings: {
    fromName: string;
    fromEmail: string;
    emailService: string;
  };
  campaignSettings: {
    timezone: string;
    trackOpens: boolean;
    trackClicks: boolean;
    dailySendLimit: number;
    unsubscribeLink: boolean;
    sendingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    sendingTime: {
      startTime: string;
      endTime: string;
    };
  };
}

export type CampaignFormData = {
    name: string,
    description?: string,
    // Targeting
    targeting: Omit<CampaignTargetingData, 'id' | 'campaignId'>

    // Campaign settings
    settings: Omit<CampaignSettingsType, 'id' | 'campaignId'>

    // Schedule
    sendingDays: Omit<SendingDayType, 'id' | 'campaignId'>


}