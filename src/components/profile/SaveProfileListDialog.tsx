// src/components/profile/SaveProfileListDialog.tsx - Updated for new store structure

"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Save, Users, Loader2 } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

import { useSaveProfileList } from "@/hooks/useProfileQueries";
import { useProfileStore } from "@/stores/profileStore";

interface SaveProfileListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveProfileListDialog({ 
  open, 
  onOpenChange
}: SaveProfileListDialogProps) {
  const router = useRouter();
  
  // UPDATED: Use applied filters and query for context
  const { 
    selectedProfiles, 
    clearProfileSelections, 
    query,              // Applied query (what was actually searched)
    appliedFilters      // Applied filters (what was actually used for search)
  } = useProfileStore();
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const saveListMutation = useSaveProfileList();

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (selectedProfiles.length === 0) {
      toast.error("No profiles selected");
      return;
    }

    try {
      const newList = await saveListMutation.mutateAsync({
        name: formData.name.trim(),
        description: formData.description.trim() || undefined,
        profiles: selectedProfiles,
        totalResults: selectedProfiles.length,
        metadata: {
          searchFilters: appliedFilters,  // UPDATED: Use applied filters
          query                          // UPDATED: Use applied query
        },
      });

      toast.success(`Saved ${selectedProfiles.length} profiles to "${formData.name}"`);
      clearProfileSelections();
      onOpenChange(false);
      
      // Reset form
      setFormData({ name: "", description: "" });
      
      // Navigate to the new list
      router.push(`/profile-lists/${newList.id}`);
    } catch (error) {
      console.error("Error saving profile list:", error);
      toast.error("Failed to save profile list");
    }
  };

  const handleClose = () => {
    if (!saveListMutation.isPending) {
      onOpenChange(false);
      setFormData({ name: "", description: "" });
    }
  };

  // Generate default name based on search criteria
  const generateDefaultName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
    
    // Try to create a meaningful name based on applied filters
    const filterParts = [];
    
    if (appliedFilters.role?.jobTitles?.length) {
      filterParts.push(appliedFilters.role.jobTitles.slice(0, 2).join(", "));
    }
    
    if (appliedFilters.company?.industries?.length) {
      filterParts.push(appliedFilters.company.industries.slice(0, 2).join(", "));
    }
    
    if (appliedFilters.location?.states?.length) {
      filterParts.push(appliedFilters.location.states.slice(0, 2).join(", "));
    }
    
    if (query) {
      filterParts.push(`"${query}"`);
    }
    
    if (filterParts.length > 0) {
      return `${filterParts.join(" • ")} - ${dateStr}`;
    }
    
    return `Profile Search Results - ${dateStr}`;
  };

  // Auto-populate name if empty when dialog opens
  const handleOpenChange = (isOpen: boolean) => {
    if (isOpen && !formData.name) {
      setFormData(prev => ({
        ...prev,
        name: generateDefaultName()
      }));
    }
    onOpenChange(isOpen);
  };

  const getProfilePreview = () => {
    return selectedProfiles.slice(0, 5).map((profile) => ({
      id: profile.id,
      name: profile.fullName,
      title: profile.jobTitle,
      company: profile.company?.name,
      initials: `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase()
    }));
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Profile List
          </DialogTitle>
          <DialogDescription>
            Save the selected profiles as a reusable list for campaigns and future reference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Selection Summary */}
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm font-medium">
                  {selectedProfiles.length} profiles selected
                </span>
                <Badge variant="secondary">
                  {selectedProfiles.length}
                </Badge>
              </div>

              {/* Sample of selected profiles */}
              {selectedProfiles.length > 0 && (
                <div className="space-y-2">
                  <Label className="text-xs font-medium text-muted-foreground">Preview:</Label>
                  <div className="space-y-1">
                    {getProfilePreview().map((profile) => (
                      <div 
                        key={profile.id} 
                        className="flex items-center gap-2 text-sm p-2 bg-muted/30 rounded text-muted-foreground"
                      >
                        <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs font-medium">
                          {profile.initials}
                        </div>
                        <span className="flex-1 truncate">
                          <span className="font-medium text-foreground">{profile.name}</span>
                          {profile.title && (
                            <span className="text-muted-foreground"> • {profile.title}</span>
                          )}
                          {profile.company && (
                            <span className="text-muted-foreground"> @ {profile.company}</span>
                          )}
                        </span>
                      </div>
                    ))}
                    {selectedProfiles.length > 5 && (
                      <div className="text-xs text-muted-foreground text-center py-1">
                        ... and {selectedProfiles.length - 5} more profiles
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Form Fields */}
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="list-name">List Name *</Label>
              <Input
                id="list-name"
                placeholder="Enter list name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={saveListMutation.isPending}
              />
              <p className="text-xs text-muted-foreground">
                Choose a descriptive name that will help you identify this list later
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="list-description">Description (Optional)</Label>
              <Textarea
                id="list-description"
                placeholder="Add a description for this profile list..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={saveListMutation.isPending}
                rows={3}
                className="resize-none"
              />
              <p className="text-xs text-muted-foreground">
                Describe the purpose or criteria used for this list
              </p>
            </div>
          </div>

          {/* Search Context Info */}
          {(query || Object.keys(appliedFilters).length > 0) && (
            <Card className="bg-muted/30">
              <CardContent className="p-3">
                <Label className="text-xs font-medium text-muted-foreground">Search Context (saved for reference):</Label>
                <div className="mt-1 space-y-1">
                  {query && (
                    <div className="text-xs">
                      <span className="font-medium">Query:</span> {query}
                    </div>
                  )}
                  {appliedFilters.role?.jobTitles?.length && (
                    <div className="text-xs">
                      <span className="font-medium">Job Titles:</span> {appliedFilters.role.jobTitles.join(", ")}
                    </div>
                  )}
                  {appliedFilters.company?.industries?.length && (
                    <div className="text-xs">
                      <span className="font-medium">Industries:</span> {appliedFilters.company.industries.join(", ")}
                    </div>
                  )}
                  {appliedFilters.location?.states?.length && (
                    <div className="text-xs">
                      <span className="font-medium">Locations:</span> {
                        Array.isArray(appliedFilters.location.states) ?
                        appliedFilters.location.states.join(", ") : 
                        appliedFilters.location.states
                      }
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="gap-2">
          <Button variant="outline" onClick={handleClose} disabled={saveListMutation.isPending}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={saveListMutation.isPending || !formData.name.trim() || selectedProfiles.length === 0}
          >
            {saveListMutation.isPending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save List ({selectedProfiles.length})
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}