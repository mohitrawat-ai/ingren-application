"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { auth } from "@/lib/auth";
import { 
  campaigns,
  campaignSettings,
  campaignSendingDays,
  campaignPitch,
  pitchFeatures,
  campaignTargeting,
  targetOrganizations,
  targetJobTitles,
  campaignAudiences,
  audienceContacts
} from "@/lib/schema";
import { eq, and } from "drizzle-orm";

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
    where: eq(campaigns.userId, session.user.id),
    orderBy: [campaigns.createdAt],
    with: {
      settings: true,
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
      pitch: {
        with: {
          features: true,
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
    .set({ status })
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
  return updatedCampaign;
}

// Delete a campaign
export async function deleteCampaign(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .delete(campaigns)
    .where(
      and(
        eq(campaigns.id, id),
        eq(campaigns.userId, session.user.id)
      )
    );

  revalidatePath("/campaigns");
}

// Save targeting data
export async function saveTargeting(
  campaignId: number,
  data: {
    organizations: Array<{
      organizationId: string;
      name: string;
      industry?: string;
      employeeCount?: string;
    }>;
    jobTitles: string[];
    contacts: Array<{
      id: string;
      name: string;
      title: string;
      organization: {
        name: string;
      };
      city?: string;
      state?: string;
      country?: string;
      email?: string;
    }>;
    totalResults: number;
  }
) {
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

    // Insert new targeting data
    if (data.organizations.length) {
      await tx.insert(targetOrganizations).values(
        data.organizations.map(org => ({
          campaignId,
          organizationId: org.organizationId,
          name: org.name,
          industry: org.industry,
          employeeCount: org.employeeCount,
        }))
      );
    }

    if (data.jobTitles.length) {
      await tx.insert(targetJobTitles).values(
        data.jobTitles.map(title => ({
          campaignId,
          title,
        }))
      );
    }

    // Create campaign audience
    const [audience] = await tx
      .insert(campaignAudiences)
      .values({
        campaignId,
        name: `Audience ${new Date().toLocaleDateString()}`,
        totalResults: data.totalResults,
      })
      .returning();

    // Insert audience contacts
    if (data.contacts.length) {
      await tx.insert(audienceContacts).values(
        data.contacts.map(contact => ({
          audienceId: audience.id,
          name: contact.name,
          title: contact.title,
          organizationName: contact.organization.name,
          city: contact.city || null,
          state: contact.state || null,
          country: contact.country || null,
          email: contact.email || null,
          apolloId: contact.id || `temp-${Date.now()}`,
        }))
      );
    }
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

// Save pitch data
export async function savePitch(
  campaignId: number,
  data: {
    companyUrl: string;
    companyDescription: string;
    features: Array<{
      problem: string;
      solution: string;
    }>;
  }
) {
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
    // Create or update pitch
    const [pitch] = await tx
      .insert(campaignPitch)
      .values({
        campaignId,
        companyUrl: data.companyUrl,
        companyDescription: data.companyDescription,
      })
      .onConflictDoUpdate({
        target: [campaignPitch.campaignId],
        set: {
          companyUrl: data.companyUrl,
          companyDescription: data.companyDescription,
        },
      })
      .returning();

    // Clear existing features
    await tx.delete(pitchFeatures).where(eq(pitchFeatures.pitchId, pitch.id));

    // Insert new features
    if (data.features.length) {
      await tx.insert(pitchFeatures).values(
        data.features.map(feature => ({
          pitchId: pitch.id,
          problem: feature.problem,
          solution: feature.solution,
        }))
      );
    }
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

// Save settings data
export async function saveSettings(
  campaignId: number,
  data: {
    fromName: string;
    fromEmail: string;
    emailService: string;
    timezone: string;
    trackOpens: boolean;
    trackClicks: boolean;
    dailySendLimit: number;
    unsubscribeLink: boolean;
    sendingStartTime: string;
    sendingEndTime: string;
    sendingDays: {
      monday: boolean;
      tuesday: boolean;
      wednesday: boolean;
      thursday: boolean;
      friday: boolean;
      saturday: boolean;
      sunday: boolean;
    };
    name: string;
  }
) {
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
    // Update campaign name
    await tx
      .update(campaigns)
      .set({ name: data.name })
      .where(eq(campaigns.id, campaignId));

    // Update campaign settings
    await tx
      .insert(campaignSettings)
      .values({
        campaignId,
        fromName: data.fromName,
        fromEmail: data.fromEmail,
        emailService: data.emailService,
        timezone: data.timezone,
        trackOpens: data.trackOpens,
        trackClicks: data.trackClicks,
        dailySendLimit: data.dailySendLimit,
        unsubscribeLink: data.unsubscribeLink,
        sendingStartTime: data.sendingStartTime,
        sendingEndTime: data.sendingEndTime,
      })
      .onConflictDoUpdate({
        target: [campaignSettings.campaignId],
        set: {
          fromName: data.fromName,
          fromEmail: data.fromEmail,
          emailService: data.emailService,
          timezone: data.timezone,
          trackOpens: data.trackOpens,
          trackClicks: data.trackClicks,
          dailySendLimit: data.dailySendLimit,
          unsubscribeLink: data.unsubscribeLink,
          sendingStartTime: data.sendingStartTime,
          sendingEndTime: data.sendingEndTime,
        },
      });

    // Update sending days
    await tx
      .insert(campaignSendingDays)
      .values({
        campaignId,
        monday: data.sendingDays.monday,
        tuesday: data.sendingDays.tuesday,
        wednesday: data.sendingDays.wednesday,
        thursday: data.sendingDays.thursday,
        friday: data.sendingDays.friday,
        saturday: data.sendingDays.saturday,
        sunday: data.sendingDays.sunday,
      })
      .onConflictDoUpdate({
        target: [campaignSendingDays.campaignId],
        set: {
          monday: data.sendingDays.monday,
          tuesday: data.sendingDays.tuesday,
          wednesday: data.sendingDays.wednesday,
          thursday: data.sendingDays.thursday,
          friday: data.sendingDays.friday,
          saturday: data.sendingDays.saturday,
          sunday: data.sendingDays.sunday,
        },
      });
  });

  revalidatePath(`/campaigns/${campaignId}`);
}