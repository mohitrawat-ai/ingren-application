// src/components/campaign/targeting/CampaignTargetingStep.tsx
"use client";

import { Button } from "@/components/ui/button";

import { ProfileListSelector } from "./ProfileListSelector";
import { TargetingPreview } from "./TargetingPreview";
import { CampaignTargetingData } from "@/types";


// TODO : Change this profile type implementation : Improve company and csv upload flow
// For now exporting it from here, shouldn't be in production
export type ProfileType = NonNullable<CampaignTargetingData['profiles']>[number];

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


  const selectedMethod = 'profile_list'

  const handleProfileListSelect = (listId: number, listName: string, profileCount: number) => {
    onChange({
      ...data,
      method: selectedMethod,
      profileListId: listId,
      profileListName: listName,
      totalProfiles: profileCount,
    });
  };

  const canProceed = () => {
    switch (selectedMethod) {
      case 'profile_list':
        return !!data.profileListId && data.totalProfiles || 0 > 0;
      default:
        return false;
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold mb-2">Target Audience</h2>
        <p className="text-muted-foreground">
          Choose how you want to select profiles for this campaign
        </p>
      </div>


      {/* Method-specific Components */}
      {selectedMethod === 'profile_list' && (
        <ProfileListSelector
          selectedListId={data.profileListId}
          onSelect={handleProfileListSelect}
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