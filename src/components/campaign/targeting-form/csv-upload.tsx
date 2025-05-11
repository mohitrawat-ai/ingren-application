"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X, HelpCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormLabel, FormDescription } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { saveCSVFile, parseCSVFile } from "@/lib/actions/uploads";
import { CSVContact } from "./types";

interface CSVUploadProps {
  onCSVProcessed: (contacts: CSVContact[], fileName: string) => void;
  onClearCSV: () => void;
}

export function CSVUpload({ onCSVProcessed, onClearCSV }: CSVUploadProps) {
  const [file, setFile] = useState<File | null>(null);
  const [alertOpen, setAlertOpen] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [contactCount, setContactCount] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast.error("Please upload a CSV file");
        return;
      }
      
      setFile(file);
      setAlertOpen(true);
    }
  };

  const handleUploadClick = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };
// src/components/campaign/targeting-form/csv-upload.tsx (Updated processCSV function)

const processCSV = async () => {
  if (!file) return;

  setUploading(true);
  try {
    // Read file as ArrayBuffer
    const buffer = await file.arrayBuffer();
    
    // Save file to server
    const { fileName } = await saveCSVFile(buffer);
    
    // Parse CSV file
    const contacts = await parseCSVFile(`uploads/${fileName}`);
    
    // Make sure we have contacts
    if (!contacts || contacts.length === 0) {
      toast.error("No valid contacts found in CSV file");
      setUploading(false);
      setAlertOpen(false);
      return;
    }
    
    // Set contact count for display
    setContactCount(contacts.length);
    
    // Send contacts to parent component
    onCSVProcessed(contacts, fileName);
    
    toast.success(`Successfully imported ${contacts.length} contacts from CSV`);
  } catch (error) {
    console.error("Error processing CSV:", error);
    toast.error("Failed to process CSV file");
  } finally {
    setUploading(false);
    setAlertOpen(false);
  }
};

  const clearCSV = () => {
    setFile(null);
    setContactCount(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
    onClearCSV();
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
      "Expanding to new markets", "Just raised $30M in funding", "React, Node.js, AWS", "Leading provider of widgets",
      // Legacy fields
      "", "", "", "john.smith@acmecorp.com", "San Francisco", "CA", "USA"
    ].join(",");
    
    const sampleRow2 = [
      // Basic contact fields
      "Jane", "Doe", "CTO", "Technology", "36", "Led digital transformation initiative",
      // Basic company fields
      "TechNova", "Software", "100-500", "$10M-$50M", "Series B", 
      "Hiring rapidly", "New product launch", "Python, TensorFlow, GCP", "AI-powered analytics platform",
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

  return (
    <div className="space-y-4">
      <div>
        <div className="flex items-center gap-2">
          <FormLabel>Upload Audience CSV</FormLabel>
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="ghost" size="icon" className="h-5 w-5">
                <HelpCircle className="h-4 w-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4">
              <h4 className="font-medium mb-2">Supported CSV Fields</h4>
              <p className="text-sm mb-2">Your CSV should include these fields:</p>
              
              <h5 className="font-medium text-xs mt-3 mb-1">PROSPECT DATA</h5>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>first_name</li>
                <li>last_name</li>
                <li>job_title</li>
                <li>department</li>
                <li>tenure_months</li>
                <li>notable_achievement</li>
              </ul>
              
              <h5 className="font-medium text-xs mt-3 mb-1">COMPANY DATA</h5>
              <ul className="text-xs space-y-1 list-disc pl-4">
                <li>company_name</li>
                <li>industry</li>
                <li>employee_count</li>
                <li>annual_revenue</li>
                <li>funding_stage</li>
                <li>growth_signals</li>
                <li>recent_news</li>
                <li>technography</li>
                <li>description</li>
              </ul>
              
              <p className="text-xs text-muted-foreground mt-3">
                You can also include email, city, state, and country fields.
              </p>
            </PopoverContent>
          </Popover>
        </div>
        
        <FormDescription>
          Upload a CSV file with your audience contacts. The CSV must include contact and company information.
          <Button 
            variant="link" 
            onClick={downloadSampleCSV} 
            className="h-auto p-0 text-xs"
          >
            Download sample CSV
          </Button>
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
            disabled={uploading}
          >
            <Upload className="mr-2 h-4 w-4" />
            {file ? 'Change CSV File' : 'Upload CSV File'}
          </Button>
          
          {file && (
            <Button
              type="button"
              variant="ghost"
              onClick={clearCSV}
              className="text-destructive"
              disabled={uploading}
            >
              <X className="mr-2 h-4 w-4" />
              Clear CSV
            </Button>
          )}
        </div>
        
        {file && (
          <div className="mt-4 p-4 border rounded-md">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-5 w-5 mr-2 text-primary" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB • Uploaded
                  </p>
                </div>
              </div>
              
              {contactCount > 0 && (
                <Badge>
                  {contactCount} contacts
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
      
      <AlertDialog open={alertOpen} onOpenChange={setAlertOpen}>
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
              setFile(null);
              if (fileInputRef.current) {
                fileInputRef.current.value = '';
              }
            }}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={processCSV} disabled={uploading}>
              {uploading ? 'Processing...' : 'Continue'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}