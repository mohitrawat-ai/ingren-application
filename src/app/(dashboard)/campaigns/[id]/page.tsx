// src/app/(dashboard)/campaigns/[id]/page.tsx
import { notFound } from "next/navigation";
import { db as dbClient} from "@/lib/db";
import { eq } from "drizzle-orm";
import { AudienceDetails } from "@/components/audience/audience-details";
import { CampaignHeader } from "@/components/campaign/campaign-header";
import { CampaignSettingsDisplay } from "@/components/campaign/settings/CampaignSettingsDisplay";

import { campaigns } from "@/lib/schema";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const db = await dbClient();

interface CampaignDetailsPageProps {
  params: Promise<{ id: string }>; 
}

export default async function CampaignDetailsPage({ 
  params 
}: CampaignDetailsPageProps) {
  // Parse campaign ID with proper error handling
  const param = await params
  const campaignId = parseInt(param.id);
  
  if (isNaN(campaignId)) {
    notFound();
  }
  
  try {
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
      with: {
        audiences: true,
        settings: true,
        sendingDays: true,
        pitch: {
          with: {
            features: true,
          },
        },
        outreach: {
          with: {
            ctaOptions: true,
            personalizationSources: true,
          },
        },
        targeting: {
          with: {
            organizations: true,
            jobTitles: true,
          },
        },
      },
    });

    if (!campaign) {
      notFound();
    }
      
    const audience = campaign?.audiences[0] || null;
    
    return (
      <div className="space-y-6">
        <CampaignHeader 
          campaignId={campaignId} 
          campaignName={campaign?.name || ""}
          campaignStatus={campaign?.status || ""}
        />
        
        <div className="grid gap-6">
          <Card>
            <CardHeader>
              <CardTitle>{campaign.name}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={campaign.status === 'active' ? 'default' : 'secondary'}>
                  {campaign.status}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Created {new Date(campaign.createdAt).toLocaleDateString()}
                </span>
              </div>
              {campaign.description && (
                <CardDescription>{campaign.description}</CardDescription>
              )}
            </CardHeader>
          </Card>

          <Tabs defaultValue="audience" className="w-full">
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="audience">Audience</TabsTrigger>
              <TabsTrigger value="pitch">Pitch</TabsTrigger>
              <TabsTrigger value="outreach">Outreach</TabsTrigger>
              <TabsTrigger value="workflow">Workflow</TabsTrigger>
              <TabsTrigger value="settings">Settings</TabsTrigger>
            </TabsList>
            
            <TabsContent value="audience" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Target Audience</CardTitle>
                  <CardDescription>
                    People and organizations targeted by this campaign
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {audience ? (
                    <AudienceDetails audienceId={audience.id} />
                  ) : (
                    <p className="text-muted-foreground">
                      No audience has been created for this campaign yet.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            <TabsContent value="settings" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Campaign Settings</CardTitle>
                  <CardDescription>
                    Email configuration, scheduling, and tracking settings
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {campaign.settings ? (
                    <CampaignSettingsDisplay 
                      settings={campaign.settings}
                      sendingDays={campaign.sendingDays}
                    />
                  ) : (
                    <p className="text-muted-foreground">
                      No settings have been configured for this campaign.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error loading campaign:", error);
    return (
      <div>
        <h1>Error Loading Campaign</h1>
        <p>There was an error loading the campaign details.</p>
      </div>
    );
  }
}