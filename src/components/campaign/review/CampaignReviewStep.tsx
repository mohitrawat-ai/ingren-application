// src/components/campaign/review/CampaignReviewStep.tsx
"use client";

import { Users, Clock, Calendar, Settings, AlertCircle, Building, Upload, List } from "lucide-react";

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

interface CampaignReviewStepProps {
  formData: CampaignFormData
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
      case 'prospect_list':
        return <List className="h-5 w-5" />;
      case 'company_list_search':
        return <Building className="h-5 w-5" />;
      case 'csv_upload':
        return <Upload className="h-5 w-5" />;
    }
  };

  const getTargetingMethodLabel = () => {
    switch (formData.targeting.method) {
      case 'prospect_list':
        return 'Existing Prospect List';
      case 'company_list_search':
        return 'Company List Search';
      case 'csv_upload':
        return 'CSV Upload';
    }
  };

  const getTargetingDescription = () => {
    switch (formData.targeting.method) {
      case 'prospect_list':
        return `Using saved list: ${formData.targeting.prospectListName}`;
      case 'company_list_search':
        return `Prospects from company list: ${formData.targeting.companyListName}`;
      case 'csv_upload':
        return 'Prospects uploaded from CSV file';
    }
  };

const getActiveSendingDays = (): string => {
  return Object.entries(formData.sendingDays)
    .filter(([, active]: [string, boolean]) => active)
    .map(([day]: [string, boolean]) => day.charAt(0).toUpperCase() + day.slice(1, 3))
    .join(', ');
};

  const estimatedSendDuration = () => {
    const totalProspects = formData.targeting.totalProspects || 0;
    const dailyLimit = formData.settings.dailySendLimit;
    const activeDays = Object.values(formData.sendingDays).filter(Boolean).length;
    
    if (totalProspects === 0 || dailyLimit === 0 || activeDays === 0) {
      return 'Unable to calculate';
    }
    
    const daysNeeded = Math.ceil(totalProspects / dailyLimit);
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
    const totalProspects = formData.targeting.totalProspects || 0;
    const dailyLimit = formData.settings.dailySendLimit;
    const activeDays = Object.values(formData.sendingDays).filter(Boolean).length;
    
    if (totalProspects === 0 || dailyLimit === 0 || activeDays === 0) {
      return null;
    }
    
    const daysNeeded = Math.ceil(totalProspects / dailyLimit);
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
    
    if (!formData.targeting.totalProspects || formData.targeting.totalProspects === 0) {
      errors.push("At least one prospect must be selected");
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
          Review your campaign settings before creating. Once created, prospect data will be locked in for this campaign.
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
        </CardContent>
      </Card>

      {/* Targeting Information */}
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
              {formData.targeting.totalProspects || 0} prospects
            </Badge>
          </div>

          {formData.targeting.prospects && formData.targeting.prospects.length > 0 && (
            <div>
              <h4 className="font-medium text-sm text-muted-foreground mb-3">SAMPLE PROSPECTS</h4>
              <div className="space-y-2">
                {formData.targeting.prospects.slice(0, 3).map((prospect, index) => (
                  <div
                    key={prospect.id || index}
                    className="flex items-center justify-between p-3 bg-muted rounded-md text-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                        <span className="text-xs font-medium">
                          {prospect.firstName?.[0]}{prospect.lastName?.[0]}
                        </span>
                      </div>
                      <div>
                        <span className="font-medium">
                          {prospect.firstName} {prospect.lastName}
                        </span>
                        <div className="text-muted-foreground">
                          {prospect.title} at {prospect.companyName}
                        </div>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {prospect.email}
                    </span>
                  </div>
                ))}
                {formData.targeting.prospects.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center py-2 bg-muted/50 rounded">
                    ... and {formData.targeting.prospects.length - 3} more prospects
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
          <strong>Important:</strong> Once created, the campaign will use a snapshot of your prospect data. 
          Future changes to the source list won&apos;t affect this campaign. The campaign will be created 
          in draft mode - you can review and start it from the campaign details page.
          {formData.targeting.method !== 'prospect_list' && (
            <> A new prospect list will be automatically created for this campaign.</>
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
                {formData.targeting.totalProspects || 0}
              </p>
              <p className="text-sm text-muted-foreground">Total Prospects</p>
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
          {formData.targeting.totalProspects && formData.targeting.totalProspects > 0 && (
            <div className="mt-4">
              <div className="flex justify-between text-sm mb-2">
                <span>Campaign will send emails progressively:</span>
                <span>
                  {Math.min(formData.settings.dailySendLimit, formData.targeting.totalProspects)} on day 1
                </span>
              </div>
              <Progress 
                value={Math.min((formData.settings.dailySendLimit / formData.targeting.totalProspects) * 100, 100)} 
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