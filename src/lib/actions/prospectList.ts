// src/lib/actions/prospectList.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import { targetLists, targetListContacts } from "@/lib/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { Prospect } from "@/types";

const db = await dbClient();

export interface CreateProspectListParams {
  name: string;
  description?: string;
  prospects: Prospect[];
  sourceCompanyListId?: number; // Reference to company list used for scoping
  metadata?: Record<string, unknown>;
}

export interface UpdateProspectListParams {
  id: number;
  name?: string;
  description?: string;
  prospects?: Prospect[];
}

// Get all prospect lists for the current user
export async function getProspectLists() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const lists = await db.query.targetLists.findMany({
    where: and(
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'prospect')
    ),
    with: {
      contacts: true,
    },
    orderBy: [desc(targetLists.createdAt)],
  });

  return lists.map(list => ({
    ...list,
    prospectCount: list.contacts.length,
  }));
}

// Get a specific prospect list by ID
export async function getProspectList(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const list = await db.query.targetLists.findFirst({
    where: and(
      eq(targetLists.id, id),
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'prospect')
    ),
    with: {
      contacts: true,
    },
  });

  if (!list) {
    throw new Error("Prospect list not found");
  }

  return {
    ...list,
    prospectCount: list.contacts.length,
  };
}

// Create a new prospect list
export async function createProspectList(data: CreateProspectListParams) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    return await db.transaction(async (tx) => {
      // Create the target list
      const [newList] = await tx
        .insert(targetLists)
        .values({
          userId: session.user!.id || "-1",
          name: data.name,
          description: data.description,
          type: 'prospect',
          sourceListId: data.sourceCompanyListId,
          createdBy: session.user!.id,
          sharedWith: data.metadata ? [JSON.stringify(data.metadata)] : [],
        })
        .returning();

      // Insert prospects if provided
      if (data.prospects && data.prospects.length > 0) {
        await tx.insert(targetListContacts).values(
          data.prospects.map(prospect => ({
            targetListId: newList.id,
            apolloProspectId: prospect.id,
            name: `${prospect.firstName} ${prospect.lastName}`.trim(),
            email: prospect.email || null,
            title: prospect.title || null,
            companyName: prospect.companyName || null,
            firstName: prospect.firstName || null,
            lastName: prospect.lastName || null,
            department: prospect.department || null,
            city: prospect.city || null,
            state: prospect.state || null,
            country: prospect.country || null,
            additionalData: {
              // Store any additional prospect data
              ...prospect,
            },
          }))
        );
      }

      revalidatePath("/prospect-lists");
      return newList;
    });
  } catch (error) {
    console.error("Error creating prospect list:", error);
    throw new Error("Failed to create prospect list");
  }
}

// Update an existing prospect list
export async function updateProspectList(data: UpdateProspectListParams) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    return await db.transaction(async (tx) => {
      // Verify ownership
      const existingList = await tx.query.targetLists.findFirst({
        where: and(
          eq(targetLists.id, data.id),
          eq(targetLists.userId, session.user!.id || "-1"),
          eq(targetLists.type, 'prospect')
        ),
      });

      if (!existingList) {
        throw new Error("Prospect list not found or unauthorized");
      }

      // Update the target list
      const updateData: Partial<typeof targetLists.$inferInsert> = {
        updatedAt: new Date(),
      };

      if (data.name) updateData.name = data.name;
      if (data.description !== undefined) updateData.description = data.description;

      const [updatedList] = await tx
        .update(targetLists)
        .set(updateData)
        .where(eq(targetLists.id, data.id))
        .returning();

      // Update prospects if provided
      if (data.prospects) {
        // Delete existing prospects
        await tx
          .delete(targetListContacts)
          .where(eq(targetListContacts.targetListId, data.id));

        // Insert new prospects
        if (data.prospects.length > 0) {
          await tx.insert(targetListContacts).values(
            data.prospects.map(prospect => ({
              targetListId: data.id,
              apolloProspectId: prospect.id,
              name: `${prospect.firstName} ${prospect.lastName}`.trim(),
              email: prospect.email || null,
              title: prospect.title || null,
              companyName: prospect.companyName || null,
              firstName: prospect.firstName || null,
              lastName: prospect.lastName || null,
              department: prospect.department || null,
              city: prospect.city || null,
              state: prospect.state || null,
              country: prospect.country || null,
              additionalData: {
                ...prospect,
              },
            }))
          );
        }
      }

      revalidatePath("/prospect-lists");
      revalidatePath(`/prospect-lists/${data.id}`);
      return updatedList;
    });
  } catch (error) {
    console.error("Error updating prospect list:", error);
    throw new Error("Failed to update prospect list");
  }
}

// Delete a prospect list
export async function deleteProspectList(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    // Check if list is used in campaigns
    const list = await db.query.targetLists.findFirst({
      where: and(
        eq(targetLists.id, id),
        eq(targetLists.userId, session.user.id),
        eq(targetLists.type, 'prospect')
      ),
      with: {
        enrollments: true,
      },
    });

    if (!list) {
      throw new Error("Prospect list not found");
    }

    if (list.usedInCampaigns || list.enrollments.length > 0) {
      throw new Error("Cannot delete prospect list that is used in campaigns");
    }

    // Delete prospects first (due to foreign key constraints)
    await db
      .delete(targetListContacts)
      .where(eq(targetListContacts.targetListId, id));

    // Delete the list
    await db
      .delete(targetLists)
      .where(eq(targetLists.id, id));

    revalidatePath("/prospect-lists");
  } catch (error) {
    console.error("Error deleting prospect list:", error);
    throw error;
  }
}

// Add prospects to an existing list
export async function addProspectsToList(listId: number, prospects: Prospect[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    return await db.transaction(async (tx) => {
      // Verify ownership
      const existingList = await tx.query.targetLists.findFirst({
        where: and(
          eq(targetLists.id, listId),
          eq(targetLists.userId, session.user!.id || "-1"),
          eq(targetLists.type, 'prospect')
        ),
      });

      if (!existingList) {
        throw new Error("Prospect list not found or unauthorized");
      }

      // Get existing prospect IDs to avoid duplicates
      const existingProspects = await tx.query.targetListContacts.findMany({
        where: eq(targetListContacts.targetListId, listId),
      });

      const existingProspectIds = new Set(existingProspects.map(p => p.apolloProspectId));

      // Filter out prospects that already exist
      const newProspects = prospects.filter(prospect => !existingProspectIds.has(prospect.id));

      if (newProspects.length === 0) {
        return { added: 0, skipped: prospects.length };
      }

      // Insert new prospects
      await tx.insert(targetListContacts).values(
        newProspects.map(prospect => ({
          targetListId: listId,
          apolloProspectId: prospect.id,
          name: `${prospect.firstName} ${prospect.lastName}`.trim(),
          email: prospect.email || null,
          title: prospect.title || null,
          companyName: prospect.companyName || null,
          firstName: prospect.firstName || null,
          lastName: prospect.lastName || null,
          department: prospect.department || null,
          city: prospect.city || null,
          state: prospect.state || null,
          country: prospect.country || null,
          additionalData: {
            ...prospect,
          },
        }))
      );

      // Update the list's updatedAt
      await tx
        .update(targetLists)
        .set({ updatedAt: new Date() })
        .where(eq(targetLists.id, listId));

      revalidatePath("/prospect-lists");
      revalidatePath(`/prospect-lists/${listId}`);
      
      return { 
        added: newProspects.length, 
        skipped: prospects.length - newProspects.length 
      };
    });
  } catch (error) {
    console.error("Error adding prospects to list:", error);
    throw new Error("Failed to add prospects to list");
  }
}

// Remove prospects from a list
export async function removeProspectsFromList(listId: number, prospectIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    return await db.transaction(async (tx) => {
      // Verify ownership
      const existingList = await tx.query.targetLists.findFirst({
        where: and(
          eq(targetLists.id, listId),
          eq(targetLists.userId, session.user!.id || "-1"),
          eq(targetLists.type, 'prospect')
        ),
      });

      if (!existingList) {
        throw new Error("Prospect list not found or unauthorized");
      }

      // Remove prospects - this would need to be implemented based on your SQL builder's capabilities
      // For now, we'll use a simpler approach
      for (const prospectId of prospectIds) {
        await tx
          .delete(targetListContacts)
          .where(and(
            eq(targetListContacts.targetListId, listId),
            eq(targetListContacts.apolloProspectId, prospectId)
          ));
      }

      // Update the list's updatedAt
      await tx
        .update(targetLists)
        .set({ updatedAt: new Date() })
        .where(eq(targetLists.id, listId));

      revalidatePath("/prospect-lists");
      revalidatePath(`/prospect-lists/${listId}`);
    });
  } catch (error) {
    console.error("Error removing prospects from list:", error);
    throw new Error("Failed to remove prospects from list");
  }
}

// Get prospect lists that can be used for campaign targeting
export async function getProspectListsForCampaigns() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const lists = await db.query.targetLists.findMany({
    where: and(
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'prospect')
    ),
    with: {
      contacts: true,
    },
    orderBy: [desc(targetLists.createdAt)],
  });

  return lists.map(list => ({
    id: list.id,
    name: list.name,
    description: list.description,
    prospectCount: list.contacts.length,
    createdAt: list.createdAt,
    usedInCampaigns: list.usedInCampaigns,
    campaignCount: list.campaignCount,
  }));
}

// Mark list as used in campaigns
export async function markProspectListAsUsedInCampaigns(listId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  await db
    .update(targetLists)
    .set({ 
      usedInCampaigns: true,
      campaignCount: sql`campaign_count + 1`,
      updatedAt: new Date()
    })
    .where(and(
      eq(targetLists.id, listId),
      eq(targetLists.userId, session.user.id)
    ));

  revalidatePath("/prospect-lists");
  revalidatePath(`/prospect-lists/${listId}`);
}