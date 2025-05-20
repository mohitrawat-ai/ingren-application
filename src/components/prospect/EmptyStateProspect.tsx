// src/components/prospect/EmptyStateProspect.tsx
import { Building, Upload, Search, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface EmptyStateProspectProps {
  title?: string;
  description?: string;
  icon?: "building" | "search" | "upload" | "user";
  showActions?: boolean;
}

export function EmptyStateProspect({
  title = "No prospects yet",
  description = "Create your first prospect list to start organizing contacts",
  icon = "user",
  showActions = true,
}: EmptyStateProspectProps) {
  const getIcon = () => {
    switch (icon) {
      case "building":
        return <Building className="h-12 w-12 text-muted-foreground mx-auto" />;
      case "search":
        return <Search className="h-12 w-12 text-muted-foreground mx-auto" />;
      case "upload":
        return <Upload className="h-12 w-12 text-muted-foreground mx-auto" />;
      default:
        return <Building className="h-12 w-12 text-muted-foreground mx-auto" />;
    }
  };

  return (
    <div className="text-center py-6">
      {getIcon()}
      <h3 className="text-lg font-medium mt-4">{title}</h3>
      <p className="text-muted-foreground mt-2">{description}</p>
      
      {showActions && (
        <div className="flex gap-4 justify-center mt-6">
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
          <Button asChild>
            <Link href="/prospects/new">
              <Plus className="mr-2 h-4 w-4" /> Create List
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}