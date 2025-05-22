"use server";

import { Company } from "@/types";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import { targetLists, targetListCompanies } from "@/lib/schema";
import { eq, and, desc, sql, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";

const db = await dbClient();

export interface CreateCompanyListParams {
    name: string;
    description?: string;
    companies: Company[];
}

export interface UpdateCompanyListParams {
    id: number;
    name?: string;
    description?: string;
    companies?: Company[];
}

// Get all company lists for the current user
export async function getCompanyLists() {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const companyLists = await db.query.targetLists.findMany({
        where: and(
            eq(targetLists.userId, session.user.id),
            eq(targetLists.type, "company")
        ),
        orderBy: [desc(targetLists.createdAt)],
        with: {
            companies: true,
        },
    });

    return companyLists.map((list) => ({
        ...list,
        companyCount: list.companies.length
    }));
}

// Get a specific company list by ID
export async function getCompanyList(id: number) {
    const session = await auth();
    if (!session?.user?.id) {
        throw new Error("Unauthorized");
    }

    const companyList = await db.query.targetLists.findFirst({
        where: and(
            eq(targetLists.id, id),
            eq(targetLists.userId, session.user.id),
            eq(targetLists.type, "company")
        ),
        with: {
            companies: true,
        },
    });

    if (!companyList) {
        throw new Error("Company list not found");
    }

    return companyList && ({
        ...companyList,
        companyCount: companyList.companies.length
    });
}

// Create a new company list
export async function createCompanyList(data: CreateCompanyListParams) {
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
          type: 'company',
          createdBy: session.user!.id,
        })
        .returning();

      // Insert companies if provided
      if (data.companies && data.companies.length > 0) {
        await tx.insert(targetListCompanies).values(
          data.companies.map(company => ({
            targetListId: newList.id,
            apolloCompanyId: company.id,
            companyName: company.name,
            industry: company.industry || null,
            employeeCount: company.size || null,
            domain: company.domain || null,
            location: company.location || null,
            description: company.description || null,
            additionalData: {
              // Store any additional company data
              ...company,
            },
          }))
        );
      }

      revalidatePath("/company-lists");
      return newList;
    });
  } catch (error) {
    console.error("Error creating company list:", error);
    throw new Error("Failed to create company list");
  }
}

// Update an existing company list
export async function updateCompanyList(data: UpdateCompanyListParams) {
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
          eq(targetLists.userId, session.user!.id || "0"),
          eq(targetLists.type, 'company')
        ),
      });

      if (!existingList) {
        throw new Error("Company list not found or unauthorized");
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

      // Update companies if provided
      if (data.companies) {
        // Delete existing companies
        await tx
          .delete(targetListCompanies)
          .where(eq(targetListCompanies.targetListId, data.id));

        // Insert new companies
        if (data.companies.length > 0) {
          await tx.insert(targetListCompanies).values(
            data.companies.map(company => ({
              targetListId: data.id,
              apolloCompanyId: company.id,
              companyName: company.name,
              industry: company.industry || null,
              employeeCount: company.size || null,
              domain: company.domain || null,
              location: company.location || null,
              description: company.description || null,
              additionalData: {
                ...company,
              },
            }))
          );
        }
      }

      revalidatePath("/company-lists");
      revalidatePath(`/company-lists/${data.id}`);
      return updatedList;
    });
  } catch (error) {
    console.error("Error updating company list:", error);
    throw new Error("Failed to update company list");
  }
}

// Delete a company list
export async function deleteCompanyList(id: number) {
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
        eq(targetLists.type, 'company')
      ),
      with: {
        enrollments: true,
      },
    });

    if (!list) {
      throw new Error("Company list not found");
    }

    if (list.usedInCampaigns || list.enrollments.length > 0) {
      throw new Error("Cannot delete company list that is used in campaigns");
    }

    // Delete companies first (due to foreign key constraints)
    await db
      .delete(targetListCompanies)
      .where(eq(targetListCompanies.targetListId, id));

    // Delete the list
    await db
      .delete(targetLists)
      .where(eq(targetLists.id, id));

    revalidatePath("/company-lists");
  } catch (error) {
    console.error("Error deleting company list:", error);
    throw error;
  }
}


// Add companies to an existing list
export async function addCompaniesToList(listId: number, companies: Company[]) {
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
          eq(targetLists.userId, session.user!.id || "0"),
          eq(targetLists.type, 'company')
        ),
      });

      if (!existingList) {
        throw new Error("Company list not found or unauthorized");
      }

      // Get existing company IDs to avoid duplicates
      const existingCompanies = await tx.query.targetListCompanies.findMany({
        where: eq(targetListCompanies.targetListId, listId),
      });

      const existingCompanyIds = new Set(existingCompanies.map(c => c.apolloCompanyId));

      // Filter out companies that already exist
      const newCompanies = companies.filter(company => !existingCompanyIds.has(company.id));

      if (newCompanies.length === 0) {
        return { added: 0, skipped: companies.length };
      }

      // Insert new companies
      await tx.insert(targetListCompanies).values(
        newCompanies.map(company => ({
          targetListId: listId,
          apolloCompanyId: company.id,
          companyName: company.name,
          industry: company.industry || null,
          employeeCount: company.size || null,
          domain: company.domain || null,
          location: company.location || null,
          description: company.description || null,
          additionalData: {
            ...company,
          },
        }))
      );

      // Update the list's updatedAt
      await tx
        .update(targetLists)
        .set({ updatedAt: new Date() })
        .where(eq(targetLists.id, listId));

      revalidatePath("/company-lists");
      revalidatePath(`/company-lists/${listId}`);
      
      return { 
        added: newCompanies.length, 
        skipped: companies.length - newCompanies.length 
      };
    });
  } catch (error) {
    console.error("Error adding companies to list:", error);
    throw new Error("Failed to add companies to list");
  }
}

// Remove companies from a list
export async function removeCompaniesFromList(listId: number, companyIds: string[]) {
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
          eq(targetLists.userId, session.user!.id || "0"),
          eq(targetLists.type, 'company')
        ),
      });

      if (!existingList) {
        throw new Error("Company list not found or unauthorized");
      }

      // Remove companies
      await tx
        .delete(targetListCompanies)
        .where(and(
          eq(targetListCompanies.targetListId, listId),
          inArray(targetListCompanies.apolloCompanyId, companyIds)
        ));

      // Update the list's updatedAt
      await tx
        .update(targetLists)
        .set({ updatedAt: new Date() })
        .where(eq(targetLists.id, listId));

      revalidatePath("/company-lists");
      revalidatePath(`/company-lists/${listId}`);
    });
  } catch (error) {
    console.error("Error removing companies from list:", error);
    throw new Error("Failed to remove companies from list");
  }
}

// Mark list as used in campaigns
export async function markListAsUsedInCampaigns(listId: number) {
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

  revalidatePath("/company-lists");
  revalidatePath(`/company-lists/${listId}`);
}

// Get company lists that can be used for scoping (for dropdown selection)
export async function getCompanyListsForScoping() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const lists = await db.query.targetLists.findMany({
    where: and(
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'company')
    ),
    with: {
      companies: true,
    },
    orderBy: [desc(targetLists.createdAt)],
  });

  return lists.map(list => ({
    id: list.id,
    name: list.name,
    description: list.description,
    companyCount: list.companies.length,
    createdAt: list.createdAt,
  }));
}

