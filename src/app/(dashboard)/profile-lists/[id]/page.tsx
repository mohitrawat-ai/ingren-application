// src/app/(dashboard)/profile-lists/[id]/page.tsx
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
  Download,
  Briefcase,
  MapPin,
  Mail,
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

import { ErrorBoundary } from "@/components/ErrorBoundary";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteProfileList, getProfileList } from "@/lib/actions/profile";
import { TargetListProfile } from "@/lib/schema/types";

interface ProfileListDetailProps {
  params: Promise<{ id: string }>
}

export default function ProfileListDetail({ params }: ProfileListDetailProps) {
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
    mutationFn: () => deleteProfileList(numericId),
    onSuccess: () => {
      toast.success("Profile list deleted successfully");
      router.push("/profile-lists");
      queryClient.invalidateQueries({ queryKey: ['profileList', numericId] });
    },
    onError: (error) => {
      console.error("Error deleting profile list:", error);
      if(error instanceof Error) {
        toast.error(error.message || "Failed to delete profile list");
      }
    }
  });

  const {data: currentList, error, isLoading: loadingCurrentList} = useQuery({
    queryKey: ['profileList', numericId],
    queryFn: () => getProfileList(numericId),
    enabled: !!numericId,
  });

  if(isNaN(numericId)) {
    toast.error("Invalid Profile list ID");
    router.push("/profile-lists");
    return;
  }

  if (error) {
    console.error("Error loading profile list:", error);
    toast.error("Failed to load profile list");
  }

  // Filter profiles based on search text
  const filteredProfiles = currentList?.profiles?.filter(profile => {
    const searchTerm = filterText.toLowerCase();
    return (
      (profile.firstName && profile.firstName.toLowerCase().includes(searchTerm)) ||
      (profile.jobTitle && profile.jobTitle.toLowerCase().includes(searchTerm)) ||
      (profile.companyName && profile.companyName.toLowerCase().includes(searchTerm)) ||
      (profile.email && profile.email.toLowerCase().includes(searchTerm)) ||
      (profile.firstName && profile.firstName.toLowerCase().includes(searchTerm)) ||
      (profile.lastName && profile.lastName.toLowerCase().includes(searchTerm))
    );
  }) || [];

  // Paginate filtered profiles
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedProfiles = filteredProfiles.slice(startIndex, endIndex);
  const totalPages = Math.ceil(filteredProfiles.length / itemsPerPage);

  const getInitials = (profile: TargetListProfile) => {
    if (profile.firstName && profile.lastName) {
      return `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();
    }
    if (profile.firstName) {
      return profile.firstName
        .split(' ')
        .map((part: string) => part[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);
    }
    return "?";
  };

  const exportToCSV = () => {
    if (!currentList?.profiles || currentList.profiles.length === 0) {
      toast.error("No profiles to export");
      return;
    }

    const headers = ["First Name", "Last Name", "Title", "Department", "Industry", "Email", "City", "State", "Country"];
    const csvContent = [
      headers.join(","),
      ...currentList.profiles.map(profile => {
        return [
          `"${profile.firstName || ''}"`,
          `"${profile.lastName || ''}"`,
          `"${profile.jobTitle || ''}"`,
          `"${profile.department || ''}"`,
          `"${profile.companyName || ''}"`,
          `"${profile.email || ''}"`,
          `"${profile.city || ''}"`,
          `"${profile.state || ''}"`,
          `"${profile.country || ''}"`
        ].join(",");
      })
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `${currentList.name.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_profiles.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const getProfileDisplayData = (profile: TargetListProfile) => {
    return {
      name: profile.firstName && profile.lastName 
        ? `${profile.firstName} ${profile.lastName}`
        : profile.firstName,
      title: profile.jobTitle,
      department: profile.department,
      company: profile.companyName,
      industry: profile.companyIndustry,
      email: profile.email,
      location: [profile.city, profile.state, profile.country].filter(Boolean).join(", "),
      seniorityLevel: profile.seniorityLevel,
      managementLevel: profile.managementLevel,
      isDecisionMaker: profile.isDecisionMaker,
    };
  };

  return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" asChild>
              <Link href="/profile-lists">
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
              <Link href={`/campaigns/new?profileList=${id}`}>
                <MailPlus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href={`/profiles/search?addToList=${id}`}>
                <Plus className="mr-2 h-4 w-4" />
                Add Profiles
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
                  <Link href={`/profile-lists/${id}/edit`}>
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
                <h3 className="mt-4 text-lg font-medium">Profile list not found</h3>
                <p className="text-muted-foreground mt-2">
                  The requested profile list could not be found
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
                      {currentList.profileCount} profiles
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
                    placeholder="Filter profiles..."
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
                <CardTitle>Profiles</CardTitle>
                <CardDescription>
                  People in this profile list ({filteredProfiles.length} of {currentList.profileCount})
                </CardDescription>
              </CardHeader>
              <CardContent>
                {paginatedProfiles.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-10 w-10 mx-auto text-muted-foreground" />
                    <p className="mt-2 text-muted-foreground">
                      {filteredProfiles.length === 0 && filterText 
                        ? "No profiles match your filter" 
                        : "No profiles in this list"}
                    </p>
                  </div>
                ) : viewMode === 'cards' ? (
                  <ScrollArea className="h-[600px] pr-4">
                    <div className="space-y-4">
                      {paginatedProfiles.map((contact) => {
                        const profile = getProfileDisplayData(contact);
                        return (
                          <div
                            key={contact.id}
                            className="p-4 border rounded-md hover:bg-accent/50"
                          >
                            <div className="flex items-start gap-4">
                              <Avatar className="h-12 w-12">
                                <AvatarFallback>
                                  {getInitials(contact)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1">
                                <h3 className="font-semibold text-lg">{profile.name}</h3>
                                
                                <div className="flex items-center gap-2 mt-1">
                                  <Briefcase className="h-4 w-4 text-muted-foreground" />
                                  <Badge variant="secondary">{profile.title}</Badge>
                                  {profile.department && (
                                    <Badge variant="outline">{profile.department}</Badge>
                                  )}
                                  {!!profile.seniorityLevel && (
                                    <Badge variant="outline" className="capitalize">
                                      {(profile.seniorityLevel as string).replace('-', ' ')}
                                    </Badge>
                                  )}
                                </div>
                                
                                <div className="flex items-center mt-2">
                                  <Building className="h-4 w-4 mr-2 text-muted-foreground" />
                                  <span className="font-medium">{profile.company}</span>
                                  {profile.industry && (
                                    <span className="text-muted-foreground ml-2">• {profile.industry}</span>
                                  )}
                                </div>
                                
                                <div className="flex flex-col gap-1 mt-2 text-sm text-muted-foreground">
                                  {profile.email && (
                                    <div className="flex items-center">
                                      <Mail className="h-3.5 w-3.5 mr-2" />
                                      {profile.email}
                                    </div>
                                  )}
                                  {profile.location && (
                                    <div className="flex items-center">
                                      <MapPin className="h-3.5 w-3.5 mr-2" />
                                      {profile.location}
                                    </div>
                                  )}
                                </div>
                                
                                {!!profile.isDecisionMaker && (
                                  <div className="mt-2">
                                    <Badge variant="default" className="text-xs">
                                      ✓ Decision Maker
                                    </Badge>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
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
                          <TableHead>Level</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {paginatedProfiles.map((contact) => {
                          const profile = getProfileDisplayData(contact);
                          return (
                            <TableRow key={contact.id}>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <Avatar className="h-8 w-8">
                                    <AvatarFallback className="text-xs">
                                      {getInitials(contact)}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="font-medium">{profile.name}</span>
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <Badge variant="secondary">{profile.title}</Badge>
                                  {profile.department && (
                                    <div className="text-xs text-muted-foreground mt-1">
                                      {profile.department}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>
                                <div>
                                  <div className="font-medium">{profile.company}</div>
                                  {profile.industry && (
                                    <div className="text-xs text-muted-foreground">
                                      {profile.industry}
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                              <TableCell>{profile.email || "—"}</TableCell>
                              <TableCell>{profile.location || "—"}</TableCell>
                              <TableCell>
                                <div className="space-y-1">
                                  {!!profile.seniorityLevel && (
                                    <Badge variant="outline" className="text-xs capitalize">
                                      {profile.seniorityLevel as string}
                                    </Badge>
                                  )}
                                  {!!profile.isDecisionMaker && (
                                    <div>
                                      <Badge variant="default" className="text-xs">
                                        Decision Maker
                                      </Badge>
                                    </div>
                                  )}
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
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
                This will permanently delete the profile list &quot;{currentList?.name}&quot;. 
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