// src/lib/actions/campaignEnrollment.ts - Updated for profiles
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
    campaignEnrollments,
    campaignEnrollmentProfiles,
    campaignProfileOperations, // Added
    targetLists,
    campaigns
} from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { markProfileListAsUsedInCampaigns } from "@/lib/actions/profileList";

const db = await dbClient();

export interface CreateCampaignEnrollmentParams {
    campaignId: number;
    profileListId: number; // Updated from prospectListId
}

export interface CampaignEnrollmentDetails {
    id: number;
    campaignId: number;
    sourceTargetListId: number;
    sourceTargetListName: string;
    enrollmentDate: Date;
    status: string;
    profileCount: number; // Updated from contactCount
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
                    eq(campaigns.userId, session.user!.id || "0")
                ),
            });

            if (!campaign) {
                throw new Error("Campaign not found or unauthorized");
            }

            // Verify profile list ownership and get profiles
            const profileList = await tx.query.targetLists.findFirst({
                where: and(
                    eq(targetLists.id, data.profileListId),
                    eq(targetLists.userId, session.user!.id || "0"),
                    eq(targetLists.type, 'profile') // Updated to profile type
                ),
                with: {
                    contacts: true, // This contains the profile data
                },
            });

            if (!profileList) {
                throw new Error("Profile list not found or unauthorized");
            }

            if (profileList.contacts.length === 0) {
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
                        profileCount: profileList.contacts.length, // Updated
                        metadata: profileList.sharedWith?.[0] ? JSON.parse(profileList.sharedWith[0]) : null,
                    },
                })
                .returning();

            // Create enrolled profile records (snapshots) - NO operational data
            if (profileList.contacts.length > 0) {
                const insertedProfiles = await tx.insert(campaignEnrollmentProfiles).values(
                    profileList.contacts.map(profile => {
                        // Parse additional data to get full profile info
                        const additionalData = profile.additionalData as any || {};
                        
                        return {
                            campaignEnrollmentId: enrollment.id,
                            profileId: profile.apolloProspectId || profile.id?.toString() || '', // Use profile ID
                            
                            // Basic identity
                            firstName: profile.firstName || additionalData.firstName || '',
                            lastName: profile.lastName || additionalData.lastName || '',
                            fullName: profile.name || additionalData.fullName || `${profile.firstName || ''} ${profile.lastName || ''}`.trim(),
                            
                            // Professional role
                            jobTitle: profile.title || additionalData.jobTitle || '',
                            department: profile.department || additionalData.department || null,
                            managementLevel: additionalData.managementLevel,
                            seniorityLevel: additionalData.seniorityLevel,
                            isDecisionMaker: additionalData.isDecisionMaker || false,
                            
                            // Contact info
                            email: profile.email || additionalData.email || null,
                            phone: additionalData.phone || null,
                            linkedinUrl: additionalData.linkedinUrl || null,
                            
                            // Location
                            city: profile.city || additionalData.city || '',
                            state: profile.state || additionalData.state || '',
                            country: profile.country || additionalData.country || '',
                            
                            // Company context
                            companyId: additionalData.company?.id || null,
                            companyName: profile.companyName || additionalData.company?.name || '',
                            companyIndustry: additionalData.company?.industry || null,
                            companySize: additionalData.company?.employeeCount || null,
                            companySizeRange: additionalData.company?.employeeCountRange || null,
                            companyRevenue: additionalData.company?.revenue || null,
                            companyDescription: additionalData.company?.description || null,
                            companyDomain: additionalData.company?.domain || null,
                            companyFounded: additionalData.company?.foundedYear || null,
                            
                            // Professional context
                            tenureMonths: additionalData.currentTenure?.monthsInRole || null,
                            recentJobChange: additionalData.recentJobChange || false,
                            
                            // Enrichment data
                            confidence: additionalData.confidence ? Math.round(additionalData.confidence * 100) : null,
                            dataSource: additionalData.dataSource || 'coresignal',
                            lastEnriched: additionalData.lastUpdated ? new Date(additionalData.lastUpdated) : null,
                        };
                    })
                ).returning();

                // Create separate operational records for each profile
                await tx.insert(campaignProfileOperations).values(
                    insertedProfiles.map(profile => ({
                        enrollmentProfileId: profile.id,
                        // All operational fields use defaults from table definition
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

// Get all enrollments for a campaign (updated for profiles)
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
                    operations: true, // Include operational data
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
        enrollmentDate: enrollment.enrollmentDate,
        status: enrollment.status,
        snapshotData: enrollment.snapshotData as Record<string, unknown>,
    }));
}

// Get enrollment details with profiles (updated)
export async function getCampaignEnrollmentDetails(enrollmentId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const enrollment = await db.query.campaignEnrollments.findFirst({
        where: eq(campaignEnrollments.id, enrollmentId),
        with: {
            enrolledProfiles: true, // Updated
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
        profileCount: enrollment.enrolledProfiles.length, // Updated
    };
}

// Update profile email status (updated to use operations table)
export async function updateProfileEmailStatus(
    enrollmentId: number,
    profileId: number,
    status: 'pending' | 'sent' | 'delivered' | 'opened' | 'clicked' | 'replied' | 'bounced' | 'failed'
) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    try {
        // Verify ownership through campaign
        const enrollment = await db.query.campaignEnrollments.findFirst({
            where: eq(campaignEnrollments.id, enrollmentId),
            with: {
                campaign: true,
            },
        });

        if (!enrollment || enrollment.campaign.userId !== session.user.id) {
            throw new Error("Enrollment not found or unauthorized");
        }

        // Update the operations record, not the profile record
        await db
            .update(campaignProfileOperations)
            .set({
                emailStatus: status,
                lastEmailSent: status === 'sent' ? new Date() : undefined,
                emailsSentCount: status === 'sent' ? sql`emails_sent_count + 1` : undefined,
                responseStatus: ['replied', 'clicked'].includes(status) ? 'engaged' :
                    status === 'bounced' ? 'bounced' : 'none',
                firstResponseDate: ['replied', 'clicked'].includes(status) ? new Date() : undefined,
                openCount: status === 'opened' ? sql`open_count + 1` : undefined,
                clickCount: status === 'clicked' ? sql`click_count + 1` : undefined,
                replyCount: status === 'replied' ? sql`reply_count + 1` : undefined,
                updatedAt: new Date(),
            })
            .where(
                eq(campaignProfileOperations.enrollmentProfileId, profileId)
            );

        revalidatePath(`/campaigns/${enrollment.campaignId}`);
    } catch (error) {
        console.error("Error updating profile email status:", error);
        throw error;
    }
}

// Get campaign enrollment statistics (updated for profiles)
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
                    operations: true, // Include operational data for stats
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
            if (!emailStatus) {
                return;
            }
            acc[emailStatus] = (acc[emailStatus] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const responseCounts = enrollments.reduce((acc, enrollment) => {
        enrollment.enrolledProfiles.forEach(profile => {
            const responseStatus = profile.operations?.responseStatus;
            if (!responseStatus) {
                return;
            }
            acc[responseStatus] = (acc[responseStatus] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    return {
        totalEnrollments: enrollments.length,
        totalProfiles, // Updated
        sourceListNames: enrollments.map(e => e.sourceTargetList?.name || 'Unknown').filter(Boolean),
        emailStatusBreakdown: statusCounts,
        responseStatusBreakdown: responseCounts,
        enrollmentDates: enrollments.map(e => e.enrollmentDate),
    };
}