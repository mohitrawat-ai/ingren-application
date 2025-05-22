// src/app/(dashboard)/campaigns/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon, ArrowLeft } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

import { TargetingForm } from "@/components/campaign/targeting-form";
import { CampaignSettingsStep } from "@/components/campaign/settings/CampaignSettingsStep";
import { CampaignReviewStep } from "@/components/campaign/review/CampaignReviewStep";

import { createCampaign, saveSettings } from "@/lib/actions/campaign";
import { createAudience } from "@/lib/actions/audience";
import { markProspectListAsUsedInCampaigns } from "@/lib/actions/prospect";
import { cn } from "@/lib/utils";

import { TargetingFormData, SettingsFormData } from "@/types";

type Step = 'targeting' | 'settings' | 'review';

interface CampaignFormData {
  targeting: TargetingFormData | null;
  settings: SettingsFormData | null;
}

const steps: { key: Step; title: string; description: string }[] = [
  {
    key: 'targeting',
    title: 'Target Audience',
    description: 'Choose your prospects',
  },
  {
    key: 'settings',
    title: 'Campaign Settings',
    description: 'Configure your campaign',
  },
  {
    key: 'review',
    title: 'Review & Launch',
    description: 'Review and create campaign',
  },
];

export default function NewCampaignPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [currentStep, setCurrentStep] = useState<Step>('targeting');
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form data for each step
  const [formData, setFormData] = useState<CampaignFormData>({
    targeting: null,
    settings: null,
  });

  // Get current step index
  const currentStepIndex = steps.findIndex(step => step.key === currentStep);

  // Default targeting data
  const defaultTargetingData: TargetingFormData = {
    organizations: [],
    jobTitles: [],
    contacts: [],
  };

  // Default settings data
  const defaultSettingsData: SettingsFormData = {
    name: "",
    description: "",
    emailSettings: {
      fromName: "",
      fromEmail: "",
      emailService: "",
    },
    campaignSettings: {
      timezone: "UTC",
      trackOpens: true,
      trackClicks: true,
      dailySendLimit: 500,
      unsubscribeLink: true,
      sendingTime: {
        startTime: "09:00",
        endTime: "17:00",
      },
      sendingDays: {
        monday: true,
        tuesday: true,
        wednesday: true,
        thursday: true,
        friday: true,
        saturday: false,
        sunday: false,
      },
    },
  };

  // Handle step navigation
  const goToStep = (step: Step) => {
    const stepIndex = steps.findIndex(s => s.key === step);
    const currentIndex = steps.findIndex(s => s.key === currentStep);
    
    // Only allow going to completed steps or the next step
    if (stepIndex <= currentIndex || stepIndex === currentIndex + 1) {
      setCurrentStep(step);
    }
  };

  const goToNextStep = () => {
    const nextIndex = currentStepIndex + 1;
    if (nextIndex < steps.length) {
      setCurrentStep(steps[nextIndex].key);
    }
  };

  const goToPreviousStep = () => {
    const prevIndex = currentStepIndex - 1;
    if (prevIndex >= 0) {
      setCurrentStep(steps[prevIndex].key);
    }
  };

  // Handle targeting form submission
  const handleTargetingSubmit = async (data: TargetingFormData) => {
    setIsSubmitting(true);
    
    try {
      // Create campaign if it doesn't exist
      let currentCampaignId = campaignId;
      if (!currentCampaignId) {
        const campaign = await createCampaign("New Campaign");
        currentCampaignId = campaign.id;
        setCampaignId(currentCampaignId);
      }

      // Create audience
      await createAudience({
        campaignId: currentCampaignId,
        name: `Audience ${new Date().toLocaleDateString()}`,
        contacts: data.contacts,
        organizations: data.organizations,
        jobTitles: data.jobTitles,
        totalResults: data.totalResults || data.contacts.length,
        csvFileName: data.csvFileName
      });

      // Mark prospect list as used if applicable
      const prospectListId = searchParams?.get('prospectList');
      if (prospectListId) {
        await markProspectListAsUsedInCampaigns(parseInt(prospectListId));
      }

      // Save form data and proceed
      setFormData(prev => ({ ...prev, targeting: data }));
      toast.success("Audience created successfully");
      goToNextStep();
      
    } catch (error) {
      console.error("Error in targeting step:", error);
      toast.error("Failed to create audience");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle settings form submission
  const handleSettingsSubmit = async (data: SettingsFormData) => {
    if (!campaignId) {
      toast.error("Campaign not found");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Convert settings data to the format expected by saveSettings
      const settingsData = {
        emailSettings: data.emailSettings,
        campaignSettings: {
          name: data.name,
          ...data.campaignSettings,
        },
      };

      await saveSettings(campaignId, settingsData);
      
      // Save form data and proceed
      setFormData(prev => ({ ...prev, settings: data }));
      toast.success("Campaign settings saved successfully");
      goToNextStep();
      
    } catch (error) {
      console.error("Error saving settings:", error);
      toast.error("Failed to save campaign settings");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle final campaign creation
  const handleCreateCampaign = async () => {
    if (!campaignId) {
      toast.error("Campaign not found");
      return;
    }

    setIsSubmitting(true);
    
    try {
      // Campaign is already created and configured, just redirect
      toast.success("Campaign created successfully!");
      router.push(`/campaigns/${campaignId}`);
    } catch (error) {
      console.error("Error finalizing campaign:", error);
      toast.error("Failed to finalize campaign");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if step is completed
  const isStepCompleted = (step: Step) => {
    switch (step) {
      case 'targeting':
        return formData.targeting !== null;
      case 'settings':
        return formData.settings !== null;
      case 'review':
        return false; // Review step is never "completed"
      default:
        return false;
    }
  };

  // Check if step is accessible
  const isStepAccessible = (step: Step) => {
    const stepIndex = steps.findIndex(s => s.key === step);
    
    // First step is always accessible
    if (stepIndex === 0) return true;
    
    // Other steps are accessible if the previous step is completed
    const prevStep = steps[stepIndex - 1];
    return isStepCompleted(prevStep.key);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Create New Campaign</h1>
          <p className="text-muted-foreground">
            Set up your sales outreach campaign in a few simple steps
          </p>
        </div>
        
        {currentStepIndex > 0 && (
          <Button
            variant="outline"
            onClick={goToPreviousStep}
            disabled={isSubmitting}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
        )}
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Setup</CardTitle>
          <CardDescription>
            Complete each step to configure your campaign
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Step Progress Indicator */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={step.key}
                  className={cn(
                    "flex flex-col items-center relative",
                    index < steps.length - 1 && "flex-1"
                  )}
                >
                  {/* Connection line */}
                  {index < steps.length - 1 && (
                    <div 
                      className={cn(
                        "absolute top-4 left-1/2 w-full h-0.5 -z-10",
                        isStepCompleted(step.key) || currentStepIndex > index
                          ? "bg-primary" 
                          : "bg-muted"
                      )}
                    />
                  )}
                  
                  {/* Step circle */}
                  <button
                    type="button"
                    onClick={() => isStepAccessible(step.key) && goToStep(step.key)}
                    disabled={!isStepAccessible(step.key) || isSubmitting}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2 transition-colors",
                      currentStep === step.key && "bg-primary text-primary-foreground border-primary",
                      isStepCompleted(step.key) && currentStep !== step.key && "bg-primary text-primary-foreground border-primary",
                      !isStepCompleted(step.key) && currentStep !== step.key && "bg-background border-muted text-muted-foreground",
                      isStepAccessible(step.key) && !isSubmitting && "cursor-pointer hover:border-primary/50",
                      !isStepAccessible(step.key) && "cursor-not-allowed opacity-50"
                    )}
                  >
                    {isStepCompleted(step.key) && currentStep !== step.key ? (
                      <CheckIcon className="h-4 w-4" />
                    ) : (
                      <span>{index + 1}</span>
                    )}
                  </button>
                  
                  {/* Step label and description */}
                  <div className="text-center">
                    <span 
                      className={cn(
                        "text-sm font-medium",
                        (currentStep === step.key || isStepCompleted(step.key)) 
                          ? "text-foreground" 
                          : "text-muted-foreground"
                      )}
                    >
                      {step.title}
                    </span>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className="mt-8">
            {currentStep === 'targeting' && (
              <TargetingForm 
                onSubmit={handleTargetingSubmit} 
                isSubmitting={isSubmitting}
                initialData={formData.targeting || defaultTargetingData}
                campaignId={campaignId || 0}
              />
            )}
            
            {currentStep === 'settings' && (
              <CampaignSettingsStep 
                onSubmit={handleSettingsSubmit}
                isSubmitting={isSubmitting}
                initialData={formData.settings || defaultSettingsData}
              />
            )}
            
            {currentStep === 'review' && (
              <CampaignReviewStep
                campaignId={campaignId}
                targetingData={formData.targeting}
                settingsData={formData.settings}
                onCreateCampaign={handleCreateCampaign}
                isSubmitting={isSubmitting}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}