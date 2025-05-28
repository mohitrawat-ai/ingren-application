// src/components/campaign/settings/CampaignSettingsDisplay.tsx
"use client";

import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import * as campaignConfig from "@/lib/config/campaign";
import { 
  Mail, 
  Clock, 
  Calendar,
  Settings,
  Send,
  Volume2,
  Target
} from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CampaignSettings, CampaignSendingDays } from "@/lib/schema/types";


interface CampaignSettingsDisplayProps {
  settings: CampaignSettings;
  sendingDays?: CampaignSendingDays | null;
}

export function CampaignSettingsDisplay({ 
  settings, 
  sendingDays 
}: CampaignSettingsDisplayProps) {
  
  // Convert UTC time strings back to local time for display
  const formatTimeForDisplay = (utcTimeString: string, timezone: string) => {
    try {
      // Parse the UTC time string (HH:MM:SS format)
      const [hours, minutes] = utcTimeString.split(':').map(Number);
      
      // Create a date object with today's date and the UTC time
      const utcDate = new Date();
      utcDate.setUTCHours(hours, minutes, 0, 0);
      
      // Convert to the campaign's timezone
      const localDate = toZonedTime(utcDate, timezone);
      
      // Format for display
      return format(localDate, 'h:mm a');
    } catch (error) {
      console.error('Error formatting time:', error);
      return utcTimeString; // Fallback to raw string
    }
  };

  // Get email service display name
  const getEmailServiceName = (service: string) => {
    return campaignConfig.emailServicesMap.get(service)?.value || service;
  };

  // Get tone display name
  const getToneDisplayName = (tone: string) => {
    return campaignConfig.toneOptionsMap.get(tone)?.value || tone;
  };

  // Get CTA display name
  const getCtaDisplayName = (cta: string) => {
    return campaignConfig.ctaOptionsMap.get(cta)?.value || cta;
  };

  // Get enabled sending days
  const getEnabledDays = () => {
    if (!sendingDays) return [];
    
    const dayMap = {
      monday: 'Mon',
      tuesday: 'Tue', 
      wednesday: 'Wed',
      thursday: 'Thu',
      friday: 'Fri',
      saturday: 'Sat',
      sunday: 'Sun'
    };
    
    return Object.entries(dayMap)
      .filter(([key]) => sendingDays[key as keyof typeof sendingDays])
      .map(([, label]) => label);
  };

  const enabledDays = getEnabledDays();

  return (
    <div className="space-y-6">
      {/* Email Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Email Configuration
          </CardTitle>
          <CardDescription>
            Sender information and email service settings
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">From Name</label>
              <p className="text-sm mt-1">{settings.fromName}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">From Email</label>
              <p className="text-sm mt-1">{settings.fromEmail}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Email Service</label>
              <p className="text-sm mt-1">{getEmailServiceName(settings.emailService)}</p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Timezone</label>
              <p className="text-sm mt-1">{settings.timezone}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Personalization */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Email Personalization
          </CardTitle>
          <CardDescription>
            Email tone and call-to-action configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email Tone</p>
                  <p className="text-xs text-muted-foreground">Communication style</p>
                </div>
              </div>
              <Badge variant="outline">
                {getToneDisplayName(settings.tone)}
              </Badge>
            </div>

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="flex items-center gap-3">
                <Target className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Call-to-Action</p>
                  <p className="text-xs text-muted-foreground">Primary action goal</p>
                </div>
              </div>
              <Badge variant="outline">
                {getCtaDisplayName(settings.cta)}
              </Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sending Schedule */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Sending Schedule
          </CardTitle>
          <CardDescription>
            When emails will be sent to recipients
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-muted-foreground">Daily Send Limit</label>
              <p className="text-sm mt-1 flex items-center gap-2">
                <Send className="h-4 w-4" />
                {settings.dailySendLimit.toLocaleString()} emails per day
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-muted-foreground">Campaign Start Date</label>
              <p className="text-sm mt-1 flex items-center gap-2">
                <Clock className="h-4 w-4" />
                {format(new Date(settings.startDate), 'PPP')}
              </p>
            </div>
          </div>

          <Separator />

          <div>
            <label className="text-sm font-medium text-muted-foreground">Sending Days</label>
            <div className="flex flex-wrap gap-2 mt-2">
              {enabledDays.length > 0 ? (
                enabledDays.map(day => (
                  <Badge key={day} variant="secondary">
                    {day}
                  </Badge>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No sending days configured</p>
              )}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground">Sending Hours</label>
            <p className="text-sm mt-1 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              {formatTimeForDisplay(settings.sendingStartTime, settings.timezone)} - {formatTimeForDisplay(settings.sendingEndTime, settings.timezone)}
              <span className="text-xs text-muted-foreground">({settings.timezone})</span>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}