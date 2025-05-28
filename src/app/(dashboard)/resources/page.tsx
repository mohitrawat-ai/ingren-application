// src/app/(dashboard)/urls/page.tsx
"use client";

import React, { useState, useEffect } from 'react';

// Import server actions
import {
  createResource,
  getResources,
  deleteResource,
  getResourceStats,
  type CreateResourceParams
} from '@/lib/actions/resource';

// Import components
import { OnboardingHeader } from '@/components/resources/OnboardingHeader';
import { RegularHeader } from '@/components/resources/RegularHeader';
import { ResourceTypeCards } from '@/components/resources/ResourceTypeCards';
import { SearchFilterBar } from '@/components/resources/SearchFilterBar';
import { AddResourceModal } from '@/components/resources/AddResourceModal';
import { ResourceGrid } from '@/components/resources/ResourceGrid';
import { CompletionBanner } from '@/components/resources/CompletionBanner';
import { EmptyStates } from '@/components/resources/EmptyStates';
import { LoadingState, ErrorState } from '@/components/resources/LoadingErrorStates';

// Import types
import { type ResourceItem, type NewItemForm, itemTypes } from '@/components/resources/types';

export default function ResourcesPage() {
  const [items, setItems] = useState<ResourceItem[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [isOnboarding, setIsOnboarding] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState<Record<string, number>>({});
  
  const [newItem, setNewItem] = useState<NewItemForm>({
    type: 'company',
    title: '',
    url: '',
    description: '',
    tags: '',
    file: undefined,
    isFileUpload: false
  });

  // Load resources on component mount
  useEffect(() => {
    loadResources();
    loadStats();
  }, []);

  // Check onboarding status based on items
  useEffect(() => {
    const savedIsOnboarding = typeof window !== 'undefined' ? localStorage.getItem('knowledgeBaseIsOnboarding') : null;
    if (savedIsOnboarding !== null) {
      setIsOnboarding(JSON.parse(savedIsOnboarding));
    } else {
      // Set onboarding based on number of items
      setIsOnboarding(items.length < 3);
    }
  }, [items.length]);

  const loadResources = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await getResources({ 
        searchTerm: searchTerm || undefined, 
        filterType: filterType !== 'all' ? filterType : undefined 
      });
      
      if (response.success) {
        setItems(response.resources.map(resource => ({
          ...resource,
          createdAt: resource.createdAt.toISOString().split('T')[0],
          description: resource.description || '',
          tags: resource.tags || [],
          isUploaded: resource.isUploaded || false,
        })));
      }
    } catch (error) {
      console.error('Error loading resources:', error);
      setError('Failed to load resources. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await getResourceStats();
      if (response.success) {
        setStats(response.stats);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
    }
  };

  // Reload resources when search/filter changes
  useEffect(() => {
    const timeoutId = setTimeout(() => {
      loadResources();
    }, 300); // Debounce search

    return () => clearTimeout(timeoutId);
  }, [searchTerm, filterType]);

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
    let fileDetails: Partial<CreateResourceParams> = {};
    
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
        
        // Set file details
        fileDetails = {
          isUploaded: true,
          fileType: newItem.file.type,
          fileName: newItem.file.name,
          fileSize: newItem.file.size,
        };
        
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

    try {
      const resourceParams: CreateResourceParams = {
        type: newItem.type,
        title: newItem.title.trim(),
        url: finalUrl,
        description: newItem.description.trim() || undefined,
        tags: newItem.tags.split(',').map(tag => tag.trim()).filter(Boolean),
        ...fileDetails,
      };

      const response = await createResource(resourceParams);
      
      if (response.success) {
        // Reload resources and stats
        await loadResources();
        await loadStats();
        
        // Reset form
        resetForm();
      }
    } catch (error) {
      console.error('Error creating resource:', error);
      alert('Failed to save resource. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleInputChange = (field: keyof NewItemForm, value: string) => {
    setNewItem(prev => ({ ...prev, [field]: value }));
  };

  const handleDeleteItem = async (id: number) => {
    if (!confirm('Are you sure you want to delete this resource?')) {
      return;
    }

    try {
      const response = await deleteResource(id);
      if (response.success) {
        await loadResources();
        await loadStats();
      }
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource. Please try again.');
    }
  };

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

  const handleAddResource = () => {
    setNewItem(prev => ({ ...prev, type: itemTypes[0].value }));
    setShowAddForm(true);
  };

  const handleAddResourceOfType = (type: string) => {
    setNewItem(prev => ({ ...prev, type }));
    setShowAddForm(true);
  };

  // Show loading state
  if (loading) {
    return <LoadingState loading={loading} />;
  }

  // Show error state
  if (error) {
    return <ErrorState error={error} onRetry={loadResources} />;
  }

  const totalResources = items.length;
  const hasFilteredResults = items.length > 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6 transition-colors">
      <div className="max-w-7xl mx-auto">
        {/* Headers */}
        <OnboardingHeader 
          totalResources={totalResources}
          isOnboarding={isOnboarding}
        />
        
        <RegularHeader 
          isOnboarding={isOnboarding}
          onAddResource={handleAddResource}
        />

        {/* Resource Type Cards */}
        <ResourceTypeCards
          isOnboarding={isOnboarding}
          stats={stats}
          onAddResourceOfType={handleAddResourceOfType}
        />

        {/* Search and Filter */}
        <SearchFilterBar
          searchTerm={searchTerm}
          filterType={filterType}
          onSearchChange={setSearchTerm}
          onFilterChange={setFilterType}
          showWhen={items.length > 0 || !isOnboarding}
        />

        {/* Add Resource Modal */}
        <AddResourceModal
          showModal={showAddForm}
          newItem={newItem}
          isUploading={isUploading}
          onClose={resetForm}
          onSubmit={handleAddItem}
          onInputChange={handleInputChange}
          onFileChange={handleFileChange}
          onSetNewItem={setNewItem}
        />

        {/* Resources Grid */}
        <ResourceGrid
          items={items}
          onDelete={handleDeleteItem}
        />

        {/* Completion Banner */}
        <CompletionBanner
          isOnboarding={isOnboarding}
          itemCount={totalResources}
          onComplete={completeOnboarding}
        />

        {/* Empty States */}
        <EmptyStates
          hasItems={totalResources > 0}
          hasFilteredResults={hasFilteredResults}
          showAddForm={showAddForm}
          onAddResource={handleAddResource}
          onClearFilters={clearFilters}
        />
      </div>
    </div>
  );
}