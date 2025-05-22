// src/components/prospect-list/EmptyStateProspectList.tsx
import { Users, Plus, Search, Upload } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProspectListProps {
  onCreateClick?: () => void;
}

export function EmptyStateProspectList({ onCreateClick }: EmptyStateProspectListProps) {
  return (
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No prospect lists yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create your first prospect list to organize contacts for targeted campaigns. 
        Prospect lists help you group potential customers by specific criteria.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First List
        </Button>
        <Button asChild variant="outline">
          <Link href="/prospects/search">
            <Search className="mr-2 h-4 w-4" />
            Search Prospects
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link href="/prospects/import">
            <Upload className="mr-2 h-4 w-4" />
            Import CSV
          </Link>
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-lg mx-auto">
        <h4 className="font-medium mb-2">How Prospect Lists Work</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Search for prospects using company filters or lists</li>
          <li>• Save selected prospects as organized, reusable lists</li>
          <li>• Use lists for targeted email campaigns</li>
          <li>• Track campaign performance by list</li>
        </ul>
      </div>
    </div>
  );
}