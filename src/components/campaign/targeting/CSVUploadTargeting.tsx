// src/components/campaign/targeting/CSVUploadTargeting.tsx
"use client";

import { useState, useRef } from "react";
import { Upload, FileText, AlertCircle, Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import { Prospect } from "@/types";

interface CSVUploadTargetingProps {
  onProspectsUploaded: (prospects: Array<Prospect>) => void;
}

export function CSVUploadTargeting({ onProspectsUploaded }: CSVUploadTargetingProps) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    
    if (selectedFile) {
      if (!selectedFile.name.endsWith('.csv')) {
        setError("Please select a CSV file");
        return;
      }
      
      if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size must be less than 5MB");
        return;
      }
      
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const processCSV = async () => {
    if (!file) return;

    setUploading(true);
    setProgress(0);
    setError(null);

    try {
      // Simulate file reading and processing
      const text = await file.text();
      const lines = text.split('\n').filter(line => line.trim());
      
      if (lines.length < 2) {
        throw new Error("CSV file must contain at least a header row and one data row");
      }

      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      // Validate required headers
      const requiredHeaders = ['email'];
      const missingHeaders = requiredHeaders.filter(h => !headers.includes(h));
      
      if (missingHeaders.length > 0) {
        throw new Error(`Missing required columns: ${missingHeaders.join(', ')}`);
      }

      // Process rows with progress updates
      const prospects = [];
      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        
        if (values.length !== headers.length) {
          console.warn(`Row ${i + 1} has incorrect number of columns, skipping`);
          continue;
        }

        const prospect: Partial<Prospect> = {
          id: `csv-${i}`,
        };

        headers.forEach((header, index) => {
          const value = values[index]?.replace(/"/g, '');
          
          switch (header) {
            case 'email':
              prospect.email = value;
              break;
            case 'first_name':
            case 'firstname':
              prospect.firstName = value;
              break;
            case 'last_name':
            case 'lastname':
              prospect.lastName = value;
              break;
            case 'name':
              // Split full name into first/last
              const nameParts = value.split(' ');
              prospect.firstName = nameParts[0] || '';
              prospect.lastName = nameParts.slice(1).join(' ') || '';
              break;
            case 'title':
            case 'job_title':
              prospect.title = value;
              break;
            case 'company':
            case 'company_name':
              prospect.companyName = value;
              break;
            case 'department':
              prospect.department = value;
              break;
            case 'city':
              prospect.city = value;
              break;
            case 'state':
              prospect.state = value;
              break;
            case 'country':
              prospect.country = value;
              break;
          }
        });

        // Validate required fields
        if (!prospect.email) {
          console.warn(`Row ${i + 1} missing email, skipping`);
          continue;
        }

        // Set defaults if names are missing
        if (!prospect.firstName && !prospect.lastName) {
          prospect.firstName = prospect.email.split('@')[0];
          prospect.lastName = '';
        }

        prospects.push(prospect);

        // Update progress
        setProgress(Math.round((i / (lines.length - 1)) * 100));
        
        // Simulate processing delay
        if (i % 10 === 0) {
          await new Promise(resolve => setTimeout(resolve, 50));
        }
      }

      if (prospects.length === 0) {
        throw new Error("No valid prospects found in CSV file");
      }

      setSuccess(true);
      onProspectsUploaded(prospects as Array<Prospect>);

    } catch (error) {
      setError(error instanceof Error ? error.message : "Failed to process CSV file");
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const resetUpload = () => {
    setFile(null);
    setError(null);
    setSuccess(false);
    setProgress(0);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Upload CSV File</CardTitle>
        <CardDescription>
          Upload a CSV file containing your prospect data
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!file && !success && (
          <div className="border-2 border-dashed rounded-md p-6 text-center">
            <Upload className="h-10 w-10 text-muted-foreground mx-auto mb-4" />
            <div className="space-y-2">
              <Label htmlFor="csv-upload" className="text-lg font-medium cursor-pointer">
                Choose CSV file or drag & drop
              </Label>
              <p className="text-sm text-muted-foreground">
                File should include columns: email, first_name, last_name, title, company
              </p>
              <Input
                ref={fileInputRef}
                id="csv-upload"
                type="file"
                accept=".csv"
                onChange={handleFileSelect}
                className="hidden"
              />
              <Button 
                variant="outline" 
                onClick={() => fileInputRef.current?.click()}
                className="mt-2"
              >
                Browse Files
              </Button>
            </div>
          </div>
        )}

        {file && !success && (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-muted rounded">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <div>
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(2)} KB
                  </p>
                </div>
              </div>
              <Button variant="outline" size="sm" onClick={resetUpload}>
                Remove
              </Button>
            </div>

            {uploading && (
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Processing CSV...</span>
                  <span>{progress}%</span>
                </div>
                <Progress value={progress} />
              </div>
            )}

            {!uploading && (
              <Button onClick={processCSV} className="w-full">
                Process CSV File
              </Button>
            )}
          </div>
        )}

        {success && (
          <Alert>
            <Check className="h-4 w-4" />
            <AlertDescription>
              CSV file processed successfully! Prospects have been loaded and are ready for the campaign.
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="text-sm text-muted-foreground space-y-1">
          <p><strong>CSV Requirements:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>Required: email column</li>
            <li>Recommended: first_name, last_name, title, company columns</li>
            <li>Maximum file size: 5MB</li>
            <li>Encoding: UTF-8</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}