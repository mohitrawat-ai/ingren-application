// src/app/(dashboard)/campaigns/[id]/page.tsx - Minimal working version
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
    console.log('Fetching campaign with only working relations...');
    
    // Only use relations that we know work
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
      with: {
        settings: true,
        sendingDays: true,
        audiences: true,
        // Skip problematic relations for now
      },
    });

    console.log('Campaign fetched successfully');

    if (!campaign) {
      notFound();
    }

    // Get additional data with simple queries (no relations)
    const targeting = await db.query.campaignTargeting.findFirst({
      where: (campaignTargeting, { eq }) => eq(campaignTargeting.campaignId, campaignId),
    });

    const targetOrganizations = targeting ? await db.query.targetOrganizations.findMany({
      where: (targetOrganizations, { eq }) => eq(targetOrganizations.campaignId, campaignId),
    }) : [];

    const targetJobTitles = targeting ? await db.query.targetJobTitles.findMany({
      where: (targetJobTitles, { eq }) => eq(targetJobTitles.campaignId, campaignId),
    }) : [];
      
    const audience = campaign?.audiences?.[0] || null;
    
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
                  
                  {targeting && (
                    <div className="mt-6 space-y-4">
                      <h4 className="font-medium">Targeting Information</h4>
                      
                      {targetOrganizations.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Organizations</h5>
                          <div className="space-y-2">
                            {targetOrganizations.map((org) => (
                              <div key={org.id} className="border rounded p-3">
                                <p className="font-medium">{org.name}</p>
                                {org.industry && <p className="text-sm text-muted-foreground">Industry: {org.industry}</p>}
                                {org.employeeCount && <p className="text-sm text-muted-foreground">Size: {org.employeeCount}</p>}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {targetJobTitles.length > 0 && (
                        <div>
                          <h5 className="text-sm font-medium text-muted-foreground mb-2">Job Titles</h5>
                          <div className="flex flex-wrap gap-2">
                            {targetJobTitles.map((title) => (
                              <Badge key={title.id} variant="outline">{title.title}</Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
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
        <pre className="bg-red-100 p-4 rounded mt-4 text-sm">
          {error instanceof Error ? error.message : 'Unknown error'}
        </pre>
      </div>
    );
  }
}