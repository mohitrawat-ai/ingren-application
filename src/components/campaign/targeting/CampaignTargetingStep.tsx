// src/components/campaign/targeting/CampaignTargetingStep.tsx
"use client";

import { useState } from "react";
import { Users, Building, Upload } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

import { ProspectListSelector } from "./ProspectListSelector";
import { CompanyListProspectSearch } from "./CompanyListProspectSearch";
import { CSVUploadTargeting } from "./CSVUploadTargeting";
import { TargetingPreview } from "./TargetingPreview";
import { Prospect, TargetingMethod, CampaignTargetingData } from "@/types";


// TODO : Change this prospect type implementation : Improve company and csv upload flow
// For now exporting it from here, shouldn't be in production
export type ProspectType = NonNullable<CampaignTargetingData['prospects']>[number];

interface CampaignTargetingStepProps {
  data: CampaignTargetingData;
  onChange: (data: CampaignTargetingData) => void;
  onNext: () => void;
  onBack: () => void;
}

export function CampaignTargetingStep({
  data,
  onChange,
  onNext,
  onBack,
}: CampaignTargetingStepProps) {
  const [selectedMethod, setSelectedMethod] = useState<TargetingMethod>(
    data.method || 'prospect_list'
  );

  const handleMethodChange = (method: TargetingMethod) => {
    setSelectedMethod(method);
    onChange({
      method,
      // Clear previous selections when method changes
      prospectListId: undefined,
      prospectListName: undefined,
      companyListId: undefined,
      companyListName: undefined,
      prospects: undefined,
      totalProspects: undefined,
    });
  };

  const handleProspectListSelect = (listId: number, listName: string, prospectCount: number) => {
    onChange({
      ...data,
      method: selectedMethod,
      prospectListId: listId,
      prospectListName: listName,
      totalProspects: prospectCount,
    });
  };

  const handleCompanyListSearch = (
    companyListId: number, 
    companyListName: string, 
    prospects: Array<ProspectType>
  ) => {
    onChange({
      ...data,
      method: selectedMethod,
      companyListId,
      companyListName,
      prospects,
      totalProspects: prospects.length,
    });
  };

  const handleCSVUpload = (prospects: Array<Prospect>) => {
    onChange({
      ...data,
      method: selectedMethod,
      prospects,
      totalProspects: prospects.length,
    });
  };

  const canProceed = () => {
    switch (selectedMethod) {
      case 'prospect_list':
        return !!data.prospectListId;
      case 'company_list_search':
        return !!data.prospects && data.prospects.length > 0;
      case 'csv_upload':
        return !!data.prospects && data.prospects.length > 0;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Target Audience</h2>
        <p className="text-muted-foreground">
          Choose how you want to select prospects for this campaign
        </p>
      </div>

      {/* Method Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Targeting Method</CardTitle>
          <CardDescription>
            Select how you want to choose prospects for this campaign
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RadioGroup
            value={selectedMethod}
            onValueChange={(value) => handleMethodChange(value as TargetingMethod)}
            className="grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div>
              <RadioGroupItem
                value="prospect_list"
                id="prospect_list"
                className="peer sr-only"
              />
              <Label
                htmlFor="prospect_list"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Users className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Existing Prospect List</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Use a saved prospect list
                  </div>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="company_list_search"
                id="company_list_search"
                className="peer sr-only"
              />
              <Label
                htmlFor="company_list_search"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Building className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Search from Company List</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Find prospects in specific companies
                  </div>
                </div>
              </Label>
            </div>

            <div>
              <RadioGroupItem
                value="csv_upload"
                id="csv_upload"
                className="peer sr-only"
              />
              <Label
                htmlFor="csv_upload"
                className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
              >
                <Upload className="mb-3 h-6 w-6" />
                <div className="text-center">
                  <div className="font-medium">Upload CSV</div>
                  <div className="text-sm text-muted-foreground mt-1">
                    Import prospects from file
                  </div>
                </div>
              </Label>
            </div>
          </RadioGroup>
        </CardContent>
      </Card>

      {/* Method-specific Components */}
      {selectedMethod === 'prospect_list' && (
        <ProspectListSelector
          selectedListId={data.prospectListId}
          onSelect={handleProspectListSelect}
        />
      )}

      {selectedMethod === 'company_list_search' && (
        <CompanyListProspectSearch
          selectedCompanyListId={data.companyListId}
          onProspectsSelected={handleCompanyListSearch}
        />
      )}

      {selectedMethod === 'csv_upload' && (
        <CSVUploadTargeting
          onProspectsUploaded={handleCSVUpload}
        />
      )}

      {/* Preview */}
      {canProceed() && (
        <TargetingPreview
          method={selectedMethod}
          data={data}
        />
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack}>
          Back
        </Button>
        <Button 
          onClick={onNext} 
          disabled={!canProceed()}
        >
          Next: Campaign Settings
        </Button>
      </div>
    </div>
  );
}