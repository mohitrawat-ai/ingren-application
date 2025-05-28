// src/lib/actions/profileList.ts (renamed from prospectList.ts)
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { targetLists } from "@/lib/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "@/lib/utils/auth-guard";
import { ownershipFilters } from "@/lib//utils/entity-filters";

const db = await dbClient();

// Mark a profile list as used in campaigns
export async function markProfileListAsUsedInCampaigns(profileListId: number) {
  const {userId} = await requireAuth();

  try {
    await db.transaction(async (tx) => {
      // Verify ownership
      const profileList = await tx.query.targetLists.findFirst({
        where: and(
          ownershipFilters.targetLists(userId, profileListId, 'profile'),
        ),
      });

      if (!profileList) {
        throw new Error("Profile list not found or unauthorized");
      }

      // Update the list to mark as used
      await tx
        .update(targetLists)
        .set({
          usedInCampaigns: true,
          campaignCount: profileList.campaignCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(targetLists.id, profileListId));
    });

    revalidatePath("/profile-lists");
    revalidatePath(`/profile-lists/${profileListId}`);
  } catch (error) {
    console.error("Error marking profile list as used:", error);
    throw error;
  }
}

// Get profile list usage statistics
export async function getProfileListUsageStats(profileListId: number) {
  const {userId} = await requireAuth();

  const profileList = await db.query.targetLists.findFirst({
    where: and(
      ownershipFilters.targetLists(userId, profileListId, 'profile'),
    ),
    with: {
      enrollments: {
        with: {
          campaign: true,
        },
      },
    },
  });

  if (!profileList) {
    throw new Error("Profile list not found");
  }

  return {
    usedInCampaigns: profileList.usedInCampaigns,
    campaignCount: profileList.campaignCount,
    campaigns: profileList.enrollments.map(enrollment => ({
      id: enrollment.campaign.id,
      name: enrollment.campaign.name,
      status: enrollment.campaign.status,
      enrollmentDate: enrollment.enrollmentDate,
    })),
  };
}

// Check if profile list can be deleted
export async function canDeleteProfileList(profileListId: number): Promise<boolean> {
  const {userId} = await requireAuth();

  const profileList = await db.query.targetLists.findFirst({
    where: and(
      ownershipFilters.targetLists(userId, profileListId, 'profile'),
    ),
    with: {
      enrollments: true,
    },
  });

  if (!profileList) {
    return false;
  }

  // Can't delete if used in any campaigns (active enrollments exist)
  return !profileList.usedInCampaigns || profileList.enrollments.length === 0;
}