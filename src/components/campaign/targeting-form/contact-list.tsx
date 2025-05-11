// src/components/campaign/targeting-form/contact-list.tsx
"use client";

import { UserCircle, Building, Award, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { FormLabel } from "@/components/ui/form";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Contact } from "./types";

interface ContactListProps {
  contacts: Contact[];
  loading: boolean;
  totalContacts: number;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function ContactList({
  contacts,
  loading,
  totalContacts,
  currentPage,
  totalPages,
  onPageChange,
}: ContactListProps) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-4">
        <FormLabel>Matching Contacts</FormLabel>
        <div className="text-sm text-muted-foreground">
          {totalContacts} results
        </div>
      </div>
      
      {loading ? (
        <div className="space-y-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1">
                <Skeleton className="h-4 w-48 mb-2" />
                <Skeleton className="h-3 w-32" />
              </div>
            </div>
          ))}
        </div>
      ) : contacts.length === 0 ? (
        <div className="text-center py-6 border rounded-md">
          <UserCircle className="h-10 w-10 mx-auto text-muted-foreground" />
          <h3 className="mt-4 text-lg font-medium">No contacts found</h3>
          <p className="text-sm text-muted-foreground mt-2">
            Add organizations or job titles to see matching contacts
          </p>
        </div>
      ) : (
        <>
          <ScrollArea className="h-[300px] border rounded-md p-2">
            <div className="space-y-2 pr-2">
              {contacts.map(contact => (
                <div
                  key={contact.id}
                  className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                >
                  <Avatar>
                    <AvatarFallback>
                      {contact.first_name && contact.last_name ? 
                        `${contact.first_name[0]}${contact.last_name[0]}` : 
                        contact.name.slice(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="font-medium">
                      {contact.first_name && contact.last_name ? 
                        `${contact.first_name} ${contact.last_name}` : 
                        contact.name}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {contact.title} {contact.department && `• ${contact.department}`}
                    </div>
                    
                    {/* Company info with tooltips for additional data */}
                    <div className="flex items-center text-xs text-muted-foreground mt-1">
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center">
                            <Building className="h-3 w-3 mr-1" />
                            <span>{contact.organization.name}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <div className="space-y-1 max-w-xs">
                              {contact.company_industry && (
                                <p className="text-xs"><span className="font-medium">Industry:</span> {contact.company_industry}</p>
                              )}
                              {contact.company_employee_count && (
                                <p className="text-xs"><span className="font-medium">Size:</span> {contact.company_employee_count}</p>
                              )}
                              {contact.company_description && (
                                <p className="text-xs"><span className="font-medium">Description:</span> {contact.company_description}</p>
                              )}
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      
                      {/* Only show these icons if we have the corresponding data */}
                      {contact.notable_achievement && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="ml-2">
                              <Award className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs max-w-xs"><span className="font-medium">Achievement:</span> {contact.notable_achievement}</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                      
                      {contact.tenure_months && (
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger className="ml-2">
                              <Clock className="h-3 w-3" />
                            </TooltipTrigger>
                            <TooltipContent>
                              <p className="text-xs"><span className="font-medium">Tenure:</span> {contact.tenure_months} months</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      )}
                    </div>
                    
                    {contact.email && (
                      <div className="text-xs text-muted-foreground">
                        {contact.email}
                      </div>
                    )}
                    {contact.city && (
                      <div className="text-xs text-muted-foreground">
                        {[contact.city, contact.state, contact.country]
                          .filter(Boolean)
                          .join(", ")}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
          
          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                Previous
              </Button>
              <div className="text-sm">
                Page {currentPage} of {totalPages}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
              </Button>
            </div>
          )}
        </>
      )}
    </div>
  );
}