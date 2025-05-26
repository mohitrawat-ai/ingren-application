// src/hooks/useProfileQueries.ts - Updated to only search when hasSearched is true

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
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

export function useFilterOptions() {
  return useQuery({
    queryKey: profileQueryKeys.filterOptions(),
    queryFn: getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes - filter options rarely change
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: 2, // Retry twice before giving up
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000), // Exponential backoff
    refetchOnWindowFocus: false,
    refetchOnMount: true, // Always try to get fresh data on mount
    throwOnError: false, // Let the component handle the error gracefully
  });
}

// Hook for profile search - UPDATED to only run when hasSearched is true
export function useProfileSearch(filters: ProviderProfileFilters, hasSearched: boolean) {
  return useQuery({
    queryKey: profileQueryKeys.search(filters),
    queryFn: () => searchProfileIds(filters),
    enabled: hasSearched, // Only enabled when user has explicitly searched
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1, // Retry once on failure
    refetchOnWindowFocus: false,
  });
}

// Hook for batch profile retrieval
export function useBatchProfiles(profileIds: string[], enabled = true) {
  return useQuery({
    queryKey: [...profileQueryKeys.all, 'batch', profileIds],
    queryFn: () => getBatchProfiles(profileIds),
    enabled: enabled && profileIds.length > 0,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
}

// Hook for single profile
export function useProfile(id: string, enabled = true) {
  return useQuery({
    queryKey: profileQueryKeys.profile(id),
    queryFn: () => getProfile(id),
    enabled: enabled && !!id,
    staleTime: 1000 * 60 * 15, // 15 minutes
  });
}

// Hook for filter validation
export function useFilterValidation(filters: ProviderProfileFilters, enabled = true) {
  return useQuery({
    queryKey: profileQueryKeys.validation(filters),
    queryFn: () => validateFilters(filters),
    enabled: enabled && Object.keys(filters).length > 0,
    staleTime: 1000 * 60 * 2, // 2 minutes
    retry: false,
  });
}

// UPDATED: Combined hook that uses appliedFilters and hasSearched
export function useProfileSearchWithData(
  appliedFilters: ProviderProfileFilters, // Changed from filters to appliedFilters
  page = 1, 
  pageSize = 10,
  hasSearched = false // NEW: Only search when user has clicked search
) {
  const queryClient = useQueryClient();
  
  // First get profile IDs - only when hasSearched is true
  const searchQuery = useProfileSearch(appliedFilters, hasSearched);
  
  // Calculate pagination
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageProfileIds = searchQuery.data?.profileIds?.slice(startIndex, endIndex) || [];
  
  // Then get profile data for current page - only if search was successful
  const profilesQuery = useBatchProfiles(
    pageProfileIds, 
    hasSearched && !!searchQuery.data?.profileIds && pageProfileIds.length > 0
  );
  
  // Prefetch next page - only if we have search results
  const nextPageIds = searchQuery.data?.profileIds?.slice(endIndex, endIndex + pageSize) || [];
  if (hasSearched && nextPageIds.length > 0 && searchQuery.data?.profileIds) {
    queryClient.prefetchQuery({
      queryKey: [...profileQueryKeys.all, 'batch', nextPageIds],
      queryFn: () => getBatchProfiles(nextPageIds),
      staleTime: 1000 * 60 * 10,
    });
  }
  
  return {
    // Search results
    profileIds: searchQuery.data?.profileIds || [],
    totalResults: searchQuery.data?.profileIds?.length || 0,
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
      total: searchQuery.data?.profileIds?.length || 0,
      pages: Math.ceil((searchQuery.data?.profileIds?.length || 0) / pageSize),
    },
    
    // Refetch functions
    refetchSearch: searchQuery.refetch,
    refetchProfiles: profilesQuery.refetch,
    
    // NEW: Indicate if search has been performed
    hasResults: hasSearched && searchQuery.isSuccess,
    noResults: hasSearched && searchQuery.isSuccess && (searchQuery.data?.profileIds?.length || 0) === 0,
  };
}

// Mutation hooks for data modification
export function useSaveProfileList() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: saveProfileList,
    onSuccess: () => {
      // Invalidate and refetch profile lists
      queryClient.invalidateQueries({ queryKey: ['profileLists'] });
    },
  });
}