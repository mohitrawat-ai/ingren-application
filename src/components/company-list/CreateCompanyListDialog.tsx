// src/components/company-list/CreateCompanyListDialog.tsx
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

import { createCompanyList } from "@/lib/actions/companyList";

interface CreateCompanyListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateCompanyListDialog({
  open,
  onOpenChange,
}: CreateCompanyListDialogProps) {
  const router = useRouter();
  const [creating, setCreating ] = useState(false);
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleCreate = async () => {
    if (!name.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    try {
      setCreating(true);
      const newList = await createCompanyList({
        name: name.trim(),
        description: description.trim() || undefined,
        companies: [],
      });
      
      toast.success("Company list created successfully");      
      // Reset form
      setName("");
      setDescription("");
      
      onOpenChange(false);
      
      // Navigate to the new list
      router.push(`/company-lists/${newList.id}`);
      
    } catch (error) {
      console.error("Error creating list:", error);
      toast.error("Failed to create company list");
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
          <DialogTitle>Create Company List</DialogTitle>
          <DialogDescription>
            Create a new list to organize companies for targeted prospect searches
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="list-name">List Name *</Label>
            <Input
              id="list-name"
              placeholder="e.g., Tech Startups, Fortune 500, SaaS Companies"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="list-description">Description</Label>
            <Textarea
              id="list-description"
              placeholder="Optional description of this company list..."
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