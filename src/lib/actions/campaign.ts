"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
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
  audienceContacts,
  campaignOutreach,
  ctaOptions,
  personalizationSources,
  campaignEnrollments,
  campaignEnrolledContacts,
  targetLists
} from "@/lib/schema";
import { eq, and, ne, sql } from "drizzle-orm";
import { fromZonedTime } from 'date-fns-tz';
import { parse } from 'date-fns';
import { 
  OutreachFormData, 
  SettingsFormData, 
  PitchFormData,
  WorkflowFormData,
  TargetingFormData
} from "@/types";

const db = await dbClient();

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
      outreach: {
        with: {
          ctaOptions: true,
          personalizationSources: true,
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

  // Rather than deleting the campaign, we can just update the status to "deleted"
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

// Save targeting data (Legacy - for backward compatibility with existing audience system)
export async function saveTargeting(
  campaignId: number,
  data: TargetingFormData
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
    if (data.organizations?.length) {
      await tx.insert(targetOrganizations).values(
        data.organizations.map(org => ({
          campaignId,
          organizationId: org.id,
          name: org.name,
          industry: org.industry || null,
          employeeCount: org.employeeCount || null,
        }))
      );
    }

    if (data.jobTitles?.length) {
      await tx.insert(targetJobTitles).values(
        data.jobTitles.map(title => ({
          campaignId,
          title,
        }))
      );
    }

    // Create campaign audience (Legacy system)
    const [audience] = await tx
      .insert(campaignAudiences)
      .values({
        campaignId,
        name: `Audience ${new Date().toLocaleDateString()}`,
        totalResults: data.totalResults || 0,
        csvFileName: data.csvFileName || null,
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
          apolloId: contact.id?.startsWith('csv-') ? null : contact.id,
          // Additional prospect fields
          firstName: contact.first_name as string || null,
          lastName: contact.last_name as string || null,
          department: contact.department as string|| null,
          tenureMonths: contact.tenure_months as number|| null,
          notableAchievement: contact.notable_achievement as string|| null,
          // Additional company fields
          companyIndustry: contact.company_industry as string|| null,
          companyEmployeeCount: contact.company_employee_count as string|| null,
          companyAnnualRevenue: contact.company_annual_revenue as string|| null,
          companyFundingStage: contact.company_funding_stage as string|| null,
          companyGrowthSignals: contact.company_growth_signals as string|| null,
          companyRecentNews: contact.company_recent_news as string|| null,
          companyTechnography: contact.company_technography as string|| null,
          companyDescription: contact.company_description as string|| null,
        }))
      );
    }
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

// New function to create campaign enrollment from prospect list
export async function createCampaignEnrollment(
  campaignId: number,
  prospectListId: number
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

  // Get the prospect list with contacts
  const prospectList = await db.query.targetLists.findFirst({
    where: and(
      eq(targetLists.id, prospectListId),
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'prospect')
    ),
    with: {
      contacts: true,
    },
  });

  if (!prospectList) {
    throw new Error("Prospect list not found");
  }

  // Create enrollment with data snapshot
  await db.transaction(async (tx) => {
    // Create the enrollment record
    const [enrollment] = await tx
      .insert(campaignEnrollments)
      .values({
        campaignId,
        sourceTargetListId: prospectListId,
        enrollmentDate: new Date(),
        status: 'active',
        snapshotData: {
          listName: prospectList.name,
          listDescription: prospectList.description,
          enrollmentDate: new Date().toISOString(),
          contactCount: prospectList.contacts.length,
        },
      })
      .returning();

    // Insert enrolled contacts with snapshot data
    if (prospectList.contacts.length > 0) {
      await tx.insert(campaignEnrolledContacts).values(
        prospectList.contacts.map(contact => ({
          campaignEnrollmentId: enrollment.id,
          apolloProspectId: contact.apolloProspectId,
          contactSnapshot: {
            name: contact.name,
            email: contact.email,
            title: contact.title,
            companyName: contact.companyName,
            firstName: contact.firstName,
            lastName: contact.lastName,
            department: contact.department,
            city: contact.city,
            state: contact.state,
            country: contact.country,
            additionalData: contact.additionalData,
          },
          emailStatus: 'pending',
        }))
      );
    }

    // Mark the prospect list as used in campaigns
    await tx
      .update(targetLists)
      .set({
        usedInCampaigns: true,
        campaignCount: sql`campaign_count + 1`,
        updatedAt: new Date(),
      })
      .where(eq(targetLists.id, prospectListId));
  });

  revalidatePath(`/campaigns/${campaignId}`);
  revalidatePath("/prospect-lists");
  revalidatePath(`/prospect-lists/${prospectListId}`);
}

// Save pitch data
export async function savePitch(
  campaignId: number,
  data: PitchFormData
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
        companyUrl: data.url,
        companyDescription: data.description,
      })
      .onConflictDoUpdate({
        target: [campaignPitch.campaignId],
        set: {
          companyUrl: data.url,
          companyDescription: data.description,
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

// Save outreach data
export async function saveOutreach(
  campaignId: number,
  data: OutreachFormData
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
    // Create or update outreach
    await tx
      .insert(campaignOutreach)
      .values({
        campaignId,
        messageTone: data.messageTone,
        selectedCta: data.selectedCta,
      })
      .onConflictDoUpdate({
        target: [campaignOutreach.campaignId],
        set: {
          messageTone: data.messageTone,
          selectedCta: data.selectedCta,
        },
      });

    // Clear existing CTA options and personalization sources
    await tx.delete(ctaOptions).where(eq(ctaOptions.campaignId, campaignId));
    await tx.delete(personalizationSources).where(eq(personalizationSources.campaignId, campaignId));

    // Insert new CTA options
    if (data.ctaOptions.length) {
      await tx.insert(ctaOptions).values(
        data.ctaOptions.map(option => ({
          campaignId,
          label: option.label,
          sourceId: option.id,
        }))
      );
    }

    // Insert new personalization sources
    if (data.personalizationSources.length) {
      await tx.insert(personalizationSources).values(
        data.personalizationSources.map(source => ({
          campaignId,
          label: source.label,
          enabled: source.enabled ? 1 : 0,
          sourceId: source.id,
        }))
      );
    }
  });

  revalidatePath(`/campaigns/${campaignId}`);
}

// Save workflow data
export async function saveWorkflow(
  campaignId: number,
  data: WorkflowFormData
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

  // TODO : For now, we'll store workflow data in the campaign metadata
  // In the future, this could be expanded to a dedicated workflow table
  console.log(data);

  revalidatePath(`/campaigns/${campaignId}`);
}

// Save settings data
export async function saveSettings(
  campaignId: number,
  data: SettingsFormData
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
      .set({ 
        name: data.name,
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

// Get campaign enrollments
export async function getCampaignEnrollments(campaignId: number) {
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

  const enrollments = await db.query.campaignEnrollments.findMany({
    where: eq(campaignEnrollments.campaignId, campaignId),
    with: {
      enrolledContacts: true,
      sourceTargetList: true,
    },
  });

  return enrollments;
}

// Update enrollment status
export async function updateEnrollmentStatus(
  enrollmentId: number,
  status: 'active' | 'paused' | 'completed'
) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(campaignEnrollments)
    .set({ 
      status,
    })
    .where(eq(campaignEnrollments.id, enrollmentId));

  revalidatePath("/campaigns");
}

// Get a campaign with its enrollments and enrolled contacts
export async function getCampaignWithEnrollments(id: number) {
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
      outreach: {
        with: {
          ctaOptions: true,
          personalizationSources: true,
        },
      },
      // New enrollment data
      enrollments: {
        with: {
          enrolledContacts: true,
          sourceTargetList: {
            with: {
              contacts: true,
            },
          },
        },
      },
      // Legacy audience data for backward compatibility
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