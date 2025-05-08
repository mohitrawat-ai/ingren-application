// src/components/campaign/targeting-form/index.tsx
"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Loader2 } from "lucide-react";

import { Form, FormControl, FormField, FormItem } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { toast } from "sonner";

import { OrganizationSearch } from "./organization-search";
import { JobTitleSelect } from "./job-title-select";
import { CSVUpload } from "./csv-upload";
import { ContactList } from "./contact-list";
import { 
  Organization, 
  Contact, 
  ContactSearchResponse,
  CSVContact,
  TargetingFormValues 
} from "./types";
import { convertCSVToContacts } from "@/lib/actions/audience";

// Form schema
const targetingFormSchema = z.object({
  organizations: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      industry: z.string().optional(),
      employeeCount: z.string().optional(),
    })
  ).optional(),
  jobTitles: z.array(z.string()).optional(),
  contacts: z.array(
    z.object({
      id: z.string(),
      name: z.string(),
      title: z.string(),
      organization: z.object({
        name: z.string(),
      }),
      city: z.string().optional(),
      state: z.string().optional(),
      country: z.string().optional(),
      email: z.string().optional(),
    })
  ),
});

interface TargetingFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  initialData?: TargetingFormValues;
  campaignId: number;
}

export function TargetingForm({ 
  onSubmit, 
  isSubmitting = false,
  initialData,
  campaignId,
}: TargetingFormProps) {
  const [contactSearchResults, setContactSearchResults] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [csvData, setCsvData] = useState<CSVContact[]>([]);
  const [csvFileName, setCsvFileName] = useState<string | null>(null);
  
  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalContacts, setTotalContacts] = useState(0);
  
  const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || '/api';
  
  const form = useForm<TargetingFormValues>({
    resolver: zodResolver(targetingFormSchema),
    defaultValues: initialData || {
      organizations: [],
      jobTitles: [],
      contacts: [],
    },
  });

  // Search for contacts when filters change
  useEffect(() => {
    const searchForContacts = async () => {
      const organizations = form.getValues("organizations") || [];
      const jobTitles = form.getValues("jobTitles") || [];
      
      // If we have CSV data, use that instead of searching
      if (csvData.length > 0) {
        try {
          const formattedContacts = await convertCSVToContacts(csvData);
          setContactSearchResults(formattedContacts);
          setTotalContacts(formattedContacts.length);
          setTotalPages(1);
          form.setValue("contacts", formattedContacts);
          return;
        } catch (error) {
          console.error("Error converting CSV data:", error);
          toast.error("Failed to process CSV data");
          return;
        }
      }
      
      if (organizations.length === 0 && jobTitles.length === 0) {
        setContactSearchResults([]);
        setTotalContacts(0);
        form.setValue("contacts", []);
        return;
      }
      
      setLoadingContacts(true);
      try {
        const params: any = {
          page: currentPage,
          per_page: 10,
        };
        
        if (organizations.length > 0) {
          params.organization_ids = organizations.map(org => org.id);
        }
        
        if (jobTitles.length > 0) {
          params.title = jobTitles;
        }
        
        const response = await fetch(`${API_BASE_URL}/people/search`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(params),
        });
        
        if (!response.ok) {
          throw new Error('Failed to search contacts');
        }
        
        const data: ContactSearchResponse = await response.json();
        setContactSearchResults(data.contacts);
        setTotalContacts(data.pagination.total_entries);
        setTotalPages(data.pagination.total_pages);
        form.setValue("contacts", data.contacts);
      } catch (error) {
        console.error("Error searching contacts:", error);
        toast.error("Failed to search contacts");
      } finally {
        setLoadingContacts(false);
      }
    };
    
    searchForContacts();
  }, [form.watch("organizations"), form.watch("jobTitles"), csvData, currentPage, form]);

  // Add an organization
  const handleAddOrganization = (organization: Organization) => {
    const currentOrganizations = form.getValues("organizations") || [];
    if (!currentOrganizations.some(org => org.id === organization.id)) {
      form.setValue("organizations", [...currentOrganizations, organization]);
    }
  };

  // Remove an organization
  const handleRemoveOrganization = (organizationId: string) => {
    const currentOrganizations = form.getValues("organizations") || [];
    form.setValue(
      "organizations", 
      currentOrganizations.filter(org => org.id !== organizationId)
    );
  };

  // Add a job title
  const handleAddJobTitle = (title: string) => {
    const currentJobTitles = form.getValues("jobTitles") || [];
    if (!currentJobTitles.includes(title)) {
      form.setValue("jobTitles", [...currentJobTitles, title]);
    }
  };

  // Remove a job title
  const handleRemoveJobTitle = (title: string) => {
    const currentJobTitles = form.getValues("jobTitles") || [];
    form.setValue(
      "jobTitles", 
      currentJobTitles.filter(t => t !== title)
    );
  };

  // Handle CSV processing
  const handleCSVProcessed = (contacts: CSVContact[], fileName: string) => {
    setCsvData(contacts);
    setCsvFileName(fileName);
    
    // Clear any previously selected filters
    form.setValue("organizations", []);
    form.setValue("jobTitles", []);
  };

  // Clear CSV data
  const clearCSVData = () => {
    setCsvData([]);
    setCsvFileName(null);
    form.setValue("contacts", []);
  };

  // Handle pagination
  const handlePageChange = (newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
  };

  // Handle form submission
  const handleFormSubmit = (data: TargetingFormValues) => {
    // Include total results and CSV file name for audience creation
    onSubmit({
      ...data,
      totalResults: totalContacts,
      csvFileName: csvFileName,
      campaignId
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Target Audience</CardTitle>
            <CardDescription>
              Define your target audience by selecting organizations and job titles, or upload a CSV
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="filters" className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="filters">Targeting Filters</TabsTrigger>
                <TabsTrigger value="csv">CSV Upload</TabsTrigger>
                <TabsTrigger value="results">
                  Results ({totalContacts})
                </TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="space-y-6">
                <div className="space-y-4">
                  <OrganizationSearch 
                    selectedOrganizations={form.getValues("organizations") || []}
                    onAddOrganization={handleAddOrganization}
                    onRemoveOrganization={handleRemoveOrganization}
                  />
                  
                  <JobTitleSelect 
                    selectedJobTitles={form.getValues("jobTitles") || []}
                    onAddJobTitle={handleAddJobTitle}
                    onRemoveJobTitle={handleRemoveJobTitle}
                  />
                </div>
              </TabsContent>
              
              <TabsContent value="csv" className="space-y-6">
                <CSVUpload 
                  onCSVProcessed={handleCSVProcessed} 
                  onClearCSV={clearCSVData}
                />
              </TabsContent>
              
              <TabsContent value="results">
                <ContactList 
                  contacts={contactSearchResults}
                  loading={loadingContacts}
                  totalContacts={totalContacts}
                  currentPage={currentPage}
                  totalPages={totalPages}
                  onPageChange={handlePageChange}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
        
        <FormField
          control={form.control}
          name="contacts"
          render={({ field }) => (
            <FormItem className="hidden">
              <FormControl>
                <Input {...field} value={JSON.stringify(field.value)} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || contactSearchResults.length === 0}
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              "Next"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}