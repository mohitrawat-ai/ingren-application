// src/app/(dashboard)/campaigns/[id]/page.tsx
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams } from "next/navigation";
import { toast } from "sonner";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  Play, 
  Pause, 
  Settings, 
  Users, 
  Mail,
  BarChart3,
  Calendar,
  AlertTriangle 
} from "lucide-react";

import { CampaignSettingsDisplay } from "@/components/campaign/settings/CampaignSettingsDisplay";
import { CampaignTargetingInfo } from "@/components/campaign/CampaignTargetingInfo";
import { EmailPreviewDialog } from "@/components/campaign/email-preview-dialog";

import { getCampaign, updateCampaignStatus } from "@/lib/actions/campaign";
import { getCampaignEnrollmentStats } from "@/lib/actions/campaignEnrollment";
import { CampaignSendingDays, CampaignSettings } from "@/lib/schema/types";

interface CampaignDetailPageData {
  campaign: {
    id: number;
    name: string;
    description: string | null;
    status: string;
    createdAt: Date;
    updatedAt: Date;
    isNewSystem: boolean;
    totalContacts: number;
    sourceListNames: string[];
    settings?: CampaignSettings;
    sendingDays?: CampaignSendingDays;
    enrollments?: Array<{
      id: number;
      sourceTargetListId: number;
      sourceTargetListName: string;
      enrollmentDate: Date;
      profileCount: number;
      status: string;
      snapshotData: Record<string, unknown>;
    }>;
    enrollmentStats?: {
      totalProfiles?: number;
      sourceListNames: string[];
      emailStatusBreakdown: Record<string, number>;
      responseStatusBreakdown: Record<string, number>;
    };
  };
}

export default function CampaignDetailPage() {
  const params = useParams();
  const campaignId = parseInt(params.id as string);
  
  const [data, setData] = useState<CampaignDetailPageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [emailPreviewOpen, setEmailPreviewOpen] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);



  const loadCampaignData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load campaign with enrollment data
      const campaign = await getCampaign(campaignId);
      
      // Load enrollment stats if using new system
      let enrollmentStats;
      if (campaign.isNewSystem) {
        try {
          enrollmentStats = await getCampaignEnrollmentStats(campaignId);
        } catch (statsError) {
          console.warn("Could not load enrollment stats:", statsError);
        }
      }
      
      setData({
        campaign: {
          ...campaign,
          enrollments: campaign.enrollments?.map(enrollment => ({
            id: enrollment.id,
            sourceTargetListId: enrollment.sourceTargetListId,
            sourceTargetListName: enrollment.sourceTargetList.name,
            enrollmentDate: enrollment.enrollmentDate,
            profileCount: enrollment.enrolledProfiles.length,
            status: enrollment.status,
            snapshotData: enrollment.snapshotData as Record<string, unknown>,
          })),
          enrollmentStats,
        },
      });
    } catch (error) {
      console.error("Error loading campaign:", error);
      setError("Failed to load campaign details");
      toast.error("Failed to load campaign details");
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

   useEffect(() => {
    loadCampaignData();
  }, [loadCampaignData]);

  const handleStatusUpdate = async (newStatus: string) => {
    if (!data?.campaign) return;
    
    try {
      setUpdatingStatus(true);
      await updateCampaignStatus(campaignId, newStatus);
      
      // Update local state
      setData(prev => prev ? {
        ...prev,
        campaign: {
          ...prev.campaign,
          status: newStatus,
        },
      } : null);
      
      toast.success(`Campaign ${newStatus === 'running' ? 'started' : 'paused'} successfully`);
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast.error("Failed to update campaign status");
    } finally {
      setUpdatingStatus(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-64 mb-2" />
            <Skeleton className="h-4 w-32" />
          </div>
          <Skeleton className="h-10 w-32" />
        </div>
        
        <div className="grid gap-6">
          <Skeleton className="h-48" />
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </div>
    );
  }

  if (error || !data?.campaign) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center">
            <AlertTriangle className="h-10 w-10 text-destructive mx-auto mb-4" />
            <h3 className="text-lg font-medium mb-2">Error Loading Campaign</h3>
            <p className="text-muted-foreground mb-4">
              {error || "Campaign not found"}
            </p>
            <Button onClick={loadCampaignData}>Try Again</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { campaign } = data;

  const getStatusBadge = (status: string) => {
    const variants: Record<string, "default" | "secondary" | "outline" | "destructive"> = {
      draft: 'secondary',
      scheduled: 'outline',
      running: 'default',
      paused: 'destructive',
      completed: 'outline',
    } as const;
    return (
      <Badge variant={variants[status] ?? 'secondary'}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const canStart = ['draft', 'paused'].includes(campaign.status);
  const canPause = campaign.status === 'running';

  return (
    <div className="space-y-6">
      {/* Campaign Header */}
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">{campaign.name}</h1>
          {campaign.description && (
            <p className="text-muted-foreground mt-1">{campaign.description}</p>
          )}
          <div className="flex items-center gap-3 mt-3">
            {getStatusBadge(campaign.status)}
            {campaign.isNewSystem && (
              <Badge variant="outline" className="text-xs">
                New System
              </Badge>
            )}
            <span className="text-sm text-muted-foreground">
              Created {new Date(campaign.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => setEmailPreviewOpen(true)}
          >
            <Mail className="mr-2 h-4 w-4" />
            Preview Emails
          </Button>
          
          {canStart && (
            <Button
              onClick={() => handleStatusUpdate('running')}
              disabled={updatingStatus}
            >
              <Play className="mr-2 h-4 w-4" />
              {updatingStatus ? 'Starting...' : 'Start Campaign'}
            </Button>
          )}
          
          {canPause && (
            <Button
              variant="outline"
              onClick={() => handleStatusUpdate('paused')}
              disabled={updatingStatus}
            >
              <Pause className="mr-2 h-4 w-4" />
              {updatingStatus ? 'Pausing...' : 'Pause Campaign'}
            </Button>
          )}
        </div>
      </div>

      {/* Campaign Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{campaign.totalContacts}</p>
                <p className="text-xs text-muted-foreground">Total Contacts</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {campaign.enrollmentStats?.emailStatusBreakdown?.sent || 0}
                </p>
                <p className="text-xs text-muted-foreground">Emails Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {campaign.enrollmentStats?.emailStatusBreakdown?.opened || 0}
                </p>
                <p className="text-xs text-muted-foreground">Opened</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">
                  {campaign.enrollments?.length || 0}
                </p>
                <p className="text-xs text-muted-foreground">Source Lists</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Campaign Targeting Information */}
      <CampaignTargetingInfo campaign={campaign} />

      {/* Campaign Settings */}
      {campaign.settings && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Campaign Settings
            </CardTitle>
            <CardDescription>
              Email configuration and sending schedule
            </CardDescription>
          </CardHeader>
          <CardContent>
            <CampaignSettingsDisplay 
              settings={campaign.settings}
              sendingDays={campaign.sendingDays}
            />
          </CardContent>
        </Card>
      )}

      {/* Email Performance (if campaign is active) */}
      {campaign.status === 'running' && campaign.enrollmentStats?.emailStatusBreakdown && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Email Performance
            </CardTitle>
            <CardDescription>
              Real-time campaign performance metrics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {Object.entries(campaign.enrollmentStats.emailStatusBreakdown).map(([status, count]) => (
                <div key={status} className="text-center">
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {status.replace('_', ' ')}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Email Preview Dialog */}
      <EmailPreviewDialog
        open={emailPreviewOpen}
        onOpenChange={setEmailPreviewOpen}
        campaignId={campaignId}
        campaignName={campaign.name}
      />
    </div>
  );
}