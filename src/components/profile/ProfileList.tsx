// src/components/profile/ProfileList.tsx
"use client";

import { Building, MapPin, Briefcase, Mail, Check, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Profile } from "@/types/profile";

interface ProfileListProps {
  profiles: Profile[];
  selectedProfiles: Profile[];
  onToggleSelection: (profile: Profile) => void;
  viewMode?: 'cards' | 'table';
  showSelection?: boolean;
}

export function ProfileList({ 
  profiles, 
  selectedProfiles, 
  onToggleSelection,
  viewMode = 'cards',
  showSelection = true 
}: ProfileListProps) {
  const isSelected = (profile: Profile): boolean => {
    return selectedProfiles.some(selected => selected.id === profile.id);
  };

  if (profiles.length === 0) {
    return (
      <div className="text-center py-12">
        <User className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-2">No profiles found</h3>
        <p className="text-muted-foreground">
          Try adjusting your search criteria to find more profiles.
        </p>
      </div>
    );
  }

  if (viewMode === 'table') {
    return <ProfileTable profiles={profiles} selectedProfiles={selectedProfiles} onToggleSelection={onToggleSelection} showSelection={showSelection} />;
  }

  return (
    <div className="space-y-4">
      {profiles.map((profile) => (
        <ProfileCard
          key={profile.id}
          profile={profile}
          isSelected={isSelected(profile)}
          onToggleSelection={() => onToggleSelection(profile)}
          showSelection={showSelection}
        />
      ))}
    </div>
  );
}

interface ProfileCardProps {
  profile: Profile;
  isSelected: boolean;
  onToggleSelection: () => void;
  showSelection?: boolean;
}

function ProfileCard({ profile, isSelected, onToggleSelection, showSelection = true }: ProfileCardProps) {
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

  const getSeniorityLevelColor = (level: string): "default" | "secondary" | "outline" => {
    switch (level) {
      case 'c-level':
      case 'vp':
        return 'default';
      case 'director':
      case 'manager':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  return (
    <Card className={`transition-colors hover:shadow-md ${isSelected ? 'border-primary bg-primary/5' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          {/* Selection Checkbox */}
          {showSelection && (
            <div className="pt-1">
              <Checkbox
                checked={isSelected}
                onCheckedChange={onToggleSelection}
                aria-label={`Select ${profile.fullName}`}
              />
            </div>
          )}

          {/* Avatar */}
          <Avatar className="h-12 w-12 flex-shrink-0">
            <AvatarFallback className="bg-primary/10 text-primary font-medium">
              {getInitials(profile)}
            </AvatarFallback>
          </Avatar>
          
          {/* Content */}
          <div className="flex-1 min-w-0">
            {/* Name and Selection Button */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-lg truncate">
                  {profile.fullName}
                </h3>
                {profile.email && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                    <Mail className="h-3 w-3" />
                    <span className="truncate">{profile.email}</span>
                  </div>
                )}
              </div>
              
              {showSelection && (
                <Button
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  onClick={onToggleSelection}
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
              )}
            </div>
            
            {/* Job Title and Department */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Briefcase className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <Badge variant="secondary" className="font-medium">
                {profile.jobTitle}
              </Badge>
              
              {profile.department && (
                <Badge variant="outline">
                  {profile.department}
                </Badge>
              )}
            </div>

            {/* Seniority and Management Level */}
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {profile.managementLevel && (
                <Badge variant={getManagementLevelColor(profile.managementLevel)} className="text-xs">
                  {profile.managementLevel.replace('_', ' ').toUpperCase()}
                </Badge>
              )}
              
              {profile.seniorityLevel && (
                <Badge variant={getSeniorityLevelColor(profile.seniorityLevel)} className="text-xs">
                  {profile.seniorityLevel.replace('-', ' ').toUpperCase()}
                </Badge>
              )}
              
              {profile.isDecisionMaker && (
                <Badge variant="default" className="text-xs bg-green-600">
                  ✓ Decision Maker
                </Badge>
              )}
            </div>
            
            {/* Company Information */}
            <div className="flex items-center mb-2">
              <Building className="h-4 w-4 mr-2 text-muted-foreground flex-shrink-0" />
              <span className="text-sm font-medium truncate">
                {formatCompanyInfo(profile)}
              </span>
            </div>

            {/* Company Size */}
            {profile.company?.employeeCountRange && (
              <div className="text-xs text-muted-foreground mb-2">
                Company size: {profile.company.employeeCountRange} employees
              </div>
            )}
            
            {/* Location */}
            <div className="flex items-center text-sm text-muted-foreground">
              <MapPin className="h-4 w-4 mr-1 flex-shrink-0" />
              <span className="truncate">{formatLocation(profile)}</span>
            </div>

            {/* Skills (if available) */}
            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-3">
                <div className="text-xs text-muted-foreground mb-1">Skills:</div>
                <div className="flex flex-wrap gap-1">
                  {profile.skills.slice(0, 3).map((skill, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {skill}
                    </Badge>
                  ))}
                  {profile.skills.length > 3 && (
                    <Badge variant="outline" className="text-xs">
                      +{profile.skills.length - 3} more
                    </Badge>
                  )}
                </div>
              </div>
            )}

            {/* Tenure Information */}
            {profile.currentTenure && (
              <div className="mt-2 text-xs text-muted-foreground">
                {profile.currentTenure.monthsInRole} months in current role
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

interface ProfileTableProps {
  profiles: Profile[];
  selectedProfiles: Profile[];
  onToggleSelection: (profile: Profile) => void;
  showSelection?: boolean;
}

function ProfileTable({ profiles, selectedProfiles, onToggleSelection, showSelection = true }: ProfileTableProps) {
  const isSelected = (profile: Profile): boolean => {
    return selectedProfiles.some(selected => selected.id === profile.id);
  };

  const getInitials = (profile: Profile): string => {
    return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?';
  };

  return (
    <div className="border rounded-lg">
      <table className="w-full">
        <thead className="border-b bg-muted/50">
          <tr>
            {showSelection && (
              <th className="w-12 p-3 text-left">
                <span className="sr-only">Select</span>
              </th>
            )}
            <th className="p-3 text-left font-medium">Profile</th>
            <th className="p-3 text-left font-medium">Position</th>
            <th className="p-3 text-left font-medium">Company</th>
            <th className="p-3 text-left font-medium">Location</th>
            <th className="p-3 text-left font-medium">Level</th>
          </tr>
        </thead>
        <tbody>
          {profiles.map((profile) => (
            <tr 
              key={profile.id} 
              className={`border-b hover:bg-muted/25 ${isSelected(profile) ? 'bg-primary/5' : ''}`}
            >
              {showSelection && (
                <td className="p-3">
                  <Checkbox
                    checked={isSelected(profile)}
                    onCheckedChange={() => onToggleSelection(profile)}
                    aria-label={`Select ${profile.fullName}`}
                  />
                </td>
              )}
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="text-xs">
                      {getInitials(profile)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{profile.fullName}</div>
                    {profile.email && (
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {profile.email}
                      </div>
                    )}
                  </div>
                </div>
              </td>
              <td className="p-3">
                <div>
                  <Badge variant="secondary" className="mb-1">
                    {profile.jobTitle}
                  </Badge>
                  {profile.department && (
                    <div className="text-xs text-muted-foreground">
                      {profile.department}
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div>
                  <div className="font-medium">{profile.company?.name}</div>
                  {profile.company?.industry && (
                    <div className="text-xs text-muted-foreground">
                      {profile.company.industry}
                    </div>
                  )}
                  {profile.company?.employeeCountRange && (
                    <div className="text-xs text-muted-foreground">
                      {profile.company.employeeCountRange} employees
                    </div>
                  )}
                </div>
              </td>
              <td className="p-3">
                <div className="text-sm">
                  {[profile.city, profile.state, profile.country]
                    .filter(Boolean)
                    .join(", ") || "—"}
                </div>
              </td>
              <td className="p-3">
                <div className="space-y-1">
                  {profile.seniorityLevel && (
                    <Badge variant="outline" className="text-xs">
                      {profile.seniorityLevel.replace('-', ' ')}
                    </Badge>
                  )}
                  {profile.managementLevel && (
                    <div>
                      <Badge variant="secondary" className="text-xs">
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
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}