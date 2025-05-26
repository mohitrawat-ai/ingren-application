// src/components/profile/ProfileFilters.tsx
"use client";

import { useState, useEffect } from "react";
import { ChevronDown, MapPin, Briefcase, Building, GraduationCap, X } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

import { ProfileFilters as ProfileFiltersType } from "@/types/profile";
import { getFilterOptions } from "@/lib/actions/profile";

interface ProfileFiltersProps {
  filters: ProfileFiltersType;
  onChange: (filters: ProfileFiltersType) => void;
  onSearch: () => void;
  loading?: boolean;
}

interface FilterOptions {
  industries: string[];
  managementLevels: string[];
  departments: string[];
  companySizes: string[];
  usStates: string[];
  countries: string[];
}

const defaultFilterOptions: FilterOptions = {
  industries: [
    "Technology", "Financial Services", "Healthcare", "Manufacturing", 
    "Retail", "Education", "Real Estate", "Marketing", "Consulting"
  ],
  managementLevels: ["executive", "manager", "individual_contributor"],
  departments: [
    "Engineering", "Sales", "Marketing", "Operations", "Finance", 
    "Human Resources", "Product", "Customer Success", "Legal"
  ],
  companySizes: ["1-10", "11-50", "51-200", "201-500", "501-1000", "1000+"],
  usStates: [
    "CA", "NY", "TX", "FL", "IL", "PA", "OH", "GA", "NC", "MI", 
    "NJ", "VA", "WA", "AZ", "MA", "TN", "IN", "MO", "MD", "WI"
  ],
  countries: ["United States", "Canada", "United Kingdom", "Germany", "France", "Australia"]
};

export function ProfileFilters({ filters, onChange, onSearch, loading }: ProfileFiltersProps) {
  const [filterOptions, setFilterOptions] = useState<FilterOptions>(defaultFilterOptions);
  const [openSections, setOpenSections] = useState({
    location: true,
    role: true,
    company: false,
    advanced: false
  });

  // Load filter options from API
  useEffect(() => {
    const loadFilterOptions = async () => {
      try {
        const options = await getFilterOptions();
        setFilterOptions(options);
      } catch (error) {
        console.error("Failed to load filter options:", error);
        // Use default options on error
      }
    };

    loadFilterOptions();
  }, []);

  // Helper to update nested filter properties
  const updateFilter = (section: keyof ProfileFiltersType, field: string, value: unknown) => {
    onChange({
      ...filters,
      [section]: {
        ...filters[section] as Record<string, unknown>,
        [field]: value
      }
    });
  };

  // Helper to toggle array values
  const toggleArrayValue = (section: keyof ProfileFiltersType, field: string, value: string) => {
    const currentSection = filters[section] as Record<string, unknown> | undefined;
    const currentArray = (currentSection?.[field] as string[]) || [];
    const newArray = currentArray.includes(value)
      ? currentArray.filter((item: string) => item !== value)
      : [...currentArray, value];
    
    updateFilter(section, field, newArray.length > 0 ? newArray : undefined);
  };

  // Helper to update range values
  const updateRangeFilter = (
    section: keyof ProfileFiltersType,
    field: string,
    rangeField: 'min' | 'max',
    value: number | undefined
  ) => {
    const currentSection = filters[section] as Record<string, unknown> | undefined;
    const currentRange = (currentSection?.[field] as { min?: number; max?: number }) || {};
    
    const newRange = {
      ...currentRange,
      [rangeField]: value
    };

    // Remove undefined values
    if (newRange.min === undefined && newRange.max === undefined) {
      updateFilter(section, field, undefined);
    } else {
      updateFilter(section, field, newRange);
    }
  };

  // Clear all filters
  const clearAllFilters = () => {
    onChange({
      page: 1,
      pageSize: 50,
      sortBy: 'relevance',
      sortOrder: 'desc'
    });
  };

  // Get applied filters count
  const getAppliedFiltersCount = () => {
    let count = 0;
    if (filters.location) {
      if (filters.location.states?.length) count++;
      if (filters.location.cities?.length) count++;
      if (filters.location.countries?.length) count++;
    }
    if (filters.role) {
      if (filters.role.jobTitles?.length) count++;
      if (filters.role.departments?.length) count++;
      if (filters.role.managementLevels?.length) count++;
      if (filters.role.seniorityLevels?.length) count++;
      if (filters.role.isDecisionMaker) count++;
    }
    if (filters.company) {
      if (filters.company.industries?.length) count++;
      if (filters.company.employeeCountRange?.min || filters.company.employeeCountRange?.max) count++;
      if (filters.company.foundedAfter) count++;
      if (filters.company.isB2B) count++;
      if (filters.company.hasRecentFunding) count++;
    }
    if (filters.advanced) {
      if (filters.advanced.skills?.length) count++;
      if (filters.advanced.tenureRange?.min || filters.advanced.tenureRange?.max) count++;
      if (filters.advanced.recentJobChange) count++;
    }
    return count;
  };

  const appliedFiltersCount = getAppliedFiltersCount();

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">Filters</CardTitle>
          {appliedFiltersCount > 0 && (
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{appliedFiltersCount} applied</Badge>
              <Button variant="ghost" size="sm" onClick={clearAllFilters}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
        <CardDescription>
          Refine your search with detailed filters
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Location Filters */}
        <Collapsible 
          open={openSections.location} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, location: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <MapPin className="h-4 w-4" />
                <span className="font-medium">Location</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div>
              <Label className="text-sm font-medium">US States</Label>
              <div className="grid grid-cols-2 gap-1 mt-2">
                {filterOptions.usStates.slice(0, 8).map((state) => (
                  <div key={state} className="flex items-center space-x-2">
                    <Checkbox
                      id={`state-${state}`}
                      checked={filters.location?.states?.includes(state) || false}
                      onCheckedChange={() => toggleArrayValue('location', 'states', state)}
                    />
                    <Label htmlFor={`state-${state}`} className="text-sm">{state}</Label>
                  </div>
                ))}
              </div>
            </div>
            
            <div>
              <Label className="text-sm font-medium">Cities</Label>
              <Input
                placeholder="Enter cities separated by commas"
                value={filters.location?.cities?.join(', ') || ''}
                onChange={(e) => updateFilter('location', 'cities', 
                  e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined
                )}
              />
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="include-remote"
                checked={filters.location?.includeRemote || false}
                onCheckedChange={(checked) => updateFilter('location', 'includeRemote', !!checked)}
              />
              <Label htmlFor="include-remote" className="text-sm">Include remote workers</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Role Filters */}
        <Collapsible 
          open={openSections.role} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, role: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                <span className="font-medium">Role & Position</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div>
              <Label className="text-sm font-medium">Job Titles</Label>
              <Input
                placeholder="CEO, CTO, VP Engineering..."
                value={filters.role?.jobTitles?.join(', ') || ''}
                onChange={(e) => updateFilter('role', 'jobTitles', 
                  e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined
                )}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Departments</Label>
              <div className="grid grid-cols-1 gap-1 mt-2">
                {filterOptions.departments.map((dept) => (
                  <div key={dept} className="flex items-center space-x-2">
                    <Checkbox
                      id={`dept-${dept}`}
                      checked={filters.role?.departments?.includes(dept) || false}
                      onCheckedChange={() => toggleArrayValue('role', 'departments', dept)}
                    />
                    <Label htmlFor={`dept-${dept}`} className="text-sm">{dept}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Management Level</Label>
              <div className="grid grid-cols-1 gap-1 mt-2">
                {filterOptions.managementLevels.map((level) => (
                  <div key={level} className="flex items-center space-x-2">
                    <Checkbox
                      id={`mgmt-${level}`}
                      checked={filters.role?.managementLevels?.includes(level) || false}
                      onCheckedChange={() => toggleArrayValue('role', 'managementLevels', level)}
                    />
                    <Label htmlFor={`mgmt-${level}`} className="text-sm capitalize">
                      {level.replace('_', ' ')}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="decision-maker"
                checked={filters.role?.isDecisionMaker || false}
                onCheckedChange={(checked) => updateFilter('role', 'isDecisionMaker', !!checked)}
              />
              <Label htmlFor="decision-maker" className="text-sm">Decision makers only</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Company Filters */}
        <Collapsible 
          open={openSections.company} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, company: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <Building className="h-4 w-4" />
                <span className="font-medium">Company</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div>
              <Label className="text-sm font-medium">Industries</Label>
              <div className="grid grid-cols-1 gap-1 mt-2">
                {filterOptions.industries.map((industry) => (
                  <div key={industry} className="flex items-center space-x-2">
                    <Checkbox
                      id={`industry-${industry}`}
                      checked={filters.company?.industries?.includes(industry) || false}
                      onCheckedChange={() => toggleArrayValue('company', 'industries', industry)}
                    />
                    <Label htmlFor={`industry-${industry}`} className="text-sm">{industry}</Label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Company Size (Employees)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.company?.employeeCountRange?.min || ''}
                  onChange={(e) => updateRangeFilter('company', 'employeeCountRange', 'min',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.company?.employeeCountRange?.max || ''}
                  onChange={(e) => updateRangeFilter('company', 'employeeCountRange', 'max',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                />
              </div>
            </div>

            <div>
              <Label className="text-sm font-medium">Founded After</Label>
              <Input
                type="number"
                placeholder="e.g., 2015"
                value={filters.company?.foundedAfter || ''}
                onChange={(e) => updateFilter('company', 'foundedAfter', 
                  e.target.value ? parseInt(e.target.value) : undefined
                )}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="b2b-only"
                  checked={filters.company?.isB2B || false}
                  onCheckedChange={(checked) => updateFilter('company', 'isB2B', !!checked)}
                />
                <Label htmlFor="b2b-only" className="text-sm">B2B companies only</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="recent-funding"
                  checked={filters.company?.hasRecentFunding || false}
                  onCheckedChange={(checked) => updateFilter('company', 'hasRecentFunding', !!checked)}
                />
                <Label htmlFor="recent-funding" className="text-sm">Recently funded companies</Label>
              </div>
            </div>
          </CollapsibleContent>
        </Collapsible>

        <Separator />

        {/* Advanced Filters */}
        <Collapsible 
          open={openSections.advanced} 
          onOpenChange={(open) => setOpenSections(prev => ({ ...prev, advanced: open }))}
        >
          <CollapsibleTrigger asChild>
            <Button variant="ghost" className="w-full justify-between p-0 h-auto">
              <div className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                <span className="font-medium">Advanced</span>
              </div>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </CollapsibleTrigger>
          <CollapsibleContent className="space-y-3 mt-3">
            <div>
              <Label className="text-sm font-medium">Skills</Label>
              <Input
                placeholder="Python, Leadership, Sales..."
                value={filters.advanced?.skills?.join(', ') || ''}
                onChange={(e) => updateFilter('advanced', 'skills', 
                  e.target.value ? e.target.value.split(',').map(s => s.trim()) : undefined
                )}
              />
            </div>

            <div>
              <Label className="text-sm font-medium">Tenure in Current Role (Months)</Label>
              <div className="flex gap-2 mt-2">
                <Input
                  type="number"
                  placeholder="Min"
                  value={filters.advanced?.tenureRange?.min || ''}
                  onChange={(e) => updateRangeFilter('advanced', 'tenureRange', 'min',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                />
                <Input
                  type="number"
                  placeholder="Max"
                  value={filters.advanced?.tenureRange?.max || ''}
                  onChange={(e) => updateRangeFilter('advanced', 'tenureRange', 'max',
                    e.target.value ? parseInt(e.target.value) : undefined
                  )}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="recent-job-change"
                checked={filters.advanced?.recentJobChange || false}
                onCheckedChange={(checked) => updateFilter('advanced', 'recentJobChange', !!checked)}
              />
              <Label htmlFor="recent-job-change" className="text-sm">Recent job change (last 12 months)</Label>
            </div>
          </CollapsibleContent>
        </Collapsible>

        {/* Search Button */}
        <div className="pt-4">
          <Button onClick={onSearch} className="w-full" disabled={loading}>
            {loading ? "Searching..." : "Apply Filters"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}