// src/components/profile/search/ProfileDataTable.tsx
"use client";

import { useMemo, useCallback } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { ArrowUpDown, MoreHorizontal, Building, MapPin, Briefcase, Mail } from "lucide-react";

import { DataTable } from "@/components/ui/data-table";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

import { useProfileStore } from "@/stores/profileStore";
import { Profile } from "@/types/profile";

export function ProfileDataTable() {
  const {
    profiles,
    loadingProfiles,
    selectedProfiles,
    toggleProfileSelection,
    bulkSelectProfiles,
    profilePagination,
    searchProfiles,
  } = useProfileStore();

  // Helper function to check if all visible profiles are selected
  const areAllProfilesSelected = useMemo(() => {
    if (profiles.length === 0) return false;
    return profiles.every(profile => 
      selectedProfiles.some(selected => selected.id === profile.id)
    );
  }, [profiles, selectedProfiles]);

  // Helper function to check if some (but not all) profiles are selected
  const areSomeProfilesSelected = useMemo(() => {
    if (profiles.length === 0) return false;
    const selectedCount = profiles.filter(profile => 
      selectedProfiles.some(selected => selected.id === profile.id)
    ).length;
    return selectedCount > 0 && selectedCount < profiles.length;
  }, [profiles, selectedProfiles]);

  // Function to toggle all visible profiles
  const toggleAllProfiles = useCallback(() => {
    if (areAllProfilesSelected) {
      // Deselect all visible profiles
      profiles.forEach(profile => {
        if (selectedProfiles.some(selected => selected.id === profile.id)) {
          toggleProfileSelection(profile);
        }
      });
    } else {
      // Select all visible profiles that aren't already selected
      const profilesToSelect = profiles.filter(profile => 
        !selectedProfiles.some(selected => selected.id === profile.id)
      );
      bulkSelectProfiles(profilesToSelect);
    }
  }, [areAllProfilesSelected, profiles, selectedProfiles, toggleProfileSelection, bulkSelectProfiles]);

  // Profile columns
  const profileColumns: ColumnDef<Profile>[] = useMemo(() => [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={areAllProfilesSelected ? true : areSomeProfilesSelected ? "indeterminate" : false}
          onCheckedChange={toggleAllProfiles}
          aria-label="Select all"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedProfiles.some(p => p.id === row.original.id)}
          onCheckedChange={() => toggleProfileSelection(row.original)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "avatar",
      header: "",
      cell: ({ row }) => {
        const firstName = row.original.firstName;
        const lastName = row.original.lastName;
        const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase();

        return (
          <Avatar className="h-8 w-8">
            <AvatarFallback className="text-xs">
              {initials}
            </AvatarFallback>
          </Avatar>
        );
      },
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "firstName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("firstName")}</div>,
    },
    {
      accessorKey: "lastName",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => <div className="font-medium">{row.getValue("lastName")}</div>,
    },
    {
      accessorKey: "jobTitle",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Job Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <div className="flex items-center">
          <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
          <Badge variant="secondary">
            {row.getValue("jobTitle")}
          </Badge>
        </div>
      ),
    },
    {
      accessorKey: "department",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const department = row.getValue("department") as string;
        return department ? (
          <Badge variant="outline">{department}</Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        );
      },
    },
    {
      accessorKey: "company",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => {
        const profile = row.original;
        return (
          <div className="flex items-center">
            <Building className="h-4 w-4 mr-2 text-muted-foreground" />
            <div>
              <div className="font-medium">{profile.company?.name}</div>
              {profile.company?.industry && (
                <div className="text-xs text-muted-foreground">{profile.company.industry}</div>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "seniorityLevel",
      header: "Seniority",
      cell: ({ row }) => {
        const seniority = row.getValue("seniorityLevel") as string;
        return seniority ? (
          <Badge variant="outline" className="capitalize">
            {seniority.replace('-', ' ')}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        );
      },
    },
    {
      accessorKey: "managementLevel",
      header: "Management",
      cell: ({ row }) => {
        const management = row.getValue("managementLevel") as string;
        const getVariant = (level: string) => {
          switch (level) {
            case 'executive': return 'default';
            case 'manager': return 'secondary';
            default: return 'outline';
          }
        };
        
        return management ? (
          <Badge variant={getVariant(management)} className="capitalize">
            {management.replace('_', ' ')}
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        );
      },
    },
    {
      accessorKey: "location",
      header: "Location",
      cell: ({ row }) => {
        const profile = row.original;
        const location = [profile.city, profile.state, profile.country]
          .filter(Boolean)
          .join(", ");
        
        return location ? (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{location}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        );
      },
    },
    {
      accessorKey: "email",
      header: "Contact",
      cell: ({ row }) => {
        const profile = row.original;
        return profile.email ? (
          <div className="flex items-center">
            <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{profile.email}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">No email</span>
        );
      },
    },
    {
      accessorKey: "isDecisionMaker",
      header: "Decision Maker",
      cell: ({ row }) => {
        const isDecisionMaker = row.getValue("isDecisionMaker") as boolean;
        return isDecisionMaker ? (
          <Badge variant="default" className="text-xs">
            ✓ Decision Maker
          </Badge>
        ) : (
          <span className="text-muted-foreground text-sm">—</span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const profile = row.original;

        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(profile.fullName)}
              >
                Copy name
              </DropdownMenuItem>
              {profile.email && (
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(profile.email || '')}
                >
                  Copy email
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(profile.company?.name || '')}
              >
                Copy company name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View full profile
              </DropdownMenuItem>
              <DropdownMenuItem>
                Add to sequence
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [selectedProfiles, toggleProfileSelection, areAllProfilesSelected, areSomeProfilesSelected, toggleAllProfiles]);

  if (loadingProfiles) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded mb-2"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="p-4">
        <DataTable
          columns={profileColumns}
          data={profiles}
          searchKey="firstName"
          pagination={profilePagination ?? undefined}
          onPageChange={(page: number) => searchProfiles(page)}
        />
      </div>
    </div>
  );
}