// src/components/campaign/targeting/TargetingPreview.tsx
"use client";

import { Users, AlertCircle } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";

import { CampaignTargetingData, TargetingMethod } from "@/types";

interface TargetingPreviewProps {
  method: TargetingMethod;
  data: CampaignTargetingData
}

export function TargetingPreview({ method, data }: TargetingPreviewProps) {
  const getMethodIcon = () => {
    switch (method) {
      case 'profile_list':
        return <Users className="h-5 w-5" />;
    }
  };

  const getMethodTitle = () => {
    switch (method) {
      case 'profile_list':
        return 'Profile List Targeting';
    }
  };

  const getMethodDescription = () => {
    switch (method) {
      case 'profile_list':
        return `Using saved profile list: ${data.profileListName}`;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {getMethodIcon()}
          {getMethodTitle()}
        </CardTitle>
        <CardDescription>{getMethodDescription()}</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Total Profiles:</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.totalProfiles || 0}
            </Badge>
          </div>

          {data.totalProfiles === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No profiles selected. Please choose profiles to continue.
              </AlertDescription>
            </Alert>
          )}

          {data.profiles && data.profiles.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Sample Profiles:</h4>
              <div className="space-y-2">
                {data.profiles.slice(0, 3).map((profile, index) => (
                  <div
                    key={profile.id || index}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                  >
                    <div>
                      <span className="font-medium">{profile.firstName} {profile.lastName}</span>
                      <span className="text-muted-foreground ml-2">
                        {profile.jobTitle} at {profile.company.name}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {profile.email}
                    </span>
                  </div>
                ))}
                {data.profiles.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    ... and {data.profiles.length - 3} more profiles
                  </div>
                )}
              </div>
            </div>
          )}

          {method === 'profile_list' && data.profileListName && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Campaign data will be copied from the profile list at the time of creation.
                Future changes to the list won&apos;t affect this campaign.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}