// src/components/resources/RegularHeader.tsx

import { Plus } from 'lucide-react';

interface RegularHeaderProps {
  isOnboarding: boolean;
  onAddResource: () => void;
}

export function RegularHeader({ isOnboarding, onAddResource }: Readonly<RegularHeaderProps>) {
  if (isOnboarding) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Knowledge Base</h1>
          <p className="text-gray-600 dark:text-gray-300 mt-2">
            Your AI SDR will use these resources to create personalized, informed campaigns
          </p>
        </div>
        <button
          onClick={onAddResource}
          className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add Resource
        </button>
      </div>
    </div>
  );
}