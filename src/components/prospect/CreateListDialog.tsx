// src/components/prospect/CreateListDialog.tsx - With Zustand
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

import { saveProspectList } from "@/lib/actions/prospect";

export function CreateListDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [listName, setListName] = useState("");
  const [creating, setCreating] = useState(false);

  const handleCreate = async () => {
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    try {
      setCreating(true);
      
      // Create an empty list
      const newList = await saveProspectList({
        name: listName,
        contacts: [],
        totalResults: 0,
      });
      
      toast.success("Prospect list created successfully");
      onOpenChange(false);
      
      // Navigate to the new list
      router.push(`/prospects/${newList.id}`);
      
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create prospect list");
    } finally {
      setCreating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New List</DialogTitle>
          <DialogDescription>
            Create an empty prospect list that you can add contacts to later
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name</Label>
            <Input
              id="list-name"
              placeholder="Enter a name for your list"
              value={listName}
              onChange={(e) => setListName(e.target.value)}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={creating || !listName.trim()}>
            {creating ? "Creating..." : "Create List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}