// src/components/campaign/settings/CampaignSettingsDisplay.tsx
"use client";

import { format } from "date-fns";
import { toZonedTime } from 'date-fns-tz';
import { 
  Mail, 
  Clock, 
  Eye, 
  MousePointer, 
  Unlink, 
  Calendar,
  Settings,
  Shield,
  Send
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

// Types based on your schema
interface CampaignSettings {
  id: number;
  campaignId?: number;
  fromName: string;
  fromEmail: string;
  emailService: string;
  timezone: string;
  trackOpens: boolean;
  trackClicks: boolean;
  dailySendLimit: number;
  unsubscribeLink: boolean;
  sendingStartTime: string; // HH:MM:SS format in UTC
  sendingEndTime: string;   // HH:MM:SS format in UTC
  startDate: Date;
}

interface CampaignSendingDays {
  id?: number;
  campaignId?: number;
  monday: boolean;
  tuesday: boolean;
  wednesday: boolean;
  thursday: boolean;
  friday: boolean;
  saturday: boolean;
  sunday: boolean;
}

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
    const serviceMap: Record<string, string> = {
      'sendgrid': 'SendGrid',
      'mailchimp': 'Mailchimp', 
      'ses': 'Amazon SES',
      'smtp': 'Custom SMTP'
    };
    return serviceMap[service] || service;
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

      {/* Tracking & Features */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Tracking & Features
          </CardTitle>
          <CardDescription>
            Email tracking and additional features configuration
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Eye className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Track Opens</p>
                    <p className="text-xs text-muted-foreground">Monitor email open rates</p>
                  </div>
                </div>
                <Badge variant={settings.trackOpens ? "default" : "secondary"}>
                  {settings.trackOpens ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <MousePointer className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Track Clicks</p>
                    <p className="text-xs text-muted-foreground">Monitor link click rates</p>
                  </div>
                </div>
                <Badge variant={settings.trackClicks ? "default" : "secondary"}>
                  {settings.trackClicks ? "Enabled" : "Disabled"}
                </Badge>
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Unlink className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Unsubscribe Link</p>
                    <p className="text-xs text-muted-foreground">Include unsubscribe option</p>
                  </div>
                </div>
                <Badge variant={settings.unsubscribeLink ? "default" : "secondary"}>
                  {settings.unsubscribeLink ? "Enabled" : "Disabled"}
                </Badge>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Shield className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Compliance</p>
                    <p className="text-xs text-muted-foreground">Email compliance status</p>
                  </div>
                </div>
                <Badge variant="default">
                  Configured
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}