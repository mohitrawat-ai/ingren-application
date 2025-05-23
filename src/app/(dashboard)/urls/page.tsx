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
}

interface NewItemForm {
  type: string;
  title: string;
  url: string;
  description: string;
  tags: string;
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
  const [newItem, setNewItem] = useState<NewItemForm>({
    type: 'company',
    title: '',
    url: '',
    description: '',
    tags: ''
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

  const getTypeConfig = (type: string): ItemType => {
    return itemTypes.find(t => t.value === type) || itemTypes[0];
  };

  const filteredItems = items.filter(item => {
    const matchesSearch = item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesFilter = filterType === 'all' || item.type === filterType;
    return matchesSearch && matchesFilter;
  });

  const handleAddItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItem.title.trim() || !newItem.url.trim()) return;

    const item: ResourceItem = {
      id: Date.now(),
      type: newItem.type,
      title: newItem.title.trim(),
      url: newItem.url.trim(),
      description: newItem.description.trim(),
      tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
      dateAdded: new Date().toISOString().split('T')[0]
    };

    setItems(prevItems => [...prevItems, item]);
    setNewItem({ type: newItem.type, title: '', url: '', description: '', tags: '' });
    setShowAddForm(false);
  };

  const handleInputChange = (field: keyof NewItemForm, value: string) => {
    setNewItem(prev => {
      const updated = { ...prev, [field]: value };
      return updated;
    });
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
    setNewItem({ type: itemTypes[0].value, title: '', url: '', description: '', tags: '' });
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
                    <p>🔗 <strong>Value-driven conversations:</strong> AI suggests relevant resources to prospects</p>
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
                >
                  <X className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                </button>
              </div>

              <form onSubmit={handleAddItem} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label htmlFor="resourceType" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Resource Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      id="resourceType"
                      value={newItem.type}
                      onChange={(e) => handleInputChange('type', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100"
                      required
                    >
                      {itemTypes.map(type => (
                        <option key={type.value} value={type.value} className="text-gray-900 dark:text-gray-100">{type.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label htmlFor="resourceTitle" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="resourceTitle"
                      type="text"
                      value={newItem.title}
                      onChange={(e) => handleInputChange('title', e.target.value)}
                      placeholder="e.g., About Our Company"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="resourceUrl" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      URL <span className="text-red-500">*</span>
                    </label>
                    <input
                      id="resourceUrl"
                      type="url"
                      value={newItem.url}
                      onChange={(e) => handleInputChange('url', e.target.value)}
                      placeholder="https://example.com/about"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="resourceDescription" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
                    <textarea
                      id="resourceDescription"
                      value={newItem.description}
                      onChange={(e) => handleInputChange('description', e.target.value)}
                      placeholder="Brief description of what this resource contains..."
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>

                  <div>
                    <label htmlFor="resourceTags" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tags</label>
                    <input
                      id="resourceTags"
                      type="text"
                      value={newItem.tags}
                      onChange={(e) => handleInputChange('tags', e.target.value)}
                      placeholder="company, overview, mission (comma separated)"
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                  >
                    Add Resource
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
              return (
                <div key={item.id} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div className={`${typeConfig.color} p-2 rounded-lg`}>
                          <IconComponent className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900 dark:text-gray-100">{item.title}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400">{typeConfig.label}</p>
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
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 text-sm font-medium transition-colors"
                      >
                        <LinkIcon className="w-4 h-4" />
                        View
                        <ExternalLink className="w-3 h-3" />
                      </a>
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