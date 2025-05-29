// Enhanced ResourcePreview.tsx - New component for different preview types
"use client";

import { useState } from 'react';
import { AlertTriangle, Globe, FileText } from 'lucide-react';
import { type ResourceItem, getPreviewType } from './types';

interface ResourcePreviewProps {
  item: ResourceItem;
}

export function ResourcePreview({ item }: Readonly<ResourcePreviewProps>) {
  const [previewError, setPreviewError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const previewType = getPreviewType(item);

  if (previewType === 'none') {
    return null;
  }

  const handleIframeLoad = () => {
    setIsLoading(false);
  };

  const handleIframeError = () => {
    setIsLoading(false);
    setPreviewError(true);
  };

  const renderPreview = () => {
    switch (previewType) {
      case 'pdf':
        return (
          <div className="relative">
            {isLoading && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Loading PDF...
                </div>
              </div>
            )}
            <iframe
              src={`${item.url}#toolbar=0&navpanes=0&scrollbar=0&view=FitH`}
              className="w-full h-48 border-0 rounded"
              title={`Preview of ${item.title}`}
              onLoad={handleIframeLoad}
              onError={handleIframeError}
            />
          </div>
        );

      case 'ppt':
        return (
          <div className="relative">
            {/* Try Office Online Viewer first */}
            {!previewError ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Loading presentation...
                    </div>
                  </div>
                )}
                <iframe
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(item.url)}`}
                  className="w-full h-48 border-0 rounded"
                  title={`Preview of ${item.title}`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                />
              </>
            ) : (
              <div className="w-full h-32 bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-700 rounded flex flex-col items-center justify-center">
                <FileText className="w-8 h-8 text-orange-600 dark:text-orange-400 mb-2" />
                <p className="text-sm font-medium text-orange-800 dark:text-orange-200">PowerPoint Presentation</p>
                <p className="text-xs text-orange-600 dark:text-orange-400">Click to view full presentation</p>
              </div>
            )}
          </div>
        );

      case 'website':
        return (
          <div className="relative">
            {/* Website preview with fallback */}
            {!previewError ? (
              <>
                {isLoading && (
                  <div className="absolute inset-0 flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded">
                    <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                      Loading preview...
                    </div>
                  </div>
                )}
                <iframe
                  src={item.url}
                  className="w-full h-40 border-0 rounded"
                  title={`Preview of ${item.title}`}
                  onLoad={handleIframeLoad}
                  onError={handleIframeError}
                  sandbox="allow-same-origin"
                />
              </>
            ) : (
              <div className="w-full h-32 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded flex flex-col items-center justify-center">
                <Globe className="w-8 h-8 text-blue-600 dark:text-blue-400 mb-2" />
                <p className="text-sm font-medium text-blue-800 dark:text-blue-200">{item.type === 'company' ? 'Company Page' : 'Web Content'}</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 text-center px-2">
                  {new URL(item.url).hostname}
                </p>
              </div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
      {renderPreview()}
      
      {previewError && previewType === 'website' && (
        <div className="px-3 py-2 bg-yellow-50 dark:bg-yellow-900/20 border-t border-yellow-200 dark:border-yellow-700">
          <div className="flex items-center gap-2 text-xs text-yellow-800 dark:text-yellow-200">
            <AlertTriangle className="w-3 h-3" />
            Preview blocked by website policy
          </div>
        </div>
      )}
    </div>
  );
}

