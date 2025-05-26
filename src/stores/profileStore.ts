// src/stores/profileStore.ts - Updated with reset search state

import { create } from 'zustand';
import { Profile, ProfileFilters } from '@/types/profile';

interface ProfileUIState {
  // Search filters (UI state)
  query: string;
  filters: ProfileFilters;
  
  // Selection state (UI state)
  selectedProfiles: Profile[];
  
  // Current profile view (UI state)
  currentProfileId: string | null;
  
  // List creation state (UI state)
  newListName: string;
  
  // Pagination state (UI state)
  currentPage: number;
  pageSize: number;
  
  // UI Actions
  setQuery: (query: string) => void;
  updateFilter: (path: string, value: unknown) => void;
  clearFilters: () => void;
  resetSearch: () => void; // NEW: Reset search state
  
  // Selection actions
  toggleProfileSelection: (profile: Profile) => void;
  bulkSelectProfiles: (profiles: Profile[]) => void;
  bulkDeselectProfiles: (profileIds: string[]) => void;
  clearProfileSelections: () => void;
  
  // Navigation actions
  setCurrentProfileId: (id: string | null) => void;
  
  // List management
  setNewListName: (name: string) => void;
  
  // Pagination actions
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // Reset function
  reset: () => void;
}

export const useProfileStore = create<ProfileUIState>()((set, get) => ({
  // Initial state
  query: '',
  filters: {},
  selectedProfiles: [],
  currentProfileId: null,
  newListName: '',
  currentPage: 1,
  pageSize: 10,
  
  // Search actions
  setQuery: (query) => {
    set({ query, currentPage: 1 }); // Reset to first page on new search
  },
  
  updateFilter: (path, value) => {
    const { filters } = get();
    const pathParts = path.split('.');
    
    // Helper function to set nested property with proper array handling
    const setNestedProperty = (
      obj: ProfileFilters | Record<string, unknown>, 
      parts: string[], 
      val: unknown
    ): ProfileFilters => {
      if (parts.length === 1) {
        const key = parts[0];
        const objAsRecord = obj as Record<string, unknown>;
        const currentValue = objAsRecord[key];
        
        // Special handling for array toggle operations
        if (typeof val === 'string') {
          // Check if this should be treated as an array toggle
          // Based on the filter structure, these fields should be arrays
          const arrayFields = [
            'states', 'cities', 'countries', 'metroAreas', // location fields
            'jobTitles', 'departments', 'managementLevels', 'seniorityLevels', // role fields
            'industries', 'subIndustries', 'techStack', // company fields
            'skills', 'educationLevel' // advanced fields
          ];
          
          if (arrayFields.includes(key)) {
            const currentArray = Array.isArray(currentValue) ? currentValue : [];
            const updatedArray = currentArray.includes(val)
              ? currentArray.filter(v => v !== val)
              : [...currentArray, val];
            
            // Return undefined if array is empty to clean up the filter object
            return { 
              ...obj, 
              [key]: updatedArray.length > 0 ? updatedArray : undefined 
            } as ProfileFilters;
          }
        }
        
        // For non-array values or explicit array assignment
        return { ...obj, [key]: val } as ProfileFilters;
      }
      
      const [currentKey, ...restParts] = parts;
      const objAsRecord = obj as Record<string, unknown>;
      const nestedObj = objAsRecord[currentKey];
      const nextObj = (nestedObj && typeof nestedObj === 'object' && !Array.isArray(nestedObj)) 
        ? nestedObj as Record<string, unknown>
        : {};
        
      const updatedNestedObj = setNestedProperty(nextObj, restParts, val);
      
      // Clean up empty nested objects
      const hasValues = Object.values(updatedNestedObj).some(v => 
        v !== undefined && v !== null && 
        (!Array.isArray(v) || v.length > 0) &&
        (typeof v !== 'object' || Object.keys(v).length > 0)
      );
      
      return {
        ...obj,
        [currentKey]: hasValues ? updatedNestedObj : undefined
      } as ProfileFilters;
    };
    
    const updatedFilters = setNestedProperty(filters, pathParts, value);
    
    // Clean up the filters object by removing undefined values
    const cleanFilters = JSON.parse(JSON.stringify(updatedFilters, (key, val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val) && val.length === 0) return undefined;
      if (typeof val === 'object' && val !== null && Object.keys(val).length === 0) return undefined;
      return val;
    }));
    
    set({ filters: cleanFilters, currentPage: 1 }); // Reset to first page on filter change
  },
  
  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
  },
  
  // NEW: Reset search state while keeping selections
  resetSearch: () => {
    set({ 
      query: '',
      filters: {},
      currentPage: 1,
      // Keep selectedProfiles and other UI state intact
    });
  },
  
  // Selection actions
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
  
  // Navigation actions
  setCurrentProfileId: (id) => set({ currentProfileId: id }),
  
  // List management
  setNewListName: (name) => set({ newListName: name }),
  
  // Pagination actions
  setPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  
  // Reset function
  reset: () => set({
    query: '',
    filters: {},
    selectedProfiles: [],
    currentProfileId: null,
    newListName: '',
    currentPage: 1,
    pageSize: 10,
  }),
}));