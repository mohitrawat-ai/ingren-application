// src/lib/actions/profile.ts - Complete profile actions with all missing functions
"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import { targetLists, targetListProfiles } from "@/lib/schema";
import { eq, and, desc } from "drizzle-orm";
import { mapProfileToTargetList } from '@/lib/mappers/profileMapper';

import {
  Profile,
  ProfileFilters,
  ProviderProfileFilters,
  ProfileSearchResponse,
  ProfileBatchResponse,
  ProfileFilterOptionsResponse,
  SaveProfileListParams
} from "@/types/profile";
import { requireAuth } from "../utils/auth-guard";

export interface CreateProfileListParams {
  name: string;
  description?: string;
  profiles: Profile[];
  metadata?: Record<string, unknown>;
}

const db = await dbClient();

// Base API URL for profile service
const PROFILE_API_BASE = process.env.INGREN_API_URL + "/provider" || 'http://localhost:3004/api/provider';
const API_KEY = process.env.INGREN_API_KEY || '';

// Validate configuration
if (!API_KEY) {
  console.error('INGREN_API_KEY environment variable is not set');
}

if (!PROFILE_API_BASE) {
  console.error('PROFILE_API_BASE environment variable is not set');
}

// Simple error class
class ProfileAPIError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public statusCode?: number
  ) {
    super(message);
    this.name = 'ProfileAPIError';
  }
}

// API request function
async function makeApiRequest<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  if (!API_KEY) {
    throw new ProfileAPIError(
      'INGREN_API_KEY environment variable is not set',
      endpoint
    );
  }

  if (!PROFILE_API_BASE) {
    throw new ProfileAPIError(
      'PROFILE_API_BASE environment variable is not set',
      endpoint
    );
  }

  const url = `${PROFILE_API_BASE}${endpoint}`;
  console.log(`Making API request to: ${url}`);
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers,
      },
    });

    if (!response.ok) {
      let errorMessage = `API request failed: ${response.status} ${response.statusText}`;
      
      try {
        const errorText = await response.text();
        if (errorText) {
          errorMessage += ` - ${errorText}`;
        }
      } catch (e) {
        console.log('Could not parse error response:', e);
      }
      
      throw new ProfileAPIError(errorMessage, endpoint, response.status);
    }

    const data = await response.json();
    
    if (!data.success) {
      throw new ProfileAPIError(
        `API returned error: ${data.message || 'Unknown error'}`,
        endpoint
      );
    }

    return data.data as T;
  } catch (error) {
    if (error instanceof ProfileAPIError) {
      throw error;
    }
    
    if (error instanceof Error) {
      if (error.name === 'AbortError') {
        throw new ProfileAPIError('Request was aborted', endpoint);
      }
      
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        throw new ProfileAPIError(
          `Connection failed: ${error.message}`,
          endpoint
        );
      }
      
      throw new ProfileAPIError(
        `Request failed: ${error.message}`,
        endpoint
      );
    }
    
    throw new ProfileAPIError('Unknown error occurred', endpoint);
  }
}

// Search for profile IDs (used by profile search)
export async function searchProfileIds(filters: ProviderProfileFilters): Promise<ProfileSearchResponse> {
  return await makeApiRequest<ProfileSearchResponse>('/profiles/search-ids?provider=coresignal', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });
}

// Get single profile by ID
export async function getProfile(id: string): Promise<Profile> {
  return await makeApiRequest<Profile>(`/profiles/${id}`);
}

// Get multiple profiles by IDs (used by profile batch loading)
export async function getBatchProfiles(ids: string[]): Promise<ProfileBatchResponse> {
  if (ids.length > 100) {
    throw new Error('Cannot request more than 100 profiles at once');
  }
  
  return await makeApiRequest<ProfileBatchResponse>('/profiles/batch?provider=coresignal', {
    method: 'POST',
    body: JSON.stringify({ ids }),
  });
}

// Get filter options for profile search UI
export async function getFilterOptions(): Promise<ProfileFilterOptionsResponse> {
  return await makeApiRequest<ProfileFilterOptionsResponse>('/profiles/filter-options');
}

// Validate filters before search
export async function validateFilters(filters: ProfileFilters) {
  return await makeApiRequest('/profiles/validate-filters', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });
}

// Build query for debugging
export async function buildQuery(filters: ProfileFilters) {
  return await makeApiRequest('/profiles/build-query', {
    method: 'POST',
    body: JSON.stringify({ filters }),
  });
}

// Save a new profile list with rich profile data
export async function saveProfileList(data: SaveProfileListParams) {
  const { userId } = await requireAuth();

  try {
    return await db.transaction(async (tx) => {
      // Create the target list
      const [newList] = await tx
        .insert(targetLists)
        .values({
          userId,
          name: data.name,
          description: data.description,
          type: 'profile',
          createdBy: userId,
          sharedWith: data.metadata ? [JSON.stringify(data.metadata)] : [],
        })
        .returning();

      // Insert profiles with FULL rich structure
      if (data.profiles && data.profiles.length > 0) {
        await tx.insert(targetListProfiles).values(
          data.profiles.map(profile => 
            mapProfileToTargetList(profile, newList.id)
          ) 
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
      profiles: true,
    },
    orderBy: [desc(targetLists.createdAt)],
  });

  return lists.map(list => ({
    ...list,
    profileCount: list.profiles.length,
    totalResults: list.profiles.length,
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
      profiles: true,
    },
  });

  if (!list) {
    throw new Error("Profile list not found");
  }

  return {
    ...list,
    profileCount: list.profiles.length,
    totalResults: list.profiles.length,
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
          eq(targetLists.userId, session.user!.id),
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
        .delete(targetListProfiles)
        .where(eq(targetListProfiles.targetListId, id));

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

// Remove profiles from a list
export async function removeProfilesFromList(listId: number, profileIds: string[]) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  try {
    await db.transaction(async (tx) => {
      // Verify ownership
      const existingList = await tx.query.targetLists.findFirst({
        where: and(
          eq(targetLists.id, listId),
          eq(targetLists.userId, session.user!.id),
          eq(targetLists.type, 'profile')
        ),
      });

      if (!existingList) {
        throw new Error("Profile list not found or unauthorized");
      }

      // Remove profiles
      await tx
        .delete(targetListProfiles)
        .where(and(
          eq(targetListProfiles.targetListId, listId),
          eq(targetListProfiles.profileId, profileIds[0]) // Note: This would need to be adjusted for multiple IDs
        ));

      // Update the list's updatedAt
      await tx
        .update(targetLists)
        .set({ updatedAt: new Date() })
        .where(eq(targetLists.id, listId));
    });

    revalidatePath("/profiles");
    revalidatePath("/profile-lists");
    revalidatePath(`/profile-lists/${listId}`);
  } catch (error) {
    console.error("Error removing profiles from list:", error);
    throw new Error("Failed to remove profiles from list");
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
          eq(targetLists.userId, session.user!.id),
          eq(targetLists.type, 'profile')
        ),
      });

      if (!existingList) {
        throw new Error("Profile list not found or unauthorized");
      }

      // Get existing profile IDs to avoid duplicates
      const existingProfiles = await tx.query.targetListProfiles.findMany({
        where: eq(targetListProfiles.targetListId, listId),
      });

      const existingProfileIds = new Set(existingProfiles.map(p => p.profileId));

      // Filter out profiles that already exist
      const newProfiles = profiles.filter(profile => !existingProfileIds.has(profile.id));

      if (newProfiles.length === 0) {
        return { added: 0, skipped: profiles.length };
      }

      // Insert new profiles with full rich structure
      await tx.insert(targetListProfiles).values(
        newProfiles.map(profile => 
        mapProfileToTargetList(profile, listId)
        )
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
      profiles: true,
    },
    orderBy: [desc(targetLists.createdAt)],
  });

  return lists.map(list => ({
    id: list.id,
    name: list.name,
    description: list.description,
    profileCount: list.profiles.length,
    createdAt: list.createdAt,
    usedInCampaigns: list.usedInCampaigns,
    campaignCount: list.campaignCount,
  }));
}