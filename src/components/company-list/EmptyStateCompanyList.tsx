// src/components/company-list/EmptyStateCompanyList.tsx
import { Building, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateCompanyListProps {
  onCreateClick?: () => void;
}

export function EmptyStateCompanyList({ onCreateClick }: EmptyStateCompanyListProps) {
  return (
    <div className="text-center py-12">
      <Building className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No company lists yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create your first company list to organize companies and streamline your prospect searches. 
        Company lists help you scope your searches to specific groups of companies.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First List
        </Button>
        <Button asChild variant="outline">
          <Link href="/prospects/search">
            <Search className="mr-2 h-4 w-4" />
            Search Companies
          </Link>
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-lg mx-auto">
        <h4 className="font-medium mb-2">How Company Lists Work</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Search and select companies from Ingren database</li>
          <li>• Save them as organized, reusable lists</li>
          <li>• Use lists to scope prospect searches to specific companies</li>
          <li>• Track which lists are used in your campaigns</li>
        </ul>
      </div>
    </div>
  );
}