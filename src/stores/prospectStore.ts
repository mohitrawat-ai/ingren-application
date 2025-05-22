// src/stores/prospectStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Company, Prospect, CompanyFilters, ProspectFilters } from '@/types';
import { saveProspectList } from '@/lib/actions/prospect';
import { 
  ProviderCompanyFilters, 
  ProviderProspectFilters,
  PaginationInfo 
} from '@/types';

import * as providerApi from '@/lib/actions/provider';

interface ProspectSearchState {
  // Company search state
  companyQuery: string;
  companyFilters: CompanyFilters;
  companies: Company[];
  selectedCompanies: Company[];
  loadingCompanies: boolean;
  companyPagination: PaginationInfo | null;
  
  // Prospect search state
  prospectQuery: string;
  prospectFilters: ProspectFilters;
  prospects: Prospect[];
  selectedProspects: Prospect[];
  loadingProspects: boolean;
  prospectPagination: PaginationInfo | null;
  searchMode: 'all' | 'selection';
  
  // List management state
  newListName: string;
  savingList: boolean;
  
  // UI state
  activeTab: 'companies' | 'prospects';
  
  // Actions - Companies
  setCompanyQuery: (query: string) => void;
  updateCompanyFilter: (filterType: keyof CompanyFilters, value: string) => void;
  searchCompanies: (page?: number) => Promise<void>;
  toggleCompanySelection: (company: Company) => void;
  clearCompanySelections: () => void;
  
  // Actions - Prospects
  setProspectQuery: (query: string) => void;
  updateProspectFilter: (filterType: keyof ProspectFilters, value: string) => void;
  searchProspects: (page?: number) => Promise<void>;
  toggleProspectSelection: (prospect: Prospect) => void;
  clearProspectSelections: () => void;
  setSearchMode: (mode: 'all' | 'selection') => void;
  
  // Actions - List management
  setNewListName: (name: string) => void;
  saveAsList: () => Promise<number | null>;
  
  // Actions - UI
  setActiveTab: (tab: 'companies' | 'prospects') => void;
  reset: () => void;
}

export const useProspectSearchStore = create<ProspectSearchState>()(
  persist(
    (set, get) => ({
      // Initial state - Companies
      companyQuery: '',
      companyFilters: {
        industries: [],
        sizes: [],
      },
      companies: [],
      selectedCompanies: [],
      loadingCompanies: false,
      companyPagination: null,
      
      // Initial state - Prospects
      prospectQuery: '',
      prospectFilters: {
        titles: [],
        departments: [],
        seniorities: [],
      },
      prospects: [],
      selectedProspects: [],
      loadingProspects: false,
      prospectPagination: null,
      searchMode: 'all',
      
      // Initial state - List management
      newListName: '',
      savingList: false,
      
      // Initial state - UI
      activeTab: 'companies',
      
      // Actions - Companies
      setCompanyQuery: (query) => set({ companyQuery: query }),
      
      updateCompanyFilter: (filterType, value) => {
        const currentFilters = get().companyFilters;
        const currentValues = currentFilters[filterType] || [];
        
        // Toggle the value (add if not present, remove if present)
        const updatedValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        set({
          companyFilters: {
            ...currentFilters,
            [filterType]: updatedValues,
          },
        });
      },
      
      searchCompanies: async (page = 1) => {
        const { companyQuery, companyFilters } = get();
        
        set({ loadingCompanies: true });
        try {
          // Convert to provider API format
          const providerFilters: ProviderCompanyFilters = {
            ...companyFilters,
            keywords: companyQuery,
            page,
            pageSize: 10
          };
          
          const response = await providerApi.searchCompanies(providerFilters);
          
          set({ 
            companies: response.companies, 
            companyPagination: response.pagination,
            loadingCompanies: false 
          });
        } catch (error) {
          set({ loadingCompanies: false });
          console.error('Error searching companies:', error);
          throw error;
        }
      },
      
      toggleCompanySelection: (company) => {
        const { selectedCompanies } = get();
        const isSelected = selectedCompanies.some(c => c.id === company.id);
        
        if (isSelected) {
          set({ 
            selectedCompanies: selectedCompanies.filter(c => c.id !== company.id),
          });
        } else {
          set({ 
            selectedCompanies: [...selectedCompanies, company],
            // If this is the first selection, automatically set search mode to 'selection'
            searchMode: selectedCompanies.length === 0 ? 'selection' : get().searchMode,
          });
        }
      },
      
      clearCompanySelections: () => set({ selectedCompanies: [] }),
      
      // Actions - Prospects
      setProspectQuery: (query) => set({ prospectQuery: query }),
      
      updateProspectFilter: (filterType, value) => {
        const currentFilters = get().prospectFilters;
        const currentValues = currentFilters[filterType]|| [];
        
        // Toggle the value
        const updatedValues = currentValues.includes(value)
          ? currentValues.filter(v => v !== value)
          : [...currentValues, value];
        
        set({
          prospectFilters: {
            ...currentFilters,
            [filterType]: updatedValues,
          },
        });
      },
      
      searchProspects: async (page = 1) => {
        const { prospectQuery, prospectFilters, selectedCompanies, searchMode } = get();
        
        set({ loadingProspects: true });
        try {
          // Determine company scope based on selection mode
          const companyScope = searchMode === 'selection' 
            ? selectedCompanies.map(c => c.id) 
            : undefined;
          
          // Convert to provider API format
          const providerFilters: ProviderProspectFilters = {
            ...prospectFilters,
            keywords: prospectQuery,
            page,
            pageSize: 10
          };
          
          const response = await providerApi.searchProspects(providerFilters, companyScope);
          
          set({ 
            prospects: response.prospects, 
            prospectPagination: response.pagination,
            loadingProspects: false 
          });
        } catch (error) {
          set({ loadingProspects: false });
          console.error('Error searching prospects:', error);
          throw error;
        }
      },
      
      toggleProspectSelection: (prospect) => {
        const { selectedProspects } = get();
        const isSelected = selectedProspects.some(p => p.id === prospect.id);
        
        if (isSelected) {
          set({ 
            selectedProspects: selectedProspects.filter(p => p.id !== prospect.id),
          });
        } else {
          set({ 
            selectedProspects: [...selectedProspects, prospect],
          });
        }
      },
      
      clearProspectSelections: () => set({ selectedProspects: [] }),
      
      setSearchMode: (mode) => set({ searchMode: mode }),
      
      // Actions - List management
      setNewListName: (name) => set({ newListName: name }),
      
      saveAsList: async () => {
        const { newListName, selectedProspects, companyFilters, prospectFilters, companyQuery, prospectQuery } = get();
        
        if (!newListName || selectedProspects.length === 0) {
          return null;
        }
        
        set({ savingList: true });
        try {
          const newList = await saveProspectList({
            name: newListName,
            contacts: selectedProspects,
            totalResults: selectedProspects.length,
            metadata: {
              searchFilters: {
                company: companyFilters,
                prospect: prospectFilters,
                companyQuery,
                prospectQuery,
              }
            }
          });
          
          set({ savingList: false, newListName: '' });
          return newList.id;
        } catch (error) {
          set({ savingList: false });
          console.error('Error saving list:', error);
          throw error;
        }
      },
      
      // Actions - UI
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      reset: () => set({
        companyQuery: '',
        companyFilters: {
          industries: [],
          sizes: [],
        },
        companies: [],
        selectedCompanies: [],
        companyPagination: null,
        prospectQuery: '',
        prospectFilters: {
          titles: [],
          departments: [],
          seniorities: [],
        },
        prospects: [],
        selectedProspects: [],
        prospectPagination: null,
        searchMode: 'all',
        newListName: '',
        activeTab: 'companies',
      }),
    }),
    {
      name: 'prospect-search-store',
      // Only persist some of the state
      partialize: (state) => ({
        companyFilters: state.companyFilters,
        prospectFilters: state.prospectFilters,
        activeTab: state.activeTab,
        searchMode: state.searchMode,
      }),
    }
  )
);