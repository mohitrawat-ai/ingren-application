// src/lib/actions/campaignEnrollment.ts - SIMPLIFIED with unified structure
"use server";

import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
    campaignEnrollments,
    campaigns
} from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

const db = await dbClient();

export interface CreateCampaignEnrollmentParams {
    campaignId: number;
    profileListId: number;
}

export interface CampaignEnrollmentDetails {
    id: number;
    campaignId: number;
    sourceTargetListId: number;
    sourceTargetListName: string;
    enrollmentDate: Date;
    status: string;
    profileCount: number;
    snapshotData: Record<string, unknown>;
}

// Get all enrollments for a campaign
export async function getCampaignEnrollments(campaignId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const enrollments = await db.query.campaignEnrollments.findMany({
        where: eq(campaignEnrollments.campaignId, campaignId),
        with: {
            enrolledProfiles: {
                with: {
                    operations: true,
                },
            },
            sourceTargetList: true,
        },
        orderBy: [desc(campaignEnrollments.enrollmentDate)],
    });

    return enrollments.map(enrollment => ({
        id: enrollment.id,
        campaignId: enrollment.campaignId,
        sourceTargetListId: enrollment.sourceTargetListId,
        sourceTargetListName: enrollment.sourceTargetList?.name || 'Unknown List',
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status,
        profileCount: enrollment.enrolledProfiles.length,
        snapshotData: enrollment.snapshotData as Record<string, unknown>,
    }));
}

// Get enrollment details with profiles
export async function getCampaignEnrollmentDetails(enrollmentId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const enrollment = await db.query.campaignEnrollments.findFirst({
        where: eq(campaignEnrollments.id, enrollmentId),
        with: {
            enrolledProfiles: {
                with: {
                    operations: true,
                },
            },
            sourceTargetList: true,
            campaign: true,
        },
    });

    if (!enrollment) {
        throw new Error("Enrollment not found");
    }

    // Verify ownership through campaign
    if (enrollment.campaign.userId !== session.user.id) {
        throw new Error("Unauthorized");
    }

    return {
        ...enrollment,
        sourceTargetListName: enrollment.sourceTargetList?.name || 'Unknown List',
        profileCount: enrollment.enrolledProfiles.length,
    };
}

// Get campaign enrollment statistics
export async function getCampaignEnrollmentStats(campaignId: number) {
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
            sourceTargetList: true,
        },
    });

    // Calculate overall stats from operations data
    const totalProfiles = enrollments.reduce((sum, enrollment) =>
        sum + enrollment.enrolledProfiles.length, 0
    );

    const statusCounts = enrollments.reduce((acc, enrollment) => {
        enrollment.enrolledProfiles.forEach(profile => {
            const emailStatus = profile.operations?.emailStatus;
            if (emailStatus) {
                acc[emailStatus] = (acc[emailStatus] || 0) + 1;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    const responseCounts = enrollments.reduce((acc, enrollment) => {
        enrollment.enrolledProfiles.forEach(profile => {
            const responseStatus = profile.operations?.responseStatus;
            if (responseStatus) {
                acc[responseStatus] = (acc[responseStatus] || 0) + 1;
            }
        });
        return acc;
    }, {} as Record<string, number>);

    return {
        totalEnrollments: enrollments.length,
        totalProfiles,
        sourceListNames: enrollments.map(e => e.sourceTargetList?.name || 'Unknown').filter(Boolean),
        emailStatusBreakdown: statusCounts,
        responseStatusBreakdown: responseCounts,
        enrollmentDates: enrollments.map(e => e.enrollmentDate),
    };
}