"use client";

import React, { useState, useEffect } from 'react';
import {
  Plus,
  Globe,
  FileText,
  Package,
  Image,
  Search,
  Filter,
  Trash2,
  Presentation,
  ExternalLink,
  Upload,
  Link as LinkIcon,
  Tag,
  Calendar,
  CheckCircle,
  Info,
  ArrowRight,
  X
} from 'lucide-react';

// Type definitions
interface ItemType {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  description: string;
  examples: string[];
}

interface ResourceItem {
  id: number;
  type: string;
  title: string;
  url: string;
  description: string;
  tags: string[];
  dateAdded: string;
  isUploaded?: boolean;
  fileType?: string;
}

interface NewItemForm {
  type: string;
  title: string;
  url: string;
  description: string;
  tags: string;
  file?: File;
  isFileUpload: boolean;
}

const LOCAL_STORAGE_KEY_ITEMS = 'knowledgeBaseItems';

const ClientKnowledgeBase: React.FC = () => {
  // Load items from local storage or default to empty array
  const [items, setItems] = useState<ResourceItem[]>(() => {
    if (typeof window !== 'undefined') {
      const savedItems = localStorage.getItem(LOCAL_STORAGE_KEY_ITEMS);
      try {
        return savedItems ? JSON.parse(savedItems) : [];
      } catch (error) {
        console.error("Error parsing items from localStorage:", error);
        return [];
      }
    }
    return [];
  });

  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [newItem, setNewItem] = useState<NewItemForm>({
    type: 'company',
    title: '',
    url: '',
    description: '',
    tags: '',
    file: undefined,
    isFileUpload: false
  });

  // Save items to local storage whenever they change
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(LOCAL_STORAGE_KEY_ITEMS, JSON.stringify(items));
    }
  }, [items]);

  // Check onboarding status based on items
  useEffect(() => {
    const savedIsOnboarding = typeof window !== 'undefined' ? localStorage.getItem('knowledgeBaseIsOnboarding') : null;
    if (savedIsOnboarding !== null) {
      setIsOnboarding(JSON.parse(savedIsOnboarding));
    }
  }, [items.length]);

  const itemTypes: ItemType[] = [
    {
      value: 'company',
      label: 'Company Info',
      icon: Globe,
      color: 'bg-blue-500 dark:bg-blue-600',
      description: 'About us, mission, team bios, company news',
      examples: ['About Us page', 'Leadership team', 'Company values', 'Press releases']
    },
    {
      value: 'blog',
      label: 'Blog Posts',
      icon: FileText,
      color: 'bg-green-500 dark:bg-green-600',
      description: 'Thought leadership, industry insights, expertise',
      examples: ['Industry insights', 'How-to guides', 'Company updates', 'Expert opinions']
    },
    {
      value: 'product',
      label: 'Products/Services',
      icon: Package,
      color: 'bg-purple-500 dark:bg-purple-600',
      description: 'Product pages, features, demos, documentation',
      examples: ['Product overview', 'Feature descriptions', 'Demo videos', 'Technical docs']
    },
    {
      value: 'pitch-deck',
      label: 'Presentations',
      icon: Presentation,
      color: 'bg-orange-500 dark:bg-orange-600',
      description: 'Pitch decks, investor materials, sales presentations',
      examples: ['Investor pitch', 'Sales deck', 'Company overview', 'Product presentations']
    },
    {
      value: 'marketing',
      label: 'Marketing Materials',
      icon: Image,
      color: 'bg-pink-500 dark:bg-pink-600',
      description: 'Case studies, testimonials, brand guidelines',
      examples: ['Customer case studies', 'Success stories', 'Brand assets', 'Testimonials']
    }
  ];

  // Helper functions
  const getTypeConfig = (type: string): ItemType => {
    return itemTypes.find(t => t.value === type) || itemTypes[0];
  };

  const getFileIcon = (fileType?: string, url?: string) => {
    if (!fileType && url) {
      if (url.includes('.pdf')) return '📄';
      if (url.includes('.ppt') || url.includes('.pptx')) return '📊';
      if (url.includes('.doc') || url.includes('.docx')) return '📝';
    }
    
    if (fileType?.includes('pdf')) return '📄';
    if (fileType?.includes('presentation') || fileType?.includes('powerpoint')) return '📊';
    if (fileType?.includes('word') || fileType?.includes('document')) return '📝';
    return '🔗';
  };

  const canPreview = (item: ResourceItem) => {
    return item.isUploaded && item.fileType?.includes('pdf');
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setNewItem(prev => ({
        ...prev,
        file,
        title: prev.title || file.name.replace(/\.[^/.]+$/, ""),
      }));
    }
  };

  const handleAddItem = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim()) return;
    
    setIsUploading(true);
    let finalUrl = newItem.url;
    
    // Handle file upload if file is selected
    if (newItem.isFileUpload && newItem.file) {
      try {
        const formData = new FormData();
        formData.append('file', newItem.file);
        
        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });
        
        if (!response.ok) {
          const errorData = await response.json();
          alert(`Upload failed: ${errorData.error}`);
          setIsUploading(false);
          return;
        }
        
        const uploadResult = await response.json();
        finalUrl = uploadResult.url;
        
      } catch (error) {
        console.error('Upload error:', error);
        alert('Failed to upload file. Please try again.');
        setIsUploading(false);
        return;
      }
    } else if (!newItem.url.trim()) {
      alert('Please provide a URL or upload a file.');
      setIsUploading(false);
      return;
    }

    const item: ResourceItem = {
      id: Date.now(),
      type: newItem.type,
      title: newItem.title.trim(),
      url: finalUrl,
      description: newItem.description.trim(),
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      dateAdded: new Date().toISOString().split('T')[0],
      isUploaded: newItem.isFileUpload,
      fileType: newItem.file?.type,
    };

    setItems(prevItems => [...prevItems, item]);
    setNewItem({ 
      type: newItem.type, 
      title: '', 
      url: '', 
      description: '', 
      tags: '', 
      file: undefined,
      isFileUpload: false 
    });
    setShowAddForm(false);
    setIsUploading(false);
  };

  const handleInputChange = (field: keyof NewItemForm, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteItem = (id: number) => {
    setItems(items.filter(item => item.id !== id));
  };

  const getItemCount = (type: string): number => {
    return items.filter(item => item.type === type).length;
  };

  const totalResources = items.length;
  const completionPercentage = Math.min((totalResources / 10) * 100, 100);

  const resetForm = () => {
    setNewItem({ 
      type: itemTypes[0].value, 
      title: '', 
      url: '', 
      description: '', 
      tags: '', 
      file: undefined,
      isFileUpload: false 
    });
    setShowAddForm(false);
  };

  const completeOnboarding = () => {
    setIsOnboarding(false);
    if (typeof window !== 'undefined') {
      localStorage.setItem('knowledgeBaseIsOnboarding', JSON.stringify(false));
    }
  };

  const clearFilters = () => {
    setSearchTerm('');
    setFilterType('all');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Onboarding Header */}
        {isOnboarding && (
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
        )}

        {/* Regular Header for post-onboarding */}
        {!isOnboarding && (
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Your Knowledge Base</h1>
                <p className="text-gray-600 dark:text-gray-300 mt-2">
                  Your AI SDR will use these resources to create personalized, informed campaigns
                </p>
              </div>
              <button
                onClick={() => {
                  setNewItem(prev => ({ ...prev, type: itemTypes[0].value }));
                  setShowAddForm(true);
                }}
                className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add Resource
              </button>
            </div>
          </div>
        )}

        {/* Onboarding Guide */}
        {isOnboarding && (
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
        )}

        {/* Resource Type Cards for Onboarding */}
        {isOnboarding && (
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
                    onClick={() => {
                      handleInputChange('type', type.value);
                      setShowAddForm(true);
                    }}
                    className="w-full text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium flex items-center justify-center gap-1 py-2 border border-blue-200 dark:border-blue-700 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/50 transition-colors"
                  >
                    <Plus className="w-4 h-4" />
                    Add {type.label}
                  </button>
                </div>
              );
            })}
          </div>
        )}

        {/* Stats Cards for post-onboarding */}
        {!isOnboarding && (
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
        )}

        {/* Search and Filter */}
        {(items.length > 0 || !isOnboarding) && (
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search your resources..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-400" />
                <select
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                  className="px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                >
                  <option value="all">All Types</option>
                  {itemTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )}

        {/* Add Item Form Modal */}
        {showAddForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-black dark:bg-opacity-70 flex items-center justify-center z-50 p-4">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Add New Resource</h3>
                <button
                  onClick={resetForm}
                  className="p-1 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
                  disabled={isUploading}
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resource Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={newItem.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                      disabled={isUploading}
                    >
                      {itemTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {/* Toggle between URL and File Upload */}
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
                          onChange={() => setNewItem(prev => ({ ...prev, isFileUpload: false, file: undefined }))}
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
                          onChange={() => setNewItem(prev => ({ ...prev, isFileUpload: true, url: '' }))}
                          className="mr-2"
                          disabled={isUploading}
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Upload File</span>
                      </label>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={newItem.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., Company Pitch Deck"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      required
                      disabled={isUploading}
                    />
                  </div>

                  {/* Conditional URL or File input */}
                  {!newItem.isFileUpload ? (
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        URL <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="url"
                        value={newItem.url}
                        onChange={(e) => handleInputChange('url', e.target.value)}
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
                          onChange={handleFileChange}
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

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      value={newItem.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of what this resource contains..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      disabled={isUploading}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                    <input
                      type="text"
                      value={newItem.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="presentation, pitch, overview (comma separated)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      disabled={isUploading}
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
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
        )}

        {/* Resources List */}
        {items.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
            {filteredItems.map(item => {
              const typeConfig = getTypeConfig(item.type);
              const IconComponent = typeConfig.icon;
              const fileIcon = getFileIcon(item.fileType, item.url);
              
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="p-6">
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
                        onClick={() => handleDeleteItem(item.id)}
                        className="p-1 text-gray-400 dark:text-gray-500 hover:text-red-600 dark:hover:text-red-400 rounded transition-colors"
                        title="Remove resource"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

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

                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-4">
                        {item.tags.map((tag, index) => (
                          <span key={`${item.id}-tag-${tag}-${index}`} className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded-full">
                            <Tag className="w-3 h-3" />
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(item.dateAdded).toLocaleDateString()}
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
        )}

        {/* Complete Onboarding Button */}
        {isOnboarding && items.length >= 3 && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-6 mb-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-6 h-6 text-green-600 dark:text-green-400" />
                <div>
                  <h3 className="font-semibold text-green-900 dark:text-green-100">Great start! 🎉</h3>
                  <p className="text-green-700 dark:text-green-300 text-sm">
                    You have added {items.length} resources. Your AI SDR is ready to create amazing campaigns!
                  </p>
                </div>
              </div>
              <button
                onClick={completeOnboarding}
                className="bg-green-600 hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-800 text-white px-6 py-2 rounded-lg flex items-center gap-2 transition-colors"
              >
                Complete Setup
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Empty State */}
        {items.length === 0 && !showAddForm && (
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
              onClick={() => {
                setNewItem(prev => ({ ...prev, type: itemTypes[0].value }));
                setShowAddForm(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800 text-white px-6 py-3 rounded-lg inline-flex items-center gap-2 transition-colors"
            >
              <Plus className="w-5 h-5" />
              Add Your First Resource
            </button>
          </div>
        )}

        {/* No Search Results */}
        {items.length > 0 && filteredItems.length === 0 && (
          <div className="text-center py-12">
            <div className="mx-auto w-24 h-24 bg-gray-100 dark:bg-gray-800 rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">No resources found</h3>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              Try adjusting your search terms or filter criteria.
            </p>
            <button
              onClick={clearFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"
            >
              Clear filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClientKnowledgeBase;