// src/stores/csvImportStore.ts
import { create } from 'zustand';
import { uploadCSV, processCSV } from '@/lib/actions/prospect';

// Define the steps of the import process
type ImportStep = 'upload' | 'mapping' | 'validation' | 'complete';

interface CSVData {
  headers: string[];
  rows: string[][];
  totalRows: number;
}

interface ValidationIssue {
  row: number;
  column: string;
  issue: string;
}

interface ColumnMapping {
  [fieldName: string]: string;
}

interface CSVImportState {
  // Process state
  currentStep: ImportStep;
  file: File | null;
  listName: string;
  uploadProgress: number;
  processingProgress: number;
  
  // CSV data
  csvData: CSVData | null;
  validationIssues: ValidationIssue[];
  columnMapping: ColumnMapping;
  
  // Process results
  newListId: number | null;
  
  // UI state
  uploading: boolean;
  processing: boolean;
  
  // Actions - Process control
  setFile: (file: File | null) => void;
  setListName: (name: string) => void;
  startUpload: () => Promise<{fileName: string}>;
  setColumnMapping: (mapping: ColumnMapping) => void;
  confirmMapping: () => Promise<{listId: number}>;
  resetImport: () => void;
  
  // Actions - Data processing
  parseCSV: (file: File) => Promise<void>;
}

export const useCSVImportStore = create<CSVImportState>((set, get) => ({
  // Initial state
  currentStep: 'upload',
  file: null,
  listName: '',
  uploadProgress: 0,
  processingProgress: 0,
  csvData: null,
  validationIssues: [],
  columnMapping: {},
  newListId: null,
  uploading: false,
  processing: false,
  
  // Actions - Process control
  setFile: (file) => {
    set({ file });
    
    if (file) {
      // If file is set, auto-generate list name from file name
      const fileName = file.name.replace(/\.[^/.]+$/, '');
      if (!get().listName) {
        set({ listName: fileName });
      }
      
      // Parse the file to get preview data
      get().parseCSV(file);
    }
  },
  
  setListName: (name) => set({ listName: name }),
  
  startUpload: async () => {
    const { file, listName } = get();
    
    if (!file || !listName.trim()) {
      throw new Error('File and list name are required');
    }
    
    set({ uploading: true, uploadProgress: 0 });
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      set(state => ({
        uploadProgress: Math.min(state.uploadProgress + 10, 95)
      }));
    }, 200);
    
    try {
      // Upload the file
      const uploadResult = await uploadCSV(file);
      
      clearInterval(progressInterval);
      set({ uploadProgress: 100, uploading: false, processing: true, currentStep: 'mapping' });
      
      // TODO : In a real implementation, you might start processing the file here
      // For now, we'll transition to the mapping step
      return uploadResult;
    } catch (error) {
      clearInterval(progressInterval);
      set({ uploading: false });
      throw error;
    }
  },
  
  setColumnMapping: (mapping) => set({ columnMapping: mapping }),
  
  confirmMapping: async () => {
    const { listName, file } = get();
    
    set({ processing: true, processingProgress: 0 });
    
    // Simulate progress updates
    const progressInterval = setInterval(() => {
      set(state => ({
        processingProgress: Math.min(state.processingProgress + 10, 95)
      }));
    }, 200);
    
    try {
      // TODO : In a real implementation, you'd use the actual file name from your upload result
      const fileName = file?.name || '';
      
      // Process the file with the mapping
      const processResult = await processCSV(fileName, listName);
      
      clearInterval(progressInterval);
      
      // Check for validation issues
      if (processResult.validationIssues && processResult.validationIssues.length > 0) {
        set({ 
          validationIssues: processResult.validationIssues,
          currentStep: 'validation',
          processing: false,
          processingProgress: 100
        });
      } else {
        // Success path
        set({ 
          newListId: processResult.listId,
          currentStep: 'complete',
          processing: false,
          processingProgress: 100
        });
      }
      
      return processResult;
    } catch (error) {
      clearInterval(progressInterval);
      set({ processing: false });
      throw error;
    }
  },
  
  resetImport: () => set({
    currentStep: 'upload',
    file: null,
    listName: '',
    uploadProgress: 0,
    processingProgress: 0,
    csvData: null,
    validationIssues: [],
    columnMapping: {},
    newListId: null,
    uploading: false,
    processing: false,
  }),
  
  // Actions - Data processing
  parseCSV: async (file) => {
    return new Promise<void>((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const lines = content.split('\n');
          
          // Parse headers (first line)
          const headers = lines[0].split(',').map(header => header.trim());
          
          // Parse rows for preview
          const rows: string[][] = [];
          for (let i = 1; i < Math.min(6, lines.length); i++) {
            if (lines[i].trim()) {
              const row = parseCSVRow(lines[i]);
              rows.push(row);
            }
          }
          
          set({
            csvData: {
              headers,
              rows,
              totalRows: lines.length - 1 // Exclude header row
            }
          });
          
          // Auto-map columns where names match
          const autoMapping: ColumnMapping = {};
          
          // Define required and optional fields
          const requiredFields = ['first_name', 'last_name', 'email', 'company_name'];
          const optionalFields = [
            'job_title', 'department', 'tenure_months', 'notable_achievement',
            'industry', 'employee_count', 'annual_revenue', 'city', 'state', 'country'
          ];
          
          // Look for exact matches first
          headers.forEach(header => {
            const normalizedHeader = header.toLowerCase();
            
            // Check if this header matches any of our fields
            [...requiredFields, ...optionalFields].forEach(field => {
              if (normalizedHeader === field) {
                autoMapping[field] = header;
              }
            });
            
            // Check for legacy mappings
            if (normalizedHeader === 'name') autoMapping['first_name'] = header;
            if (normalizedHeader === 'title') autoMapping['job_title'] = header;
            if (normalizedHeader === 'company') autoMapping['company_name'] = header;
          });
          
          set({ columnMapping: autoMapping });
          resolve();
        } catch (error) {
          reject(error);
        }
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      reader.readAsText(file);
    });
  },
}));

// Helper function to parse CSV rows (simple version)
function parseCSVRow(row: string): string[] {
  return row.split(',').map(cell => cell.trim());
}