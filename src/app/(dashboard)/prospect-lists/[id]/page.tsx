// src/app/(dashboard)/prospect-lists/[id]/page.tsx
"use client";

import { useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Users, 
  Plus,
  Building,
  Filter,
  MailPlus,
  Download
} from "lucide-react";

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
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProspectList, getProspectList } from "@/lib/actions/prospectList";

interface ProspectListDetailProps {
  params: Promise<{ id: string }>
}

export default function ProspectListDetail({ params }: ProspectListDetailProps) {
  const router = useRouter();
  const { id } = use(params);
  const numericId = Number(id);
  const queryClient = useQueryClient();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const itemsPerPage = 10;

  const {mutateAsync: handleDelete, isPending: deleting} = useMutation({
    mutationFn: () => deleteProspectList(numericId),
    onSuccess: () => {
      toast.success("Prospect list deleted successfully");
      router.push("/prospect-lists");
      queryClient.invalidateQueries({ queryKey: ['prospectList', numericId] });
    },
    onError: (error) => {
      console.error("Error deleting prospect list:", error);
      if(error instanceof Error) {
        toast.error(error.message || "Failed to delete prospect list");
      }
    }
  });

  const {data: currentList, error, isLoading: loadingCurrentList} = useQuery({
    queryKey: ['prospectList', numericId],
    queryFn: () => getProspectList(numericId),
    enabled: !!numericId,
  });

  if(isNaN(numericId)) {
    toast.error("Invalid Prospect list ID");
    router.push("/prospect-lists");
    return;
  }

  if (error) {
    console.error("Error loading prospect list:", error);
    toast.error("Failed to load prospect list");
  }

  // Filter prospects based on search text
  const filteredProspects = currentList?.contacts?.filter(contact =>
    (contact.name && contact.name.toLowerCase().includes(filterText.toLowerCase())) ||
    (contact.title && contact.title.toLowerCase().includes(filterText.toLowerCase())) ||
    (contact.companyName && contact.companyName.toLowerCase().includes(filterText.toLowerCase())) ||
    (contact.email && contact.email.toLowerCase().includes(filterText.toLowerCase()))
  ) || [];

  // Paginate filtered prospects
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProspects = filteredProspects.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProspects.length / itemsPerPage);

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const exportToCSV = () => {
    if (!currentList?.contacts || currentList.contacts.length === 0) {
      toast.error("No prospects to export");
      return;
    }

    const headers = ["Name", "Title", "Company", "Email", "City", "State", "Country"];
    const csvContent = [
      headers.join(","),
      ...currentList.contacts.map(contact => [
        `"${contact.name || ''}"`,
        `"${contact.title || ''}"`,
        `"${contact.companyName || ''}"`,
        `"${contact.email || ''}"`,
        `"${contact.city || ''}"`,
        `"${contact.state || ''}"`,
        `"${contact.country || ''}"`
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentList.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_prospects.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/prospect-lists">
                <ArrowLeft className="h-4 w-4" />
              </Link>
            </Button>
            <div>
              <h1 className="text-3xl font-bold">
                {loadingCurrentList ? "Loading..." : currentList?.name}
              </h1>
              {!loadingCurrentList && currentList?.description && (
                <p className="text-muted-foreground mt-1">
                  {currentList.description}
                </p>
              )}
            </div>
          </div>
          <div className="flex gap-2">
            <Button asChild variant="outline">
              <Link href={`/campaigns/new?prospectList=${id}`}>
                <MailPlus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/prospects/search?addToList=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Prospects
              </Link>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Actions
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem asChild>
                  <Link href={`/prospect-lists/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit List
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={exportToCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Export CSV
                </DropdownMenuItem>
                <DropdownMenuItem 
                  className="text-destructive focus:text-destructive"
                  onClick={() => setDeleteDialogOpen(true)}
                  disabled={currentList?.usedInCampaigns}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete List
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
        
        {loadingCurrentList ? (
          <div className="space-y-4">
            <Skeleton className="h-8 w-64" />
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-36 w-full" />
          </div>
        ) : !currentList ? (
          <Card>
            <CardContent className="py-10">
              <div className="text-center">
                <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Prospect list not found</h3>
                <p className="text-muted-foreground mt-2">
                  The requested prospect list could not be found
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <p className="text-muted-foreground">
                    Created on {new Date(currentList.createdAt).toLocaleDateString()}
                  </p>
                  <div className="flex items-center mt-1 gap-2">
                    <Badge>
                      {currentList.prospectCount} prospects
                    </Badge>
                    {currentList.usedInCampaigns && (
                      <Badge variant="secondary">
                        Used in {currentList.campaignCount} campaigns
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="relative w-64">
                  <Input
                    placeholder="Filter prospects..."
                    onChange={(e) => {
                      setFilterText(e.target.value);
                      setCurrentPage(1); // Reset to first page when filtering
                    }}
                    className="pl-8"
                  />
                  <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                </div>
                
                <div className="flex border rounded">
                  <Button
                    variant={viewMode === 'cards' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('cards')}
                  >
                    Cards
                  </Button>
                  <Button
                    variant={viewMode === 'table' ? 'default' : 'ghost'}
                    size="sm"
                    onClick={() => setViewMode('table')}
                  >
                    Table
                  </Button>
                </div>
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Prospects</CardTitle>
                <CardDescription>
                  People in this prospect list ({filteredProspects.length} of {currentList.prospectCount})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedProspects.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {filteredProspects.length === 0 && filterText 
                        ? "No prospects match your filter" 
                        : "No prospects in this list"}
                    </p>
                  </div>
                ) : viewMode === 'cards' ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {paginatedProspects.map((contact) => (
                        <div
                          key={contact.id}
                          className="p-4 border rounded-md hover:bg-accent/50"
                        >
                          <div className="flex items-start gap-4">
                            <Avatar className="h-10 w-10">
                              <AvatarFallback>
                                {getInitials(contact.firstName && contact.lastName 
                                  ? `${contact.firstName} ${contact.lastName}`
                                  : contact.name)}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <h3 className="font-medium">
                                {contact.firstName && contact.lastName 
                                  ? `${contact.firstName} ${contact.lastName}`
                                  : contact.name}
                              </h3>
                              <div className="flex items-center gap-1 mt-1">
                                <Badge variant="secondary" className="font-normal">
                                  {contact.title}
                                </Badge>
                                {contact.department && (
                                  <Badge variant="outline" className="font-normal">
                                    {contact.department}
                                  </Badge>
                                )}
                              </div>
                              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                                <div className="flex items-center">
                                  <Building className="h-3.5 w-3.5 mr-1 inline-flex" />
                                  {contact.companyName}
                                </div>
                                {(contact.city || contact.state || contact.country) && (
                                  <div className="text-xs">
                                    {[contact.city, contact.state, contact.country]
                                      .filter(Boolean)
                                      .join(", ")}
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </ScrollArea>
                ) : (
                  <div className="rounded-md border">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Name</TableHead>
                          <TableHead>Title</TableHead>
                          <TableHead>Company</TableHead>
                          <TableHead>Email</TableHead>
                          <TableHead>Location</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProspects.map((contact) => (
                          <TableRow key={contact.id}>
                            <TableCell>
                              <div className="flex items-center gap-2">
                                <Avatar className="h-8 w-8">
                                  <AvatarFallback className="text-xs">
                                    {getInitials(contact.firstName && contact.lastName 
                                      ? `${contact.firstName} ${contact.lastName}`
                                      : contact.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="font-medium">
                                  {contact.firstName && contact.lastName 
                                    ? `${contact.firstName} ${contact.lastName}`
                                    : contact.name}
                                </span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="secondary">
                                {contact.title}
                              </Badge>
                            </TableCell>
                            <TableCell>{contact.companyName}</TableCell>
                            <TableCell>{contact.email || "—"}</TableCell>
                            <TableCell>
                              {[contact.city, contact.state, contact.country]
                                .filter(Boolean)
                                .join(", ") || "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
                
                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-4">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === 1}
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    >
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {currentPage} of {totalPages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage === totalPages}
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </>
        )}
        
        <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the prospect list &quot;{currentList?.name}&quot;. 
                This action cannot be undone.
                {currentList?.usedInCampaigns && (
                  <div className="mt-2 p-2 bg-destructive/10 border border-destructive/20 rounded">
                    <p className="text-destructive text-sm font-medium">
                      This list is used in {currentList.campaignCount} campaigns and cannot be deleted.
                    </p>
                  </div>
                )}
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction 
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => handleDelete()}
                disabled={deleting || currentList?.usedInCampaigns}
              >
                {deleting ? "Deleting..." : "Delete"}
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </ErrorBoundary>
  );
}