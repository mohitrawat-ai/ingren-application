// src/app/(dashboard)/prospects/page.tsx - With Zustand
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, UploadCloud, Search, Trash2, Edit } from "lucide-react";

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

import { CreateListDialog } from "@/components/prospect/CreateListDialog";
import { EmptyStateProspect } from "@/components/prospect/EmptyStateProspect";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our store
import { useProspectListStore } from "@/stores/prospectListStore";

export default function ProspectsPage() {
  const { 
    lists, 
    loadingLists, 
    fetchLists, 
    deleteList 
  } = useProspectListStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<number | null>(null);

  useEffect(() => {
    fetchLists().catch(error => {
      console.error("Error fetching lists:", error);
      toast.error("Failed to load prospect lists");
    });
  }, [fetchLists]);

  const handleDelete = async () => {
    if (!listToDelete) return;
    
    try {
      await deleteList(listToDelete);
      toast.success("Prospect list deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting list:", error);
      toast.error("Failed to delete prospect list");
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
          <h1 className="text-3xl font-bold">Prospects</h1>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href="/prospects/search">
                <Search className="mr-2 h-4 w-4" />
                Search Prospects
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/prospects/import">
                <UploadCloud className="mr-2 h-4 w-4" />
                Import CSV
              </Link>
            </Button>
            <Button onClick={() => setCreateDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" /> Create List
            </Button>
          </div>
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle>Prospect Lists</CardTitle>
            <CardDescription>
              Manage your lists of prospects for campaigns
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
              <EmptyStateProspect />
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Contacts</TableHead>
                    <TableHead>Source</TableHead>
                    <TableHead>Created Date</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {lists.map((list) => (
                    <TableRow key={list.id}>
                      <TableCell className="font-medium">
                        <Link href={`/prospects/${list.id}`} className="hover:underline">
                          {list.name}
                        </Link>
                      </TableCell>
                      {/* <TableCell>{list.totalResults}</TableCell>
                      <TableCell>
                        {list.csvFileName ? (
                          <Badge variant="outline">CSV Import</Badge>
                        ) : (
                          <Badge variant="outline">API Search</Badge>
                        )}
                      </TableCell> */}
                      <TableCell>
                        {new Date(list.createdAt).toLocaleDateString()}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button asChild variant="ghost" size="icon">
                            <Link href={`/prospects/${list.id}`}>
                              <Edit className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => openDeleteDialog(list.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
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
                This will permanently delete the prospect list. 
                This action cannot be undone.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={handleDelete}
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
        
        <CreateListDialog
          open={createDialogOpen}
          onOpenChange={setCreateDialogOpen}
        />
      </div>
    </ErrorBoundary>
  );
}