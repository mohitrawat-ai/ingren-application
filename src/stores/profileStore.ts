// src/stores/profileStore.ts - Updated with user-friendly UX methods

import { create } from 'zustand';
import { Profile, ProfileFilters } from '@/types/profile';

interface ProfileUIState {
  // Search state
  query: string;
  draftQuery: string;
  
  // Filter state - separated into draft and applied
  draftFilters: ProfileFilters;
  appliedFilters: ProfileFilters;
  
  // Search control
  hasSearched: boolean;
  
  // Selection state (unchanged)
  selectedProfiles: Profile[];
  
  // Current profile view (unchanged)
  currentProfileId: string | null;
  
  // List creation state (unchanged)
  newListName: string;
  
  // Pagination state (unchanged)
  currentPage: number;
  pageSize: number;
  
  // Search Actions
  setDraftQuery: (query: string) => void;
  updateDraftFilter: (path: string, value: unknown) => void;
  clearDraftFilters: () => void;
  applyFilters: () => void;
  resetSearch: () => void;
  discardChanges: () => void; // NEW: Discard draft changes
  
  // Selection actions (unchanged)
  toggleProfileSelection: (profile: Profile) => void;
  bulkSelectProfiles: (profiles: Profile[]) => void;
  bulkDeselectProfiles: (profileIds: string[]) => void;
  clearProfileSelections: () => void;
  
  // Navigation actions (unchanged)
  setCurrentProfileId: (id: string | null) => void;
  
  // List management (unchanged)
  setNewListName: (name: string) => void;
  
  // Pagination actions (unchanged)
  setPage: (page: number) => void;
  setPageSize: (size: number) => void;
  
  // USER-FRIENDLY UX METHODS (updated for better UX)
  hasUnsavedChanges: () => boolean;          // Renamed from hasPendingChanges
  getCurrentFiltersCount: () => number;       // What user sees as "active filters"
  getCurrentFilters: () => ProfileFilters;   // What user sees as current filters
  getCurrentQuery: () => string;             // What user sees as current query
  
  // Reset function (unchanged)
  reset: () => void;
}

export const useProfileStore = create<ProfileUIState>()((set, get) => ({
  // Initial state
  query: '',
  draftQuery: '',
  draftFilters: {},
  appliedFilters: {},
  hasSearched: false,
  selectedProfiles: [],
  currentProfileId: null,
  newListName: '',
  currentPage: 1,
  pageSize: 10,
  
  // Search actions
  setDraftQuery: (draftQuery) => {
    set({ draftQuery });
  },
  
  updateDraftFilter: (path, value) => {
    const { draftFilters } = get();
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
          const arrayFields = [
            'states', 'cities', 'countries', 'metroAreas',
            'jobTitles', 'departments', 'managementLevels', 'seniorityLevels',
            'industries', 'subIndustries', 'techStack',
            'skills', 'educationLevel'
          ];
          
          if (arrayFields.includes(key)) {
            const currentArray = Array.isArray(currentValue) ? currentValue : [];
            const updatedArray = currentArray.includes(val)
              ? currentArray.filter(v => v !== val)
              : [...currentArray, val];
            
            return { 
              ...obj, 
              [key]: updatedArray.length > 0 ? updatedArray : undefined 
            } as ProfileFilters;
          }
        }
        
        return { ...obj, [key]: val } as ProfileFilters;
      }
      
      const [currentKey, ...restParts] = parts;
      const objAsRecord = obj as Record<string, unknown>;
      const nestedObj = objAsRecord[currentKey];
      const nextObj = (nestedObj && typeof nestedObj === 'object' && !Array.isArray(nestedObj)) 
        ? nestedObj as Record<string, unknown>
        : {};
        
      const updatedNestedObj = setNestedProperty(nextObj, restParts, val);
      
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
    
    const updatedDraftFilters = setNestedProperty(draftFilters, pathParts, value);
    
    const cleanFilters = JSON.parse(JSON.stringify(updatedDraftFilters, (key, val) => {
      if (val === undefined) return undefined;
      if (Array.isArray(val) && val.length === 0) return undefined;
      if (typeof val === 'object' && val !== null && Object.keys(val).length === 0) return undefined;
      return val;
    }));
    
    set({ draftFilters: cleanFilters });
  },
  
  clearDraftFilters: () => {
    set({ draftFilters: {}, draftQuery: '' });
  },
  
  applyFilters: () => {
    const { draftFilters, draftQuery } = get();
    set({ 
      appliedFilters: { ...draftFilters },
      query: draftQuery,
      hasSearched: true,
      currentPage: 1
    });
  },
  
  resetSearch: () => {
    set({ 
      query: '',
      draftQuery: '',
      draftFilters: {},
      appliedFilters: {},
      hasSearched: false,
      currentPage: 1,
    });
  },
  
  // NEW: Discard changes and revert to applied state
  discardChanges: () => {
    const { appliedFilters, query } = get();
    set({
      draftFilters: { ...appliedFilters },
      draftQuery: query,
    });
  },
  
  // Selection actions (unchanged - keeping for brevity)
  toggleProfileSelection: (profile) => {
    const { selectedProfiles } = get();
    const isSelected = selectedProfiles.some(p => p.id === profile.id);
    
    if (isSelected) {
      set({ selectedProfiles: selectedProfiles.filter(p => p.id !== profile.id) });
    } else {
      set({ selectedProfiles: [...selectedProfiles, profile] });
    }
  },
  
  bulkSelectProfiles: (profiles) => {
    const { selectedProfiles } = get();
    const existingIds = new Set(selectedProfiles.map(p => p.id));
    const newProfiles = profiles.filter(p => !existingIds.has(p.id));
    set({ selectedProfiles: [...selectedProfiles, ...newProfiles] });
  },
  
  bulkDeselectProfiles: (profileIds) => {
    const { selectedProfiles } = get();
    set({ selectedProfiles: selectedProfiles.filter(p => !profileIds.includes(p.id)) });
  },
  
  clearProfileSelections: () => set({ selectedProfiles: [] }),
  
  // Navigation actions (unchanged)
  setCurrentProfileId: (id) => set({ currentProfileId: id }),
  
  // List management (unchanged)
  setNewListName: (name) => set({ newListName: name }),
  
  // Pagination actions (unchanged)
  setPage: (page) => set({ currentPage: page }),
  setPageSize: (size) => set({ pageSize: size, currentPage: 1 }),
  
  // USER-FRIENDLY UX METHODS
  hasUnsavedChanges: () => {
    const { draftFilters, appliedFilters, draftQuery, query } = get();
    return (
      JSON.stringify(draftFilters) !== JSON.stringify(appliedFilters) ||
      draftQuery !== query
    );
  },
  
  getCurrentFiltersCount: () => {
    const { hasSearched, appliedFilters, draftFilters } = get();
    // Show applied filters if searched, otherwise show draft (what user is configuring)
    const filtersToCount = hasSearched ? appliedFilters : draftFilters;
    return countFilters(filtersToCount);
  },
  
  getCurrentFilters: () => {
    const { hasSearched, appliedFilters, draftFilters } = get();
    // Show applied filters if searched, otherwise show draft
    return hasSearched ? appliedFilters : draftFilters;
  },
  
  getCurrentQuery: () => {
    const { hasSearched, query, draftQuery } = get();
    // Show applied query if searched, otherwise show draft
    return hasSearched ? query : draftQuery;
  },
  
  // Reset function (unchanged)
  reset: () => set({
    query: '',
    draftQuery: '',
    draftFilters: {},
    appliedFilters: {},
    hasSearched: false,
    selectedProfiles: [],
    currentProfileId: null,
    newListName: '',
    currentPage: 1,
    pageSize: 10,
  }),
}));

// Helper function to count active filters (unchanged)
function countFilters(filters: ProfileFilters): number {
  let count = 0;
  
  // Count location filters
  if (filters.location?.countries?.length) count += filters.location.countries.length;
  if (filters.location?.states?.length) count += filters.location.states.length;
  if (filters.location?.cities?.length) count += filters.location.cities.length;
  
  // Count role filters
  if (filters.role?.jobTitles?.length) count += filters.role.jobTitles.length;
  if (filters.role?.departments?.length) count += filters.role.departments.length;
  if (filters.role?.managementLevels?.length) count += filters.role.managementLevels.length;
  if (filters.role?.seniorityLevels?.length) count += filters.role.seniorityLevels.length;
  if (filters.role?.isDecisionMaker) count += 1;
  if (filters.role?.keywords) count += 1;
  
  // Count company filters
  if (filters.company?.industries?.length) count += filters.company.industries.length;
  if (filters.company?.employeeCountRange?.min || filters.company?.employeeCountRange?.max) count += 1;
  if (filters.company?.revenueRange?.min || filters.company?.revenueRange?.max) count += 1;
  if (filters.company?.foundedAfter || filters.company?.foundedBefore) count += 1;
  if (filters.company?.isB2B) count += 1;
  if (filters.company?.hasRecentFunding) count += 1;
  if (filters.company?.companyKeywords) count += 1;
  
  // Count advanced filters
  if (filters.advanced?.skills?.length) count += filters.advanced.skills.length;
  if (filters.advanced?.tenureRange?.min || filters.advanced?.tenureRange?.max) count += 1;
  if (filters.advanced?.recentJobChange) count += 1;
  if (filters.advanced?.keywords) count += 1;
  
  return count;
}