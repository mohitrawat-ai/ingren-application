// src/components/profile/ProfileResults.tsx
"use client";

import { Building, MapPin, Briefcase, Mail, User, Check } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

import { useProfileStore } from "@/stores/profileStore";
import { Profile } from "@/types/profile";

interface ProfileResultsProps {
  className?: string;
}

export function ProfileResults({ className }: ProfileResultsProps) {
  const {
    profiles,
    loadingProfiles,
    selectedProfiles,
    toggleProfileSelection,
    profilePagination,
    searchProfiles,
  } = useProfileStore();

  const isSelected = (profile: Profile): boolean => {
    return selectedProfiles.some(selected => selected.id === profile.id);
  };

  const handlePageChange = (page: number) => {
    searchProfiles(page);
  };

  if (loadingProfiles) {
    return (
      <div className={className}>
        <div className="space-y-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <div className="flex items-start gap-4">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-5 w-48" />
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-4 w-64" />
                    <div className="flex gap-2">
                      <Skeleton className="h-6 w-20" />
                      <Skeleton className="h-6 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-9 w-20" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!profiles || profiles.length === 0) {
    return (
      <div className={className}>
        <div className="text-center py-12">
          <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-lg font-medium mb-2">No profiles found</h3>
          <p className="text-muted-foreground mb-4">
            Try adjusting your search criteria or filters to find more profiles.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="space-y-4">
        {profiles.map((profile) => (
          <ProfileCard
            key={profile.id}
            profile={profile}
            isSelected={isSelected(profile)}
            onSelect={() => toggleProfileSelection(profile)}
          />
        ))}
      </div>

      {/* Pagination */}
      {profilePagination && profilePagination.pages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={profilePagination.page === 1}
            onClick={() => handlePageChange(profilePagination.page - 1)}
          >
            Previous
          </Button>
          
          <span className="text-sm text-muted-foreground">
            Page {profilePagination.page} of {profilePagination.pages}
          </span>
          
          <Button
            variant="outline"
            size="sm"
            disabled={profilePagination.page === profilePagination.pages}
            onClick={() => handlePageChange(profilePagination.page + 1)}
          >
            Next
          </Button>
        </div>
      )}

      {/* Results summary */}
      <div className="text-center text-sm text-muted-foreground mt-4">
        {profilePagination ? (
          <>
            Showing {((profilePagination.page - 1) * profilePagination.pageSize) + 1} to{' '}
            {Math.min(profilePagination.page * profilePagination.pageSize, profilePagination.total)} of{' '}
            {profilePagination.total} profiles
          </>
        ) : (
          `${profiles.length} profiles found`
        )}
      </div>
    </div>
  );
}

interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onSelect: () => void;
}

function ProfileCard({ profile, isSelected, onSelect }: ProfileCardProps) {
  const getInitials = (profile: Profile): string => {
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  const formatLocation = (profile: Profile): string => {
    return [profile.city, profile.state, profile.country]
      .filter(Boolean)
      .join(", ") || "Location not specified";
  };

  const formatCompanyInfo = (profile: Profile): string => {
    const parts = [profile.company?.name];
    if (profile.company?.industry) {
      parts.push(profile.company.industry);
    }
    return parts.filter(Boolean).join(" • ");
  };

  const getManagementLevelColor = (level: string): "default" | "secondary" | "outline" => {
    switch (level) {
      case 'executive':
        return 'default';
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={`transition-colors ${isSelected ? 'border-primary bg-primary/5' : 'hover:bg-accent/50'}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {getInitials(profile)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold text-lg truncate">
                {profile.fullName}
              </h3>
              <Button
                variant={isSelected ? "default" : "outline"}
                size="sm"
                onClick={onSelect}
                className="ml-2 flex-shrink-0"
              >
                {isSelected ? (
                  <>
                    <Check className="mr-1 h-4 w-4" />
                    Selected
                  </>
                ) : (
                  "Select"
                )}
              </Button>
            </div>
            
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Badge variant="secondary">{profile.jobTitle}</Badge>
              
              {profile.department && (
                <Badge variant="outline">{profile.department}</Badge>
              )}
              
              {profile.managementLevel && (
                <Badge variant={getManagementLevelColor(profile.managementLevel)} className="capitalize">
                  {profile.managementLevel.replace('_', ' ')}
                </Badge>
              )}
              
              {profile.seniorityLevel && (
                <Badge variant="outline" className="capitalize">
                  {profile.seniorityLevel.replace('-', ' ')}
                </Badge>
              )}
            </div>
            
            <div className="flex items-center mt-2">
              <Building className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {formatCompanyInfo(profile)}
              </span>
            </div>
            
            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
              {profile.email && (
                <div className="flex items-center">
                  <Mail className="h-4 w-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{profile.email}</span>
                </div>
              )}
              
              <div className="flex items-center">
                <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
                <span className="truncate">{formatLocation(profile)}</span>
              </div>
            </div>
            
            {profile.isDecisionMaker && (
              <div className="mt-2">
                <Badge variant="default" className="text-xs">
                  ✓ Decision Maker
                </Badge>
              </div>
            )}
            
            {profile.company?.employeeCountRange && (
              <div className="mt-1 text-xs text-muted-foreground">
                Company size: {profile.company.employeeCountRange} employees
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}