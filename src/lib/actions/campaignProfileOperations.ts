// src/lib/actions/campaignProfileOperations.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
    campaignProfileOperations,
    campaignEnrollmentProfiles,
    campaignEnrollments,
    campaigns
} from "@/lib/schema";
import { eq, and, sql } from "drizzle-orm";

const db = await dbClient();

// Update email status for a profile
export async function updateProfileEmailStatus(
    enrollmentProfileId: number,
    status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership through campaign enrollment
        const profileWithCampaign = await db.query.campaignEnrollmentProfiles.findFirst({
            where: eq(campaignEnrollmentProfiles.id, enrollmentProfileId),
            with: {
                enrollment: {
                    with: {
                        campaign: true,
                    },
                },
            },
        });

        if (!profileWithCampaign || profileWithCampaign.enrollment.campaign.userId !== session.user.id) {
            throw new Error("Profile not found or unauthorized");
        }

        // Update operational status
        await db
            .update(campaignProfileOperations)
            .set({
                emailStatus: status,
                lastEmailSent: status === 'sent' ? new Date() : undefined,
                emailsSentCount: status === 'sent' ? sql`emails_sent_count + 1` : undefined,
                responseStatus: ['replied', 'clicked'].includes(status) ? 'engaged' :
                    status === 'bounced' ? 'bounced' : 'none',
                firstResponseDate: ['replied', 'clicked'].includes(status) ? sql`COALESCE(first_response_date, ${new Date()})` : undefined,
                lastResponseDate: ['replied', 'clicked'].includes(status) ? new Date() : undefined,
                openCount: status === 'opened' ? sql`open_count + 1` : undefined,
                clickCount: status === 'clicked' ? sql`click_count + 1` : undefined,
                replyCount: status === 'replied' ? sql`reply_count + 1` : undefined,
                lastContactAttempt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(campaignProfileOperations.enrollmentProfileId, enrollmentProfileId));

        revalidatePath(`/campaigns/${profileWithCampaign.enrollment.campaign.id}`);
    } catch (error) {
        console.error("Error updating profile email status:", error);
        throw error;
    }
}

// Pause a profile in the campaign
export async function pauseProfileInCampaign(
    enrollmentProfileId: number,
    reason?: string
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership
        const profileWithCampaign = await db.query.campaignEnrollmentProfiles.findFirst({
            where: eq(campaignEnrollmentProfiles.id, enrollmentProfileId),
            with: {
                enrollment: {
                    with: {
                        campaign: true,
                    },
                },
            },
        });

        if (!profileWithCampaign || profileWithCampaign.enrollment.campaign.userId !== session.user.id) {
            throw new Error("Profile not found or unauthorized");
        }

        await db
            .update(campaignProfileOperations)
            .set({
                isActive: 'paused',
                pausedAt: new Date(),
                pauseReason: reason,
                updatedAt: new Date(),
            })
            .where(eq(campaignProfileOperations.enrollmentProfileId, enrollmentProfileId));

        revalidatePath(`/campaigns/${profileWithCampaign.enrollment.campaign.id}`);
    } catch (error) {
        console.error("Error pausing profile:", error);
        throw error;
    }
}

// Resume a profile in the campaign
export async function resumeProfileInCampaign(enrollmentProfileId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership
        const profileWithCampaign = await db.query.campaignEnrollmentProfiles.findFirst({
            where: eq(campaignEnrollmentProfiles.id, enrollmentProfileId),
            with: {
                enrollment: {
                    with: {
                        campaign: true,
                    },
                },
            },
        });

        if (!profileWithCampaign || profileWithCampaign.enrollment.campaign.userId !== session.user.id) {
            throw new Error("Profile not found or unauthorized");
        }

        await db
            .update(campaignProfileOperations)
            .set({
                isActive: 'true',
                pausedAt: null,
                pauseReason: null,
                updatedAt: new Date(),
            })
            .where(eq(campaignProfileOperations.enrollmentProfileId, enrollmentProfileId));

        revalidatePath(`/campaigns/${profileWithCampaign.enrollment.campaign.id}`);
    } catch (error) {
        console.error("Error resuming profile:", error);
        throw error;
    }
}

// Mark profile as unsubscribed
export async function unsubscribeProfile(enrollmentProfileId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership
        const profileWithCampaign = await db.query.campaignEnrollmentProfiles.findFirst({
            where: eq(campaignEnrollmentProfiles.id, enrollmentProfileId),
            with: {
                enrollment: {
                    with: {
                        campaign: true,
                    },
                },
            },
        });

        if (!profileWithCampaign || profileWithCampaign.enrollment.campaign.userId !== session.user.id) {
            throw new Error("Profile not found or unauthorized");
        }

        await db
            .update(campaignProfileOperations)
            .set({
                isActive: 'unsubscribed',
                responseStatus: 'unsubscribed',
                unsubscribedAt: new Date(),
                updatedAt: new Date(),
            })
            .where(eq(campaignProfileOperations.enrollmentProfileId, enrollmentProfileId));

        revalidatePath(`/campaigns/${profileWithCampaign.enrollment.campaign.id}`);
    } catch (error) {
        console.error("Error unsubscribing profile:", error);
        throw error;
    }
}

// Schedule next contact for a profile
export async function scheduleNextContact(
    enrollmentProfileId: number,
    nextContactDate: Date,
    sequenceStep?: number
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership
        const profileWithCampaign = await db.query.campaignEnrollmentProfiles.findFirst({
            where: eq(campaignEnrollmentProfiles.id, enrollmentProfileId),
            with: {
                enrollment: {
                    with: {
                        campaign: true,
                    },
                },
            },
        });

        if (!profileWithCampaign || profileWithCampaign.enrollment.campaign.userId !== session.user.id) {
            throw new Error("Profile not found or unauthorized");
        }

        await db
            .update(campaignProfileOperations)
            .set({
                nextScheduledContact: nextContactDate,
                currentSequenceStep: sequenceStep || db.sql`current_sequence_step + 1`,
                updatedAt: new Date(),
            })
            .where(eq(campaignProfileOperations.enrollmentProfileId, enrollmentProfileId));

        revalidatePath(`/campaigns/${profileWithCampaign.enrollment.campaign.id}`);
    } catch (error) {
        console.error("Error scheduling next contact:", error);
        throw error;
    }
}

// Add notes to a profile
export async function addProfileNotes(
    enrollmentProfileId: number,
    notes: string
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership
        const profileWithCampaign = await db.query.campaignEnrollmentProfiles.findFirst({
            where: eq(campaignEnrollmentProfiles.id, enrollmentProfileId),
            with: {
                enrollment: {
                    with: {
                        campaign: true,
                    },
                },
            },
        });

        if (!profileWithCampaign || profileWithCampaign.enrollment.campaign.userId !== session.user.id) {
            throw new Error("Profile not found or unauthorized");
        }

        await db
            .update(campaignProfileOperations)
            .set({
                notes,
                updatedAt: new Date(),
            })
            .where(eq(campaignProfileOperations.enrollmentProfileId, enrollmentProfileId));

        revalidatePath(`/campaigns/${profileWithCampaign.enrollment.campaign.id}`);
    } catch (error) {
        console.error("Error adding profile notes:", error);
        throw error;
    }
}

// Get profiles that need to be contacted
export async function getProfilesDueForContact(campaignId: number) {
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
        throw new Error("Campaign not found or unauthorized");
    }

    // Get enrollments with profiles that are due for contact
    const enrollments = await db.query.campaignEnrollments.findMany({
        where: eq(campaignEnrollments.campaignId, campaignId),
        with: {
            enrolledProfiles: {
                with: {
                    operations: true,
                },
            },
        },
    });

    const now = new Date();
    const dueProfiles = enrollments.flatMap(enrollment =>
        enrollment.enrolledProfiles.filter(profile => {
            const ops = profile.operations;
            return ops && 
                   ops.isActive === 'true' && 
                   ops.nextScheduledContact && 
                   new Date(ops.nextScheduledContact) <= now;
        }).map(profile => ({
            ...profile,
            enrollmentId: enrollment.id,
        }))
    );

    return dueProfiles;
}

// Get campaign performance statistics
export async function getCampaignPerformanceStats(campaignId: number) {
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
        throw new Error("Campaign not found or unauthorized");
    }

    const enrollments = await db.query.campaignEnrollments.findMany({
        where: eq(campaignEnrollments.campaignId, campaignId),
        with: {
            enrolledProfiles: {
                with: {
                    operations: true,
                },
            },
        },
    });

    const allOperations = enrollments.flatMap(enrollment =>
        enrollment.enrolledProfiles.map(profile => profile.operations).filter(Boolean)
    );

    const stats = {
        totalProfiles: allOperations.length,
        activeProfiles: allOperations.filter(op => op?.isActive === 'true').length,
        pausedProfiles: allOperations.filter(op => op?.isActive === 'paused').length,
        unsubscribedProfiles: allOperations.filter(op => op?.isActive === 'unsubscribed').length,
        
        emailsSent: allOperations.reduce((sum, op) => sum + (op?.emailsSentCount || 0), 0),
        totalOpens: allOperations.reduce((sum, op) => sum + (op?.openCount || 0), 0),
        totalClicks: allOperations.reduce((sum, op) => sum + (op?.clickCount || 0), 0),
        totalReplies: allOperations.reduce((sum, op) => sum + (op?.replyCount || 0), 0),
        
        emailStatusBreakdown: allOperations.reduce((acc, op) => {
            if (op?.emailStatus) {
                acc[op.emailStatus] = (acc[op.emailStatus] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>),
        
        responseStatusBreakdown: allOperations.reduce((acc, op) => {
            if (op?.responseStatus) {
                acc[op.responseStatus] = (acc[op.responseStatus] || 0) + 1;
            }
            return acc;
        }, {} as Record<string, number>),
    };

    return stats;
}