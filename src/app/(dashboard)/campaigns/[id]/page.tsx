// src/app/(dashboard)/campaigns/[id]/page.tsx
import { notFound } from "next/navigation";
import { db as dbClient} from "@/lib/db";
import { eq } from "drizzle-orm";
import { AudienceDetails } from "@/components/audience/audience-details";
import { CampaignHeader } from "@/components/campaign/campaign-header";

import { campaigns } from "@/lib/schema";

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
        },
      });
      
      const audience = campaign?.audiences[0] || null;
    
    return (
      <div className="space-y-6">
         <CampaignHeader 
          campaignId={campaignId} 
          campaignName={campaign?.name || ""}
          campaignStatus={campaign?.status || ""}
        />
        <h1 className="text-3xl font-bold">{campaign?.name}</h1>
        
        <div className="grid gap-6">
          <div>
            <h2 className="text-xl font-semibold mb-4">Target Audience</h2>
            {audience ? (
              <AudienceDetails audienceId={audience.id} />
            ) : (
              <p>No audience has been created for this campaign yet.</p>
            )}
          </div>
          
          {/* Additional campaign sections would go here */}
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