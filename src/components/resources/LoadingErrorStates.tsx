// src/components/resources/LoadingErrorStates.tsx

import { Loader2, X } from 'lucide-react';

interface LoadingStateProps {
  loading: boolean;
}

export function LoadingState({ loading }: Readonly<LoadingStateProps>) {
  if (!loading) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center justify-center py-12">
          <div className="flex items-center gap-3">
            <Loader2 className="w-6 h-6 animate-spin text-blue-600" />
            <span className="text-gray-600 dark:text-gray-300">Loading your resources...</span>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ErrorStateProps {
  error: string | null;
  onRetry: () => void;
}

export function ErrorState({ error, onRetry }: Readonly<ErrorStateProps>) {
  if (!error) return null;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-lg p-6">
          <div className="flex items-center gap-3">
            <X className="w-6 h-6 text-red-600 dark:text-red-400" />
            <div>
              <h3 className="font-semibold text-red-900 dark:text-red-100">Error Loading Resources</h3>
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          </div>
          <button
            onClick={onRetry}
            className="mt-4 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm"
          >
            Try Again
          </button>
        </div>
      </div>
    </div>
  );
}