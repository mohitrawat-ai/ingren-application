// src/components/campaign/CampaignTargetingInfo.tsx - Updated for profiles
"use client";

import { Users, AlertTriangle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CampaignEnrollmentCard } from "./CampaignEnrollmentCard";

interface CampaignTargetingInfoProps {
  campaign: {
    id: number;
    name: string;
    isNewSystem: boolean;
    totalContacts?: number; // Keep for compatibility
    totalProfiles?: number; // New field
    enrollments?: Array<{
      id: number;
      sourceTargetListId: number;
      sourceTargetListName: string;
      enrollmentDate: Date;
      profileCount: number; // Updated from contactCount
      status: string;
      snapshotData: Record<string, unknown>;
    }>;
    enrollmentStats?: {
      totalProfiles?: number; // New field
      sourceListNames: string[];
      emailStatusBreakdown: Record<string, number>;
    };
    legacyStats?: {
      totalContacts: number;
    };
  };
}

export function CampaignTargetingInfo({ campaign }: CampaignTargetingInfoProps) {
  // Use totalProfiles if available, fallback to totalContacts for compatibility
  const profileCount = campaign.totalProfiles || campaign.totalContacts;

  if (!campaign.isNewSystem) {
    // Legacy campaign display
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Campaign Targeting (Legacy)
          </CardTitle>
          <CardDescription>
            This campaign uses the legacy targeting system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This campaign was created with the legacy system. 
              It has {campaign.legacyStats?.totalContacts || 0} contacts.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // New system display
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Campaign Targeting
          </CardTitle>
          <CardDescription>
            Target audience information and enrollment details
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-2xl font-bold">{profileCount}</p>
              <p className="text-sm text-muted-foreground">Total Profiles</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">{campaign.enrollments?.length || 0}</p>
              <p className="text-sm text-muted-foreground">Source Lists</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold">
                {campaign.enrollmentStats?.emailStatusBreakdown?.sent || 0}
              </p>
              <p className="text-sm text-muted-foreground">Emails Sent</p>
            </div>
          </div>

          {campaign.enrollmentStats?.sourceListNames && (
            <div className="mt-4">
              <p className="text-sm font-medium mb-2">Source Lists:</p>
              <div className="flex flex-wrap gap-2">
                {campaign.enrollmentStats.sourceListNames.map((listName, index) => (
                  <Badge key={index} variant="outline">
                    {listName}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {campaign.enrollments && campaign.enrollments.length > 0 && (
        <div>
          <h3 className="text-lg font-semibold mb-4">Enrollment Details</h3>
          <div className="grid gap-4">
            {campaign.enrollments.map((enrollment) => {
              // Calculate email stats for this enrollment
              const emailStats = {
                sent: campaign.enrollmentStats?.emailStatusBreakdown?.sent || 0,
                opened: campaign.enrollmentStats?.emailStatusBreakdown?.opened || 0,
                clicked: campaign.enrollmentStats?.emailStatusBreakdown?.clicked || 0,
                replied: campaign.enrollmentStats?.emailStatusBreakdown?.replied || 0,
              };

              return (
                <CampaignEnrollmentCard
                  key={enrollment.id}
                  enrollment={{
                    ...enrollment,
                    contactCount: enrollment.profileCount, // Map profileCount to contactCount for compatibility
                  }}
                  emailStats={emailStats}
                />
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}