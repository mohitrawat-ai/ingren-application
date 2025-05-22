// src/app/(dashboard)/company-lists/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Building, 
  Search, 
  Plus,
  ExternalLink,
  Filter
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

import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our store
import { useCompanyListStore } from "@/stores/companyListStore";

interface CompanyListDetailProps {
  params: Promise<{ id: string }>
}

export default function CompanyListDetail({ params }: CompanyListDetailProps) {
  const router = useRouter();
  const { id } = use(params);
  const numericId = Number(id);
  
  const { 
    currentList, 
    loadingCurrentList, 
    fetchList, 
    deleteList,
    deleting
  } = useCompanyListStore();
  
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  useEffect(() => {
    if (isNaN(numericId)) {
      toast.error("Invalid list ID");
      router.push("/company-lists");
      return;
    }
    
    fetchList(numericId).catch(error => {
      console.error("Error loading company list:", error);
      toast.error("Failed to load company list");
    });
  }, [numericId, fetchList, router]);

  const handleDelete = async () => {
    if (!currentList) return;
    
    try {
      await deleteList(currentList.id);
      toast.success("Company list deleted successfully");
      router.push("/company-lists");
    } catch (error: unknown) {
      console.error("Error deleting list:", error);
      if(error instanceof Error)
        toast.error(error.message || "Failed to delete company list");
    }
  };

  // Filter companies based on search text
  const filteredCompanies = currentList?.companies?.filter(company =>
    company.companyName.toLowerCase().includes(filterText.toLowerCase()) ||
    (company.industry && company.industry.toLowerCase().includes(filterText.toLowerCase())) ||
    (company.domain && company.domain.toLowerCase().includes(filterText.toLowerCase()))
  ) || [];

  // Paginate filtered companies
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCompanies = filteredCompanies.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage);

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/company-lists">
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
              <Link href={`/prospects/search?companyList=${id}`}>
                <Search className="mr-2 h-4 w-4" />
                Find Prospects
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/prospects/search`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Companies
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
                  <Link href={`/company-lists/${id}/edit`}>
                    <Edit className="mr-2 h-4 w-4" />
                    Edit List
                  </Link>
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
                <Building className="h-10 w-10 mx-auto text-muted-foreground" />
                <h3 className="mt-4 text-lg font-medium">Company list not found</h3>
                <p className="text-muted-foreground mt-2">
                  The requested company list could not be found
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
                      {currentList.companyCount} companies
                    </Badge>
                    {currentList.usedInCampaigns && (
                      <Badge variant="secondary">
                        Used in {currentList.campaignCount} campaigns
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <div className="relative w-64">
                <Input
                  placeholder="Filter companies..."
                  onChange={(e) => {
                    setFilterText(e.target.value);
                    setCurrentPage(1); // Reset to first page when filtering
                  }}
                  className="pl-8"
                />
                <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            
            <Card>
              <CardHeader>
                <CardTitle>Companies</CardTitle>
                <CardDescription>
                  Companies in this list ({filteredCompanies.length} of {currentList.companyCount})
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px] pr-4">
                  <div className="space-y-4">
                    {paginatedCompanies.length === 0 ? (
                      <div className="text-center py-8">
                        <Building className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">
                          {filteredCompanies.length === 0 && filterText 
                            ? "No companies match your filter" 
                            : "No companies in this list"}
                        </p>
                      </div>
                    ) : (
                      paginatedCompanies.map((company) => (
                        <div
                          key={company.id}
                          className="p-4 border rounded-md hover:bg-accent/50"
                        >
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h3 className="font-medium">{company.companyName}</h3>
                              
                              <div className="flex items-center gap-2 mt-2">
                                {company.industry && (
                                  <Badge variant="secondary">
                                    {company.industry}
                                  </Badge>
                                )}
                                {company.employeeCount && (
                                  <Badge variant="outline">
                                    {company.employeeCount} employees
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                                {company.domain && (
                                  <div className="flex items-center">
                                    <ExternalLink className="h-3.5 w-3.5 mr-1" />
                                    <Link 
                                      href={company.domain.startsWith('http') ? company.domain : `https://${company.domain}`}
                                      target="_blank"
                                      className="hover:underline"
                                    >
                                      {company.domain}
                                    </Link>
                                  </div>
                                )}
                                
                                {company.location && (
                                  <div className="text-xs">
                                    {company.location}
                                  </div>
                                )}
                              </div>
                              
                              {company.description && (
                                <p className="text-sm text-muted-foreground mt-2 line-clamp-2">
                                  {company.description}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </ScrollArea>
                
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
                This will permanently delete the company list &quot;{currentList?.name}&quot;. 
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
                onClick={handleDelete}
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