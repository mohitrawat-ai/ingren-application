// src/components/profile/search/ProfileDataTable.tsx - Updated for React Query + Zustand

"use client";

import { useState, useMemo } from "react";
import { 
  User, 
  Mail, 
  Phone, 
  ExternalLink,
  ChevronUp,
  ChevronDown,
  ChevronsUpDown,
  MoreHorizontal,
  Eye,
  Copy,
  Check
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Skeleton } from "@/components/ui/skeleton";

import { Profile } from "@/types/profile";
import { cn } from "@/lib/utils";

interface ProfileDataTableProps {
  profiles: Profile[];
  isLoading?: boolean;
  selectedProfiles?: Profile[];
  onToggleSelection?: (profile: Profile) => void;
  onProfileClick?: (profile: Profile) => void;
  className?: string;
}

type SortField = 'name' | 'title' | 'company' | 'location' | 'seniority' | 'tenure';
type SortDirection = 'asc' | 'desc' | null;

interface SortConfig {
  field: SortField | null;
  direction: SortDirection;
}

export function ProfileDataTable({
  profiles,
  isLoading = false,
  selectedProfiles = [],
  onToggleSelection,
  onProfileClick,
  className,
}: ProfileDataTableProps) {
  const [sortConfig, setSortConfig] = useState<SortConfig>({ field: null, direction: null });
  const [copiedEmail, setCopiedEmail] = useState<string | null>(null);

  // Sort profiles based on current sort config
  const sortedProfiles = useMemo(() => {
    if (!sortConfig.field || !sortConfig.direction) {
      return profiles;
    }

    return [...profiles].sort((a, b) => {
      let aValue: string | number = '';
      let bValue: string | number = '';

      switch (sortConfig.field) {
        case 'name':
          aValue = a.fullName.toLowerCase();
          bValue = b.fullName.toLowerCase();
          break;
        case 'title':
          aValue = a.jobTitle.toLowerCase();
          bValue = b.jobTitle.toLowerCase();
          break;
        case 'company':
          aValue = (a.company?.name || '').toLowerCase();
          bValue = (b.company?.name || '').toLowerCase();
          break;
        case 'location':
          aValue = `${a.city} ${a.state} ${a.country}`.toLowerCase();
          bValue = `${b.city} ${b.state} ${b.country}`.toLowerCase();
          break;
        case 'seniority':
          // Custom seniority level ordering
          const seniorityOrder = { 'c-level': 6, 'vp': 5, 'director': 4, 'manager': 3, 'senior': 2, 'mid-level': 1, 'junior': 0 };
          aValue = seniorityOrder[a.seniorityLevel as keyof typeof seniorityOrder] || 0;
          bValue = seniorityOrder[b.seniorityLevel as keyof typeof seniorityOrder] || 0;
          break;
        case 'tenure':
          aValue = a.currentTenure?.monthsInRole || 0;
          bValue = b.currentTenure?.monthsInRole || 0;
          break;
        default:
          return 0;
      }

      if (aValue < bValue) return sortConfig.direction === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [profiles, sortConfig]);

  // Handle sorting
  const handleSort = (field: SortField) => {
    setSortConfig((current) => {
      if (current.field === field) {
        // Cycle through: asc -> desc -> null
        const direction = current.direction === 'asc' ? 'desc' : current.direction === 'desc' ? null : 'asc';
        return { field: direction ? field : null, direction };
      } else {
        return { field, direction: 'asc' };
      }
    });
  };

  // Get sort icon for column
  const getSortIcon = (field: SortField) => {
    if (sortConfig.field !== field) {
      return <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />;
    }
    
    return sortConfig.direction === 'asc' 
      ? <ChevronUp className="h-4 w-4" />
      : <ChevronDown className="h-4 w-4" />;
  };

  // Check if profile is selected
  const isSelected = (profile: Profile): boolean => {
    return selectedProfiles.some(selected => selected.id === profile.id);
  };

  // Get profile initials
  const getInitials = (profile: Profile): string => {
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  // Format location
  const formatLocation = (profile: Profile): string => {
    return [profile.city, profile.state, profile.country]
      .filter(Boolean)
      .join(", ") || "—";
  };

  // Get badge variant for management level
  const getManagementLevelVariant = (level: string): "default" | "secondary" | "outline" => {
    switch (level) {
      case 'executive': return 'default';
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  // Get badge variant for seniority level
  const getSeniorityLevelVariant = (level: string): "default" | "secondary" | "outline" => {
    switch (level) {
      case 'c-level':
      case 'vp': return 'default';
      case 'director':
      case 'manager': return 'secondary';
      default: return 'outline';
    }
  };

  // Copy email to clipboard
  const handleCopyEmail = async (email: string) => {
    try {
      await navigator.clipboard.writeText(email);
      setCopiedEmail(email);
      setTimeout(() => setCopiedEmail(null), 2000);
    } catch (err) {
      console.error('Failed to copy email:', err);
    }
  };

  // Handle profile row click
  const handleRowClick = (profile: Profile, event: React.MouseEvent) => {
    // Don't trigger if clicking on interactive elements
    const target = event.target as HTMLElement;
    if (target.closest('button') || target.closest('a') || target.closest('[role="checkbox"]')) {
      return;
    }
    
    onProfileClick?.(profile);
  };

  // Loading skeleton
  if (isLoading) {
    return (
      <div className={cn("border rounded-lg", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-12"></TableHead>
              <TableHead>Profile</TableHead>
              <TableHead>Position</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Level</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {[...Array(10)].map((_, i) => (
              <TableRow key={i}>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <Skeleton className="h-4 w-32" />
                  </div>
                </TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                <TableCell><Skeleton className="h-4 w-16" /></TableCell>
                <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                <TableCell><Skeleton className="h-4 w-4" /></TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    );
  }

  if (profiles.length === 0) {
    return (
      <div className={cn("border rounded-lg p-8 text-center", className)}>
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No profiles found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria to find more profiles.
        </p>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className={cn("border rounded-lg", className)}>
        <Table>
          <TableHeader>
            <TableRow>
              {/* Selection column */}
              {onToggleSelection && (
                <TableHead className="w-12">
                  <span className="sr-only">Select</span>
                </TableHead>
              )}
              
              {/* Profile column */}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('name')}
                >
                  Profile
                  {getSortIcon('name')}
                </Button>
              </TableHead>
              
              {/* Position column */}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('title')}
                >
                  Position
                  {getSortIcon('title')}
                </Button>
              </TableHead>
              
              {/* Company column */}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('company')}
                >
                  Company
                  {getSortIcon('company')}
                </Button>
              </TableHead>
              
              {/* Location column */}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('location')}
                >
                  Location
                  {getSortIcon('location')}
                </Button>
              </TableHead>
              
              {/* Level column */}
              <TableHead>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-auto p-0 font-medium"
                  onClick={() => handleSort('seniority')}
                >
                  Level
                  {getSortIcon('seniority')}
                </Button>
              </TableHead>
              
              {/* Contact column */}
              <TableHead>Contact</TableHead>
              
              {/* Actions column */}
              <TableHead className="w-12">
                <span className="sr-only">Actions</span>
              </TableHead>
            </TableRow>
          </TableHeader>
          
          <TableBody>
            {sortedProfiles.map((profile) => (
              <TableRow 
                key={profile.id}
                className={cn(
                  "cursor-pointer hover:bg-muted/50 transition-colors",
                  isSelected(profile) && "bg-primary/5 border-primary/20"
                )}
                onClick={(e) => handleRowClick(profile, e)}
              >
                {/* Selection checkbox */}
                {onToggleSelection && (
                  <TableCell>
                    <Checkbox
                      checked={isSelected(profile)}
                      onCheckedChange={() => onToggleSelection(profile)}
                      aria-label={`Select ${profile.fullName}`}
                    />
                  </TableCell>
                )}
                
                {/* Profile info */}
                <TableCell>
                  <div className="flex items-center gap-3">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback className="text-xs font-medium">
                        {getInitials(profile)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="min-w-0">
                      <div className="font-medium truncate">{profile.fullName}</div>
                      {profile.department && (
                        <div className="text-xs text-muted-foreground truncate">
                          {profile.department}
                        </div>
                      )}
                    </div>
                  </div>
                </TableCell>
                
                {/* Position */}
                <TableCell>
                  <div className="space-y-1">
                    <Badge variant="secondary" className="text-xs">
                      {profile.jobTitle}
                    </Badge>
                    {profile.currentTenure?.monthsInRole && (
                      <div className="text-xs text-muted-foreground">
                        {profile.currentTenure.monthsInRole}mo tenure
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Company */}
                <TableCell>
                  <div className="min-w-0">
                    <div className="font-medium truncate">
                      {profile.company?.name || '—'}
                    </div>
                    {profile.company?.industry && (
                      <div className="text-xs text-muted-foreground truncate">
                        {profile.company.industry}
                      </div>
                    )}
                    {profile.company?.employeeCountRange && (
                      <div className="text-xs text-muted-foreground">
                        {profile.company.employeeCountRange} employees
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Location */}
                <TableCell>
                  <div className="text-sm">{formatLocation(profile)}</div>
                </TableCell>
                
                {/* Level */}
                <TableCell>
                  <div className="space-y-1">
                    {profile.seniorityLevel && (
                      <Badge 
                        variant={getSeniorityLevelVariant(profile.seniorityLevel)} 
                        className="text-xs"
                      >
                        {profile.seniorityLevel.replace('-', ' ')}
                      </Badge>
                    )}
                    {profile.managementLevel && (
                      <div>
                        <Badge 
                          variant={getManagementLevelVariant(profile.managementLevel)} 
                          className="text-xs"
                        >
                          {profile.managementLevel.replace('_', ' ')}
                        </Badge>
                      </div>
                    )}
                    {profile.isDecisionMaker && (
                      <div>
                        <Badge variant="default" className="text-xs bg-green-600">
                          ✓ Decision Maker
                        </Badge>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Contact */}
                <TableCell>
                  <div className="space-y-1">
                    {profile.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3 w-3 text-muted-foreground" />
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0 text-xs hover:text-primary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCopyEmail(profile.email!);
                              }}
                            >
                              {copiedEmail === profile.email ? (
                                <Check className="h-3 w-3 text-green-600" />
                              ) : (
                                <Copy className="h-3 w-3" />
                              )}
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>
                            {copiedEmail === profile.email ? 'Copied!' : 'Copy email'}
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                    {profile.phone && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Phone className="h-3 w-3" />
                        <span className="truncate">{profile.phone}</span>
                      </div>
                    )}
                    {profile.linkedinUrl && (
                      <div className="flex items-center gap-1">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-auto p-0"
                              onClick={(e) => {
                                e.stopPropagation();
                                window.open(profile.linkedinUrl, '_blank');
                              }}
                            >
                              <ExternalLink className="h-3 w-3 text-blue-600" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent>View LinkedIn profile</TooltipContent>
                        </Tooltip>
                      </div>
                    )}
                  </div>
                </TableCell>
                
                {/* Actions */}
                <TableCell>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="h-4 w-4" />
                        <span className="sr-only">Open menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => onProfileClick?.(profile)}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </DropdownMenuItem>
                      {profile.email && (
                        <DropdownMenuItem onClick={() => handleCopyEmail(profile.email!)}>
                          <Copy className="mr-2 h-4 w-4" />
                          Copy Email
                        </DropdownMenuItem>
                      )}
                      {profile.linkedinUrl && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem 
                            onClick={() => window.open(profile.linkedinUrl, '_blank')}
                          >
                            <ExternalLink className="mr-2 h-4 w-4" />
                            Open LinkedIn
                          </DropdownMenuItem>
                        </>
                      )}
                      {onToggleSelection && (
                        <>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => onToggleSelection(profile)}>
                            {isSelected(profile) ? 'Deselect' : 'Select'}
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </TooltipProvider>
  );
}