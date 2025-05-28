// src/lib/actions/campaign.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { takeProfileSnapshot } from "@/lib/utils/profile-snapshot";
import {
  campaigns,
  campaignSettings,
  campaignSendingDays,
  campaignEnrollments,
  targetLists,
} from "@/lib/schema";
import { eq, and, ne } from "drizzle-orm";
import { fromZonedTime } from 'date-fns-tz';
import { parse } from 'date-fns';
import type { DatabaseTransaction } from "@/types/database";
import { SettingsFormData } from "@/types";
import { requireAuth } from "@/lib/utils/auth-guard";

const db = await dbClient();
// Simple type definitions for this module
type TargetingMethod = 'profile_list';

interface TargetingData {
  method: TargetingMethod;
  profileListId?: number;
  totalResults?: number;
}


// Create a new campaign
export async function createCampaign(name: string) {
  const { userId } = await requireAuth();

  const [campaign] = await db
    .insert(campaigns)
    .values({
      name,
      userId,
      status: "draft",
    })
    .returning();

  revalidatePath("/campaigns");
  return campaign;
}

// Get all campaigns for the current user
export async function getCampaigns() {
  const { userId } = await requireAuth();

  const campaignsList = await db.query.campaigns.findMany({
    where: and(
      eq(campaigns.userId, userId),
      ne(campaigns.status, "deleted")
    ),
    orderBy: [campaigns.createdAt],
    with: {
      settings: true,
      enrollments: {
        with: {
          enrolledProfiles: true, // Updated from enrolledContacts
          sourceTargetList: true,
        },
      },
    },
  });

  // Transform campaigns to include enrollment stats
  const campaignsWithStats = campaignsList.map(campaign => {
    const totalProfiles = campaign.enrollments.reduce(
      (sum, enrollment) => sum + enrollment.enrolledProfiles.length, // Updated
      0
    );

    const sourceListNames = campaign.enrollments.map(
      enrollment => enrollment.sourceTargetList?.name || 'Unknown List'
    );

    return {
      ...campaign,
      isNewSystem: true,
      totalContacts: totalProfiles, // Keep as totalContacts for compatibility
      totalProfiles, // Add explicit totalProfiles
      enrollmentCount: campaign.enrollments.length,
      sourceListNames,
      statistics: {
        sentEmails: Math.floor(Math.random() * 2000),
        openRate: `${(Math.random() * 40 + 10).toFixed(1)}%`,
        clickRate: `${(Math.random() * 20 + 5).toFixed(1)}%`
      }
    };
  });

  return campaignsWithStats;
}

// Get a single campaign by ID
export async function getCampaign(id: number) {
  const { userId } = await requireAuth();


  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, id),
      eq(campaigns.userId, userId)
    ),
    with: {
      settings: true,
      sendingDays: true,
      enrollments: {
        with: {
          enrolledProfiles: true, // Updated from enrolledContacts
          sourceTargetList: true,
        },
      },
    },
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  // Add enrollment stats
  const totalProfiles = campaign.enrollments.reduce(
    (sum, enrollment) => sum + enrollment.enrolledProfiles.length, // Updated
    0
  );

  const sourceListNames = campaign.enrollments.map(
    enrollment => enrollment.sourceTargetList?.name || 'Unknown List'
  );

  return {
    ...campaign,
    isNewSystem: true,
    totalContacts: totalProfiles, // Keep for compatibility
    totalProfiles, // Add explicit field
    sourceListNames,
    enrollmentStats: {
      totalContacts: totalProfiles, // Keep for compatibility
      totalProfiles,
      sourceListNames,
      emailStatusBreakdown: {}, // TODO: Calculate from enrolled profiles
    },
  };
}

// Update campaign status (e.g., draft, active, paused)
export async function updateCampaignStatus(id: number, status: string) {
  const { userId } = await requireAuth();


  const [updatedCampaign] = await db
    .update(campaigns)
    .set({
      status,
      updatedAt: new Date()
    })
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.userId, userId)
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
  const { userId } = await requireAuth();


  await db
    .update(campaigns)
    .set({ status: "deleted" })
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.userId, userId)
      )
    );

  revalidatePath("/campaigns");
}

export async function saveTargeting(campaignId: number, data: TargetingData) {
  const { userId } = await requireAuth();

  // Verify campaign ownership
  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, campaignId),
      eq(campaigns.userId, userId)
    ),
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  await db.transaction(async (tx) => {
    // Clear any existing enrollments for this campaign
    await tx.delete(campaignEnrollments).where(eq(campaignEnrollments.campaignId, campaignId));

    if (data.method === 'profile_list' && data.profileListId) {
      // Create enrollment from existing profile list
      await createEnrollmentFromProfileList(tx, campaignId, data.profileListId);
    }
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

// Helper: Create enrollment from profile list
async function createEnrollmentFromProfileList(tx: DatabaseTransaction, campaignId: number, profileListId: number) {
  // Get the profile list with contacts (profiles)
  const profileList = await tx.query.targetLists.findFirst({
    where: and(
      eq(targetLists.id, profileListId),
      eq(targetLists.type, 'profile') // Ensure it's a profile list
    ),
    with: {
      profiles: true, // These are actually profiles stored in the contacts table
    },
  });

  if (!profileList || profileList.profiles.length === 0) {
    throw new Error("Profile list not found or empty");
  }

  // Create enrollment
  const [enrollment] = await tx
    .insert(campaignEnrollments)
    .values({
      campaignId,
      sourceTargetListId: profileListId,
      enrollmentDate: new Date(),
      status: 'active',
      snapshotData: {
        listName: profileList.name,
        listDescription: profileList.description,
        enrollmentTime: new Date().toISOString(),
        profileCount: profileList.profiles.length, // Updated
      },
    })
    .returning();

  // Copy all profiles to enrolled profiles with full fields
  // await tx.insert(campaignEnrollmentProfiles).values(
  //   profileList.profiles.map(profile => ({
  //     campaignEnrollmentId: enrollment.id,
  //     ...omit(profile, ['id', 'targetListId', 'apolloProspectId', 'additionalData', 'createdAt', 'lastSynced'])
  //   }))
  // );

  await takeProfileSnapshot(tx, enrollment.id, profileListId);


  // Mark profile list as used in campaigns
  await tx
    .update(targetLists)
    .set({
      usedInCampaigns: true,
      campaignCount: profileList.campaignCount + 1,
      updatedAt: new Date()
    })
    .where(eq(targetLists.id, profileListId));
}


// Save settings data (UPDATED for new system)
export async function saveSettings(campaignId: number, data: SettingsFormData) {
  const { userId } = await requireAuth();


  // Verify campaign ownership
  const campaign = await db.query.campaigns.findFirst({
    where: and(
      eq(campaigns.id, campaignId),
      eq(campaigns.userId, userId)
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
    const settingsData = {
      fromName: data.emailSettings.fromName,
      fromEmail: data.emailSettings.fromEmail,
      emailService: data.emailSettings.emailService,
      timezone: timeZone,
      dailySendLimit: data.campaignSettings.dailySendLimit,
      sendingStartTime: sendingStartTime,
      sendingEndTime: sendingEndTime,
      tone: data.campaignSettings.tone,          
      cta: data.campaignSettings.cta,
    }
    const dayTimeData = {
      monday: data.campaignSettings.sendingDays.monday,
      tuesday: data.campaignSettings.sendingDays.tuesday,
      wednesday: data.campaignSettings.sendingDays.wednesday,
      thursday: data.campaignSettings.sendingDays.thursday,
      friday: data.campaignSettings.sendingDays.friday,
      saturday: data.campaignSettings.sendingDays.saturday,
      sunday: data.campaignSettings.sendingDays.sunday,
    }

    // Update campaign settings (now includes tone and cta)
    await tx
      .insert(campaignSettings)
      .values({
        campaignId,
        ...settingsData
      })
      .onConflictDoUpdate({
        target: [campaignSettings.campaignId],
        set: {
          ...settingsData
        },
      });

    // Update sending days (unchanged)
    await tx
      .insert(campaignSendingDays)
      .values({
        campaignId,
        ...dayTimeData
      })
      .onConflictDoUpdate({
        target: [campaignSendingDays.campaignId],
        set: {
          ...dayTimeData
        },
      });
  });

  revalidatePath(`/campaigns/${campaignId}`);
}