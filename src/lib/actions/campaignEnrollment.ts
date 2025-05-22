// src/lib/actions/campaignEnrollment.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import {
    campaignEnrollments,
    campaignEnrolledContacts,
    targetLists,
    campaigns
} from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { markProspectListAsUsedInCampaigns } from "./prospectList";

const db = await dbClient();

export interface CreateCampaignEnrollmentParams {
    campaignId: number;
    prospectListId: number;
}

export interface CampaignEnrollmentDetails {
    id: number;
    campaignId: number;
    sourceTargetListId: number;
    sourceTargetListName: string;
    enrollmentDate: Date;
    status: string;
    contactCount: number;
    snapshotData: Record<string, unknown>;
}

// Create a new campaign enrollment from a prospect list
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

            // Verify prospect list ownership and get contacts
            const prospectList = await tx.query.targetLists.findFirst({
                where: and(
                    eq(targetLists.id, data.prospectListId),
                    eq(targetLists.userId, session.user!.id || "0"),
                    eq(targetLists.type, 'prospect')
                ),
                with: {
                    contacts: true,
                },
            });

            if (!prospectList) {
                throw new Error("Prospect list not found or unauthorized");
            }

            if (prospectList.contacts.length === 0) {
                throw new Error("Cannot enroll empty prospect list");
            }

            // Create the enrollment record
            const [enrollment] = await tx
                .insert(campaignEnrollments)
                .values({
                    campaignId: data.campaignId,
                    sourceTargetListId: data.prospectListId,
                    enrollmentDate: new Date(),
                    status: 'active',
                    snapshotData: {
                        listName: prospectList.name,
                        listDescription: prospectList.description,
                        enrollmentTime: new Date().toISOString(),
                        contactCount: prospectList.contacts.length,
                        metadata: prospectList.sharedWith?.[0] ? JSON.parse(prospectList.sharedWith[0]) : null,
                    },
                })
                .returning();

            // Create enrolled contact records (snapshots)
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
                            enrollmentDate: new Date().toISOString(),
                            additionalData: contact.additionalData,
                        },
                        emailStatus: 'pending',
                        lastContacted: null,
                        responseStatus: 'none',
                    }))
                );
            }

            // Mark the prospect list as used in campaigns
            await markProspectListAsUsedInCampaigns(data.prospectListId);

            revalidatePath(`/campaigns/${data.campaignId}`);
            revalidatePath("/campaigns");
            revalidatePath(`/prospect-lists/${data.prospectListId}`);

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
            enrolledContacts: true,
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
        contactCount: enrollment.enrolledContacts.length,
        snapshotData: enrollment.snapshotData as Record<string, unknown>,
    }));
}

// Get enrollment details with contacts
export async function getCampaignEnrollmentDetails(enrollmentId: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const enrollment = await db.query.campaignEnrollments.findFirst({
        where: eq(campaignEnrollments.id, enrollmentId),
        with: {
            enrolledContacts: true,
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
        contactCount: enrollment.enrolledContacts.length,
    };
}

// Update contact email status
export async function updateContactEmailStatus(
    enrollmentId: number,
    contactId: number,
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

        // Update the contact status
        await db
            .update(campaignEnrolledContacts)
            .set({
                emailStatus: status,
                lastContacted: status === 'sent' ? new Date() : undefined,
                responseStatus: ['replied', 'clicked'].includes(status) ? 'engaged' :
                    status === 'bounced' ? 'bounced' : 'none',
            })
            .where(and(
                eq(campaignEnrolledContacts.campaignEnrollmentId, enrollmentId),
                eq(campaignEnrolledContacts.id, contactId)
            ));

        revalidatePath(`/campaigns/${enrollment.campaignId}`);
    } catch (error) {
        console.error("Error updating contact email status:", error);
        throw error;
    }
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
            enrolledContacts: true,
            sourceTargetList: true,
        },
    });

    // Calculate overall stats
    const totalContacts = enrollments.reduce((sum, enrollment) =>
        sum + enrollment.enrolledContacts.length, 0
    );

    const statusCounts = enrollments.reduce((acc, enrollment) => {
        enrollment.enrolledContacts.forEach(contact => {
            if (!contact.emailStatus) {
                return;
            }
            acc[contact.emailStatus] = (acc[contact.emailStatus] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    const responseCounts = enrollments.reduce((acc, enrollment) => {
        enrollment.enrolledContacts.forEach(contact => {
            if (!contact.responseStatus) {
                return;
            }
            acc[contact.responseStatus] = (acc[contact.responseStatus] || 0) + 1;
        });
        return acc;
    }, {} as Record<string, number>);

    return {
        totalEnrollments: enrollments.length,
        totalContacts,
        sourceListNames: enrollments.map(e => e.sourceTargetList?.name || 'Unknown').filter(Boolean),
        emailStatusBreakdown: statusCounts,
        responseStatusBreakdown: responseCounts,
        enrollmentDates: enrollments.map(e => e.enrollmentDate),
    };
}