// src/components/profile-list/EmptyStateProfileList.tsx
import { Users, Plus, Search } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProfileListProps {
  onCreateClick?: () => void;
}

export function EmptyStateProfileList({ onCreateClick }: EmptyStateProfileListProps) {
  return (
    <div className="text-center py-12">
      <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
      <h3 className="text-xl font-semibold mb-2">No profile lists yet</h3>
      <p className="text-muted-foreground mb-6 max-w-md mx-auto">
        Create your first profile list to organize contacts for targeted campaigns. 
        Profile lists help you group potential customers by specific criteria using our enhanced profile data.
      </p>
      
      <div className="flex flex-col sm:flex-row gap-3 justify-center">
        <Button onClick={onCreateClick}>
          <Plus className="mr-2 h-4 w-4" />
          Create Your First List
        </Button>
        <Button asChild variant="outline">
          <Link href="/profiles/search">
            <Search className="mr-2 h-4 w-4" />
            Search Profiles
          </Link>
        </Button>
      </div>
      
      <div className="mt-8 p-4 bg-muted/50 rounded-lg max-w-lg mx-auto">
        <h4 className="font-medium mb-2">How Profile Lists Work</h4>
        <ul className="text-sm text-muted-foreground space-y-1">
          <li>• Search for profiles using advanced filters and company data</li>
          <li>• Enhanced profile data includes company context and role details</li>
          <li>• Save selected profiles as organized, reusable lists</li>
          <li>• Use lists for targeted email campaigns</li>
          <li>• Track campaign performance by profile list</li>
        </ul>
      </div>
    </div>
  );
}