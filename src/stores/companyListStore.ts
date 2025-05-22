// src/stores/companyListStore.ts
import { create } from 'zustand';
import { 
  getCompanyLists, 
  getCompanyList, 
  createCompanyList,
  updateCompanyList,
  deleteCompanyList,
  addCompaniesToList,
  removeCompaniesFromList,
  getCompanyListsForScoping
} from '@/lib/actions/companyList';
import { TargetList, TargetListCompany } from '@/lib/schema';
import { Company } from '@/types';

interface CompanyListWithCompanies extends TargetList {
  companies: TargetListCompany[];
  companyCount: number;
}

interface CompanyListState {
  // List data
  lists: CompanyListWithCompanies[];
  currentList: CompanyListWithCompanies | null;
  scopingLists: Array<{
    id: number;
    name: string;
    description: string | null;
    companyCount: number;
    createdAt: Date;
  }>;
  
  // UI state
  loadingLists: boolean;
  loadingCurrentList: boolean;
  loadingScopingLists: boolean;
  creating: boolean;
  updating: boolean;
  deleting: boolean;
  
  // Form state
  selectedCompanies: Company[];
  
  // Actions - Data loading
  fetchLists: () => Promise<void>;
  fetchList: (id: number) => Promise<void>;
  fetchScopingLists: () => Promise<void>;
  
  // Actions - CRUD operations
  createList: (data: {
    name: string;
    description?: string;
    companies: Company[];
  }) => Promise<TargetList>;
  
  updateList: (data: {
    id: number;
    name?: string;
    description?: string;
    companies?: Company[];
  }) => Promise<void>;
  
  deleteList: (id: number) => Promise<void>;
  
  // Actions - Company management
  addCompanies: (listId: number, companies: Company[]) => Promise<{
    added: number;
    skipped: number;
  }>;
  
  removeCompanies: (listId: number, companyIds: string[]) => Promise<void>;
  
  // Actions - Selection management
  setSelectedCompanies: (companies: Company[]) => void;
  addSelectedCompany: (company: Company) => void;
  removeSelectedCompany: (companyId: string) => void;
  clearSelectedCompanies: () => void;
  
  // Actions - UI state
  resetState: () => void;
}

export const useCompanyListStore = create<CompanyListState>((set, get) => ({
  // Initial state
  lists: [],
  currentList: null,
  scopingLists: [],
  loadingLists: false,
  loadingCurrentList: false,
  loadingScopingLists: false,
  creating: false,
  updating: false,
  deleting: false,
  selectedCompanies: [],
  
  // Actions - Data loading
  fetchLists: async () => {
    set({ loadingLists: true });
    try {
      const lists = await getCompanyLists();
      set({ lists, loadingLists: false });
    } catch (error) {
      set({ loadingLists: false });
      console.error('Error fetching company lists:', error);
      throw error;
    }
  },
  
  fetchList: async (id) => {
    set({ loadingCurrentList: true });
    try {
      const list = await getCompanyList(id);
      set({ currentList: list, loadingCurrentList: false });
    } catch (error) {
      set({ loadingCurrentList: false });
      console.error('Error fetching company list:', error);
      throw error;
    }
  },
  
  fetchScopingLists: async () => {
    set({ loadingScopingLists: true });
    try {
      const scopingLists = await getCompanyListsForScoping();
      set({ scopingLists, loadingScopingLists: false });
    } catch (error) {
      set({ loadingScopingLists: false });
      console.error('Error fetching scoping lists:', error);
      throw error;
    }
  },
  
  // Actions - CRUD operations
  createList: async (data) => {
    set({ creating: true });
    try {
      const newList = await createCompanyList(data);
      
      // Refresh lists
      await get().fetchLists();
      
      set({ creating: false });
      return newList;
    } catch (error) {
      set({ creating: false });
      console.error('Error creating company list:', error);
      throw error;
    }
  },
  
  updateList: async (data) => {
    set({ updating: true });
    try {
      await updateCompanyList(data);
      
      // Refresh current list if it's the one being updated
      if (get().currentList?.id === data.id) {
        await get().fetchList(data.id);
      }
      
      // Refresh lists
      await get().fetchLists();
      
      set({ updating: false });
    } catch (error) {
      set({ updating: false });
      console.error('Error updating company list:', error);
      throw error;
    }
  },
  
  deleteList: async (id) => {
    set({ deleting: true });
    try {
      await deleteCompanyList(id);
      
      // Clear current list if it's the one being deleted
      if (get().currentList?.id === id) {
        set({ currentList: null });
      }
      
      // Remove from lists
      const { lists } = get();
      set({ lists: lists.filter(list => list.id !== id) });
      
      set({ deleting: false });
    } catch (error) {
      set({ deleting: false });
      console.error('Error deleting company list:', error);
      throw error;
    }
  },
  
  // Actions - Company management
  addCompanies: async (listId, companies) => {
    try {
      const result = await addCompaniesToList(listId, companies);
      
      // Refresh current list if it's the one being updated
      if (get().currentList?.id === listId) {
        await get().fetchList(listId);
      }
      
      // Refresh lists
      await get().fetchLists();
      
      return result;
    } catch (error) {
      console.error('Error adding companies to list:', error);
      throw error;
    }
  },
  
  removeCompanies: async (listId, companyIds) => {
    try {
      await removeCompaniesFromList(listId, companyIds);
      
      // Refresh current list if it's the one being updated
      if (get().currentList?.id === listId) {
        await get().fetchList(listId);
      }
      
      // Refresh lists
      await get().fetchLists();
    } catch (error) {
      console.error('Error removing companies from list:', error);
      throw error;
    }
  },
  
  // Actions - Selection management
  setSelectedCompanies: (companies) => set({ selectedCompanies: companies }),
  
  addSelectedCompany: (company) => {
    const { selectedCompanies } = get();
    const exists = selectedCompanies.some(c => c.id === company.id);
    
    if (!exists) {
      set({ selectedCompanies: [...selectedCompanies, company] });
    }
  },
  
  removeSelectedCompany: (companyId) => {
    const { selectedCompanies } = get();
    set({ 
      selectedCompanies: selectedCompanies.filter(c => c.id !== companyId) 
    });
  },
  
  clearSelectedCompanies: () => set({ selectedCompanies: [] }),
  
  // Actions - UI state
  resetState: () => set({
    lists: [],
    currentList: null,
    scopingLists: [],
    loadingLists: false,
    loadingCurrentList: false,
    loadingScopingLists: false,
    creating: false,
    updating: false,
    deleting: false,
    selectedCompanies: [],
  }),
}));