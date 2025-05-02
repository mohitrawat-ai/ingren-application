"use client";

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { Trash2, Link, Plus, RefreshCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
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

import { getUrls, createUrl, deleteUrl } from "@/lib/actions/url";
import { z } from "zod";

const urlSchema = z.object({
  url: z.string().url("Please enter a valid URL"),
});

interface Url {
  id: string;
  url: string;
  summary: string | null;
  createdAt: string;
}

export default function UrlsPage() {
  const [urls, setUrls] = useState<Url[]>([]);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [urlError, setUrlError] = useState("");
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [urlToDelete, setUrlToDelete] = useState<Url | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    loadUrls();
  }, []);

  const loadUrls = async () => {
    try {
      setLoading(true);
      const data = await getUrls();
      setUrls(data);
    } catch (error) {
      toast.error("Failed to load URLs");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddUrl = async () => {
    setUrlError("");
    
    try {
      const result = urlSchema.safeParse({ url: newUrl });
      
      if (!result.success) {
        setUrlError(result.error.errors[0].message);
        return;
      }
      
      setSubmitting(true);
      const addedUrl = await createUrl(newUrl);
      setUrls([...urls, addedUrl]);
      setNewUrl("");
      setAddDialogOpen(false);
      toast.success("URL added successfully");
    } catch (error) {
      toast.error("Failed to add URL");
      console.error(error);
    } finally {
      setSubmitting(false);
    }
  };

  const openDeleteDialog = (url: Url) => {
    setUrlToDelete(url);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!urlToDelete) return;
    
    try {
      await deleteUrl(urlToDelete.id);
      setUrls(urls.filter(url => url.id !== urlToDelete.id));
      toast.success("URL deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete URL");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">URL Management</h1>
        <div className="flex gap-2">
          <Button onClick={loadUrls} variant="outline">
            <RefreshCcw className="mr-2 h-4 w-4" /> Refresh
          </Button>
          <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" /> Add URL
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New URL</DialogTitle>
                <DialogDescription>
                  Add a URL to analyze and extract insights from
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="url">URL</Label>
                  <Input
                    id="url"
                    placeholder="https://example.com"
                    value={newUrl}
                    onChange={(e) => setNewUrl(e.target.value)}
                  />
                  {urlError && (
                    <p className="text-sm text-destructive">{urlError}</p>
                  )}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button onClick={handleAddUrl} disabled={submitting}>
                  {submitting ? "Adding..." : "Add URL"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All URLs</CardTitle>
          <CardDescription>
            Manage your tracked URLs and their summaries
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : urls.length === 0 ? (
            <div className="text-center py-6">
              <Link className="mx-auto h-10 w-10 text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">No URLs yet</h3>
              <p className="text-muted-foreground mt-2">
                Add URLs to analyze and extract insights
              </p>
              <DialogTrigger asChild>
                <Button className="mt-4">
                  <Plus className="mr-2 h-4 w-4" /> Add URL
                </Button>
              </DialogTrigger>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>URL</TableHead>
                  <TableHead>Summary</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {urls.map((url) => (
                  <TableRow key={url.id}>
                    <TableCell>
                      <a 
                        href={url.url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-primary hover:underline flex items-center gap-1"
                      >
                        <Link className="h-4 w-4" />
                        {url.url}
                      </a>
                    </TableCell>
                    <TableCell>
                      {url.summary || <span className="text-muted-foreground italic">No summary yet</span>}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => openDeleteDialog(url)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
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
              This will permanently delete the URL. This action cannot be undone.
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