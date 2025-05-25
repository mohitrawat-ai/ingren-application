// src/components/profile/search/ProfileFiltersPanel.tsx
"use client";

import { useEffect } from "react";
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

export function ProfileFiltersPanel() {
  const { 
    filters, 
    updateFilter, 
    filterOptions, 
    fetchFilterOptions, 
    loadingFilterOptions 
  } = useProfileStore();

  // Load filter options on mount
  useEffect(() => {
    if (!filterOptions && !loadingFilterOptions) {
      fetchFilterOptions().catch(console.error);
    }
  }, [filterOptions, loadingFilterOptions, fetchFilterOptions]);

  const handleArrayFilter = (path: string, value: string) => {
    updateFilter(path, value);
  };

  const handleInputFilter = (path: string, value: string) => {
    updateFilter(path, value);
  };

  const handleBooleanFilter = (path: string, value: boolean) => {
    updateFilter(path, value);
  };

 const getSelectedCount = (path: string): number => {
    const pathParts = path.split('.');
    let current: unknown = filters;
    
    for (const part of pathParts) {
      if (current && typeof current === 'object' && part in current) {
        current = (current as Record<string, unknown>)[part];
      } else {
        current = undefined;
        break;
      }
    }
    
    return Array.isArray(current) ? current.length : 0;
  };

  const clearFilter = (path: string) => {
    updateFilter(path, []);
  };

  if (loadingFilterOptions) {
    return (
      <div className="p-4">
        <div className="animate-pulse space-y-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-20 bg-muted rounded"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
            {/* Countries */}
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterOptions?.countries?.map(country => (
                  <div key={country} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`country-${country}`}
                      checked={filters.location?.countries?.includes(country) || false}
                      onCheckedChange={() => handleArrayFilter('location.countries', country)}
                    />
                    <label
                      htmlFor={`country-${country}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {country}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* US States */}
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterOptions?.usStates?.map(state => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`state-${state}`}
                      checked={filters.location?.states?.includes(state) || false}
                      onCheckedChange={() => handleArrayFilter('location.states', state)}
                    />
                    <label
                      htmlFor={`state-${state}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {state}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Cities - Free text input */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Cities</Label>
              <Input
                placeholder="Enter city names (comma separated)"
                onChange={(e) => {
                  const cities = e.target.value.split(',').map(c => c.trim()).filter(c => c);
                  updateFilter('location.cities', cities);
                }}
                className="text-sm"
              />
            </div>

            {/* Include Remote */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="include-remote"
                checked={filters.location?.includeRemote || false}
                onCheckedChange={(checked) => handleBooleanFilter('location.includeRemote', !!checked)}
              />
              <label
                htmlFor="include-remote"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Include remote workers
              </label>
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
            {/* Job Titles */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Job Title Keywords</Label>
              <Input
                placeholder="e.g., CEO, CTO, VP Engineering"
                value={filters.role?.keywords || ''}
                onChange={(e) => handleInputFilter('role.keywords', e.target.value)}
                className="text-sm"
              />
            </div>

            {/* Departments */}
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterOptions?.departments?.map(department => (
                  <div key={department} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`dept-${department}`}
                      checked={filters.role?.departments?.includes(department) || false}
                      onCheckedChange={() => handleArrayFilter('role.departments', department)}
                    />
                    <label
                      htmlFor={`dept-${department}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {department}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Management Levels */}
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
              <div className="space-y-2">
                {filterOptions?.managementLevels?.map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`mgmt-${level}`}
                      checked={filters.role?.managementLevels?.includes(level) || false}
                      onCheckedChange={() => handleArrayFilter('role.managementLevels', level)}
                    />
                    <label
                      htmlFor={`mgmt-${level}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {level.replace('_', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Seniority Levels */}
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
              <div className="space-y-2">
                {filterOptions?.seniorityLevels?.map(level => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`seniority-${level}`}
                      checked={filters.role?.seniorityLevels?.includes(level) || false}
                      onCheckedChange={() => handleArrayFilter('role.seniorityLevels', level)}
                    />
                    <label
                      htmlFor={`seniority-${level}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                    >
                      {level.replace('-', ' ')}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Decision Maker */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="decision-maker"
                checked={filters.role?.isDecisionMaker || false}
                onCheckedChange={(checked) => handleBooleanFilter('role.isDecisionMaker', !!checked)}
              />
              <label
                htmlFor="decision-maker"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
            {/* Industries */}
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
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {filterOptions?.industries?.map(industry => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox 
                      id={`industry-${industry}`}
                      checked={filters.company?.industries?.includes(industry) || false}
                      onCheckedChange={() => handleArrayFilter('company.industries', industry)}
                    />
                    <label
                      htmlFor={`industry-${industry}`}
                      className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {industry}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            {/* Company Size */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Employee Count Range</Label>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Min</Label>
                    <Input
                      type="number"
                      placeholder="1"
                      value={filters.company?.employeeCountRange?.min || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        updateFilter('company.employeeCountRange.min', value);
                      }}
                      className="text-sm"
                    />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Max</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={filters.company?.employeeCountRange?.max || ''}
                      onChange={(e) => {
                        const value = e.target.value ? parseInt(e.target.value) : undefined;
                        updateFilter('company.employeeCountRange.max', value);
                      }}
                      className="text-sm"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Company Keywords */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Company Keywords</Label>
              <Input
                placeholder="Company name or description keywords"
                value={filters.company?.companyKeywords || ''}
                onChange={(e) => handleInputFilter('company.companyKeywords', e.target.value)}
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
                    value={filters.company?.foundedAfter || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateFilter('company.foundedAfter', value);
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Before</Label>
                  <Input
                    type="number"
                    placeholder="2024"
                    value={filters.company?.foundedBefore || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateFilter('company.foundedBefore', value);
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
                checked={filters.company?.isB2B || false}
                onCheckedChange={(checked) => handleBooleanFilter('company.isB2B', !!checked)}
              />
              <label
                htmlFor="b2b-only"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                B2B companies only
              </label>
            </div>

            {/* Recent Funding */}
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="recent-funding"
                checked={filters.company?.hasRecentFunding || false}
                onCheckedChange={(checked) => handleBooleanFilter('company.hasRecentFunding', !!checked)}
              />
              <label
                htmlFor="recent-funding"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
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
            {/* Skills */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Skills</Label>
              <Input
                placeholder="e.g., Python, Leadership, Machine Learning"
                onChange={(e) => {
                  const skills = e.target.value.split(',').map(s => s.trim()).filter(s => s);
                  updateFilter('advanced.skills', skills);
                }}
                className="text-sm"
              />
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
                    value={filters.advanced?.tenureRange?.min || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateFilter('advanced.tenureRange.min', value);
                    }}
                    className="text-sm"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Max</Label>
                  <Input
                    type="number"
                    placeholder="60"
                    value={filters.advanced?.tenureRange?.max || ''}
                    onChange={(e) => {
                      const value = e.target.value ? parseInt(e.target.value) : undefined;
                      updateFilter('advanced.tenureRange.max', value);
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
                checked={filters.advanced?.recentJobChange || false}
                onCheckedChange={(checked) => handleBooleanFilter('advanced.recentJobChange', !!checked)}
              />
              <label
                htmlFor="recent-job-change"
                className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Started current job in last 12 months
              </label>
            </div>

            {/* General Keywords */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">General Keywords</Label>
              <Input
                placeholder="Search across all profile fields"
                value={filters.advanced?.keywords || ''}
                onChange={(e) => handleInputFilter('advanced.keywords', e.target.value)}
                className="text-sm"
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}