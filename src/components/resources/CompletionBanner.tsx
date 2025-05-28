// src/components/resources/CompletionBanner.tsx

import { CheckCircle, ArrowRight } from 'lucide-react';

interface CompletionBannerProps {
  isOnboarding: boolean;
  itemCount: number;
  onComplete: () => void;
}

export function CompletionBanner({ isOnboarding, itemCount, onComplete }: Readonly<CompletionBannerProps>) {
  if (!isOnboarding || itemCount < 3) {
    return null;
  }

  return (
    <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
          <div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">Great start! 🎉</h3>
            <p className="text-green-700 dark:text-green-300 text-sm">
              You have added {itemCount} resources. Your AI SDR is ready to create amazing campaigns!
            </p>
          </div>
        </div>
        <button
          onClick={onComplete}
          className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
        >
          Complete Setup
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}