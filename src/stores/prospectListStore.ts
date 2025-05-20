// src/stores/prospectListStore.ts
import { create } from 'zustand';
import { 
  getProspectLists, 
  getProspectList, 
  deleteProspectList 
} from '@/lib/actions/prospect';
import { AudienceType, ContactType } from '@/lib/schema';

interface ProspectListState {
  // List data
  lists: AudienceType[];
  currentList: (AudienceType & { contacts: ContactType[] }) | null;
  
  // UI state
  loadingLists: boolean;
  loadingCurrentList: boolean;
  filterText: string;
  currentPage: number;
  itemsPerPage: number;
  
  // Selected contacts
  selectedContacts: ContactType[];
  
  // Derived data (computed at runtime)
  filteredContacts: ContactType[];
  paginatedContacts: ContactType[];
  totalPages: number;
  
  // Actions - Data loading
  fetchLists: () => Promise<void>;
  fetchList: (id: number) => Promise<void>;
  deleteList: (id: number) => Promise<void>;
  
  // Actions - UI state
  setFilterText: (text: string) => void;
  setCurrentPage: (page: number) => void;
  
  // Actions - Selection
  toggleContactSelection: (contact: ContactType) => void;
  clearSelections: () => void;
  selectAll: () => void;
  
  // Pagination actions
  nextPage: () => void;
  prevPage: () => void;
  
  // Derived data calculation
  updateDerivedState: () => void;
}

export const useProspectListStore = create<ProspectListState>((set, get) => ({
  // Initial state
  lists: [],
  currentList: null,
  loadingLists: false,
  loadingCurrentList: false,
  filterText: '',
  currentPage: 1,
  itemsPerPage: 10,
  selectedContacts: [],
  
  // Derived data (initial empty values)
  filteredContacts: [],
  paginatedContacts: [],
  totalPages: 0,
  
  // Helper function to update derived state
  updateDerivedState: () => {
    const { currentList, filterText, currentPage, itemsPerPage } = get();
    
    // Calculate filtered contacts
    let filteredContacts: ContactType[] = [];
    if (currentList && currentList.contacts) {
      if (!filterText) {
        filteredContacts = [...currentList.contacts];
      } else {
        const searchText = filterText.toLowerCase();
        filteredContacts = currentList.contacts.filter(contact => {
          return (
            (contact.name && contact.name.toLowerCase().includes(searchText)) ||
            (contact.title && contact.title.toLowerCase().includes(searchText)) ||
            (contact.organizationName && contact.organizationName.toLowerCase().includes(searchText)) ||
            (contact.email && contact.email.toLowerCase().includes(searchText))
          );
        });
      }
    }
    
    // Calculate paginated contacts
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    const paginatedContacts = filteredContacts.slice(start, end);
    
    // Calculate total pages
    const totalPages = Math.ceil(filteredContacts.length / itemsPerPage);
    
    // Update the state with derived values
    set({ 
      filteredContacts, 
      paginatedContacts, 
      totalPages 
    });
  },
  
  // Actions - Data loading
  fetchLists: async () => {
    set({ loadingLists: true });
    try {
      const lists = await getProspectLists();
      set({ lists, loadingLists: false });
    } catch (error) {
      set({ loadingLists: false });
      console.error('Error fetching prospect lists:', error);
      throw error;
    }
  },
  
  fetchList: async (id) => {
    console.log(`fetchList called with id: ${id}`);
    set({ loadingCurrentList: true });
    try {
      console.log(`Calling getProspectList with id: ${id}`);
      const list = await getProspectList(id);
      console.log(`getProspectList returned:`, list);
      
      set({ currentList: list, loadingCurrentList: false, currentPage: 1, selectedContacts: [] });
      
      // Update the derived state after setting currentList
      setTimeout(() => get().updateDerivedState(), 0);
      
      console.log(`State updated with currentList`);
    } catch (error) {
      set({ loadingCurrentList: false });
      console.error('Error fetching prospect list:', error);
      throw error;
    }
  },
  
  deleteList: async (id) => {
    try {
      await deleteProspectList(id);
      const { lists } = get();
      set({ 
        lists: lists.filter(list => list.id !== id),
        currentList: null,
      });
    } catch (error) {
      console.error('Error deleting prospect list:', error);
      throw error;
    }
  },
  
  // Actions - UI state
  setFilterText: (text) => {
    set({ filterText: text, currentPage: 1 });
    // Update derived state when filter changes
    setTimeout(() => get().updateDerivedState(), 0);
  },
  
  setCurrentPage: (page) => {
    set({ currentPage: page });
    // Update derived state when page changes
    setTimeout(() => get().updateDerivedState(), 0);
  },
  
  // Actions - Selection
  toggleContactSelection: (contact) => {
    const { selectedContacts } = get();
    const isSelected = selectedContacts.some(c => c.id === contact.id);
    
    if (isSelected) {
      set({ selectedContacts: selectedContacts.filter(c => c.id !== contact.id) });
    } else {
      set({ selectedContacts: [...selectedContacts, contact] });
    }
  },
  
  clearSelections: () => set({ selectedContacts: [] }),
  
  selectAll: () => {
    const { paginatedContacts, selectedContacts } = get();
    
    // If all paginated contacts are already selected, deselect them
    if (paginatedContacts.every(contact => 
      selectedContacts.some(selected => selected.id === contact.id)
    )) {
      const paginatedIds = paginatedContacts.map(contact => contact.id);
      set({ 
        selectedContacts: selectedContacts.filter(contact => 
          !paginatedIds.includes(contact.id)
        ) 
      });
    } else {
      // Otherwise, select all paginated contacts
      const newSelectedContacts = [...selectedContacts];
      
      paginatedContacts.forEach(contact => {
        if (!selectedContacts.some(selected => selected.id === contact.id)) {
          newSelectedContacts.push(contact);
        }
      });
      
      set({ selectedContacts: newSelectedContacts });
    }
  },
  
  // Pagination actions
  nextPage: () => {
    const { currentPage, totalPages } = get();
    if (currentPage < totalPages) {
      set({ currentPage: currentPage + 1 });
      // Update derived state after page change
      setTimeout(() => get().updateDerivedState(), 0);
    }
  },
  
  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
      // Update derived state after page change
      setTimeout(() => get().updateDerivedState(), 0);
    }
  },
}));