// src/components/prospect/search/SelectedProspectsView.tsx
"use client";

import { useState, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DataTable } from "@/components/ui/data-table";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Filter,
  MoreHorizontal,
  Building,
  MapPin,
  Trash2,
  ArrowUpDown
} from "lucide-react";

import { useProspectSearchStore } from "@/stores/prospectStore";
import { Prospect } from "@/types";
import { ColumnDef } from "@tanstack/react-table";

export function SelectedProspectsView() {
  const { selectedProspects, toggleProspectSelection, bulkDeselectProspects } = useProspectSearchStore();
  const [filterText, setFilterText] = useState("");
  const [selectedForRemoval, setSelectedForRemoval] = useState<string[]>([]);

  // Filter selected prospects based on search text
  const filteredProspects = useMemo(() => {
    if (!filterText) return selectedProspects;
    
    const lowerFilter = filterText.toLowerCase();
    return selectedProspects.filter(prospect =>
      prospect.firstName?.toLowerCase().includes(lowerFilter) ||
      prospect.lastName?.toLowerCase().includes(lowerFilter) ||
      prospect.title?.toLowerCase().includes(lowerFilter) ||
      prospect.companyName?.toLowerCase().includes(lowerFilter) ||
      prospect.email?.toLowerCase().includes(lowerFilter)
    );
  }, [selectedProspects, filterText]);

  // Handle individual removal selection
  const toggleRemovalSelection = useCallback((prospectId: string) => {
    setSelectedForRemoval(prev => 
      prev.includes(prospectId)
        ? prev.filter(id => id !== prospectId)
        : [...prev, prospectId]
    );
  }, []);

  // Handle select all for removal
  const areAllSelectedForRemoval = useMemo(() => {
    if (filteredProspects.length === 0) return false;
    return filteredProspects.every(prospect => selectedForRemoval.includes(prospect.id));
  }, [filteredProspects, selectedForRemoval]);

  const areSomeSelectedForRemoval = useMemo(() => {
    if (filteredProspects.length === 0) return false;
    const selectedCount = filteredProspects.filter(prospect => 
      selectedForRemoval.includes(prospect.id)
    ).length;
    return selectedCount > 0 && selectedCount < filteredProspects.length;
  }, [filteredProspects, selectedForRemoval]);

  const toggleAllForRemoval = useCallback(() => {
    if (areAllSelectedForRemoval) {
      // Deselect all visible prospects for removal
      const visibleIds = filteredProspects.map(p => p.id);
      setSelectedForRemoval(prev => prev.filter(id => !visibleIds.includes(id)));
    } else {
      // Select all visible prospects for removal
      const visibleIds = filteredProspects.map(p => p.id);
      setSelectedForRemoval(prev => {
        const newSet = new Set([...prev, ...visibleIds]);
        return Array.from(newSet);
      });
    }
  }, [areAllSelectedForRemoval, filteredProspects]);

  // Handle bulk removal
  const handleBulkRemoval = useCallback(() => {
    if (selectedForRemoval.length > 0) {
      bulkDeselectProspects(selectedForRemoval);
      setSelectedForRemoval([]);
    }
  }, [selectedForRemoval, bulkDeselectProspects]);

  // Column definitions for selected prospects
  const columns: ColumnDef<Prospect>[] = useMemo(() => [
    {
      id: "select",
      header: () => (
        <Checkbox
          checked={areAllSelectedForRemoval ? true : areSomeSelectedForRemoval ? "indeterminate" : false}
          onCheckedChange={toggleAllForRemoval}
          aria-label="Select all for removal"
        />
      ),
      cell: ({ row }) => (
        <Checkbox
          checked={selectedForRemoval.includes(row.original.id)}
          onCheckedChange={() => toggleRemovalSelection(row.original.id)}
          aria-label="Select for removal"
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
      accessorKey: "title",
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      ),
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.getValue("title")}
        </Badge>
      ),
    },
    {
      accessorKey: "companyName",
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
      cell: ({ row }) => (
        <div className="flex items-center">
          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="font-medium">{row.getValue("companyName")}</span>
        </div>
      ),
    },
    {
      accessorKey: "country",
      header: "Location",
      cell: ({ row }) => {
        const country = row.getValue("country") as string;
        return country ? (
          <div className="flex items-center">
            <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
            <span className="text-sm">{country}</span>
          </div>
        ) : (
          <span className="text-muted-foreground text-sm">N/A</span>
        );
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const prospect = row.original;

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
                onClick={() => navigator.clipboard.writeText(`${prospect.firstName} ${prospect.lastName}`)}
              >
                Copy name
              </DropdownMenuItem>
              {prospect.email && (
                <DropdownMenuItem
                  onClick={() => navigator.clipboard.writeText(prospect.email)}
                >
                  Copy email
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => toggleProspectSelection(prospect)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Remove from selection
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ], [
    selectedForRemoval,
    toggleRemovalSelection,
    areAllSelectedForRemoval,
    areSomeSelectedForRemoval,
    toggleAllForRemoval,
    toggleProspectSelection
  ]);

  if (selectedProspects.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3 mb-4">
          <Building className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-medium mb-2">No prospects selected</h3>
        <p className="text-muted-foreground mb-4">
          Select prospects from the search results to see them here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filter and bulk actions */}
      <div className="flex items-center justify-between">
        <div className="relative w-64">
          <Filter className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Filter selected prospects..."
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
            className="pl-9"
          />
        </div>
        
        {selectedForRemoval.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleBulkRemoval}
          >
            <Trash2 className="mr-2 h-4 w-4" />
            Remove Selected ({selectedForRemoval.length})
          </Button>
        )}
      </div>

      {/* Results summary */}
      <div className="text-sm text-muted-foreground">
        Showing {filteredProspects.length} of {selectedProspects.length} selected prospects
      </div>

      {/* Data table */}
      <DataTable
        columns={columns}
        data={filteredProspects}
        searchKey="firstName"
      />
    </div>
  );
}