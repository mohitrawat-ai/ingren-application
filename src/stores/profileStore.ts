// src/stores/profileStore.ts
import { create } from 'zustand';
import { 
  Profile, 
  ProfileFilters, 
  ProviderProfileFilters,
  ProfilePaginationInfo,
  SaveProfileListParams
} from '@/types/profile';

// Profile API functions (we'll create these next)
import * as profileApi from '@/lib/actions/profile';

interface ProfileSearchState {
  // Search state
  query: string;
  filters: ProfileFilters;
  profiles: Profile[];
  selectedProfiles: Profile[];
  loadingProfiles: boolean;
  profilePagination: ProfilePaginationInfo | null;
  
  // Profile details
  currentProfile: Profile | null;
  loadingCurrentProfile: boolean;
  
  // List management state
  newListName: string;
  savingList: boolean;
  
  // Filter options
  filterOptions: {
    industries: string[];
    managementLevels: string[];
    seniorityLevels: string[];
    departments: string[];
    companySizes: string[];
    usStates: string[];
    countries: string[];
  } | null;
  loadingFilterOptions: boolean;
  
  // Actions - Search
  setQuery: (query: string) => void;
  updateFilter: (path: string, value: unknown) => void;
  searchProfiles: (page?: number) => Promise<void>;
  
  // Actions - Selection
  toggleProfileSelection: (profile: Profile) => void;
  bulkSelectProfiles: (profiles: Profile[]) => void;
  bulkDeselectProfiles: (profileIds: string[]) => void;
  clearProfileSelections: () => void;
  
  // Actions - Profile details
  fetchProfile: (id: string) => Promise<void>;
  clearCurrentProfile: () => void;
  
  // Actions - List management
  setNewListName: (name: string) => void;
  saveAsList: () => Promise<number | null>;
  
  // Actions - Filter options
  fetchFilterOptions: () => Promise<void>;
  
  // Actions - UI
  reset: () => void;
}

export const useProfileStore = create<ProfileSearchState>()((set, get) => ({
  // Initial state
  query: '',
  filters: {},
  profiles: [],
  selectedProfiles: [],
  loadingProfiles: false,
  profilePagination: null,
  
  currentProfile: null,
  loadingCurrentProfile: false,
  
  newListName: '',
  savingList: false,
  
  filterOptions: null,
  loadingFilterOptions: false,
  
  // Actions - Search
  setQuery: (query) => set({ query }),
  
  updateFilter: (path, value) => {
    const { filters } = get();
    const pathParts = path.split('.');
    
    // Helper function to set nested property
    const setNestedProperty = (obj: any, parts: string[], val: unknown): any => {
      if (parts.length === 1) {
        const key = parts[0];
        
        // Handle array toggle logic for filters
        if (Array.isArray(obj[key]) && typeof val === 'string') {
          const currentArray = obj[key] as string[];
          const updatedArray = currentArray.includes(val)
            ? currentArray.filter(v => v !== val)
            : [...currentArray, val];
          
          return { ...obj, [key]: updatedArray };
        }
        
        return { ...obj, [key]: val };
      }
      
      const [currentKey, ...restParts] = parts;
      return {
        ...obj,
        [currentKey]: setNestedProperty(obj[currentKey] || {}, restParts, val)
      };
    };
    
    const updatedFilters = setNestedProperty(filters, pathParts, value);
    set({ filters: updatedFilters });
  },
  
  searchProfiles: async (page = 1) => {
    const { query, filters } = get();
    
    set({ loadingProfiles: true });
    try {
      // Convert to provider API format
      const providerFilters: ProviderProfileFilters = {
        ...filters,
        keywords: query,
        page,
        pageSize: 10
      };
      
      // First get profile IDs
      const searchResponse = await profileApi.searchProfileIds(providerFilters);
      
      if (searchResponse.profileIds.length === 0) {
        set({ 
          profiles: [], 
          profilePagination: {
            page,
            pageSize: 10,
            total: 0,
            pages: 0
          },
          loadingProfiles: false 
        });
        return;
      }
      
      // Calculate pagination for current page
      const pageSize = 10;
      const startIndex = (page - 1) * pageSize;
      const endIndex = startIndex + pageSize;
      const pageProfileIds = searchResponse.profileIds.slice(startIndex, endIndex);
      
      // Get full profile data for current page
      const profilesResponse = await profileApi.getBatchProfiles(pageProfileIds);
      
      set({ 
        profiles: profilesResponse.profiles,
        profilePagination: {
          page,
          pageSize,
          total: searchResponse.profileIds.length,
          pages: Math.ceil(searchResponse.profileIds.length / pageSize)
        },
        loadingProfiles: false 
      });
    } catch (error) {
      set({ loadingProfiles: false });
      console.error('Error searching profiles:', error);
      throw error;
    }
  },
  
  // Actions - Selection
  toggleProfileSelection: (profile) => {
    const { selectedProfiles } = get();
    const isSelected = selectedProfiles.some(p => p.id === profile.id);
    
    if (isSelected) {
      set({ 
        selectedProfiles: selectedProfiles.filter(p => p.id !== profile.id),
      });
    } else {
      set({ 
        selectedProfiles: [...selectedProfiles, profile],
      });
    }
  },
  
  bulkSelectProfiles: (profiles) => {
    const { selectedProfiles } = get();
    const existingIds = new Set(selectedProfiles.map(p => p.id));
    const newProfiles = profiles.filter(p => !existingIds.has(p.id));
    
    set({
      selectedProfiles: [...selectedProfiles, ...newProfiles]
    });
  },
  
  bulkDeselectProfiles: (profileIds) => {
    const { selectedProfiles } = get();
    set({
      selectedProfiles: selectedProfiles.filter(p => !profileIds.includes(p.id))
    });
  },
  
  clearProfileSelections: () => set({ selectedProfiles: [] }),
  
  // Actions - Profile details
  fetchProfile: async (id) => {
    set({ loadingCurrentProfile: true });
    try {
      const profile = await profileApi.getProfile(id);
      set({ currentProfile: profile, loadingCurrentProfile: false });
    } catch (error) {
      set({ loadingCurrentProfile: false });
      console.error('Error fetching profile:', error);
      throw error;
    }
  },
  
  clearCurrentProfile: () => set({ currentProfile: null }),
  
  // Actions - List management
  setNewListName: (name) => set({ newListName: name }),
  
  saveAsList: async () => {
    const { newListName, selectedProfiles, filters, query } = get();
    
    if (!newListName || selectedProfiles.length === 0) {
      return null;
    }
    
    set({ savingList: true });
    try {
      const listParams: SaveProfileListParams = {
        name: newListName,
        profiles: selectedProfiles,
        totalResults: selectedProfiles.length,
        metadata: {
          searchFilters: filters,
          query,
        }
      };
      
      const newList = await profileApi.saveProfileList(listParams);
      
      set({ savingList: false, newListName: '' });
      return newList.id;
    } catch (error) {
      set({ savingList: false });
      console.error('Error saving profile list:', error);
      throw error;
    }
  },
  
  // Actions - Filter options
  fetchFilterOptions: async () => {
    set({ loadingFilterOptions: true });
    try {
      const options = await profileApi.getFilterOptions();
      set({ filterOptions: options, loadingFilterOptions: false });
    } catch (error) {
      set({ loadingFilterOptions: false });
      console.error('Error fetching filter options:', error);
      throw error;
    }
  },
  
  // Actions - UI
  reset: () => set({
    query: '',
    filters: {},
    profiles: [],
    selectedProfiles: [],
    profilePagination: null,
    currentProfile: null,
    newListName: '',
    filterOptions: null,
  }),
}));