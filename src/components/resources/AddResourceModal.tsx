// src/components/resources/AddResourceModal.tsx

import { X, Upload } from 'lucide-react';
import { itemTypes, type NewItemForm } from './types';

interface AddResourceModalProps {
  showModal: boolean;
  newItem: NewItemForm;
  isUploading: boolean;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onInputChange: (field: keyof NewItemForm, value: string) => void;
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSetNewItem: (updater: (prev: NewItemForm) => NewItemForm) => void;
}

export function AddResourceModal({
  showModal,
  newItem,
  isUploading,
  onClose,
  onSubmit,
  onInputChange,
  onFileChange,
  onSetNewItem,
}: Readonly<AddResourceModalProps>) {
  if (!showModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Resource</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
            disabled={isUploading}
          >
            <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6">
          <div className="space-y-4">
            {/* Resource Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Resource Type <span className="text-red-500">*</span>
              </label>
              <select
                value={newItem.type}
                onChange={(e) => onInputChange('type', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                required
                disabled={isUploading}
              >
                {itemTypes.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            {/* Upload Type Toggle */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Add Resource By
              </label>
              <div className="flex gap-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadType"
                    checked={!newItem.isFileUpload}
                    onChange={() => onSetNewItem(prev => ({ ...prev, isFileUpload: false, file: undefined }))}
                    className="mr-2"
                    disabled={isUploading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">URL Link</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="uploadType"
                    checked={newItem.isFileUpload}
                    onChange={() => onSetNewItem(prev => ({ ...prev, isFileUpload: true, url: '' }))}
                    className="mr-2"
                    disabled={isUploading}
                  />
                  <span className="text-sm text-gray-700 dark:text-gray-300">Upload File</span>
                </label>
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={newItem.title}
                onChange={(e) => onInputChange('title', e.target.value)}
                placeholder="e.g., Company Pitch Deck"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                required
                disabled={isUploading}
              />
            </div>

            {/* URL or File Upload */}
            {!newItem.isFileUpload ? (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  URL <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  value={newItem.url}
                  onChange={(e) => onInputChange('url', e.target.value)}
                  placeholder="https://example.com/presentation.pdf"
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                  required
                  disabled={isUploading}
                />
              </div>
            ) : (
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Upload File <span className="text-red-500">*</span>
                </label>
                <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 text-center">
                  <input
                    type="file"
                    accept=".pdf,.ppt,.pptx,.doc,.docx"
                    onChange={onFileChange}
                    className="hidden"
                    id="file-upload"
                    required={newItem.isFileUpload}
                    disabled={isUploading}
                  />
                  <label
                    htmlFor="file-upload"
                    className={`cursor-pointer flex flex-col items-center ${isUploading ? 'pointer-events-none opacity-50' : ''}`}
                  >
                    <Upload className="w-8 h-8 text-gray-400 mb-2" />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {newItem.file ? newItem.file.name : 'Click to upload PDF, PowerPoint, or Word document'}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                      Max 10MB
                    </span>
                  </label>
                </div>
              </div>
            )}

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea
                value={newItem.description}
                onChange={(e) => onInputChange('description', e.target.value)}
                placeholder="Brief description of what this resource contains..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                disabled={isUploading}
              />
            </div>

            {/* Tags */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
              <input
                type="text"
                value={newItem.tags}
                onChange={(e) => onInputChange('tags', e.target.value)}
                placeholder="presentation, pitch, overview (comma separated)"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                disabled={isUploading}
              />
            </div>
          </div>

          {/* Form Actions */}
          <div className="flex gap-3 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              disabled={isUploading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              disabled={isUploading}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Uploading...
                </>
              ) : (
                newItem.isFileUpload ? 'Upload & Add' : 'Add Resource'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}