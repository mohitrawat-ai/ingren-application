// src/lib/actions/campaignEnrollment.ts - SIMPLIFIED with unified structure
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
    campaignEnrollments,
    campaignEnrollmentProfiles,
    campaignProfileOperations,
    targetLists,
    campaigns
} from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { markProfileListAsUsedInCampaigns } from "./profileList";

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

// Create a new campaign enrollment from a profile list
export async function createCampaignEnrollment(data: CreateCampaignEnrollmentParams) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        return await db.transaction(async (tx) => {
            // Verify campaign ownership
            const campaign = await tx.query.campaigns.findFirst({
                where: and(
                    eq(campaigns.id, data.campaignId),
                    eq(campaigns.userId, session.user!.id)
                ),
            });

            if (!campaign) {
                throw new Error("Campaign not found or unauthorized");
            }

            // Verify profile list ownership and get profiles
            const profileList = await tx.query.targetLists.findFirst({
                where: and(
                    eq(targetLists.id, data.profileListId),
                    eq(targetLists.userId, session.user!.id),
                    eq(targetLists.type, 'profile')
                ),
                with: {
                    profiles: true,
                },
            });

            if (!profileList) {
                throw new Error("Profile list not found or unauthorized");
            }

            if (profileList.profiles.length === 0) {
                throw new Error("Cannot enroll empty profile list");
            }

            // Create the enrollment record
            const [enrollment] = await tx
                .insert(campaignEnrollments)
                .values({
                    campaignId: data.campaignId,
                    sourceTargetListId: data.profileListId,
                    enrollmentDate: new Date(),
                    status: 'active',
                    snapshotData: {
                        listName: profileList.name,
                        listDescription: profileList.description,
                        enrollmentTime: new Date().toISOString(),
                        profileCount: profileList.profiles.length,
                        metadata: profileList.sharedWith?.[0] ? JSON.parse(profileList.sharedWith[0]) : null,
                    },
                })
                .returning();

            // SIMPLIFIED: Direct copy since structures are identical
            if (profileList.profiles.length > 0) {
                const insertedProfiles = await tx.insert(campaignEnrollmentProfiles).values(
                    profileList.profiles.map(profile => ({
                        campaignEnrollmentId: enrollment.id,
                        
                        // DIRECT MAPPING - no transformation needed!
                        profileId: profile.profileId,
                        firstName: profile.firstName,
                        lastName: profile.lastName,
                        fullName: profile.fullName,
                        jobTitle: profile.jobTitle,
                        department: profile.department,
                        managementLevel: profile.managementLevel,
                        seniorityLevel: profile.seniorityLevel,
                        isDecisionMaker: profile.isDecisionMaker,
                        email: profile.email,
                        phone: profile.phone,
                        linkedinUrl: profile.linkedinUrl,
                        city: profile.city,
                        state: profile.state,
                        country: profile.country,
                        companyId: profile.companyId,
                        companyName: profile.companyName,
                        companyIndustry: profile.companyIndustry,
                        companySize: profile.companySize,
                        companySizeRange: profile.companySizeRange,
                        companyRevenue: profile.companyRevenue,
                        companyDescription: profile.companyDescription,
                        companyDomain: profile.companyDomain,
                        companyFounded: profile.companyFounded,
                        tenureMonths: profile.tenureMonths,
                        recentJobChange: profile.recentJobChange,
                        confidence: profile.confidence,
                        dataSource: profile.dataSource,
                        lastEnriched: profile.lastEnriched,
                    }))
                ).returning();

                // Create operational records (trigger will handle this automatically)
                // But we can also do it manually for clarity:
                await tx.insert(campaignProfileOperations).values(
                    insertedProfiles.map(profile => ({
                        enrollmentProfileId: profile.id,
                    }))
                );
            }

            // Mark the profile list as used in campaigns
            await markProfileListAsUsedInCampaigns(data.profileListId);

            revalidatePath(`/campaigns/${data.campaignId}`);
            revalidatePath("/campaigns");
            revalidatePath(`/profile-lists/${data.profileListId}`);

            return enrollment;
        });
    } catch (error) {
        console.error("Error creating campaign enrollment:", error);
        throw error;
    }
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