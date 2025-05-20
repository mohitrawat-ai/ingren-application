"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Plus, UploadCloud, Search, Trash2, Edit, Users } from "lucide-react";

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

import { getProspectLists, deleteProspectList } from "@/lib/actions/prospect";
import { AudienceType } from "@/lib/schema";

export default function ProspectsPage() {
  const [lists, setLists] = useState<AudienceType[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [listToDelete, setListToDelete] = useState<AudienceType | null>(null);

  useEffect(() => {
    const loadProspectLists = async () => {
      try {
        setLoading(true);
        const data = await getProspectLists();
        setLists(data);
      } catch (error) {
        toast.error("Failed to load prospect lists");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProspectLists();
  }, []);

  const handleDelete = async () => {
    if (!listToDelete) return;
    
    try {
      await deleteProspectList(listToDelete.id);
      setLists(lists.filter(list => list.id !== listToDelete.id));
      toast.success("Prospect list deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete prospect list");
      console.error(error);
    }
  };

  const openDeleteDialog = (list: AudienceType) => {
    setListToDelete(list);
    setDeleteDialogOpen(true);
  };

  return (
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
          <Button asChild>
            <Link href="/prospects/new">
              <Plus className="mr-2 h-4 w-4" /> Create List
            </Link>
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
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : lists.length === 0 ? (
            <div className="text-center py-6">
              <Users className="h-12 w-12 text-muted-foreground mx-auto" />
              <h3 className="text-lg font-medium mt-4">No prospect lists yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first prospect list to start organizing contacts
              </p>
              <div className="flex gap-4 justify-center mt-6">
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
                <Button asChild>
                  <Link href="/prospects/new">
                    <Plus className="mr-2 h-4 w-4" /> Create List
                  </Link>
                </Button>
              </div>
            </div>
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
                    <TableCell>{list.totalResults}</TableCell>
                    <TableCell>
                      {list.csvFileName ? (
                        <Badge variant="outline">CSV Import</Badge>
                      ) : (
                        <Badge variant="outline">API Search</Badge>
                      )}
                    </TableCell>
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
                          onClick={() => openDeleteDialog(list)}
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
              This will permanently delete the prospect list &quot;{listToDelete?.name}&quot;. 
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
    </div>
  );
}