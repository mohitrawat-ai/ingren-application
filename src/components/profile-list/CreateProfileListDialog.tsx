// src/components/profile-list/CreateProfileListDialog.tsx
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

import { saveProfileList } from "@/lib/actions/profile";
import { SaveProfileListParams } from "@/types/profile";

interface CreateProfileListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateProfileListDialog({
  open,
  onOpenChange,
}: CreateProfileListDialogProps) {
  const router = useRouter();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    try {
      setCreating(true);
      
      const listParams: SaveProfileListParams = {
        name: name.trim(),
        description: description.trim() || undefined,
        profiles: [],
        totalResults: 0,
      };
      
      const newList = await saveProfileList(listParams);
      
      toast.success("Profile list created successfully");      
      
      // Reset form
      setName("");
      setDescription("");
      
      onOpenChange(false);
      
      // Navigate to the new list
      router.push(`/profile-lists/${newList.id}`);
      
    } catch (error) {
      console.error("Error creating profile list:", error);
      toast.error("Failed to create profile list");
    } finally {
      setCreating(false);
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
          <DialogTitle>Create Profile List</DialogTitle>
          <DialogDescription>
            Create a new list to organize profiles for campaign targeting
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="profile-list-name">List Name *</Label>
            <Input
              id="profile-list-name"
              placeholder="e.g., C-Suite Tech Leaders, VP Engineering, Decision Makers"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="profile-list-description">Description</Label>
            <Textarea
              id="profile-list-description"
              placeholder="Optional description of this profile list..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
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