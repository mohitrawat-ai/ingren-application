// src/components/prospect-list/CreateProspectListDialog.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { useProspectListStore } from "@/stores/prospectListStore";

interface CreateProspectListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProspectListDialog({
  open,
  onOpenChange,
}: CreateProspectListDialogProps) {
  const router = useRouter();
  const { createList, creating, selectedProspects, clearSelectedProspects } = useProspectListStore();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    try {
      const newList = await createList({
        name: name.trim(),
        description: description.trim() || undefined,
        prospects: selectedProspects,
      });
      
      toast.success("Prospect list created successfully");
      
      // Reset form
      setName("");
      setDescription("");
      clearSelectedProspects();
      
      onOpenChange(false);
      
      // Navigate to the new list
      router.push(`/prospect-lists/${newList.id}`);
      
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create prospect list");
    }
  };

  const handleClose = () => {
    // Reset form when closing
    setName("");
    setDescription("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Create Prospect List</DialogTitle>
          <DialogDescription>
            Create a new list to organize prospects for campaign targeting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="prospect-list-name">List Name *</Label>
            <Input
              id="prospect-list-name"
              placeholder="e.g., Q1 Targets, VP Engineering, SaaS Decision Makers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="prospect-list-description">Description</Label>
            <Textarea
              id="prospect-list-description"
              placeholder="Optional description of this prospect list..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          
          {selectedProspects.length > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium">
                {selectedProspects.length} prospects selected
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                These prospects will be added to your new list
              </p>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleCreate} 
            disabled={creating || !name.trim()}
          >
            {creating ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

