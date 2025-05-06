"use client";

import { useState, useEffect, useRef } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { PlusCircle, UserCircle, X, Upload, FileText } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

import { apolloOrganizationService } from "@/lib/organization";
import { apolloService } from "@/lib/contacts";
import { toast } from "sonner";

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

type TargetingFormValues = z.infer<typeof targetingFormSchema>;

const jobTitleOptions = [
  "CEO",
  "CTO",
  "CFO",
  "CIO",
  "VP of Sales",
  "VP of Marketing",
  "Director of Sales",
  "Director of Marketing",
  "Sales Manager",
  "Marketing Manager",
  "Product Manager",
];

interface TargetingFormProps {
  onSubmit: (data: any) => void;
  isSubmitting?: boolean;
  initialData?: any;
}

export function TargetingForm({ 
  onSubmit, 
  isSubmitting = false,
  initialData,
}: TargetingFormProps) {
  const [organizationSearchTerm, setOrganizationSearchTerm] = useState("");
  const [organizationSearchResults, setOrganizationSearchResults] = useState([]);
  const [searchingOrganizations, setSearchingOrganizations] = useState(false);
  const [selectedJobTitles, setSelectedJobTitles] = useState<string[]>([]);
  const [jobTitleSearchTerm, setJobTitleSearchTerm] = useState("");
  const [filteredJobTitles, setFilteredJobTitles] = useState(jobTitleOptions);
  const [contactSearchResults, setContactSearchResults] = useState([]);
  const [loadingContacts, setLoadingContacts] = useState(false);
  const [csvAlertOpen, setCsvAlertOpen] = useState(false);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const form = useForm<TargetingFormValues>({
    resolver: zodResolver(targetingFormSchema),
    defaultValues: initialData || {
      organizations: [],
      jobTitles: [],
      contacts: [],
    },
  });
  
  // Handle organization search
  useEffect(() => {
    const searchOrgs = async () => {
      if (organizationSearchTerm.length < 2) {
        setOrganizationSearchResults([]);
        return;
      }
      
      setSearchingOrganizations(true);
      try {
        const results = await apolloOrganizationService.searchOrganizations(
          organizationSearchTerm,
          (orgs) => {
            setOrganizationSearchResults(orgs);
            setSearchingOrganizations(false);
          },
          (error) => {
            console.error("Error searching organizations:", error);
            setSearchingOrganizations(false);
          }
        );
      } catch (error) {
        console.error("Error searching organizations:", error);
        setSearchingOrganizations(false);
      }
    };
    
    const timeoutId = setTimeout(searchOrgs, 300);
    return () => clearTimeout(timeoutId);
  }, [organizationSearchTerm]);

  // Filter job titles based on search
  useEffect(() => {
    if (!jobTitleSearchTerm) {
      setFilteredJobTitles(jobTitleOptions);
      return;
    }
    
    const lowerCaseSearchTerm = jobTitleSearchTerm.toLowerCase();
    const filtered = jobTitleOptions.filter(title => 
      title.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setFilteredJobTitles(filtered);
  }, [jobTitleSearchTerm]);

  // Search for contacts when filters change
  useEffect(() => {
    const searchForContacts = async () => {
      const organizations = form.getValues("organizations") || [];
      const jobTitles = form.getValues("jobTitles") || [];
      
      if (organizations.length === 0 && jobTitles.length === 0 && csvData.length === 0) {
        setContactSearchResults([]);
        return;
      }
      
      // If we have CSV data, use that instead of searching
      if (csvData.length > 0) {
        const formattedContacts = csvData.map((contact, index) => ({
          id: `csv-${index}`,
          name: contact.name || "Unknown",
          title: contact.title || "Unknown",
          organization: {
            name: contact.company || "Unknown",
          },
          city: contact.city,
          state: contact.state,
          country: contact.country,
          email: contact.email,
        }));
        setContactSearchResults(formattedContacts);
        form.setValue("contacts", formattedContacts);
        return;
      }
      
      // If no CSV data, search using API
      if (organizations.length === 0 && jobTitles.length === 0) {
        return;
      }
      
      setLoadingContacts(true);
      try {
        const params: any = {
          page: 1,
          per_page: 25,
        };
        
        if (organizations.length > 0) {
          params.organization_ids = organizations.map(org => org.id);
        }
        
        if (jobTitles.length > 0) {
          params.q_person_title = jobTitles;
        }
        
        const results = await apolloService.searchContacts(params);
        setContactSearchResults(results.contacts);
        form.setValue("contacts", results.contacts);
      } catch (error) {
        console.error("Error searching contacts:", error);
      } finally {
        setLoadingContacts(false);
      }
    };
    
    searchForContacts();
  }, [form.watch("organizations"), form.watch("jobTitles"), csvData, form]);

  // Add an organization
  const handleAddOrganization = (organization) => {
    const currentOrganizations = form.getValues("organizations") || [];
    if (!currentOrganizations.some(org => org.id === organization.id)) {
      form.setValue("organizations", [...currentOrganizations, organization]);
    }
    setOrganizationSearchTerm("");
  };

  // Remove an organization
  const handleRemoveOrganization = (organizationId) => {
    const currentOrganizations = form.getValues("organizations") || [];
    form.setValue(
      "organizations", 
      currentOrganizations.filter(org => org.id !== organizationId)
    );
  };

  // Add a job title
  const handleAddJobTitle = (title) => {
    const currentJobTitles = form.getValues("jobTitles") || [];
    if (!currentJobTitles.includes(title)) {
      form.setValue("jobTitles", [...currentJobTitles, title]);
      setSelectedJobTitles([...selectedJobTitles, title]);
    }
    setJobTitleSearchTerm("");
  };

  // Remove a job title
  const handleRemoveJobTitle = (title: string) => {
    const currentJobTitles = form.getValues("jobTitles") || [];
    form.setValue(
      "jobTitles", 
      currentJobTitles.filter(t => t !== title)
    );
    setSelectedJobTitles(selectedJobTitles.filter(t => t !== title));
  };

  // Handle CSV file upload
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setCsvFile(file);
      setCsvAlertOpen(true);
    }
  };

  // Trigger file input click
  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  // Process and parse CSV
  const processCSV = async () => {
    if (!csvFile) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const text = e.target?.result as string;
        
        // Use PapaParse to parse CSV
        const result = await parseCSV(text);
        
        if (result.data && result.data.length > 0) {
          // Access the data from the parsed result
          const parsedData = result.data;
          // Get headers from the first row
          const headers = result.meta.fields || [];
          
          // Check if required fields exist
          const hasRequiredFields = 
            headers.includes('name') && 
            headers.includes('title') && 
            headers.includes('company');
          
          if (!hasRequiredFields) {
            toast.error("CSV must include 'name', 'title', and 'company' columns");
            return;
          }
          
          // Filter out rows with missing required data
          const validData = parsedData.filter(row => 
            row.name && row.title && row.company
          );
          
          setCsvData(validData);
          toast.success(`Successfully imported ${validData.length} contacts from CSV`);
          
          // Clear any previously selected filters
          form.setValue("organizations", []);
          form.setValue("jobTitles", []);
          setSelectedJobTitles([]);
        }
      } catch (error) {
        console.error('Error parsing CSV:', error);
        toast.error("Failed to parse CSV file");
      } finally {
        setCsvAlertOpen(false);
      }
    };
    reader.readAsText(csvFile);
  };

  // Parse CSV using PapaParse
  const parseCSV = (csvText: string) => {
    return new Promise((resolve, reject) => {
      try {
        // Using dynamic import for Papa Parse
        import('papaparse').then(Papa => {
          const result = Papa.parse(csvText, {
            header: true,
            skipEmptyLines: true,
            dynamicTyping: true,
            complete: (results) => {
              resolve(results);
            },
            error: (error) => {
              reject(error);
            }
          });
        }).catch(err => {
          reject(err);
        });
      } catch (error) {
        reject(error);
      }
    });
  };

  // Clear CSV data
  const clearCsvData = () => {
    setCsvData([]);
    setCsvFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleFormSubmit = (data: TargetingFormValues) => {
    // Include total results for pagination
    onSubmit({
      ...data,
      totalResults: contactSearchResults.length,
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
                <TabsTrigger value="csv" className="flex items-center">
                  <FileText className="mr-2 h-4 w-4" />
                  CSV Upload
                </TabsTrigger>
                <TabsTrigger value="results">Results ({contactSearchResults.length})</TabsTrigger>
              </TabsList>
              
              <TabsContent value="filters" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <FormLabel>Organizations</FormLabel>
                    <FormDescription>
                      Select target organizations
                    </FormDescription>
                    
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {form.getValues("organizations")?.map(org => (
                        <Badge 
                          key={org.id}
                          variant="secondary"
                          className="text-sm py-1 px-3"
                        >
                          {org.name}
                          <button 
                            type="button" 
                            className="ml-1 hover:text-destructive"
                            onClick={() => handleRemoveOrganization(org.id)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full justify-start"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Organization
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search organizations..."
                            value={organizationSearchTerm}
                            onValueChange={setOrganizationSearchTerm}
                          />
                          <CommandList>
                            {searchingOrganizations ? (
                              <div className="p-2">
                                <Skeleton className="h-5 w-full mb-2" />
                                <Skeleton className="h-5 w-full mb-2" />
                                <Skeleton className="h-5 w-full" />
                              </div>
                            ) : organizationSearchTerm.length < 2 ? (
                              <CommandEmpty>
                                Type at least 2 characters to search
                              </CommandEmpty>
                            ) : organizationSearchResults.length === 0 ? (
                              <CommandEmpty>No organizations found</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {organizationSearchResults.map(org => (
                                  <CommandItem
                                    key={org.id}
                                    onSelect={() => handleAddOrganization(org)}
                                    className="cursor-pointer"
                                  >
                                    <div className="flex flex-col">
                                      <span>{org.name}</span>
                                      <span className="text-xs text-muted-foreground">
                                        {org.industry} • {org.employeeCount} employees
                                      </span>
                                    </div>
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div>
                    <FormLabel>Job Titles</FormLabel>
                    <FormDescription>
                      Select target job titles
                    </FormDescription>
                    
                    <div className="flex flex-wrap gap-2 mt-2 mb-2">
                      {form.getValues("jobTitles")?.map(title => (
                        <Badge 
                          key={title}
                          variant="secondary"
                          className="text-sm py-1 px-3"
                        >
                          {title}
                          <button 
                            type="button" 
                            className="ml-1 hover:text-destructive"
                            onClick={() => handleRemoveJobTitle(title)}
                          >
                            <X className="h-3 w-3" />
                          </button>
                        </Badge>
                      ))}
                    </div>
                    
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          size="sm"
                          className="h-9 w-full justify-start"
                        >
                          <PlusCircle className="mr-2 h-4 w-4" />
                          Add Job Title
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-96 p-0" align="start">
                        <Command>
                          <CommandInput
                            placeholder="Search job titles..."
                            value={jobTitleSearchTerm}
                            onValueChange={setJobTitleSearchTerm}
                          />
                          <CommandList>
                            {filteredJobTitles.length === 0 ? (
                              <CommandEmpty>No job titles found</CommandEmpty>
                            ) : (
                              <CommandGroup>
                                {filteredJobTitles.map(title => (
                                  <CommandItem
                                    key={title}
                                    onSelect={() => handleAddJobTitle(title)}
                                    className="cursor-pointer"
                                  >
                                    {title}
                                  </CommandItem>
                                ))}
                              </CommandGroup>
                            )}
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="csv" className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <FormLabel>Upload Audience CSV</FormLabel>
                    <FormDescription>
                      Upload a CSV file with your audience contacts. The CSV must include 'name', 'title', and 'company' columns.
                      Additional supported columns: 'email', 'city', 'state', 'country'.
                    </FormDescription>
                    
                    <div className="mt-2 flex items-center space-x-2">
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileChange}
                        accept=".csv"
                        className="hidden"
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleUploadClick}
                        className="flex-1"
                      >
                        <Upload className="mr-2 h-4 w-4" />
                        {csvFile ? 'Change CSV File' : 'Upload CSV File'}
                      </Button>
                      
                      {csvFile && (
                        <Button
                          type="button"
                          variant="ghost"
                          onClick={clearCsvData}
                          className="text-destructive"
                        >
                          <X className="mr-2 h-4 w-4" />
                          Clear CSV
                        </Button>
                      )}
                    </div>
                    
                    {csvFile && (
                      <div className="mt-4 p-4 border rounded-md">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-primary" />
                            <div>
                              <p className="font-medium">{csvFile.name}</p>
                              <p className="text-xs text-muted-foreground">
                                {(csvFile.size / 1024).toFixed(2)} KB • Uploaded
                              </p>
                            </div>
                          </div>
                          
                          {csvData.length > 0 && (
                            <Badge>
                              {csvData.length} contacts
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
              
              <TabsContent value="results">
                <div className="space-y-2">
                  <div className="flex items-center justify-between mb-4">
                    <FormLabel>Matching Contacts</FormLabel>
                    <div className="text-sm text-muted-foreground">
                      {contactSearchResults.length} results
                    </div>
                  </div>
                  
                  {loadingContacts ? (
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
                  ) : contactSearchResults.length === 0 ? (
                    <div className="text-center py-6 border rounded-md">
                      <UserCircle className="h-10 w-10 mx-auto text-muted-foreground" />
                      <h3 className="mt-4 text-lg font-medium">No contacts found</h3>
                      <p className="text-sm text-muted-foreground mt-2">
                        {csvData.length > 0 
                          ? "Your CSV data may be empty or missing required fields"
                          : "Add organizations or job titles to see matching contacts"}
                      </p>
                    </div>
                  ) : (
                    <ScrollArea className="h-[300px] border rounded-md p-2">
                      <div className="space-y-2 pr-2">
                        {contactSearchResults.map(contact => (
                          <div
                            key={contact.id}
                            className="flex items-center gap-3 p-2 rounded-md hover:bg-accent"
                          >
                            <Avatar>
                              <AvatarFallback>
                                {contact.name.slice(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1">
                              <div className="font-medium">{contact.name}</div>
                              <div className="text-sm text-muted-foreground">
                                {contact.title} at {contact.organization.name}
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
                  )}
                </div>
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
                <Input {...field} />
              </FormControl>
            </FormItem>
          )}
        />
        
        <div className="flex justify-end">
          <Button type="submit" disabled={isSubmitting || contactSearchResults.length === 0}>
            {isSubmitting ? "Saving..." : "Next"}
          </Button>
        </div>
      </form>
      
      {/* Confirmation dialog for CSV upload */}
      <AlertDialog open={csvAlertOpen} onOpenChange={setCsvAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Process CSV File</AlertDialogTitle>
            <AlertDialogDescription>
              This will replace your current targeting filters with contacts from the CSV file.
              Are you sure you want to continue?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => {
              setCsvFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={processCSV}>Continue</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Form>
  );
}