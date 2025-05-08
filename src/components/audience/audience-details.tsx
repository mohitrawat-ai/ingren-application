// src/components/audience/audience-details.tsx
"use client";

import { useState, useEffect } from "react";
import { FileText, Download, Users, Building, User } from "lucide-react";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";
import { getAudience } from "@/lib/actions/audience";

interface AudienceDetailsProps {
  audienceId: number;
}

export function AudienceDetails({ audienceId }: AudienceDetailsProps) {
  const [audience, setAudience] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [contactsPage, setContactsPage] = useState(1);
  const contactsPerPage = 10;
  
  useEffect(() => {
    const loadAudience = async () => {
      try {
        setLoading(true);
        const data = await getAudience(audienceId);
        setAudience(data);
      } catch (error) {
        console.error("Error loading audience:", error);
        toast.error("Failed to load audience details");
      } finally {
        setLoading(false);
      }
    };
    
    loadAudience();
  }, [audienceId]);
  
  const downloadCSV = () => {
    if (!audience?.csvFileName) {
      toast.error("No CSV file associated with this audience");
      return;
    }
    
    window.open(`/api/uploads/${audience.csvFileName}`, '_blank');
  };
  
  // Calculate pagination for contacts
  const startIndex = (contactsPage - 1) * contactsPerPage;
  const endIndex = startIndex + contactsPerPage;
  const paginatedContacts = audience?.contacts?.slice(startIndex, endIndex) || [];
  const totalPages = audience?.contacts ? Math.ceil(audience.contacts.length / contactsPerPage) : 0;
  
  // src/components/audience/audience-details.tsx (continued)
  return (
    <div className="space-y-6">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-36 w-full" />
        </div>
      ) : !audience ? (
        <Card>
          <CardContent className="py-10">
            <div className="text-center">
              <Users className="h-10 w-10 mx-auto text-muted-foreground" />
              <h3 className="mt-4 text-lg font-medium">Audience not found</h3>
              <p className="text-muted-foreground mt-2">
                The requested audience could not be found
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold">{audience.name}</h1>
              <p className="text-muted-foreground">
                Created on {new Date(audience.createdAt).toLocaleDateString()}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-sm">
                {audience.totalResults} contacts
              </Badge>
              {audience.csvFileName && (
                <Button variant="outline" size="sm" onClick={downloadCSV}>
                  <Download className="mr-2 h-4 w-4" />
                  Download CSV
                </Button>
              )}
            </div>
          </div>
          
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Audience Details</CardTitle>
                <CardDescription>
                  Information about this target audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Users className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium">Total Contacts</p>
                      <p className="text-2xl font-bold">{audience.totalResults}</p>
                    </div>
                  </div>
                  
                  {audience.csvFileName && (
                    <div className="flex items-center gap-3">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="text-sm font-medium">Source</p>
                        <p>CSV Upload</p>
                        <Button 
                          variant="link" 
                          size="sm" 
                          className="px-0 h-auto" 
                          onClick={downloadCSV}
                        >
                          Download original file
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Contact Preview</CardTitle>
                <CardDescription>
                  Preview of contacts in this audience
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[300px] pr-4">
                  <div className="space-y-4">
                    {paginatedContacts.length === 0 ? (
                      <div className="text-center py-6">
                        <User className="h-10 w-10 mx-auto text-muted-foreground" />
                        <p className="mt-2 text-muted-foreground">No contacts available</p>
                      </div>
                    ) : (
                      paginatedContacts.map((contact: any) => (
                        <div 
                          key={contact.id} 
                          className="p-3 border rounded-md hover:bg-accent/50"
                        >
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarFallback>
                                {contact.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <p className="font-medium">{contact.name}</p>
                              <p className="text-sm text-muted-foreground">
                                {contact.title}
                              </p>
                              <div className="flex items-center mt-1">
                                <Building className="h-3 w-3 mr-1 text-muted-foreground" />
                                <p className="text-xs text-muted-foreground">
                                  {contact.organizationName}
                                </p>
                              </div>
                              {contact.email && (
                                <p className="text-xs mt-1">
                                  {contact.email}
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
          </div>
        </>
      )}
    </div>
  );
}