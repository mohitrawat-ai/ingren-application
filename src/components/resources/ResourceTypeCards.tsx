// src/components/resources/ResourceTypeCards.tsx

import { Plus } from 'lucide-react';
import { itemTypes } from './types';

interface ResourceTypeCardsProps {
  isOnboarding: boolean;
  stats: Record<string, number>;
  onAddResourceOfType: (type: string) => void;
}

export function ResourceTypeCards({ isOnboarding, stats, onAddResourceOfType }: Readonly<ResourceTypeCardsProps>) {
  const getItemCount = (type: string): number => {
    return stats[type] || 0;
  };

  if (isOnboarding) {
    // Onboarding cards - detailed with examples
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {itemTypes.map(type => {
          const IconComponent = type.icon;
          return (
            <div key={type.value} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
              <div className="flex items-center gap-3 mb-4">
                <div className={`${type.color} p-3 rounded-lg`}>
                  <IconComponent className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-gray-100">{type.label}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{getItemCount(type.value)} added</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300 text-sm mb-3">{type.description}</p>
              <div className="space-y-1 mb-4">
                {type.examples.slice(0, 3).map((example, idx) => (
                  <div key={idx} className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1">
                    <div className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></div>
                    {example}
                  </div>
                ))}
              </div>
              <button
                onClick={() => onAddResourceOfType(type.value)}
                className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-1 py-2 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add {type.label}
              </button>
            </div>
          );
        })}
      </div>
    );
  }

  // Post-onboarding stats cards - compact
  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
      {itemTypes.map(type => {
        const IconComponent = type.icon;
        return (
          <div key={type.value} className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
            <div className="flex items-center gap-3">
              <div className={`${type.color} p-2 rounded-lg`}>
                <IconComponent className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">{type.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{getItemCount(type.value)}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}