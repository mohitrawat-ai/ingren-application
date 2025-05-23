// src/components/prospect/search/SelectionToolbar.tsx
"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { 
  Users, 
  Eye, 
  Search, 
  Save,
  Building,
  Trash2
} from "lucide-react";
import { useProspectSearchStore } from "@/stores/prospectStore";

interface SelectionToolbarProps {
  onSave: () => void;
  type: 'companies' | 'prospects';
}

export function SelectionToolbar({ onSave, type }: SelectionToolbarProps) {
  const {
    selectedCompanies,
    selectedProspects,
    viewMode,
    setViewMode,
    clearCompanySelections,
    clearProspectSelections,
  } = useProspectSearchStore();

  const isCompanies = type === 'companies';
  const selectedCount = isCompanies ? selectedCompanies.length : selectedProspects.length;
  const clearSelections = isCompanies ? clearCompanySelections : clearProspectSelections;
  
  // Don't show toolbar if no selections
  if (selectedCount === 0) {
    return null;
  }

  const Icon = isCompanies ? Building : Users;
  const itemName = isCompanies ? 'companies' : 'prospects';

  return (
    <Card className="border-primary/20 bg-primary/5">
      <CardContent className="py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Icon className="h-4 w-4 text-primary" />
              <span className="font-medium text-sm">
                {selectedCount} {itemName} selected
              </span>
              <Badge variant="secondary" className="text-xs">
                Across all pages
              </Badge>
            </div>
            
            {!isCompanies && (
              <div className="flex items-center gap-2">
                <Button
                  variant={viewMode === 'search' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('search')}
                  className="h-8"
                >
                  <Search className="mr-1 h-3 w-3" />
                  Search Results
                </Button>
                <Button
                  variant={viewMode === 'selected' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('selected')}
                  className="h-8"
                >
                  <Eye className="mr-1 h-3 w-3" />
                  View Selected ({selectedCount})
                </Button>
              </div>
            )}
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
              onClick={clearSelections}
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