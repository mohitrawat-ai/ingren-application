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

// Validate configuration
if (!API_KEY) {
  console.error('PROFILE_API_KEY environment variable is not set');
}

if (!PROFILE_API_BASE) {
  console.error('PROFILE_API_BASE environment variable is not set');
}

// Rate limiting and retry configuration
const MAX_RETRIES = 3;
const RETRY_DELAY = 1000; // 1 second
const REQUEST_TIMEOUT = 30000; // 30 seconds

// Track failed requests to prevent spam
const failedRequests = new Map<string, { count: number; lastAttempt: number }>();
const FAILURE_COOLDOWN = 60000; // 1 minute cooldown after failures

// Helper function to create AbortController with timeout
function createTimeoutController(timeoutMs: number): AbortController {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  // Clean up timeout when request completes
  controller.signal.addEventListener('abort', () => {
    clearTimeout(timeoutId);
  });
  
  return controller;
}

// Helper function to check if we should skip request due to recent failures
function shouldSkipRequest(endpoint: string): boolean {
  const failure = failedRequests.get(endpoint);
  if (!failure) return false;
  
  const timeSinceLastAttempt = Date.now() - failure.lastAttempt;
  const cooldownRequired = Math.min(FAILURE_COOLDOWN * failure.count, 300000); // Max 5 min cooldown
  
  return timeSinceLastAttempt < cooldownRequired;
}

// Helper function to record request failure
function recordFailure(endpoint: string): void {
  const existing = failedRequests.get(endpoint) || { count: 0, lastAttempt: 0 };
  failedRequests.set(endpoint, {
    count: existing.count + 1,
    lastAttempt: Date.now()
  });
}

// Helper function to clear failure record on success
function clearFailure(endpoint: string): void {
  failedRequests.delete(endpoint);
}

// Enhanced error class for better error handling
class ProfileAPIError extends Error {
  constructor(
    message: string,
    public endpoint: string,
    public statusCode?: number,
    public cause?: Error
  ) {
    super(message);
    this.name = 'ProfileAPIError';
  }
}

// Helper function to make API requests with comprehensive error handling
async function makeApiRequest<T>(
  endpoint: string, 
  options: RequestInit = {},
  retryCount = 0
): Promise<T> {
  // Check if we should skip this request due to recent failures
  if (shouldSkipRequest(endpoint)) {
    const failure = failedRequests.get(endpoint);
    throw new ProfileAPIError(
      `Request to ${endpoint} skipped due to recent failures (${failure?.count} attempts)`,
      endpoint
    );
  }

  // Validate environment configuration
  if (!API_KEY) {
    throw new ProfileAPIError(
      'PROFILE_API_KEY environment variable is not set',
      endpoint
    );
  }

  if (!PROFILE_API_BASE) {
    throw new ProfileAPIError(
      'PROFILE_API_BASE environment variable is not set',
      endpoint
    );
  }

  // Create timeout controller
  const controller = createTimeoutController(REQUEST_TIMEOUT);
  
  try {
    const url = `${PROFILE_API_BASE}${endpoint}`;
    console.log(`Making API request to: ${url}`);
    
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        ...options.headers,
      },
    });

    // Clear any previous failures on successful connection
    clearFailure(endpoint);

    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      throw new ProfileAPIError(
        `API request failed: ${response.status} ${response.statusText} - ${errorText}`,
        endpoint,
        response.status
      );
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
    // Record the failure
    recordFailure(endpoint);
    
    // Handle different types of errors
    if (error instanceof ProfileAPIError) {
      throw error;
    }
    
    if (error instanceof Error) {
      // Handle specific fetch errors
      if (error.name === 'AbortError') {
        throw new ProfileAPIError(
          `Request timeout after ${REQUEST_TIMEOUT}ms`,
          endpoint,
          undefined,
          error
        );
      }
      
      if (error.message.includes('fetch failed') || error.message.includes('ECONNREFUSED')) {
        const shouldRetry = retryCount < MAX_RETRIES;
        
        if (shouldRetry) {
          console.warn(`Fetch failed for ${endpoint}, retrying in ${RETRY_DELAY}ms (attempt ${retryCount + 1}/${MAX_RETRIES})`);
          await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
          return makeApiRequest<T>(endpoint, options, retryCount + 1);
        }
        
        throw new ProfileAPIError(
          `Connection failed after ${MAX_RETRIES} retries: ${error.message}`,
          endpoint,
          undefined,
          error
        );
      }
      
      throw new ProfileAPIError(
        `Request failed: ${error.message}`,
        endpoint,
        undefined,
        error
      );
    }
    
    throw new ProfileAPIError(
      'Unknown error occurred',
      endpoint,
      undefined,
      error as Error
    );
  }
}

// Safe wrapper for API calls that shouldn't crash the app
async function safeApiCall<T>(
  apiCall: () => Promise<T>,
  fallbackValue: T,
  errorContext: string
): Promise<T> {
  try {
    return await apiCall();
  } catch (error) {
    console.error(`${errorContext}:`, error);
    
    // In development, you might want to throw errors
    // In production, return fallback to prevent crashes
    if (process.env.NODE_ENV === 'development') {
      throw error;
    }
    
    return fallbackValue;
  }
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

// Filter options with safe fallback
export async function getFilterOptions(): Promise<{
  industries: string[];
  managementLevels: string[];
  seniorityLevels: string[];
  departments: string[];
  companySizes: string[];
  usStates: string[];
  countries: string[];
}> {
  const fallbackOptions: ProfileFilterOptionsResponse = {
    industries: [
      "Technology", "Financial Services", "Healthcare", "Manufacturing", 
      "Retail", "Education", "Real Estate", "Marketing", "Consulting"
    ],
    managementLevels: ["executive", "manager", "individual_contributor"],
    seniorityLevels: ["c-level", "vp", "director", "manager", "senior", "mid-level", "junior"],
    departments: [
      "Engineering", "Sales", "Marketing", "Operations", "Finance", 
      "Human Resources", "Product", "Customer Success", "Legal"
    ],
    companySizes: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
    usStates: [
      "CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI", 
      "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI"
    ],
    countries: ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia"]
  };

  return safeApiCall(
    () => makeApiRequest<ProfileFilterOptionsResponse>('/profiles/filter-options'),
    fallbackOptions,
    'Failed to fetch filter options'
  );
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