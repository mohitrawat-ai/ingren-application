// Email service options
export const emailServices = [
    { value: "sendgrid", label: "SendGrid" },
    { value: "mailchimp", label: "Mailchimp" },
    { value: "ses", label: "Amazon SES" },
    { value: "smtp", label: "Custom SMTP" },
];

export const emailServicesMap = new Map(emailServices.map(t => [t.value, t]));


// Timezone options
export const timezones = [
    { value: "UTC", label: "UTC" },
    { value: "America/New_York", label: "Eastern Time (ET)" },
    { value: "America/Chicago", label: "Central Time (CT)" },
    { value: "America/Denver", label: "Mountain Time (MT)" },
    { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
    { value: "Europe/London", label: "London (GMT)" },
    { value: "Europe/Paris", label: "Central European Time (CET)" },
    { value: "Asia/Singapore", label: "Singapore Time (SGT)" },
    { value: "Asia/Tokyo", label: "Japan Standard Time (JST)" },
    { value: "Australia/Sydney", label: "Australian Eastern Time (AET)" },
    { value: "Asia/Kolkata", label: "India Standard Time (IST)" },
];

// Tone options
export const toneOptions = [
    { value: "professional", label: "Professional", description: "Formal and business-appropriate" },
    { value: "friendly", label: "Friendly", description: "Warm and approachable" },
    { value: "casual", label: "Casual", description: "Relaxed and conversational" },
    { value: "formal", label: "Formal", description: "Traditional and respectful" },
];

export const toneOptionsMap = new Map(toneOptions.map(t => [t.value, t]));

// CTA options
export const ctaOptions = [
    { value: "schedule_call", label: "Schedule a Call", description: "Book a meeting or call" },
    { value: "request_demo", label: "Request a Demo", description: "Ask for a product demonstration" },
    { value: "learn_more", label: "Learn More", description: "Get additional information" },
    { value: "get_started", label: "Get Started", description: "Begin using the service" },
    { value: "contact_us", label: "Contact Us", description: "General contact request" },
    { value: "download_resource", label: "Download Resource", description: "Download whitepaper or guide" },
];

export const ctaOptionsMap = new Map(ctaOptions.map(t => [t.value, t]));

// Day labels for the form
export const days = [
    { value: "campaignSettings.sendingDays.monday", label: "Monday" },
    { value: "campaignSettings.sendingDays.tuesday", label: "Tuesday" },
    { value: "campaignSettings.sendingDays.wednesday", label: "Wednesday" },
    { value: "campaignSettings.sendingDays.thursday", label: "Thursday" },
    { value: "campaignSettings.sendingDays.friday", label: "Friday" },
    { value: "campaignSettings.sendingDays.saturday", label: "Saturday" },
    { value: "campaignSettings.sendingDays.sunday", label: "Sunday" },
];

export const defaultSettings = {
    name: "",
    description: "",
    emailSettings: {
        fromName: "",
        fromEmail: "",
        emailService: "",
    },
    campaignSettings: {
        timezone: "America/Los_Angeles",
        dailySendLimit: 20,
        tone: "professional",
        cta: "schedule_call",
        sendingDays: {
            monday: true,
            tuesday: true,
            wednesday: true,
            thursday: true,
            friday: true,
            saturday: false,
            sunday: false,
        },
        sendingTime: {
            startTime: "09:00",
            endTime: "17:00",
        },
    },
};