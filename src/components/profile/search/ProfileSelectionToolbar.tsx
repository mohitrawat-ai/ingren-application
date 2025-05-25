// src/components/profile/search/ProfileSelectionToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  UserCheck, 
  Save,
  Trash2
} from "lucide-react";
import { useProfileStore } from "@/stores/profileStore";

interface ProfileSelectionToolbarProps {
  onSave: () => void;
}

export function ProfileSelectionToolbar({ onSave }: ProfileSelectionToolbarProps) {
  const {
    selectedProfiles,
    clearProfileSelections,
  } = useProfileStore();

  // Don't show toolbar if no selections
  if (selectedProfiles.length === 0) {
    return null;
  }

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <UserCheck className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {selectedProfiles.length} profiles selected
              </span>
              <Badge variant="secondary" className="text-xs">
                Across all pages
              </Badge>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={onSave}
              size="sm"
              className="h-8"
            >
              <Save className="mr-1 h-3 w-3" />
              Save as List
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={clearProfileSelections}
              className="h-8 text-destructive hover:text-destructive"
            >
              <Trash2 className="mr-1 h-3 w-3" />
              Clear All
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}