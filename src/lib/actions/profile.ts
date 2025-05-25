// src/lib/actions/profile.ts
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import { targetLists, targetListContacts } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";

import {
  Profile,
  ProfileFilters,
  ProviderProfileFilters,
  ProfileSearchResponse,
  ProfileBatchResponse,
  ProfileFilterOptionsResponse,
  SaveProfileListParams
} from "@/types/profile";

export interface CreateProfileListParams {
  name: string;
  description?: string;
  profiles: Profile[];
  metadata?: Record<string, unknown>;
}


const db = await dbClient();

// Base API URL for profile service
const PROFILE_API_BASE = process.env.NEXT_PUBLIC_PROVIDERS_INGREN_API_URL || 'http://localhost:3004/api/provider';
const API_KEY = process.env.INGREN_API_KEY || '';

// Helper function to make API requests
async function makeApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${PROFILE_API_BASE}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      ...options.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `API request failed: ${response.status}`);
  }

  const data = await response.json();
  return data.data || data;
}

// Create a new profile list
export async function createProfileList(data: CreateProfileListParams) {
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
          type: 'profile',
          createdBy: session.user!.id,
          sharedWith: data.metadata ? [JSON.stringify(data.metadata)] : [],
        })
        .returning();

      // Insert profiles if provided
      if (data.profiles && data.profiles.length > 0) {
        await tx.insert(targetListContacts).values(
          data.profiles.map(profile => ({
            targetListId: newList.id,
            apolloProspectId: profile.id,
            name: profile.fullName,
            email: profile.email || null,
            title: profile.jobTitle || null,
            companyName: profile.company?.name || null,
            firstName: profile.firstName || null,
            lastName: profile.lastName || null,
            department: profile.department || null,
            city: profile.city || null,
            state: profile.state || null,
            country: profile.country || null,
            additionalData: {
              // Store full profile data
              ...profile,
              profileType: 'coresignal',
            },
          }))
        );
      }

      revalidatePath("/profiles");
      revalidatePath("/profile-lists");
      return newList;
    });
  } catch (error) {
    console.error("Error creating profile list:", error);
    throw new Error("Failed to create profile list");
  }
}

// Search for profile IDs
export async function searchProfileIds(filters: ProviderProfileFilters): Promise<ProfileSearchResponse> {
  try {
    return await makeApiRequest<ProfileSearchResponse>('/profiles/search-ids', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  } catch (error) {
    console.error('Error searching profile IDs:', error);
    throw error;
  }
}

// Get single profile by ID
export async function getProfile(id: string): Promise<Profile> {
  try {
    return await makeApiRequest<Profile>(`/profiles/${id}`);
  } catch (error) {
    console.error('Error getting profile:', error);
    throw error;
  }
}

// Get multiple profiles by IDs
export async function getBatchProfiles(ids: string[]): Promise<ProfileBatchResponse> {
  try {
    if (ids.length > 100) {
      throw new Error('Cannot request more than 100 profiles at once');
    }
    
    return await makeApiRequest<ProfileBatchResponse>('/profiles/batch', {
      method: 'POST',
      body: JSON.stringify({ ids }),
    });
  } catch (error) {
    console.error('Error getting batch profiles:', error);
    throw error;
  }
}

// Get filter options
export async function getFilterOptions(): Promise<ProfileFilterOptionsResponse> {
  try {
    return await makeApiRequest<ProfileFilterOptionsResponse>('/profiles/filter-options');
  } catch (error) {
    console.error('Error getting filter options:', error);
    throw error;
  }
}

// Validate filters
export async function validateFilters(filters: ProfileFilters) {
  try {
    return await makeApiRequest('/profiles/validate-filters', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  } catch (error) {
    console.error('Error validating filters:', error);
    throw error;
  }
}

// Build query for debugging
export async function buildQuery(filters: ProfileFilters) {
  try {
    return await makeApiRequest('/profiles/build-query', {
      method: 'POST',
      body: JSON.stringify({ filters }),
    });
  } catch (error) {
    console.error('Error building query:', error);
    throw error;
  }
}

// Profile List Management Functions

// Save a new profile list
export async function saveProfileList(data: SaveProfileListParams) {
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
          type: 'profile',
          createdBy: session.user!.id,
          sharedWith: data.metadata ? [JSON.stringify(data.metadata)] : [],
        })
        .returning();

      // Insert profiles if provided
      if (data.profiles && data.profiles.length > 0) {
        await tx.insert(targetListContacts).values(
          data.profiles.map(profile => ({
            targetListId: newList.id,
            apolloProspectId: profile.id,
            name: profile.fullName,
            email: profile.email || null,
            title: profile.jobTitle || null,
            companyName: profile.company?.name || null,
            firstName: profile.firstName || null,
            lastName: profile.lastName || null,
            department: profile.department || null,
            city: profile.city || null,
            state: profile.state || null,
            country: profile.country || null,
            additionalData: {
              // Store full profile data
              ...profile,
              profileType: 'coresignal',
            },
          }))
        );
      }

      revalidatePath("/profiles");
      revalidatePath("/profile-lists");
      return newList;
    });
  } catch (error) {
    console.error("Error creating profile list:", error);
    throw new Error("Failed to create profile list");
  }
}

// Get all profile lists for the current user
export async function getProfileLists() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const lists = await db.query.targetLists.findMany({
    where: and(
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'profile')
    ),
    with: {
      contacts: true,
    },
    orderBy: [desc(targetLists.createdAt)],
  });

  return lists.map(list => ({
    ...list,
    profileCount: list.contacts.length,
    totalResults: list.contacts.length,
  }));
}

// Get a specific profile list by ID
export async function getProfileList(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const list = await db.query.targetLists.findFirst({
    where: and(
      eq(targetLists.id, id),
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'profile')
    ),
    with: {
      contacts: true,
    },
  });

  if (!list) {
    throw new Error("Profile list not found");
  }

  return {
    ...list,
    profileCount: list.contacts.length,
    totalResults: list.contacts.length,
  };
}

// Delete a profile list
export async function deleteProfileList(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await db.transaction(async (tx) => {
      // Verify ownership and check if list is used in campaigns
      const list = await tx.query.targetLists.findFirst({
        where: and(
          eq(targetLists.id, id),
          eq(targetLists.userId, session.user!.id || "-1"),
          eq(targetLists.type, 'profile')
        ),
        with: {
          enrollments: true,
        },
      });

      if (!list) {
        throw new Error("Profile list not found");
      }

      if (list.usedInCampaigns || list.enrollments.length > 0) {
        throw new Error("Cannot delete profile list that is used in campaigns");
      }

      // Delete contacts first (due to foreign key constraints)
      await tx
        .delete(targetListContacts)
        .where(eq(targetListContacts.targetListId, id));

      // Then delete the list itself
      await tx
        .delete(targetLists)
        .where(eq(targetLists.id, id));
    });

    revalidatePath("/profiles");
    revalidatePath("/profile-lists");
  } catch (error) {
    console.error("Error deleting profile list:", error);
    throw error;
  }
}

// Add profiles to an existing list
export async function addProfilesToList(listId: number, profiles: Profile[]) {
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
          eq(targetLists.type, 'profile')
        ),
      });

      if (!existingList) {
        throw new Error("Profile list not found or unauthorized");
      }

      // Get existing profile IDs to avoid duplicates
      const existingProfiles = await tx.query.targetListContacts.findMany({
        where: eq(targetListContacts.targetListId, listId),
      });

      const existingProfileIds = new Set(existingProfiles.map(p => p.apolloProspectId));

      // Filter out profiles that already exist
      const newProfiles = profiles.filter(profile => !existingProfileIds.has(profile.id));

      if (newProfiles.length === 0) {
        return { added: 0, skipped: profiles.length };
      }

      // Insert new profiles
      await tx.insert(targetListContacts).values(
        newProfiles.map(profile => ({
          targetListId: listId,
          apolloProspectId: profile.id,
          name: profile.fullName,
          email: profile.email || null,
          title: profile.jobTitle || null,
          companyName: profile.company?.name || null,
          firstName: profile.firstName || null,
          lastName: profile.lastName || null,
          department: profile.department || null,
          city: profile.city || null,
          state: profile.state || null,
          country: profile.country || null,
          additionalData: {
            ...profile,
            profileType: 'coresignal',
          },
        }))
      );

      // Update the list's updatedAt
      await tx
        .update(targetLists)
        .set({ updatedAt: new Date() })
        .where(eq(targetLists.id, listId));

      revalidatePath("/profiles");
      revalidatePath("/profile-lists");
      revalidatePath(`/profile-lists/${listId}`);
      
      return { 
        added: newProfiles.length, 
        skipped: profiles.length - newProfiles.length 
      };
    });
  } catch (error) {
    console.error("Error adding profiles to list:", error);
    throw new Error("Failed to add profiles to list");
  }
}

// Get profile lists for campaign targeting
export async function getProfileListsForCampaigns() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const lists = await db.query.targetLists.findMany({
    where: and(
      eq(targetLists.userId, session.user.id),
      eq(targetLists.type, 'profile')
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
    profileCount: list.contacts.length,
    createdAt: list.createdAt,
    usedInCampaigns: list.usedInCampaigns,
    campaignCount: list.campaignCount,
  }));
}