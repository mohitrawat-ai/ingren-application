"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Download, Edit, Filter, MailPlus, Trash2, Building, User, Mail } from "lucide-react";

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

import { getProspectList, deleteProspectList } from "@/lib/actions/prospect";
import { AudienceType, ContactType } from "@/lib/schema";

interface ProspectDetailProps {
  params: Promise<{ id: string }> 
}

export default function ProspectDetail({ params }: ProspectDetailProps) {
  const router = useRouter();
  const [list, setList] = useState<AudienceType & { contacts: ContactType[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [filterText, setFilterText] = useState("");
  const [contactsPage, setContactsPage] = useState(1);
  const contactsPerPage = 10;

  const { id } = use(params)

  useEffect(() => {
    const loadProspectList = async () => {
      try {
        setLoading(true);
        const data = await getProspectList(parseInt(id));
        setList(data);
      } catch (error) {
        toast.error("Failed to load prospect list");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadProspectList();
  }, [id]);

  const handleDelete = async () => {
    if (!list) return;
    
    try {
      await deleteProspectList(list.id);
      toast.success("Prospect list deleted successfully");
      router.push("/prospects");
    } catch (error) {
      toast.error("Failed to delete prospect list");
      console.error(error);
    }
  };

  // Filter contacts based on search text
  const filteredContacts = list?.contacts.filter(contact => {
    if (!filterText) return true;
    
    const searchText = filterText.toLowerCase();
    return (
      contact.name?.toLowerCase().includes(searchText) ||
      contact.title?.toLowerCase().includes(searchText) ||
      contact.organizationName?.toLowerCase().includes(searchText) ||
      contact.email?.toLowerCase().includes(searchText) ||
      contact.city?.toLowerCase().includes(searchText) ||
      contact.firstName?.toLowerCase().includes(searchText) ||
      contact.lastName?.toLowerCase().includes(searchText) ||
      contact.department?.toLowerCase().includes(searchText)
    );
  }) || [];

  // Paginate contacts
  const paginatedContacts = filteredContacts.slice(
    (contactsPage - 1) * contactsPerPage,
    contactsPage * contactsPerPage
  );
  
  const totalPages = Math.ceil(filteredContacts.length / contactsPerPage);

  const downloadCSV = () => {
    if (!list?.csvFileName) {
      toast.error("No CSV file associated with this list");
      return;
    }
    
    window.open(`/api/uploads/${list.csvFileName}`, '_blank');
  };

  const getInitials = (name: string | null) => {
    if (!name) return "?";
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prospects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-3xl font-bold">{loading ? "Loading..." : list?.name}</h1>
          {!loading && list?.csvFileName && (
            <Badge variant="outline" className="ml-2">CSV Import</Badge>
          )}
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/campaigns/new?list=${id}`}>
              <MailPlus className="mr-2 h-4 w-4" />
              Create Campaign
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
                <Link href={`/prospects/${id}/edit`}>
                  <Edit className="mr-2 h-4 w-4" />
                  Edit List
                </Link>
              </DropdownMenuItem>
              {list?.csvFileName && (
                <DropdownMenuItem onClick={downloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                className="text-destructive focus:text-destructive"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Delete List
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="text-muted-foreground">
                Created on {new Date(list?.createdAt || '').toLocaleDateString()}
              </p>
              <div className="flex items-center mt-1">
                <Badge>
                  {list?.totalResults || 0} contacts
                </Badge>
              </div>
            </div>
            <div className="relative w-64">
              <Input
                placeholder="Filter contacts..."
                value={filterText}
                onChange={(e) => setFilterText(e.target.value)}
                className="pl-8"
              />
              <Filter className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            </div>
          </div>
          
          <Card>
            <CardHeader>
              <CardTitle>Contacts</CardTitle>
              <CardDescription>
                People in this prospect list
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[550px] pr-4">
                <div className="space-y-4">
                  {paginatedContacts.length === 0 ? (
                    <div className="text-center py-6">
                      <User className="h-10 w-10 mx-auto text-muted-foreground" />
                      <p className="mt-2 text-muted-foreground">
                        {filterText ? "No contacts match your filter" : "No contacts in this list"}
                      </p>
                    </div>
                  ) : (
                    paginatedContacts.map((contact) => (
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
                                {contact.organizationName}
                              </div>
                              {contact.email && (
                                <div className="flex items-center">
                                  <Mail className="h-3.5 w-3.5 mr-1 inline-flex" />
                                  {contact.email}
                                </div>
                              )}
                              {(contact.city || contact.state || contact.country) && (
                                <div className="text-xs">
                                  {[contact.city, contact.state, contact.country]
                                    .filter(Boolean)
                                    .join(", ")}
                                </div>
                              )}
                            </div>
                            {/* Additional properties display */}
                            {(contact.notableAchievement || contact.companyIndustry || contact.companyDescription) && (
                              <div className="mt-2 pt-2 border-t text-sm">
                                {contact.notableAchievement && (
                                  <div className="mt-1">
                                    <span className="font-medium">Notable Achievement:</span> {contact.notableAchievement}
                                  </div>
                                )}
                                {contact.companyIndustry && (
                                  <div className="mt-1">
                                    <span className="font-medium">Industry:</span> {contact.companyIndustry}
                                  </div>
                                )}
                                {contact.companyDescription && (
                                  <div className="mt-1">
                                    <span className="font-medium">Company:</span> {contact.companyDescription}
                                  </div>
                                )}
                              </div>
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
                    disabled={contactsPage === 1}
                    onClick={() => setContactsPage(prev => Math.max(prev - 1, 1))}
                  >
                    Previous
                  </Button>
                  <span className="text-sm">
                    Page {contactsPage} of {totalPages}
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={contactsPage === totalPages}
                    onClick={() => setContactsPage(prev => Math.min(prev + 1, totalPages))}
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
              This will permanently delete the prospect list &quot;{list?.name}&quot;. 
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