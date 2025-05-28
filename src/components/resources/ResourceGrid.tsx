// src/components/resources/ResourceGrid.tsx

import {
  Trash2,
  Presentation,
  ExternalLink,
  Link as LinkIcon,
  Tag,
  Calendar,
} from 'lucide-react';
import { type ResourceItem, getTypeConfig, getFileIcon, canPreview } from './types';

interface ResourceGridProps {
  items: ResourceItem[];
  onDelete: (id: number) => void;
}

export function ResourceGrid({ items, onDelete }: Readonly<ResourceGridProps>) {
  if (items.length === 0) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
      {items.map(item => {
        const typeConfig = getTypeConfig(item.type);
        const IconComponent = typeConfig.icon;
        const fileIcon = getFileIcon(item.fileType, item.url);
        
        return (
          <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <div className="p-6">
              {/* Header with icon, title, and delete button */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className={`${typeConfig.color} p-2 rounded-lg`}>
                    <IconComponent className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                      {item.isUploaded && (
                        <span className="text-lg" title="Uploaded file">{fileIcon}</span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {typeConfig.label}
                      {item.isUploaded && ' • Uploaded'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onDelete(item.id)}
                  className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                  title="Remove resource"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Description */}
              {item.description && (
                <p className="text-gray-600 dark:text-gray-300 text-sm mb-4">{item.description}</p>
              )}

              {/* PDF Preview for uploaded PDFs */}
              {canPreview(item) && (
                <div className="mb-4 border border-gray-200 dark:border-gray-700 rounded-lg overflow-hidden">
                  <iframe
                    src={`${item.url}#toolbar=0&navpanes=0&scrollbar=0`}
                    className="w-full h-48"
                    title={`Preview of ${item.title}`}
                  />
                </div>
              )}

              {/* Tags */}
              {item.tags.length > 0 && (
                <div className="flex flex-wrap gap-1 mb-4">
                  {item.tags.map((tag, index) => (
                    <span 
                      key={`${item.id}-tag-${tag}-${index}`} 
                      className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full"
                    >
                      <Tag className="w-3 h-3" />
                      {tag}
                    </span>
                  ))}
                </div>
              )}

              {/* Footer with date and actions */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Calendar className="w-3 h-3" />
                  {new Date(item.createdAt).toLocaleDateString()}
                </div>
                <div className="flex gap-2">
                  {/* Preview button for PDFs */}
                  {canPreview(item) && (
                    <button
                      onClick={() => window.open(item.url, '_blank')}
                      className="inline-flex items-center gap-1 text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300 text-sm font-medium transition-colors"
                    >
                      <Presentation className="w-4 h-4" />
                      Preview
                    </button>
                  )}
                  
                  {/* View/Download button */}
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    download={item.isUploaded ? item.title : undefined}
                    className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                  >
                    <LinkIcon className="w-4 h-4" />
                    {item.isUploaded ? 'Download' : 'View'}
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}