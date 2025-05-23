// src/lib/actions/campaign.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import { 
  campaigns,
  campaignSettings,
  campaignSendingDays,
  campaignTargeting,
  targetOrganizations,
  targetJobTitles,
  campaignAudiences,
  audienceContacts
} from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { fromZonedTime } from 'date-fns-tz';
import { parse } from 'date-fns';

const db = await dbClient();

// Simple type definitions for this module
type TargetingMethod = 'prospect_list' | 'company_list_search' | 'csv_upload';

interface TargetingData {
  method: TargetingMethod;
  prospectListId?: number;
  companyListId?: number;
  prospects?: Array<{
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    title: string;
    companyName: string;
    department?: string;
    city?: string;
    state?: string;
    country?: string;
    [key: string]: unknown;
  }>;
  totalResults?: number;
}

interface SettingsData {
  name: string;
  description?: string;
  emailSettings: {
    fromName: string;
    fromEmail: string;
    emailService: string;
  };
  campaignSettings: {
    timezone: string;
    trackOpens: boolean;
    trackClicks: boolean;
    dailySendLimit: number;
    unsubscribeLink: boolean;
    sendingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    sendingTime: {
      startTime: string;
      endTime: string;
    };
  };
}

// Create a new campaign
export async function createCampaign(name: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [campaign] = await db
    .insert(campaigns)
    .values({
      name,
      userId: session.user.id,
      status: "draft",
    })
    .returning();

  revalidatePath("/campaigns");
  return campaign;
}

// Get all campaigns for the current user
export async function getCampaigns() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const campaignsList = await db.query.campaigns.findMany({
    where: and(
      eq(campaigns.userId, session.user.id),
      ne(campaigns.status, "deleted")
    ),
    orderBy: [campaigns.createdAt],
    with: {
      settings: true,
      audiences: true,
    },
  });

  // Add mock statistics for UI
  const campaignsWithStats = campaignsList.map(campaign => ({
    ...campaign,
    statistics: {
      sentEmails: Math.floor(Math.random() * 2000),
      openRate: `${(Math.random() * 40 + 10).toFixed(1)}%`,
      clickRate: `${(Math.random() * 20 + 5).toFixed(1)}%`
    }
  }));

  return campaignsWithStats;
}

// Get a single campaign by ID
export async function getCampaign(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, id),
      eq(campaigns.userId, session.user.id)
    ),
    with: {
      settings: true,
      sendingDays: true,
      targeting: {
        with: {
          organizations: true,
          jobTitles: true,
        },
      },
      audiences: {
        with: {
          contacts: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  return campaign;
}

// Update campaign status (e.g., draft, active, paused)
export async function updateCampaignStatus(id: number, status: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const [updatedCampaign] = await db
    .update(campaigns)
    .set({ 
      status,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.userId, session.user.id)
      )
    )
    .returning();

  if (!updatedCampaign) {
    throw new Error("Campaign not found");
  }

  revalidatePath(`/campaigns`);
  revalidatePath(`/campaigns/${id}`);
  return updatedCampaign;
}

// Delete a campaign
export async function deleteCampaign(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(campaigns)
    .set({ status: "deleted" })
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.userId, session.user.id)
      )
    );

  revalidatePath("/campaigns");
}

// Save targeting data
export async function saveTargeting(campaignId: number, data: TargetingData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify campaign ownership
  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, campaignId),
      eq(campaigns.userId, session.user.id)
    ),
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  await db.transaction(async (tx) => {
    // Create or update targeting record
    await tx
      .insert(campaignTargeting)
      .values({ campaignId })
      .onConflictDoNothing();

    // Clear existing targeting data
    await tx.delete(targetOrganizations).where(eq(targetOrganizations.campaignId, campaignId));
    await tx.delete(targetJobTitles).where(eq(targetJobTitles.campaignId, campaignId));

    // For prospect list method, we'll reference the list ID
    if (data.method === 'prospect_list' && data.prospectListId) {
      // Store the prospect list reference (you might want to add a field for this)
      // For now, we'll create a simple record
      await tx.insert(targetOrganizations).values({
        campaignId,
        organizationId: `prospect_list_${data.prospectListId}`,
        name: `Prospect List ${data.prospectListId}`,
        industry: null,
        employeeCount: null,
      });
    }

    // For company list method, store the company list reference
    if (data.method === 'company_list_search' && data.companyListId) {
      await tx.insert(targetOrganizations).values({
        campaignId,
        organizationId: `company_list_${data.companyListId}`,
        name: `Company List ${data.companyListId}`,
        industry: null,
        employeeCount: null,
      });
    }

    // Create campaign audience with prospects
    if (data.prospects && data.prospects.length > 0) {
      const [audience] = await tx
        .insert(campaignAudiences)
        .values({
          campaignId,
          name: `Audience ${new Date().toLocaleDateString()}`,
          totalResults: data.totalResults || data.prospects.length,
          csvFileName: data.method === 'csv_upload' ? 'uploaded.csv' : null,
        })
        .returning();

      // Insert audience contacts
      await tx.insert(audienceContacts).values(
        data.prospects.map(prospect => ({
          audienceId: audience.id,
          name: `${prospect.firstName} ${prospect.lastName}`.trim(),
          title: prospect.title,
          organizationName: prospect.companyName,
          city: prospect.city || null,
          state: prospect.state || null,
          country: prospect.country || null,
          email: prospect.email || null,
          apolloId: prospect.id?.startsWith('csv-') ? null : prospect.id,
          
          // Additional fields
          firstName: prospect.firstName || null,
          lastName: prospect.lastName || null,
          department: prospect.department || null,
          tenureMonths: (prospect.tenureMonths as number) || null,
          notableAchievement: (prospect.notableAchievement as string) || null,
          
          // Company fields - you can expand these based on your data
          companyIndustry: null,
          companyEmployeeCount: null,
          companyAnnualRevenue: null,
          companyFundingStage: null,
          companyGrowthSignals: null,
          companyRecentNews: null,
          companyTechnography: null,
          companyDescription: null,
        }))
      );
    } else if (data.totalResults && data.totalResults > 0) {
      // Create audience even if no prospects are provided (for prospect list method)
      await tx
        .insert(campaignAudiences)
        .values({
          campaignId,
          name: `Audience ${new Date().toLocaleDateString()}`,
          totalResults: data.totalResults,
          csvFileName: null,
        });
    }
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

// Save settings data
export async function saveSettings(campaignId: number, data: SettingsData) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify campaign ownership
  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, campaignId),
      eq(campaigns.userId, session.user.id)
    ),
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  await db.transaction(async (tx) => {
    // Update campaign name and description
    await tx
      .update(campaigns)
      .set({ 
        name: data.name,
        description: data.description,
        updatedAt: new Date(),
      })
      .where(eq(campaigns.id, campaignId));

    /**
     * Converts local time in a specific timezone to UTC time string.
     */
    function localTimeToUTCTimeString(time: string, timeZone: string): string {
      try {
        const date = new Date().toISOString().split("T")[0];
        const dateTimeString = `${date} ${time}`;
        const formatString = "yyyy-MM-dd HH:mm";
        const localDate = parse(dateTimeString, formatString, new Date());
        
        const utcDate = fromZonedTime(localDate, timeZone);
        
        // Extract HH:mm:ss from the UTC Date
        const hours = String(utcDate.getUTCHours()).padStart(2, '0');
        const minutes = String(utcDate.getUTCMinutes()).padStart(2, '0');
        const seconds = String(utcDate.getUTCSeconds()).padStart(2, '0');

        return `${hours}:${minutes}:${seconds}`;
      } catch (error) {
        console.error('Error converting time:', error);
        // Fallback to the original time if conversion fails
        return time.length === 5 ? `${time}:00` : time;
      }
    }

    const timeZone = data.campaignSettings.timezone;
    const sendingStartTime = localTimeToUTCTimeString(data.campaignSettings.sendingTime.startTime, timeZone);
    const sendingEndTime = localTimeToUTCTimeString(data.campaignSettings.sendingTime.endTime, timeZone);

    // Update campaign settings
    await tx
      .insert(campaignSettings)
      .values({
        campaignId,
        fromName: data.emailSettings.fromName,
        fromEmail: data.emailSettings.fromEmail,
        emailService: data.emailSettings.emailService,
        timezone: timeZone,
        trackOpens: data.campaignSettings.trackOpens,
        trackClicks: data.campaignSettings.trackClicks,
        dailySendLimit: data.campaignSettings.dailySendLimit,
        unsubscribeLink: data.campaignSettings.unsubscribeLink,
        sendingStartTime: sendingStartTime,
        sendingEndTime: sendingEndTime,
      })
      .onConflictDoUpdate({
        target: [campaignSettings.campaignId],
        set: {
          fromName: data.emailSettings.fromName,
          fromEmail: data.emailSettings.fromEmail,
          emailService: data.emailSettings.emailService,
          timezone: timeZone,
          trackOpens: data.campaignSettings.trackOpens,
          trackClicks: data.campaignSettings.trackClicks,
          dailySendLimit: data.campaignSettings.dailySendLimit,
          unsubscribeLink: data.campaignSettings.unsubscribeLink,
          sendingStartTime: sendingStartTime,
          sendingEndTime: sendingEndTime,
        },
      });

    // Update sending days
    await tx
      .insert(campaignSendingDays)
      .values({
        campaignId,
        monday: data.campaignSettings.sendingDays.monday,
        tuesday: data.campaignSettings.sendingDays.tuesday,
        wednesday: data.campaignSettings.sendingDays.wednesday,
        thursday: data.campaignSettings.sendingDays.thursday,
        friday: data.campaignSettings.sendingDays.friday,
        saturday: data.campaignSettings.sendingDays.saturday,
        sunday: data.campaignSettings.sendingDays.sunday,
      })
      .onConflictDoUpdate({
        target: [campaignSendingDays.campaignId],
        set: {
          monday: data.campaignSettings.sendingDays.monday,
          tuesday: data.campaignSettings.sendingDays.tuesday,
          wednesday: data.campaignSettings.sendingDays.wednesday,
          thursday: data.campaignSettings.sendingDays.thursday,
          friday: data.campaignSettings.sendingDays.friday,
          saturday: data.campaignSettings.sendingDays.saturday,
          sunday: data.campaignSettings.sendingDays.sunday,
        },
      });
  });

  revalidatePath(`/campaigns/${campaignId}`);
}