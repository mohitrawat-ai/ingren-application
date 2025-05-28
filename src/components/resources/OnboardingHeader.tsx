// src/components/resources/OnboardingHeader.tsx
import { Info } from 'lucide-react';

interface OnboardingHeaderProps {
  totalResources: number;
  isOnboarding: boolean;
}

export function OnboardingHeader({ totalResources, isOnboarding }: Readonly<OnboardingHeaderProps>) {
  if (!isOnboarding) return null;

  const completionPercentage = Math.min((totalResources / 10) * 100, 100);

  return (
    <>
      {/* Main Onboarding Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-700 dark:to-purple-700 text-white p-6 rounded-lg mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Welcome to Ingren AI! 🚀</h1>
            <p className="text-blue-100 dark:text-blue-200 text-lg">
              Let us set up your knowledge base to power your AI SDR campaigns
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold">{totalResources}/10</div>
            <div className="text-blue-100 dark:text-blue-200 text-sm">Resources added</div>
          </div>
        </div>
        <div className="mt-4">
          <div className="bg-white bg-opacity-20 rounded-full h-2">
            <div
              className="bg-white rounded-full h-2 transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            ></div>
          </div>
          <p className="text-blue-100 dark:text-blue-200 text-sm mt-2">
            Add at least 5-10 resources to get the best results from your AI SDR
          </p>
        </div>
      </div>

      {/* Onboarding Guide */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex items-start gap-4">
          <div className="bg-blue-100 dark:bg-blue-900 p-2 rounded-lg">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900 dark:text-gray-100 mb-2">How this powers your AI SDR</h3>
            <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-600 dark:text-gray-300">
              <div>
                <p className="mb-2">✨ <strong>Personalized outreach:</strong> AI uses your company info to craft relevant messages</p>
                <p className="mb-2">🎯 <strong>Smart positioning:</strong> AI references your products/services accurately</p>
              </div>
              <div>
                <p className="mb-2">📈 <strong>Credibility boost:</strong> AI shares relevant blog posts and case studies</p>
                <p>🔗 <strong>Value-driven conversations:</strong> AI suggests relevant resources to profiles</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}