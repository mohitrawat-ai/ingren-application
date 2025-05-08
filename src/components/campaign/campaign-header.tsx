// src/components/campaign/campaign-header.tsx
"use client";

import { useState } from "react";
import { Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmailPreviewModal } from "@/components/campaign/email-preview-modal";

interface CampaignHeaderProps {
  campaignId: number;
  campaignName: string;
  campaignStatus: string;
}

export function CampaignHeader({ 
  campaignId,
  campaignName,
  campaignStatus
}: CampaignHeaderProps) {
  const [previewEmailsOpen, setPreviewEmailsOpen] = useState(false);
  
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-500">Active</Badge>;
      case "paused":
        return <Badge variant="outline" className="text-yellow-500 border-yellow-500">Paused</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };
  
  return (
    <div className="flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold">{campaignName}</h1>
        <div className="mt-2">
          {getStatusBadge(campaignStatus)}
        </div>
      </div>
      
      <Button onClick={() => setPreviewEmailsOpen(true)}>
        <Mail className="mr-2 h-4 w-4" />
        Preview Emails
      </Button>
      
      <EmailPreviewModal
        open={previewEmailsOpen}
        onOpenChange={setPreviewEmailsOpen}
        campaignId={campaignId}
      />
    </div>
  );
}