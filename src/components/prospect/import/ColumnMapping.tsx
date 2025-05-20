// src/components/prospect/import/ColumnMapping.tsx
import { useState, useEffect } from "react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ArrowDown } from "lucide-react";

interface ColumnMappingProps {
  csvHeaders: string[];
  requiredFields: string[];
  optionalFields: string[];
  onColumnMapped: (mapping: Record<string, string>) => void;
  sampleData: string[][];
}

export function ColumnMapping({ 
  csvHeaders, 
  requiredFields, 
  optionalFields,
  onColumnMapped,
  sampleData
}: ColumnMappingProps) {
  const [mapping, setMapping] = useState<Record<string, string>>({});
  
  // Auto-map columns with exact name matches
  useEffect(() => {
    const initialMapping: Record<string, string> = {};
    
    csvHeaders.forEach(header => {
      const normalizedHeader = header.toLowerCase().trim();
      
      if (requiredFields.map(f => f.toLowerCase()).includes(normalizedHeader) || 
          optionalFields.map(f => f.toLowerCase()).includes(normalizedHeader)) {
        initialMapping[normalizedHeader] = header;
      }
    });
    
    setMapping(initialMapping);
  }, [csvHeaders, requiredFields, optionalFields]);
  
  const updateMapping = (fieldName: string, csvHeader: string) => {
    setMapping({
      ...mapping,
      [fieldName]: csvHeader,
    });
  };
  
  const handleConfirm = () => {
    // Validate that all required fields are mapped
    const missingRequiredFields = requiredFields.filter(
      field => !Object.keys(mapping).includes(field.toLowerCase())
    );
    
    if (missingRequiredFields.length > 0) {
      alert(`Please map all required fields: ${missingRequiredFields.join(", ")}`);
      return;
    }
    
    onColumnMapped(mapping);
  };
  
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-medium">Map Columns</h3>
        <p className="text-sm text-muted-foreground">
          Match your CSV columns to the required and optional fields.
        </p>
      </div>
      
      <div className="space-y-6">
        <div>
          <h4 className="text-sm font-medium mb-2">Required Fields</h4>
          <div className="space-y-2">
            {requiredFields.map(field => (
              <div key={field} className="flex items-center gap-2">
                <div className="w-1/3">{field}</div>
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                <div className="w-2/3">
                  <Select 
                    value={mapping[field.toLowerCase()]} 
                    onValueChange={(value) => updateMapping(field.toLowerCase(), value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      {csvHeaders.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-medium mb-2">Optional Fields</h4>
          <div className="space-y-2">
            {optionalFields.map(field => (
              <div key={field} className="flex items-center gap-2">
                <div className="w-1/3">{field}</div>
                <ArrowDown className="h-4 w-4 text-muted-foreground" />
                <div className="w-2/3">
                  <Select 
                    value={mapping[field.toLowerCase()]} 
                    onValueChange={(value) => updateMapping(field.toLowerCase(), value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="(Optional) Select a column" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">-- Ignore this field --</SelectItem>
                      {csvHeaders.map(header => (
                        <SelectItem key={header} value={header}>
                          {header}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              {csvHeaders.map((header, index) => (
                <TableHead key={index}>
                  {header}
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {sampleData.slice(0, 3).map((row, rowIndex) => (
              <TableRow key={rowIndex}>
                {row.map((cell, cellIndex) => (
                  <TableCell key={cellIndex}>{cell}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="flex justify-end">
        <Button onClick={handleConfirm}>Confirm Mapping</Button>
      </div>
    </div>
  );
}