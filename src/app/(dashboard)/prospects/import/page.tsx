"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowLeft, Upload, FileText, Download, AlertCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";

import { ColumnMapping } from "@/components/prospect/import/ColumnMapping";
import { ErrorBoundary } from "@/components/prospect/ErrorBoundary";

// Import our store
import { useCSVImportStore } from "@/stores/csvImportStore";

export default function ImportCSVPage() {
  const router = useRouter();
    const {
    // State
    currentStep,
    file,
    listName,
    uploadProgress,
    processingProgress,
    csvData,
    validationIssues,
    columnMapping,
    newListId,
    uploading,
    processing,
    
    // Actions
    setFile,
    setListName,
    startUpload,
    setColumnMapping,
    confirmMapping,
    resetImport
  } = useCSVImportStore();

   // Effect to redirect when import completes
  useEffect(() => {
    if (currentStep === 'complete' && newListId) {
      toast.success("CSV import completed successfully");
      router.push(`/prospects/${newListId}`);
    }
  }, [currentStep, newListId, router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0] || null;
    
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv' && !selectedFile.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setFile(selectedFile);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a CSV file");
      return;
    }
    
    if (!listName.trim()) {
      toast.error("Please enter a list name");
      return;
    }
    
    try {
      await startUpload();
    } catch (error) {
      console.error("Error uploading CSV:", error);
      toast.error("Failed to upload CSV");
    }
  };

  const handleColumnMapping = (mapping: Record<string, string>) => {
    setColumnMapping(mapping);
  };

  const handleConfirmMapping = async () => {
    try {
      await confirmMapping();
    } catch (error) {
      console.error("Error processing CSV:", error);
      toast.error("Failed to process CSV");
    }
  };

  const downloadSampleCSV = () => {
    const csvHeaders = [
      // Basic contact fields
      "first_name", "last_name", "job_title", "department", "tenure_months", "notable_achievement",
      // Basic company fields
      "company_name", "industry", "employee_count", "annual_revenue", "funding_stage", 
      "growth_signals", "recent_news", "technography", "description",
      // Legacy fields (for backward compatibility)
      "name", "title", "company", "email", "city", "state", "country"
    ].join(",");
    
    const sampleRow1 = [
      // Basic contact fields
      "John", "Smith", "VP of Engineering", "Engineering", "24", "Grew the team from 5 to 50 engineers",
      // Basic company fields
      "Acme Corp", "Technology", "1000-5000", "$50M-$100M", "Series C", 
      "Expanding to new markets", "Just raised $30M in funding", "React | Node.js | AWS", "Leading provider of widgets",
      // Legacy fields
      "", "", "", "john.smith@acmecorp.com", "San Francisco", "CA", "USA"
    ].join(",");
    
    const sampleRow2 = [
      // Basic contact fields
      "Jane", "Doe", "CTO", "Technology", "36", "Led digital transformation initiative",
      // Basic company fields
      "TechNova", "Software", "100-500", "$10M-$50M", "Series B", 
      "Hiring rapidly", "New product launch", "Python | Tensorflow", "AI-powered analytics platform",
      // Legacy fields
      "", "", "", "jane.doe@technova.io", "Boston", "MA", "USA"
    ].join(",");
    
    const csvContent = [csvHeaders, sampleRow1, sampleRow2].join("\n");
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'sample-contacts.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

    // Define the required and optional fields for mapping
  const requiredFields = ['first_name', 'last_name', 'email', 'company_name'];
  const optionalFields = [
    'job_title', 'department', 'tenure_months', 'notable_achievement',
    'industry', 'employee_count', 'annual_revenue', 'city', 'state', 'country'
  ];

   return (
    <ErrorBoundary>
      <div className="space-y-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/prospects">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <h1 className="text-2xl font-bold">Import Contacts CSV</h1>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            {currentStep === 'upload' && (
              <Card>
                <CardHeader>
                  <CardTitle>Upload CSV File</CardTitle>
                  <CardDescription>
                    Import your contacts from a CSV file
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-6">
                    <div className="space-y-2">
                      <Label htmlFor="list-name">List Name</Label>
                      <Input
                        id="list-name"
                        placeholder="Enter a name for your list"
                        value={listName}
                        onChange={(e) => setListName(e.target.value)}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="csv-file">CSV File</Label>
                      <div className="border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center">
                        {file ? (
                          <div className="text-center">
                            <FileText className="h-10 w-10 text-primary mx-auto mb-2" />
                            <p className="text-lg font-medium">{file.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {(file.size / 1024).toFixed(2)} KB • {csvData?.totalRows || 0} rows
                            </p>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="mt-2"
                              onClick={() => setFile(null)}
                            >
                              Choose Different File
                            </Button>
                          </div>
                        ) : (
                          <>
                            <Upload className="h-10 w-10 text-muted-foreground mb-2" />
                            <p className="text-lg font-medium">Drag & Drop your CSV file here</p>
                            <p className="text-sm text-muted-foreground mb-4">
                              or click to browse files
                            </p>
                            <input
                              id="csv-file"
                              type="file"
                              accept=".csv"
                              className="hidden"
                              onChange={handleFileChange}
                            />
                            <Button
                              variant="outline"
                              onClick={() => document.getElementById("csv-file")?.click()}
                            >
                              Browse Files
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* CSV Sample */}
                    <div>
                      <Button variant="link" onClick={downloadSampleCSV} className="p-0 h-auto">
                        <Download className="h-4 w-4 mr-1" />
                        Download Sample CSV
                      </Button>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={!file || !listName.trim() || uploading || processing}
                  >
                    {uploading ? (
                      <>Uploading...</>
                    ) : processing ? (
                      <>Processing...</>
                    ) : (
                      <>Import Contacts</>
                    )}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {currentStep === 'mapping' && csvData && (
              <Card>
                <CardHeader>
                  <CardTitle>Map CSV Columns</CardTitle>
                  <CardDescription>
                    Match your CSV columns to contact fields
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <ColumnMapping
                    csvHeaders={csvData.headers}
                    requiredFields={requiredFields}
                    optionalFields={optionalFields}
                    onColumnMapped={handleColumnMapping}
                    sampleData={csvData.rows}
                  />
                </CardContent>
                <CardFooter className="flex justify-end">
                  <Button
                    onClick={handleConfirmMapping}
                    disabled={processing || Object.keys(columnMapping).length < requiredFields.length}
                  >
                    {processing ? "Processing..." : "Continue"}
                  </Button>
                </CardFooter>
              </Card>
            )}
            
            {currentStep === 'validation' && validationIssues.length > 0 && (
              <Card className="border-destructive">
                <CardHeader>
                  <CardTitle className="text-destructive">Validation Issues</CardTitle>
                  <CardDescription>
                    Your CSV file has {validationIssues.length} validation issues that need to be fixed
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Import Failed</AlertTitle>
                    <AlertDescription>
                      Please fix the issues below and try again
                    </AlertDescription>
                  </Alert>
                  
                  <div className="mt-4 max-h-60 overflow-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Row</TableHead>
                          <TableHead>Column</TableHead>
                          <TableHead>Issue</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {validationIssues.map((issue, index) => (
                          <TableRow key={index}>
                            <TableCell>{issue.row}</TableCell>
                            <TableCell>{issue.column}</TableCell>
                            <TableCell>{issue.issue}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  
                  <div className="mt-4 flex justify-end">
                    <Button onClick={resetImport}>
                      Upload New File
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {(uploading || processing) && (
              <Card className="mt-6">
                <CardContent className="pt-6">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>{uploading ? "Uploading..." : "Processing..."}</span>
                      <span>{uploading ? uploadProgress : processingProgress}%</span>
                    </div>
                    <Progress value={uploading ? uploadProgress : processingProgress} />
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
          
          <div>
            <Card>
              <CardHeader>
                <CardTitle>CSV Preview</CardTitle>
                <CardDescription>
                  Preview of your CSV data
                </CardDescription>
              </CardHeader>
              <CardContent>
                {csvData ? (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          {csvData.headers.map((header, index) => (
                            <TableHead key={index} className="whitespace-nowrap">
                              {header}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvData.rows.map((row, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {row.map((cell, cellIndex) => (
                              <TableCell key={cellIndex} className="truncate max-w-xs">
                                {cell}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <FileText className="h-10 w-10 mx-auto mb-2" />
                    <p>Upload a CSV file to see preview</p>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>Required Columns</CardTitle>
                <CardDescription>
                  Your CSV should include these fields
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Accordion type="single" collapsible defaultValue="basics">
                  <AccordionItem value="basics">
                    <AccordionTrigger>Basic Fields (Required)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Badge>first_name</Badge>
                        <Badge>last_name</Badge>
                        <Badge>email</Badge>
                        <Badge>company_name</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        Alternatively, you can use the legacy fields: name, company, and email
                      </p>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="prospect">
                    <AccordionTrigger>Prospect Fields (Optional)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Badge variant="outline">job_title</Badge>
                        <Badge variant="outline">department</Badge>
                        <Badge variant="outline">tenure_months</Badge>
                        <Badge variant="outline">notable_achievement</Badge>
                        <Badge variant="outline">city</Badge>
                        <Badge variant="outline">state</Badge>
                        <Badge variant="outline">country</Badge>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                  
                  <AccordionItem value="company">
                    <AccordionTrigger>Company Fields (Optional)</AccordionTrigger>
                    <AccordionContent>
                      <div className="space-y-2">
                        <Badge variant="outline">industry</Badge>
                        <Badge variant="outline">employee_count</Badge>
                        <Badge variant="outline">annual_revenue</Badge>
                        <Badge variant="outline">funding_stage</Badge>
                        <Badge variant="outline">growth_signals</Badge>
                        <Badge variant="outline">recent_news</Badge>
                        <Badge variant="outline">technography</Badge>
                        <Badge variant="outline">description</Badge>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ErrorBoundary>
  );
}