// src/app/(dashboard)/campaigns/new/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { CheckIcon } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { TargetingForm } from "@/components/campaign/targeting-form";
import { PitchForm } from "@/components/campaign/pitch-form";
import { OutreachForm } from "@/components/campaign/outreach-form";
import { WorkflowForm } from "@/components/campaign/workflow-form";
import { SettingsForm } from "@/components/campaign/settings-form";
import { createCampaign, saveOutreach, savePitch, saveSettings } from "@/lib/actions/campaign";
import { createAudience } from "@/lib/actions/audience";
import { cn } from "@/lib/utils";

import { SettingsFormData } from "@/types";
import { TargetingFormData } from "@/types";
import { PitchFormData } from "@/types";
import { OutreachFormData } from "@/types";
import { WorkflowFormData } from "@/types";

const steps = [
  { id: 0, label: "Targeting", description: "Define your target audience" },
  { id: 1, label: "Pitch", description: "Create your company pitch" },
  { id: 2, label: "Outreach", description: "Configure message content" },
  { id: 3, label: "Workflow", description: "Set up follow-up sequence" },
  { id: 4, label: "Settings", description: "Finalize campaign settings" },
];

export default function NewCampaignPage() {
  const [activeStep, setActiveStep] = useState(0);
  const [campaignId, setCampaignId] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Default values for each form
  const defaultTargetingData: TargetingFormData = {
    organizations: [],
    jobTitles: [],
    contacts: [],
  };

  const defaultPitchData: PitchFormData = {
    url: "",
    description: "",
    features: [
      { problem: "", solution: "", id: 1 }
    ],
  };

  const defaultWorkflowData: WorkflowFormData = {
    enableFollowUp: false,
    followUpConfig: {
      waitDays: 3,
      emailSubject: "",
      emailBody: "",
    },
  };

  const defaultSettingsData: SettingsFormData = {
    emailSettings: {
      fromName: "",
      fromEmail: "",
      emailService: "",
    },
    campaignSettings: {
      name: "",
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

  // Form data state for each step with proper typing
  const [formData, setFormData] = useState<{
    targeting: TargetingFormData | null;
    pitch: PitchFormData | null;
    outreach: OutreachFormData | null;
    workflow: WorkflowFormData | null;
    settings: SettingsFormData | null;
  }>({
    targeting: null,
    pitch: null,
    outreach: null,
    workflow: null,
    settings: null,
  });

  const handleStepSubmit = async (step: string, data: unknown) => {
    // Update form data for the current step
    setFormData({
      ...formData,
      [step]: data,
    });

    // If this is the first step, create the campaign
    if (step === "targeting" && !campaignId) {
      setIsSubmitting(true);
      try {
        const campaign = await createCampaign("New Campaign");
        setCampaignId(campaign.id);
        
        // Create audience with properly typed data
        const targetingData = data as TargetingFormData;
        await createAudience({
          campaignId: campaign.id,
          name: `Audience ${new Date().toLocaleDateString()}`,
          contacts: targetingData.contacts,
          organizations: targetingData.organizations,
          jobTitles: targetingData.jobTitles,
          totalResults: targetingData.totalResults || targetingData.contacts.length,
          csvFileName: targetingData.csvFileName
        });
        
        toast.success("Audience created successfully");
      } catch (error) {
        console.error("Error creating campaign and audience:", error);
        toast.error("Failed to create campaign and audience");
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Save step data for other steps
    if (campaignId && step !== "targeting") {
      setIsSubmitting(true);
      try {
        // Call appropriate API to save step data based on the current step
        switch (step) {
          case "pitch":
            const pitchData = data as PitchFormData;
            await savePitch(campaignId, pitchData);
            toast.success("Pitch data saved successfully");
            break;
          case "outreach":
            // Assuming there would be a saveOutreach function
            const outreachData = data as OutreachFormData
            await saveOutreach(campaignId, outreachData);
            toast.success("Outreach data saved successfully");
            break;
          case "workflow":
            // Assuming there would be a saveWorkflow function
            // await saveWorkflow(campaignId, data);
            toast.success("Workflow data saved successfully");
            break;
          case "settings":
            const settingsData = data as SettingsFormData;
            await saveSettings(campaignId, {
              emailSettings: settingsData.emailSettings,
              campaignSettings: {
                ...settingsData.campaignSettings,
                name: settingsData.campaignSettings.name || "New Campaign"
              }
            });
            toast.success("Campaign settings saved successfully");
            break;
        }
      } catch (error) {
        console.error(`Error saving ${step} data:`, error);
        toast.error(`Failed to save ${step} data`);
        return;
      } finally {
        setIsSubmitting(false);
      }
    }

    // Move to next step
    if (activeStep < steps.length - 1) {
      setActiveStep(activeStep + 1);
    } else {
      // Final step completed
      router.push(`/campaigns/${campaignId}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Create New Campaign</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Campaign Creation</CardTitle>
          <CardDescription>
            Complete each step to set up your sales campaign
          </CardDescription>
        </CardHeader>
        
        <CardContent>
          {/* Custom Stepper Implementation */}
          <div className="mb-8">
            <div className="flex justify-between">
              {steps.map((step, index) => (
                <div 
                  key={step.id}
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
                        activeStep > index 
                          ? "bg-primary" 
                          : "bg-muted"
                      )}
                    />
                  )}
                  
                  {/* Step circle */}
                  <button
                    type="button"
                    onClick={() => activeStep > step.id && setActiveStep(step.id)}
                    disabled={activeStep < step.id}
                    className={cn(
                      "w-8 h-8 rounded-full flex items-center justify-center mb-2 border-2",
                      activeStep === step.id && "bg-primary text-primary-foreground border-primary",
                      activeStep > step.id && "bg-primary text-primary-foreground border-primary",
                      activeStep < step.id && "bg-background border-muted text-muted-foreground",
                      activeStep >= step.id && "cursor-pointer"
                    )}
                  >
                    {activeStep > step.id 
                      ? <CheckIcon className="h-4 w-4" /> 
                      : <span>{step.id + 1}</span>
                    }
                  </button>
                  
                  {/* Step label and description */}
                  <div className="text-center">
                    <span 
                      className={cn(
                        "text-sm font-medium",
                        activeStep >= step.id ? "text-foreground" : "text-muted-foreground"
                      )}
                    >
                      {step.label}
                    </span>
                    <p className="text-xs text-muted-foreground hidden sm:block">
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-8">
            {activeStep === 0 && (
              <TargetingForm 
                onSubmit={(data) => handleStepSubmit("targeting", data)} 
                isSubmitting={isSubmitting}
                initialData={formData.targeting || defaultTargetingData}
                campaignId={campaignId || 0}
              />
            )}
            {activeStep === 1 && (
              <PitchForm 
                onSubmit={(data) => handleStepSubmit("pitch", data)}
                isSubmitting={isSubmitting}
                initialData={formData.pitch || defaultPitchData}
              />
            )}
            {activeStep === 2 && (
              <OutreachForm 
                onSubmit={(data) => handleStepSubmit("outreach", data)}
                isSubmitting={isSubmitting}
                initialData={formData.outreach}
              />
            )}
            {activeStep === 3 && (
              <WorkflowForm 
                onSubmit={(data) => handleStepSubmit("workflow", data)}
                isSubmitting={isSubmitting}
                initialData={formData.workflow || defaultWorkflowData}
              />
            )}
            {activeStep === 4 && (
              <SettingsForm 
                onSubmit={(data) => handleStepSubmit("settings", data)}
                isSubmitting={isSubmitting}
                initialData={formData.settings || defaultSettingsData}
              />
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}