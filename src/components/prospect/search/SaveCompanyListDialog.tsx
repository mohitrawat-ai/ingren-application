// src/components/prospect/search/SaveCompanyListDialog.tsx
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
import { Badge } from "@/components/ui/badge";
import { Building } from "lucide-react";

import { useCompanyListStore } from "@/stores/companyListStore";

interface SaveCompanyListDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SaveCompanyListDialog({
  open,
  onOpenChange,
}: SaveCompanyListDialogProps) {
  const router = useRouter();
  const { 
    createList, 
    creating, 
    selectedCompanies, 
    clearSelectedCompanies 
  } = useCompanyListStore();
  
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  const handleSave = async () => {
    if (!name.trim()) {
      toast.error("Please enter a list name");
      return;
    }

    if (selectedCompanies.length === 0) {
      toast.error("No companies selected");
      return;
    }
    
    try {
      const newList = await createList({
        name: name.trim(),
        description: description.trim() || undefined,
        companies: selectedCompanies,
      });
      
      toast.success(`Company list created with ${selectedCompanies.length} companies`);
      
      // Reset form
      setName("");
      setDescription("");
      clearSelectedCompanies();
      
      onOpenChange(false);
      
      // Navigate to the new list
      router.push(`/company-lists/${newList.id}`);
      
    } catch (error) {
      console.error("Error creating company list:", error);
      toast.error("Failed to create company list");
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
          <DialogTitle>Save Company List</DialogTitle>
          <DialogDescription>
            Save {selectedCompanies.length} selected companies as a reusable list
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="company-list-name">List Name *</Label>
            <Input
              id="company-list-name"
              placeholder="e.g., Tech Startups Q1, Fortune 500 Targets"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={100}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company-list-description">Description</Label>
            <Textarea
              id="company-list-description"
              placeholder="Optional description for this company list..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              maxLength={500}
              rows={3}
            />
          </div>
          
          <div className="p-3 bg-muted rounded-md">
            <div className="flex items-center justify-between mb-2">
              <div>
                <p className="text-sm font-medium">
                  {selectedCompanies.length} companies selected
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  These companies will be saved to your new list
                </p>
              </div>
            </div>
            
            {/* Preview of selected companies */}
            <div className="space-y-2 mt-3">
              <p className="text-xs font-medium text-muted-foreground">Preview:</p>
              <div className="max-h-24 overflow-y-auto space-y-1">
                {selectedCompanies.slice(0, 5).map((company) => (
                  <div key={company.id} className="flex items-center gap-2 text-xs">
                    <Building className="h-3 w-3 text-muted-foreground" />
                    <span className="font-medium">{company.name}</span>
                    {company.industry && (
                      <Badge variant="outline" className="text-xs h-4 px-1">
                        {company.industry}
                      </Badge>
                    )}
                  </div>
                ))}
                {selectedCompanies.length > 5 && (
                  <p className="text-xs text-muted-foreground italic">
                    ... and {selectedCompanies.length - 5} more companies
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={creating || !name.trim() || selectedCompanies.length === 0}
          >
            {creating ? "Saving..." : "Save Company List"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}