// src/components/profile/search/ProfileFiltersPanel.tsx - Updated with Searchable Multi-Select

"use client";

import { useState, useEffect } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { X } from "lucide-react";

import { useProfileStore } from "@/stores/profileStore";
import { ProfileFilterOptionsResponse } from "@/types/profile";

// Import our new SearchableMultiSelect component
import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";

interface ProfileFiltersPanelProps {
  filterOptions?: ProfileFilterOptionsResponse | null;
}

export function ProfileFiltersPanel({ filterOptions }: ProfileFiltersPanelProps) {
  const {
    draftFilters,
    updateDraftFilter,
    clearDraftFilters,
    getCurrentFiltersCount,
  } = useProfileStore();

  // Local state for text inputs
  const [localInputs, setLocalInputs] = useState({
    cities: '',
    jobTitleKeywords: '',
    companyKeywords: '',
    skills: '',
    generalKeywords: ''
  });

  // Sync local inputs with draft filter state
  useEffect(() => {
    setLocalInputs({
      cities: draftFilters.location?.cities?.join(', ') || '',
      jobTitleKeywords: draftFilters.role?.keywords || '',
      companyKeywords: draftFilters.company?.companyKeywords || '',
      skills: draftFilters.advanced?.skills?.join(', ') || '',
      generalKeywords: draftFilters.advanced?.keywords || ''
    });
  }, [draftFilters]);

  // Handle multi-select filter changes
  const handleMultiSelectFilter = (path: string, values: string[]) => {
    updateDraftFilter(path, values.length > 0 ? values : undefined);
  };

  // Handle text input changes
  const handleTextInputChange = (field: keyof typeof localInputs, value: string) => {
    setLocalInputs(prev => ({ ...prev, [field]: value }));
  };

  // Handle text input blur
  const handleTextInputBlur = (field: keyof typeof localInputs, filterPath: string) => {
    const value = localInputs[field];

    if (!value.trim()) {
      updateDraftFilter(filterPath, undefined);
      return;
    }

    if (field === 'cities' || field === 'skills') {
      const arrayValue = value.split(',').map(s => s.trim()).filter(s => s);
      updateDraftFilter(filterPath, arrayValue.length > 0 ? arrayValue : undefined);
    } else {
      updateDraftFilter(filterPath, value.trim());
    }
  };

  const handleBooleanFilter = (path: string, checked: boolean) => {
  // If unchecked, remove the filter entirely by setting to undefined
  updateDraftFilter(path, checked ? true : undefined);
};

  const getSelectedCount = (path: string): number => {
    const pathParts = path.split('.');
    let current: unknown = draftFilters;

    for (const part of pathParts) {
      if (current && typeof current === 'object' && current !== null && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        current = undefined;
        break;
      }
    }

    return Array.isArray(current) ? current.length : 0;
  };

  const clearFilter = (path: string) => {
    updateDraftFilter(path, undefined);
  };

  const currentFiltersCount = getCurrentFiltersCount();

  // Show loading message if filter options are not available
  if (!filterOptions) {
    return (
      <div className="p-4 text-center text-muted-foreground">
        <div className="text-sm">Loading filter options...</div>
        <div className="text-xs mt-1">Please check your connection if this persists.</div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter status */}
      {currentFiltersCount > 0 && (
        <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {currentFiltersCount} {currentFiltersCount === 1 ? 'filter' : 'filters'} active
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={clearDraftFilters}
            className="h-8 px-2"
          >
            <X className="h-3 w-3 mr-1" />
            Clear All
          </Button>
        </div>
      )}

      <Accordion type="multiple" className="w-full" defaultValue={["location", "role", "company"]}>

        {/* Location Filters */}
        <AccordionItem value="location">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              Location
              {getSelectedCount('location.countries') + getSelectedCount('location.states') + getSelectedCount('location.cities') > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getSelectedCount('location.countries') + getSelectedCount('location.states') + getSelectedCount('location.cities')}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Countries - Now using SearchableMultiSelect */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Countries</Label>
                {getSelectedCount('location.countries') > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('location.countries')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={filterOptions.countries || []}
                selectedValues={draftFilters.location?.countries || []}
                onSelectionChange={(values) => handleMultiSelectFilter('location.countries', values)}
                placeholder="Select countries..."
                searchPlaceholder="Search countries..."
                maxDisplay={2}
              />
            </div>

            {/* US States - Now using SearchableMultiSelect */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">US States</Label>
                {getSelectedCount('location.states') > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('location.states')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={filterOptions.usStates || []}
                selectedValues={draftFilters.location?.states || []}
                onSelectionChange={(values) => handleMultiSelectFilter('location.states', values)}
                placeholder="Select US states..."
                searchPlaceholder="Search states..."
                maxDisplay={2}
              />
            </div>

            {/* Cities - Keep as text input since it's more flexible */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cities</Label>
              <Input
                placeholder="Enter city names (comma separated)"
                value={localInputs.cities}
                onChange={(e) => handleTextInputChange('cities', e.target.value)}
                onBlur={() => handleTextInputBlur('cities', 'location.cities')}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter cities separated by commas (e.g., &quot;San Francisco, Austin, Seattle&quot;)
              </p>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Role Filters */}
        <AccordionItem value="role">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              Role & Position
              {getSelectedCount('role.jobTitles') + getSelectedCount('role.departments') + getSelectedCount('role.managementLevels') + getSelectedCount('role.seniorityLevels') > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getSelectedCount('role.jobTitles') + getSelectedCount('role.departments') + getSelectedCount('role.managementLevels') + getSelectedCount('role.seniorityLevels')}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Job Title Keywords - Keep as text input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Title Keywords</Label>
              <Input
                placeholder="e.g., CEO, CTO, VP Engineering"
                value={localInputs.jobTitleKeywords}
                onChange={(e) => handleTextInputChange('jobTitleKeywords', e.target.value)}
                onBlur={() => handleTextInputBlur('jobTitleKeywords', 'role.keywords')}
                className="text-sm"
              />
            </div>

            {/* Departments - Now using SearchableMultiSelect */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Departments</Label>
                {getSelectedCount('role.departments') > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('role.departments')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={filterOptions.departments || []}
                selectedValues={draftFilters.role?.departments || []}
                onSelectionChange={(values) => handleMultiSelectFilter('role.departments', values)}
                placeholder="Select departments..."
                searchPlaceholder="Search departments..."
                maxDisplay={2}
              />
            </div>

            {/* Management Levels - Now using SearchableMultiSelect */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Management Level</Label>
                {getSelectedCount('role.managementLevels') > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('role.managementLevels')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={filterOptions.managementLevels || []}
                selectedValues={draftFilters.role?.managementLevels || []}
                onSelectionChange={(values) => handleMultiSelectFilter('role.managementLevels', values)}
                placeholder="Select management levels..."
                searchPlaceholder="Search levels..."
                maxDisplay={3}
              />
            </div>

            {/* Seniority Levels - Now using SearchableMultiSelect for consistency */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Seniority Level</Label>
                {getSelectedCount('role.seniorityLevels') > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('role.seniorityLevels')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={[
                  { value: 'c-level', label: 'C-Level' },
                  { value: 'vp', label: 'VP' },
                  { value: 'director', label: 'Director' },
                  { value: 'manager', label: 'Manager' },
                  { value: 'senior', label: 'Senior' },
                  { value: 'mid-level', label: 'Mid-Level' },
                  { value: 'junior', label: 'Junior' }
                ]}
                selectedValues={draftFilters.role?.seniorityLevels || []}
                onSelectionChange={(values) => handleMultiSelectFilter('role.seniorityLevels', values)}
                placeholder="Select seniority levels..."
                searchPlaceholder="Search levels..."
                maxDisplay={2}
              />
            </div>

            {/* Decision Maker */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="decision-maker"
                checked={draftFilters.role?.isDecisionMaker || false}
                onCheckedChange={(checked) => handleBooleanFilter('role.isDecisionMaker', !!checked)}
              />
              <label
                htmlFor="decision-maker"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Decision makers only
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Company Filters */}
        <AccordionItem value="company">
          <AccordionTrigger className="py-2">
            <div className="flex items-center gap-2">
              Company
              {getSelectedCount('company.industries') > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {getSelectedCount('company.industries')}
                </Badge>
              )}
            </div>
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Industries - Now using SearchableMultiSelect */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Industries</Label>
                {getSelectedCount('company.industries') > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearFilter('company.industries')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={filterOptions.industries || []}
                selectedValues={draftFilters.company?.industries || []}
                onSelectionChange={(values) => handleMultiSelectFilter('company.industries', values)}
                placeholder="Select industries..."
                searchPlaceholder="Search industries..."
                maxDisplay={2}
              />
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee Count Range</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="1"
                    value={draftFilters.company?.employeeCountRange?.min || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateDraftFilter('company.employeeCountRange.min', value);
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="10000"
                    value={draftFilters.company?.employeeCountRange?.max || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateDraftFilter('company.employeeCountRange.max', value);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Company Keywords */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company Keywords</Label>
              <Input
                placeholder="Company name or description keywords"
                value={localInputs.companyKeywords}
                onChange={(e) => handleTextInputChange('companyKeywords', e.target.value)}
                onBlur={() => handleTextInputBlur('companyKeywords', 'company.companyKeywords')}
                className="text-sm"
              />
            </div>

            {/* Founded Year Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Founded Year</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">After</Label>
                  <Input
                    type="number"
                    placeholder="2000"
                    value={draftFilters.company?.foundedAfter || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateDraftFilter('company.foundedAfter', value);
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Before</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={draftFilters.company?.foundedBefore || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateDraftFilter('company.foundedBefore', value);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* B2B Filter */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="b2b-only"
                checked={draftFilters.company?.isB2B || false}
                onCheckedChange={(checked) => handleBooleanFilter('company.isB2B', !!checked)}
              />
              <label
                htmlFor="b2b-only"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                B2B companies only
              </label>
            </div>

            {/* Recent Funding */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recent-funding"
                checked={draftFilters.company?.hasRecentFunding || false}
                onCheckedChange={(checked) => handleBooleanFilter('company.hasRecentFunding', !!checked)}
              />
              <label
                htmlFor="recent-funding"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Recent funding (last 24 months)
              </label>
            </div>
          </AccordionContent>
        </AccordionItem>

        {/* Advanced Filters */}
        <AccordionItem value="advanced">
          <AccordionTrigger className="py-2">
            Advanced Filters
          </AccordionTrigger>
          <AccordionContent className="space-y-4">
            {/* Skills - Keep as text input for flexibility */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Skills</Label>
              <Input
                placeholder="e.g., Python, Leadership, Machine Learning"
                value={localInputs.skills}
                onChange={(e) => handleTextInputChange('skills', e.target.value)}
                onBlur={() => handleTextInputBlur('skills', 'advanced.skills')}
                className="text-sm"
              />
              <p className="text-xs text-muted-foreground">
                Enter skills separated by commas
              </p>
            </div>

            {/* Tenure Range */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Current Role Tenure (months)</Label>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label className="text-xs text-muted-foreground">Min</Label>
                  <Input
                    type="number"
                    placeholder="6"
                    value={draftFilters.advanced?.tenureRange?.min || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateDraftFilter('advanced.tenureRange.min', value);
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={draftFilters.advanced?.tenureRange?.max || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateDraftFilter('advanced.tenureRange.max', value);
                    }}
                    className="text-sm"
                  />
                </div>
              </div>
            </div>

            {/* Recent Job Change */}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="recent-job-change"
                checked={draftFilters.advanced?.recentJobChange || false}
                onCheckedChange={(checked) => handleBooleanFilter('advanced.recentJobChange', !!checked)}
              />
              <label
                htmlFor="recent-job-change"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 cursor-pointer"
              >
                Started current job in last 12 months
              </label>
            </div>

            {/* General Keywords */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">General Keywords</Label>
              <Input
                placeholder="Search across all profile fields"
                value={localInputs.generalKeywords}
                onChange={(e) => handleTextInputChange('generalKeywords', e.target.value)}
                onBlur={() => handleTextInputBlur('generalKeywords', 'advanced.keywords')}
                className="text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}