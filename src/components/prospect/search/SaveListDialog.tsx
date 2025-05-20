"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SaveListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  listName: string;
  onListNameChange: (name: string) => void;
  onSave: () => void;
  isSaving: boolean;
  selectedCount: number;
}

export function SaveListDialog({
  open,
  onOpenChange,
  listName,
  onListNameChange,
  onSave,
  isSaving,
  selectedCount
}: SaveListDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Save Prospect List</DialogTitle>
          <DialogDescription>
            Create a new list with {selectedCount} selected prospects
          </DialogDescription>
        </DialogHeader>

        <div className="py-4">
          <div className="space-y-2">
            <label htmlFor="list-name" className="text-sm font-medium">
              List Name
            </label>
            <Input
              id="list-name"
              placeholder="Enter a name for your list"
              value={listName}
              onChange={(e) => onListNameChange(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSave} disabled={isSaving || !listName.trim() || selectedCount === 0}>
            {isSaving ? "Saving..." : "Save List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}