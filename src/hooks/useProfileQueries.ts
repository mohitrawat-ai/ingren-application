// src/hooks/useProfileQueries.ts - Simplified without automatic retries

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { PAGINATION_CONFIG } from '@/config/pagination';

import { 
  getFilterOptions, 
  searchProfileIds, 
  getBatchProfiles, 
  getProfile,
  validateFilters,
  saveProfileList,
} from '@/lib/actions/profile';

import { ProviderProfileFilters } from '@/types/profile';

// Query keys for consistent caching
export const profileQueryKeys = {
  all: ['profiles'] as const,
  filterOptions: () => [...profileQueryKeys.all, 'filterOptions'] as const,
  search: (filters: ProviderProfileFilters) => [...profileQueryKeys.all, 'search', filters] as const,
  profile: (id: string) => [...profileQueryKeys.all, 'profile', id] as const,
  validation: (filters: ProviderProfileFilters) => [...profileQueryKeys.all, 'validation', filters] as const,
};

// Simple filter options hook - no automatic retry
export function useFilterOptions() {
  return useQuery({
    queryKey: profileQueryKeys.filterOptions(),
    queryFn: getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
    retry: false, // No automatic retry - user clicks retry button
    refetchOnWindowFocus: false,
    throwOnError: false, // Let component handle errors gracefully
  });
}

// Simple profile search hook - no automatic retry
export function useProfileSearch(filters: ProviderProfileFilters, hasSearched: boolean) {
  return useQuery({
    queryKey: profileQueryKeys.search(filters),
    queryFn: () => searchProfileIds(filters),
    enabled: hasSearched, // Only enabled when user has explicitly searched
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: false, // No automatic retry - user clicks retry button
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
}

// Simple batch profiles hook - no automatic retry
export function useBatchProfiles(profileIds: string[], enabled = true) {
  return useQuery({
    queryKey: [...profileQueryKeys.all, 'batch', profileIds],
    queryFn: () => getBatchProfiles(profileIds),
    enabled: enabled && profileIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
    retry: false, // No automatic retry
    throwOnError: false,
  });
}

// Simple single profile hook - no automatic retry
export function useProfile(id: string, enabled = true) {
  return useQuery({
    queryKey: profileQueryKeys.profile(id),
    queryFn: () => getProfile(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
    retry: false, // No automatic retry
    throwOnError: false,
  });
}

// Simple filter validation hook - no automatic retry
export function useFilterValidation(filters: ProviderProfileFilters, enabled = true) {
  return useQuery({
    queryKey: profileQueryKeys.validation(filters),
    queryFn: () => validateFilters(filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false, // No automatic retry
    throwOnError: false,
  });
}

// Main search hook - only searches once, then paginates through cached IDs
export function useProfileSearchWithData(
  appliedFilters: ProviderProfileFilters,
  page: number = 1, 
  pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  hasSearched = false
) {
  // IMPORTANT: Strip pagination params from filters for search query key
  // Only search filters should trigger new searches, not page/pageSize changes
  const searchOnlyFilters = { ...appliedFilters };
  delete searchOnlyFilters.page;
  delete searchOnlyFilters.pageSize;
  
  // Create stable key based only on search criteria (not pagination)
  const searchFiltersKey = JSON.stringify(searchOnlyFilters);
  
  // Get all profile IDs ONCE when search filters change - not on page changes
  const searchQuery = useQuery({
    queryKey: [...profileQueryKeys.all, 'search-once', searchFiltersKey],
    queryFn: () => searchProfileIds(searchOnlyFilters), // Use filters without pagination
    enabled: hasSearched, // Only when user has explicitly searched
    staleTime: 1000 * 60 * 5, // 5 minutes - keep IDs cached
    retry: false,
    refetchOnWindowFocus: false,
    throwOnError: false,
  });
  
  // Calculate pagination from cached IDs (client-side pagination)
  const allProfileIds = searchQuery.data?.profileIds || [];
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageProfileIds = allProfileIds.slice(startIndex, endIndex);
  
  // Get profile data for current page only
  const profilesQuery = useBatchProfiles(
    pageProfileIds, 
    hasSearched && searchQuery.isSuccess && pageProfileIds.length > 0
  );
  
  return {
    // Search results (cached from first call)
    profileIds: allProfileIds,
    totalResults: allProfileIds.length,
    searchMetadata: searchQuery.data?.searchMetadata,
    
    // Current page data
    profiles: profilesQuery.data?.profiles || [],
    
    // Loading states
    isSearching: searchQuery.isLoading,
    isLoadingProfiles: profilesQuery.isLoading,
    isLoading: searchQuery.isLoading || profilesQuery.isLoading,
    
    // Error states
    searchError: searchQuery.error,
    profilesError: profilesQuery.error,
    error: searchQuery.error || profilesQuery.error,
    
    // Pagination
    pagination: {
      page,
      pageSize,
      total: allProfileIds.length,
      pages: Math.ceil(allProfileIds.length / pageSize),
    },
    
    // Manual refetch functions
    refetchSearch: searchQuery.refetch,
    refetchProfiles: profilesQuery.refetch,
    
    // Search status indicators
    hasResults: hasSearched && searchQuery.isSuccess,
    noResults: hasSearched && searchQuery.isSuccess && allProfileIds.length === 0,
  };
}

// Simple save profile list mutation - no automatic retry
export function useSaveProfileList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saveProfileList,
    onSuccess: () => {
      // Invalidate and refetch profile lists
      queryClient.invalidateQueries({ queryKey: ['profileLists'] });
    },
    // No retry on mutation - let user try again if needed
    retry: false,
  });
}