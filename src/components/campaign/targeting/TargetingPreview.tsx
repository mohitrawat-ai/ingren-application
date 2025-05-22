// src/components/campaign/targeting/TargetingPreview.tsx
"use client";

import { Users, Building, Upload, AlertCircle } from "lucide-react";

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
      case 'prospect_list':
        return <Users className="h-5 w-5" />;
      case 'company_list_search':
        return <Building className="h-5 w-5" />;
      case 'csv_upload':
        return <Upload className="h-5 w-5" />;
    }
  };

  const getMethodTitle = () => {
    switch (method) {
      case 'prospect_list':
        return 'Prospect List Targeting';
      case 'company_list_search':
        return 'Company List Search Targeting';
      case 'csv_upload':
        return 'CSV Upload Targeting';
    }
  };

  const getMethodDescription = () => {
    switch (method) {
      case 'prospect_list':
        return `Using saved prospect list: ${data.prospectListName}`;
      case 'company_list_search':
        return `Prospects found from company list: ${data.companyListName}`;
      case 'csv_upload':
        return 'Prospects uploaded from CSV file';
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
            <span className="text-sm font-medium">Total Prospects:</span>
            <Badge variant="outline" className="text-lg px-3 py-1">
              {data.totalProspects || 0}
            </Badge>
          </div>

          {data.totalProspects === 0 && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                No prospects selected. Please choose prospects to continue.
              </AlertDescription>
            </Alert>
          )}

          {data.prospects && data.prospects.length > 0 && (
            <div>
              <h4 className="font-medium mb-2">Sample Prospects:</h4>
              <div className="space-y-2">
                {data.prospects.slice(0, 3).map((prospect, index) => (
                  <div
                    key={prospect.id || index}
                    className="flex items-center justify-between p-2 bg-muted rounded text-sm"
                  >
                    <div>
                      <span className="font-medium">{prospect.firstName} {prospect.lastName}</span>
                      <span className="text-muted-foreground ml-2">
                        {prospect.title} at {prospect.companyName}
                      </span>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {prospect.email}
                    </span>
                  </div>
                ))}
                {data.prospects.length > 3 && (
                  <div className="text-sm text-muted-foreground text-center py-2">
                    ... and {data.prospects.length - 3} more prospects
                  </div>
                )}
              </div>
            </div>
          )}

          {method === 'prospect_list' && data.prospectListName && (
            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                Campaign data will be copied from the prospect list at the time of creation. 
                Future changes to the list won&apos;t affect this campaign.
              </AlertDescription>
            </Alert>
          )}
        </div>
      </CardContent>
    </Card>
  );
}