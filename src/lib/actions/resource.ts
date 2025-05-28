// src/lib/actions/resource.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { resources } from "@/lib/schema/resources";
import { eq, and, desc, ilike, or, sql, count } from "drizzle-orm";
import { requireAuth } from "@/lib/utils/auth-guard";

const db = await dbClient();

export interface CreateResourceParams {
  type: string;
  title: string;
  url: string;
  description?: string;
  tags?: string[];
  isUploaded?: boolean;
  fileType?: string;
  fileName?: string;
  fileSize?: number;
}

export interface UpdateResourceParams extends Partial<CreateResourceParams> {
  id: number;
}

export interface ResourceSearchParams {
  searchTerm?: string;
  filterType?: string;
  limit?: number;
  offset?: number;
}

// Create a new resource
export async function createResource(params: CreateResourceParams) {
  const { userId, tenantId } = await requireAuth();

  try {
    const [resource] = await db
      .insert(resources)
      .values({
        userId,
        tenantId,
        type: params.type,
        title: params.title.trim(),
        url: params.url,
        description: params.description?.trim() ?? null,
        tags: params.tags || [],
        isUploaded: params.isUploaded || false,
        fileType: params.fileType ?? null,
        fileName: params.fileName ?? null,
        fileSize: params.fileSize ?? null,
      })
      .returning();

    revalidatePath("/resources");
    return { success: true, resource };
  } catch (error) {
    console.error("Error creating resource:", error);
    throw new Error("Failed to create resource");
  }
}

// Get all resources for the current user
export async function getResources(params: ResourceSearchParams = {}) {
  const { userId, tenantId } = await requireAuth();

  try {
    // Build the base conditions
    const baseConditions = [
    ];

    if(userId) {
        baseConditions.push(eq(resources.userId, userId));
    }
    if(tenantId) {
        baseConditions.push(eq(resources.tenantId, tenantId));
    }

      // Add search conditions if provided
      if (params.searchTerm) {
          const searchTerm = `%${params.searchTerm.toLowerCase()}%`;
          const orConditions = [
              ilike(resources.title, searchTerm),
              ilike(resources.description, searchTerm),
              sql`${resources.tags}::text ILIKE ${searchTerm}`,
          ];
          baseConditions.push(or(...orConditions));
      }

    // Add type filter if provided
    if (params.filterType && params.filterType !== 'all') {
      baseConditions.push(eq(resources.type, params.filterType));
    }

    // Build the query with all conditions
    let query = db
      .select()
      .from(resources)
      .where(and(...baseConditions))
      .orderBy(desc(resources.createdAt))
      .$dynamic();

    // Apply pagination
    if (typeof params.limit === 'number' && params.limit > 0){
      query = query.limit(params.limit);
    }
    if (typeof params.offset === 'number' && params.offset >= 0) {
      query = query.offset(params.offset);
    }

    const resourceList = await query;
    return { success: true, resources: resourceList };
  } catch (error) {
    console.error("Error fetching resources:", error);
    throw new Error("Failed to fetch resources");
  }
}

// Get a single resource by ID
export async function getResource(id: number) {
  const { userId, tenantId } = await requireAuth();

  try {
    const resource = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.id, id),
          eq(resources.userId, userId),
          eq(resources.tenantId, tenantId)
        )
      )
      .limit(1);

    if (resource.length === 0) {
      throw new Error("Resource not found or unauthorized");
    }

    return { success: true, resource: resource[0] };
  } catch (error) {
    console.error("Error fetching resource:", error);
    throw new Error("Failed to fetch resource");
  }
}

// Update a resource
export async function updateResource(params: UpdateResourceParams) {
  const { userId, tenantId } = await requireAuth();

  try {
    // Verify ownership
    const existingResource = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.id, params.id),
          eq(resources.userId, userId),
          eq(resources.tenantId, tenantId)
        )
      )
      .limit(1);

    if (existingResource.length === 0) {
      throw new Error("Resource not found or unauthorized");
    }

    // Update the resource
    const updateData: Partial<typeof resources.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (params.type !== undefined) updateData.type = params.type;
    if (params.title !== undefined) updateData.title = params.title.trim();
    if (params.url !== undefined) updateData.url = params.url;
    if (params.description !== undefined) updateData.description = params.description?.trim() || null;
    if (params.tags !== undefined) updateData.tags = params.tags;
    if (params.isUploaded !== undefined) updateData.isUploaded = params.isUploaded;
    if (params.fileType !== undefined) updateData.fileType = params.fileType;
    if (params.fileName !== undefined) updateData.fileName = params.fileName;
    if (params.fileSize !== undefined) updateData.fileSize = params.fileSize;

    const [updatedResource] = await db
      .update(resources)
      .set(updateData)
      .where(eq(resources.id, params.id))
      .returning();

    revalidatePath("/resources");
    return { success: true, resource: updatedResource };
  } catch (error) {
    console.error("Error updating resource:", error);
    throw new Error("Failed to update resource");
  }
}

// Delete a resource
export async function deleteResource(id: number) {
  const { userId, tenantId } = await requireAuth();

  try {
    // Verify ownership before deletion
    const existingResource = await db
      .select()
      .from(resources)
      .where(
        and(
          eq(resources.id, id),
          eq(resources.userId, userId),
          eq(resources.tenantId, tenantId)
        )
      )
      .limit(1);

    if (existingResource.length === 0) {
      throw new Error("Resource not found or unauthorized");
    }

    await db
      .delete(resources)
      .where(eq(resources.id, id));

    revalidatePath("/resources");
    return { success: true };
  } catch (error) {
    console.error("Error deleting resource:", error);
    throw new Error("Failed to delete resource");
  }
}

// Get resource statistics by type
export async function getResourceStats() {
  const { userId, tenantId } = await requireAuth();

  try {
    const stats = await db
      .select({
        type: resources.type,
        count: count(),
      })
      .from(resources)
      .where(
        and(
          eq(resources.userId, userId),
          eq(resources.tenantId, tenantId)
        )
      )
      .groupBy(resources.type);

    const statsMap = stats.reduce((acc, stat) => {
      acc[stat.type] = stat.count;
      return acc;
    }, {} as Record<string, number>);

    return { success: true, stats: statsMap };
  } catch (error) {
    console.error("Error fetching resource stats:", error);
    throw new Error("Failed to fetch resource statistics");
  }
}

// Bulk delete resources
export async function deleteMultipleResources(ids: number[]) {
  const { userId, tenantId } = await requireAuth();

  try {
    // Verify all resources belong to the user
    const existingResources = await db
      .select({ id: resources.id })
      .from(resources)
      .where(
        and(
          eq(resources.userId, userId),
          eq(resources.tenantId, tenantId)
        )
      );

    const userResourceIds = new Set(existingResources.map(r => r.id));
    const validIds = ids.filter(id => userResourceIds.has(id));

    if (validIds.length === 0) {
      throw new Error("No valid resources found for deletion");
    }

    await db
      .delete(resources)
      .where(
        and(
          eq(resources.userId, userId),
          eq(resources.tenantId, tenantId)
        )
      );

    revalidatePath("/resources");
    return { success: true, deletedCount: validIds.length };
  } catch (error) {
    console.error("Error bulk deleting resources:", error);
    throw new Error("Failed to delete resources");
  }
}