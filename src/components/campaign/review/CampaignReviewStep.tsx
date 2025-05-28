// src/components/campaign/review/CampaignReviewStep.tsx - Updated to show tone and CTA
"use client";

import { Users, Clock, Calendar, Settings, AlertCircle, List, Volume2, Target } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { Progress } from "@/components/ui/progress";
import { CampaignFormData } from "@/types";
import * as CampaignConfig from "@/lib/config/campaign";

interface CampaignReviewStepProps {
  formData: CampaignFormData & {
    settings: CampaignFormData['settings'];
  };
  onBack: () => void;
  onCreate: () => void;
  creating: boolean;
}

export function CampaignReviewStep({
  formData,
  onBack,
  onCreate,
  creating,
}: CampaignReviewStepProps) {
  
  const getTargetingMethodIcon = () => {
    switch (formData.targeting.method) {
      case 'profile_list':
        return <List className="h-5 w-5" />;
    }
  };

  const getTargetingMethodLabel = () => {
    switch (formData.targeting.method) {
      case 'profile_list':
        return 'Existing Profile List'; 
    }
  };

  const getTargetingDescription = () => {
    switch (formData.targeting.method) {
      case 'profile_list':
        return `Using profile list: ${formData.targeting.profileListName}`;
    }
  };

  // Helper functions for display names
  const getToneDisplayName = (tone: string) => {
    return CampaignConfig.toneOptionsMap.get(tone)?.value || tone;
  };

  const getCtaDisplayName = (cta: string) => {
   return CampaignConfig.ctaOptionsMap.get(cta)?.value || cta;
  };

  const getActiveSendingDays = (): string => {
    return Object.entries(formData.sendingDays)
      .filter(([, active]: [string, boolean]) => active)
      .map(([day]: [string, boolean]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
      .join(', ');
  };

  const estimatedSendDuration = () => {
    const totalProfiles = formData.targeting.totalProfiles || 0;
    const dailyLimit = formData.settings.dailySendLimit;
    const activeDays = Object.values(formData.sendingDays).filter(Boolean).length;

    if (totalProfiles === 0 || dailyLimit === 0 || activeDays === 0) {
      return 'Unable to calculate';
    }

    const daysNeeded = Math.ceil(totalProfiles / dailyLimit);
    const calendarDaysNeeded = Math.ceil(daysNeeded / activeDays * 7);
    
    if (calendarDaysNeeded === 1) {
      return '1 day';
    } else if (calendarDaysNeeded < 7) {
      return `${calendarDaysNeeded} days`;
    } else {
      const weeks = Math.ceil(calendarDaysNeeded / 7);
      return `~${weeks} week${weeks > 1 ? 's' : ''}`;
    }
  };

  const getEstimatedCompletion = () => {
    const totalProfiles = formData.targeting.totalProfiles || 0;
    const dailyLimit = formData.settings.dailySendLimit;
    const activeDays = Object.values(formData.sendingDays).filter(Boolean).length;

    if (totalProfiles === 0 || dailyLimit === 0 || activeDays === 0) {
      return null;
    }

    const daysNeeded = Math.ceil(totalProfiles / dailyLimit);
    const calendarDaysNeeded = Math.ceil(daysNeeded / activeDays * 7);
    
    const startDate = formData.settings.startDate || new Date();
    const completionDate = new Date(startDate);
    completionDate.setDate(completionDate.getDate() + calendarDaysNeeded);
    
    return completionDate;
  };

  const hasValidationErrors = () => {
    const errors = [];
    
    if (!formData.name.trim()) {
      errors.push("Campaign name is required");
    }
    
    if (!formData.settings.fromName.trim()) {
      errors.push("From name is required");
    }
    
    if (!formData.settings.fromEmail.trim()) {
      errors.push("From email is required");
    }
    
    if (!formData.targeting.totalProfiles || formData.targeting.totalProfiles === 0) {
      errors.push("At least one profile must be selected");
    }
    
    const activeDays = Object.values(formData.sendingDays).filter(Boolean).length;
    if (activeDays === 0) {
      errors.push("At least one sending day must be selected");
    }
    
    return errors;
  };

  const validationErrors = hasValidationErrors();
  const canCreate = validationErrors.length === 0 && !creating;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Review Campaign</h2>
        <p className="text-muted-foreground">
          Review your campaign settings before creating. Once created, profile data will be locked in for this campaign.
        </p>
      </div>

      {/* Validation Errors */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            <strong>Please fix the following issues:</strong>
            <ul className="list-disc list-inside mt-2">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {/* Campaign Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Campaign Overview
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">CAMPAIGN NAME</h4>
              <p className="font-medium text-lg">{formData.name || 'Untitled Campaign'}</p>
              {formData.description && (
                <p className="text-sm text-muted-foreground mt-1">
                  {formData.description}
                </p>
              )}
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">SENDER INFORMATION</h4>
              <p className="font-medium">{formData.settings.fromName || 'No name set'}</p>
              <p className="text-sm text-muted-foreground">{formData.settings.fromEmail || 'No email set'}</p>
            </div>
          </div>

          <Separator />

          {/* Email Personalization Section */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">EMAIL TONE</h4>
              <div className="flex items-center gap-2">
                <Volume2 className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{getToneDisplayName(formData.settings.tone)}</Badge>
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">CALL-TO-ACTION</h4>
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-muted-foreground" />
                <Badge variant="outline">{getCtaDisplayName(formData.settings.cta)}</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Target Audience */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Target Audience
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {getTargetingMethodIcon()}
              <div>
                <p className="font-medium">{getTargetingMethodLabel()}</p>
                <p className="text-sm text-muted-foreground">{getTargetingDescription()}</p>
              </div>
            </div>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {formData.targeting.totalProfiles || 0} profiles
            </Badge>
          </div>

          {formData.targeting.profiles && formData.targeting.profiles.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">SAMPLE PROFILES</h4>
              <div className="space-y-2">
                {formData.targeting.profiles.slice(0, 3).map((profile, index) => (
                  <div
                    key={profile.id || index}
                    className="flex items-center justify-between p-3 bg-muted rounded-md text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {profile.firstName?.[0]}{profile.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {profile.firstName} {profile.lastName}
                        </span>
                        <div className="text-muted-foreground">
                          {profile.jobTitle} at {profile.company?.name}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {profile.email}
                    </span>
                  </div>
                ))}
                {formData.targeting.profiles.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded">
                    ... and {formData.targeting.profiles.length - 3} more profiles
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Schedule & Sending */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Sending Schedule
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">SENDING TIME</h4>
              <p className="font-medium">
                {formData.settings.sendingStartTime} - {formData.settings.sendingEndTime}
              </p>
              <p className="text-sm text-muted-foreground">
                Timezone: {formData.settings.timezone}
              </p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">SENDING DAYS</h4>
              <p className="font-medium">{getActiveSendingDays()}</p>
              <p className="text-sm text-muted-foreground">
                {Object.values(formData.sendingDays).filter(Boolean).length} days/week
              </p>
            </div>
          </div>
          
          <Separator />
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">DAILY LIMIT</h4>
              <p className="font-medium">{formData.settings.dailySendLimit} emails/day</p>
            </div>
            
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">ESTIMATED DURATION</h4>
              <p className="font-medium">{estimatedSendDuration()}</p>
            </div>

            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-2">ESTIMATED COMPLETION</h4>
              <p className="font-medium">
                {getEstimatedCompletion() 
                  ? getEstimatedCompletion()!.toLocaleDateString()
                  : 'Unable to calculate'
                }
              </p>
            </div>
          </div>

          {formData.settings.startDate && (
            <>
              <Separator />
              <div>
                <h4 className="font-medium text-sm text-muted-foreground mb-2">START DATE</h4>
                <p className="font-medium">
                  {formData.settings.startDate.toLocaleDateString()} at{' '}
                  {formData.settings.sendingStartTime}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Important Notes */}
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          <strong>Important:</strong> Once created, the campaign will use a snapshot of your profile data. 
          Future changes to the source list won&apos;t affect this campaign. The campaign will be created 
          in draft mode - you can review and start it from the campaign details page.
          {formData.targeting.method !== 'profile_list' && (
            <> A new profile list will be automatically created for this campaign.</>
          )}
        </AlertDescription>
      </Alert>

      {/* Campaign Summary Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Campaign Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {formData.targeting.totalProfiles || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Profiles</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {formData.settings.dailySendLimit}
              </p>
              <p className="text-sm text-muted-foreground">Daily Limit</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {Object.values(formData.sendingDays).filter(Boolean).length}
              </p>
              <p className="text-sm text-muted-foreground">Sending Days</p>
            </div>
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-2xl font-bold text-primary">
                {estimatedSendDuration()}
              </p>
              <p className="text-sm text-muted-foreground">Duration</p>
            </div>
          </div>
          
          {/* Progress Preview */}
          {formData.targeting.totalProfiles && formData.targeting.totalProfiles > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Campaign will send emails progressively:</span>
                <span>
                  {Math.min(formData.settings.dailySendLimit, formData.targeting.totalProfiles)} on day 1
                </span>
              </div>
              <Progress 
                value={Math.min((formData.settings.dailySendLimit / formData.targeting.totalProfiles) * 100, 100)} 
                className="h-2"
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} disabled={creating}>
          Back to Settings
        </Button>
        <Button 
          onClick={onCreate} 
          disabled={!canCreate}
          size="lg"
          className="min-w-[200px]"
        >
          {creating ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating Campaign...
            </div>
          ) : (
            "Create Campaign"
          )}
        </Button>
      </div>
    </div>
  );
}