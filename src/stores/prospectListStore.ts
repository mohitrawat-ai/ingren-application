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
  
  // Computed
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
  
  // Computed properties
  get filteredContacts() {
    const { currentList, filterText } = get();
    if (!currentList) return [];
    
    if (!filterText) return currentList.contacts;
    
    const searchText = filterText.toLowerCase();
    return currentList.contacts.filter(contact => {
      return (
        (contact.name && contact.name.toLowerCase().includes(searchText)) ||
        (contact.title && contact.title.toLowerCase().includes(searchText)) ||
        (contact.organizationName && contact.organizationName.toLowerCase().includes(searchText)) ||
        (contact.email && contact.email.toLowerCase().includes(searchText))
      );
    });
  },
  
  get paginatedContacts() {
    const { filteredContacts, currentPage, itemsPerPage } = get();
    const start = (currentPage - 1) * itemsPerPage;
    const end = start + itemsPerPage;
    return filteredContacts.slice(start, end);
  },
  
  get totalPages() {
    const { filteredContacts, itemsPerPage } = get();
    return Math.ceil(filteredContacts.length / itemsPerPage);
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
    set({ loadingCurrentList: true });
    try {
      const list = await getProspectList(id);
      set({ currentList: list, loadingCurrentList: false, currentPage: 1, selectedContacts: [] });
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
  setFilterText: (text) => set({ filterText: text, currentPage: 1 }),
  setCurrentPage: (page) => set({ currentPage: page }),
  
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
    }
  },
  
  prevPage: () => {
    const { currentPage } = get();
    if (currentPage > 1) {
      set({ currentPage: currentPage - 1 });
    }
  },
}));