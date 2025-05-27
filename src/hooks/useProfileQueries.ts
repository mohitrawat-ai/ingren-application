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
  // IMPORTANT: Remove page/pageSize from search key - only include actual search filters
  search: (filters: Omit<ProviderProfileFilters, 'page' | 'pageSize'>) => 
    [...profileQueryKeys.all, 'search', filters] as const,
  profile: (id: string) => [...profileQueryKeys.all, 'profile', id] as const,
  validation: (filters: ProviderProfileFilters) => [...profileQueryKeys.all, 'validation', filters] as const,
};

// Simple filter options hook - no automatic retry
export function useFilterOptions() {
  return useQuery({
    queryKey: profileQueryKeys.filterOptions(),
    queryFn: getFilterOptions,
    staleTime: 1000 * 60 * 30, // 30 minutes
    gcTime: 1000 * 60 * 60, // 1 hour
    retry: false, // No automatic retry - user clicks retry button
    refetchOnWindowFocus: false,
    throwOnError: false, // Let component handle errors gracefully
  });
}

// Simple batch profiles hook - no automatic retry
export function useBatchProfiles(profileIds: string[], enabled = true) {
  return useQuery({
    queryKey: [...profileQueryKeys.all, 'batch', profileIds],
    queryFn: () => getBatchProfiles(profileIds),
    enabled: enabled && profileIds.length > 0,
    staleTime: 1000 * 60 * 60, // 1 hour
    gcTime: 1000 * 60 * 60 * 2, // 2 hours
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

// Hook for profile search - UPDATED to exclude pagination from query key
export function useProfileSearch(
  filters: ProviderProfileFilters, 
  hasSearched: boolean
) {
  // Extract pagination params to exclude from query key
  const { page : __page, pageSize : __pageSize, ...searchFilters } = filters;
  console.log('Page:', __page, 'Page Size:', __pageSize);
  
  return useQuery({
    queryKey: profileQueryKeys.search(searchFilters), // Use only search filters for key
    queryFn: () => searchProfileIds({
      ...searchFilters,
      page: 1, // Always get from page 1
      pageSize: 1000, // Get max results in one call
    }),
    enabled: hasSearched,
    staleTime: 1000 * 60 * 5, // 5 minutes
    retry: 1,
    refetchOnWindowFocus: false,
  });
}

// UPDATED: Combined hook with proper separation of concerns
export function useProfileSearchWithData(
  appliedFilters: ProviderProfileFilters,
  page: number = 1, 
  pageSize: number = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  hasSearched = false
) {
  // Separate search filters from pagination
  const { page: __page, pageSize: __pageSize, ...searchFilters } = appliedFilters;

  console.log('Page:', __page, 'Page Size:', __pageSize);
  
  // First get profile IDs - only when hasSearched is true
  // This will only re-run when searchFilters change, not on pagination
  const searchQuery = useProfileSearch(
    { ...searchFilters, page: 1, pageSize: 1000 }, 
    hasSearched
  );
  
  // Calculate pagination on the client side
  const startIndex = (page - 1) * pageSize;
  const endIndex = startIndex + pageSize;
  const pageProfileIds = searchQuery.data?.profileIds?.slice(startIndex, endIndex) || [];
  
  // Then get profile data for current page
  const profilesQuery = useBatchProfiles(
    pageProfileIds, 
    hasSearched && !!searchQuery.data?.profileIds && pageProfileIds.length > 0
  );
  
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
    
    // Status flags
    hasResults: hasSearched && searchQuery.isSuccess,
    noResults: hasSearched && searchQuery.isSuccess && (searchQuery.data?.profileIds?.length || 0) === 0,
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