// src/app/(dashboard)/prospect-lists/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, Search, Trash2, Edit, Users, Eye, MailPlus, Upload } from "lucide-react";

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

import { CreateProspectListDialog } from "@/components/prospect-list/CreateProspectListDialog";
import { EmptyStateProspectList } from "@/components/prospect-list/EmptyStateProspectList";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";


// Import our actions
import { deleteProspectList, getProspectLists } from "@/lib/actions/prospectList";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export default function ProspectListsPage() {
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);
  const [listToDeleteName, setListToDeleteName] = useState<string>("");

  const {data: lists = [], error, isLoading : loadingLists} = useQuery({
    queryKey: ['prospect-lists'],
    queryFn: () => getProspectLists(),
  });

  const queryClient = useQueryClient();

  if(error) {
    console.error("Error fetching prospect lists:", error);
    toast.error("Failed to load prospect lists");
  }

  const {mutateAsync: handleDelete, isPending: deleting} = useMutation({
    mutationFn: (listId: number) => deleteProspectList(listId),
    onSuccess: () => {
      toast.success("Prospect list deleted successfully");
      setDeleteDialogOpen(false);
      setListToDelete(null);
      setListToDeleteName("");
      queryClient.invalidateQueries({ queryKey: ['prospect-lists'] });

    },
    onError: (error) => {
      console.error("Error deleting prospect list:", error);
      if(error instanceof Error) {
        toast.error(error.message || "Failed to delete prospect list");
      }
    },
  });

  const openDeleteDialog = (listId: number, listName: string) => {
    setListToDelete(listId);
    setListToDeleteName(listName);
    setDeleteDialogOpen(true);
  };

  const getUsageBadge = (list: { usedInCampaigns: boolean; campaignCount: number }) => {
    if (list.usedInCampaigns) {
      return (
        <Badge variant="secondary">
          Used in {list.campaignCount} campaign{list.campaignCount !== 1 ? 's' : ''}
        </Badge>
      );
    }
    return <Badge variant="outline">Not used yet</Badge>;
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Prospect Lists</h1>
            <p className="text-muted-foreground">
              Organize prospects into targeted lists for your campaigns
            </p>
          </div>
          <div className="flex gap-2">
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
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Create List
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Your Prospect Lists</CardTitle>
            <CardDescription>
              Manage your saved prospect lists for campaign targeting
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
              <EmptyStateProspectList onCreateClick={() => setCreateDialogOpen(true)} />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Prospects</TableHead>
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
                            href={`/prospect-lists/${list.id}`} 
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
                          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                          {list.prospectCount}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getUsageBadge(list)}
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
                              <Link href={`/prospect-lists/${list.id}`}>
                                <Eye className="mr-2 h-4 w-4" />
                                View Details
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/prospect-lists/${list.id}/edit`}>
                                <Edit className="mr-2 h-4 w-4" />
                                Edit List
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/campaigns/new?prospectList=${list.id}`}>
                                <MailPlus className="mr-2 h-4 w-4" />
                                Create Campaign
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <Link href={`/prospects/search?addToList=${list.id}`}>
                                <Plus className="mr-2 h-4 w-4" />
                                Add Prospects
                              </Link>
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-destructive focus:text-destructive"
                              onClick={() => openDeleteDialog(list.id, list.name)}
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
                This will permanently delete the prospect list &quot;{listToDeleteName}&quot;. 
                This action cannot be undone.
                {lists.find(l => l.id === listToDelete)?.usedInCampaigns && (
                  <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-destructive text-sm font-medium">
                      This list is used in campaigns and cannot be deleted.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDelete(listToDelete || -1)}
                disabled={deleting || lists.find(l => l.id === listToDelete)?.usedInCampaigns}
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <CreateProspectListDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
}