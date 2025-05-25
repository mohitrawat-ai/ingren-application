// src/components/profile/SaveProfileListDialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Save, Users } from "lucide-react";
import { toast } from "sonner";

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

import { Profile } from "@/types/profile";
import { createProfileList } from "@/lib/actions/profile";
import { useProfileStore } from "@/stores/profileStore";

interface SaveProfileListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedProfiles: Profile[];
}

export function SaveProfileListDialog({ 
  open, 
  onOpenChange, 
  selectedProfiles 
}: SaveProfileListDialogProps) {
  const router = useRouter();
  const { clearProfileSelections } = useProfileStore();
  
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (selectedProfiles.length === 0) {
      toast.error("No profiles selected");
      return;
    }

    setSaving(true);
    
    try {
      const newList = await createProfileList({
        name: formData.name.trim(),
        description: formData.description.trim(),
        profiles: selectedProfiles,
        metadata: {
          source: 'search',
          createdAt: new Date().toISOString(),
          profileCount: selectedProfiles.length,
        },
      });

      toast.success(`Saved ${selectedProfiles.length} profiles to "${formData.name}"`);
      clearProfileSelections();
      onOpenChange(false);
      
      // Reset form
      setFormData({ name: "", description: "" });
      
      // Navigate to the new list
      router.push(`/profiles/lists/${newList.id}`);
    } catch (error) {
      console.error("Error saving profile list:", error);
      toast.error("Failed to save profile list");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    if (!saving) {
      onOpenChange(false);
      setFormData({ name: "", description: "" });
    }
  };

  // Generate default name based on search criteria or selection
  const generateDefaultName = () => {
    const now = new Date();
    const dateStr = now.toLocaleDateString();
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

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Save Profile List
          </DialogTitle>
          <DialogDescription>
            Save the selected profiles as a reusable list for campaigns and future reference.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          {/* Selection Summary */}
          <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
            <Users className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm">
              <strong>{selectedProfiles.length}</strong> profiles selected
            </span>
            <Badge variant="secondary" className="ml-auto">
              {selectedProfiles.length}
            </Badge>
          </div>

          {/* Sample of selected profiles */}
          {selectedProfiles.length > 0 && (
            <div className="space-y-2">
              <Label className="text-sm font-medium">Selected Profiles Preview</Label>
              <div className="max-h-32 overflow-y-auto space-y-1">
                {selectedProfiles.slice(0, 5).map((profile) => (
                  <div 
                    key={profile.id} 
                    className="flex items-center gap-2 text-sm p-2 bg-muted/50 rounded"
                  >
                    <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center text-xs">
                      {profile.firstName?.[0]}{profile.lastName?.[0]}
                    </div>
                    <span className="flex-1 truncate">
                      {profile.fullName} - {profile.jobTitle}
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

          {/* Form Fields */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="list-name">List Name *</Label>
              <Input
                id="list-name"
                placeholder="Enter list name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                disabled={saving}
              />
            </div>

            <div>
              <Label htmlFor="list-description">Description (Optional)</Label>
              <Textarea
                id="list-description"
                placeholder="Add a description for this profile list..."
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                disabled={saving}
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving || !formData.name.trim()}>
            {saving ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Saving...
              </>
            ) : (
              <>
                <Save className="mr-2 h-4 w-4" />
                Save List
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}