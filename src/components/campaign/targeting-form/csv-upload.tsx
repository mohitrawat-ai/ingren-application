// src/components/campaign/targeting-form/csv-upload.tsx
"use client";

import { useRef, useState } from "react";
import { FileText, Upload, X } from "lucide-react";
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

  return (
    <div className="space-y-4">
      <div>
        <FormLabel>Upload Audience CSV</FormLabel>
        <FormDescription>
          Upload a CSV file with your audience contacts. The CSV must include name, title, and company columns.
          Additional supported columns: email, city, state, country.
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