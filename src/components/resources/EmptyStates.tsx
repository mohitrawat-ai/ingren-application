// src/components/resources/EmptyStates.tsx

import { Upload, Search, Plus } from 'lucide-react';

interface EmptyStatesProps {
  hasItems: boolean;
  hasFilteredResults: boolean;
  showAddForm: boolean;
  onAddResource: () => void;
  onClearFilters: () => void;
}

export function EmptyStates({ 
  hasItems, 
  hasFilteredResults, 
  showAddForm, 
  onAddResource, 
  onClearFilters 
}: Readonly<EmptyStatesProps>) {
  // No empty state needed if there are items and results
  if (hasItems && hasFilteredResults) {
    return null;
  }

  // Empty database state
  if (!hasItems && !showAddForm) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center mb-4">
          <Upload className="w-8 h-8 text-blue-600 dark:text-blue-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Ready to power up your AI SDR?</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
          Start by adding your company information, blog posts, and marketing materials.
          The more you add, the smarter your AI SDR becomes!
        </p>
        <button
          onClick={onAddResource}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
        >
          <Plus className="w-5 h-5" />
          Add Your First Resource
        </button>
      </div>
    );
  }

  // No search results state
  if (hasItems && !hasFilteredResults) {
    return (
      <div className="text-center py-12">
        <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
          <Search className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No resources found</h3>
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          Try adjusting your search terms or filter criteria.
        </p>
        <button
          onClick={onClearFilters}
          className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
        >
          Clear filters
        </button>
      </div>
    );
  }

  return null;
}