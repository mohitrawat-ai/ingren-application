export type SettingsFormDataOld = {
  emailSettings: {
    fromName: string;
    fromEmail: string;
    emailService: string;
  };
  campaignSettings: {
    name: string;
    timezone: string;
    trackOpens: boolean;
    trackClicks: boolean;
    dailySendLimit: number;
    unsubscribeLink: boolean;
    sendingTime: {
      startTime: string;
      endTime: string;
    };
    sendingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
  };
}