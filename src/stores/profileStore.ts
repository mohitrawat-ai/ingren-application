// src/stores/profileStore.ts - Simplified store for UI state only

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
    
    // Helper function to set nested property
    const setNestedProperty = (
      obj: ProfileFilters | Record<string, unknown>, 
      parts: string[], 
      val: unknown
    ): ProfileFilters => {
      if (parts.length === 1) {
        const key = parts[0];
        const objAsRecord = obj as Record<string, unknown>;
        
        // Handle array toggle logic for filters
        if (Array.isArray(objAsRecord[key]) && typeof val === 'string') {
          const currentArray = objAsRecord[key] as string[];
          const updatedArray = currentArray.includes(val)
            ? currentArray.filter(v => v !== val)
            : [...currentArray, val];
          
          return { ...obj, [key]: updatedArray } as ProfileFilters;
        }
        
        return { ...obj, [key]: val } as ProfileFilters;
      }
      
      const [currentKey, ...restParts] = parts;
      const objAsRecord = obj as Record<string, unknown>;
      const nestedObj = objAsRecord[currentKey];
      const nextObj = (nestedObj && typeof nestedObj === 'object' && !Array.isArray(nestedObj)) 
        ? nestedObj as Record<string, unknown>
        : {};
        
      return {
        ...obj,
        [currentKey]: setNestedProperty(nextObj, restParts, val)
      } as ProfileFilters;
    };
    
    const updatedFilters = setNestedProperty(filters, pathParts, value);
    set({ filters: updatedFilters, currentPage: 1 }); // Reset to first page on filter change
  },
  
  clearFilters: () => {
    set({ filters: {}, currentPage: 1 });
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