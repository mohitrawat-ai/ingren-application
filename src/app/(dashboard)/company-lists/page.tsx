// src/app/(dashboard)/company-lists/page.tsx
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, Building, Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { CreateCompanyListDialog } from "@/components/company-list/CreateCompanyListDialog";
import { EmptyStateCompanyList } from "@/components/company-list/EmptyStateCompanyList";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our store
import { useCompanyListStore } from "@/stores/companyListStore";

export default function CompanyListsPage() {
  const { 
    lists, 
    loadingLists, 
    fetchLists, 
    deleteList,
    deleting
  } = useCompanyListStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchLists().catch(error => {
      console.error("Error fetching company lists:", error);
      toast.error("Failed to load company lists");
    });
  }, [fetchLists]);

  const handleDelete = async () => {
    if (!listToDelete) return;
    
    try {
      await deleteList(listToDelete);
      toast.success("Company list deleted successfully");
      setDeleteDialogOpen(false);
      setListToDelete(null);
    } catch (error) {
      console.error("Error deleting list:", error);
      if(error instanceof Error) {
          toast.error(error.message || "Failed to delete company list");
      }
    }
  };

  const openDeleteDialog = (listId: number) => {
    setListToDelete(listId);
    setDeleteDialogOpen(true);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Company Lists</h1>
            <p className="text-muted-foreground">
              Organize companies into reusable lists for targeted prospect searches
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/prospects/search">
                <Search className="mr-2 h-4 w-4" />
                Search Companies
              </Link>
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Company Lists</CardTitle>
            <CardDescription>
              Manage your saved company lists for prospect targeting
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loadingLists ? (
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="flex items-center space-x-4">
                    <Skeleton className="h-12 w-full" />
                  </div>
                ))}
              </div>
            ) : lists.length === 0 ? (
              <EmptyStateCompanyList onCreateClick={() => setCreateDialogOpen(true)} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Companies</TableHead>
                    <TableHead>Usage</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell>
                        <div>
                          <Link 
                            href={`/company-lists/${list.id}`} 
                            className="font-medium hover:underline"
                          >
                            {list.name}
                          </Link>
                          {list.description && (
                            <p className="text-sm text-muted-foreground mt-1">
                              {list.description}
                            </p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                          {list.companyCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {list.usedInCampaigns ? (
                            <Badge variant="secondary">
                              Used in {list.campaignCount} campaigns
                            </Badge>
                          ) : (
                            <Badge variant="outline">Not used yet</Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        {new Date(list.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                              •••
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem asChild>
                              <Link href={`/company-lists/${list.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/company-lists/${list.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit List
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/prospects/search?companyList=${list.id}`}>
                                <Search className="mr-2 h-4 w-4" />
                                Find Prospects
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteDialog(list.id)}
                              disabled={list.usedInCampaigns}
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete List
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the company list. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
                disabled={deleting}
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <CreateCompanyListDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
}