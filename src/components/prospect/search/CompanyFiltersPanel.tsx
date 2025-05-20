"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { CompanyFilters } from "../types";

interface CompanyFiltersPanelProps {
  filters: CompanyFilters;
  onIndustryChange: (industry: string) => void;
  onEmployeeSizeChange: (size: string) => void;
}

// Sample industry options (these would come from an API)
const industryOptions = [
  "Technology", "Healthcare", "Finance", "Education", 
  "Manufacturing", "Retail", "Media", "Government"
];

// Sample employee size options
const employeeSizeOptions = [
  "1-10", "11-50", "51-200", "201-500", 
  "501-1000", "1001-5000", "5001-10000", "10000+"
];

export function CompanyFiltersPanel({ 
  filters, 
  onIndustryChange, 
  onEmployeeSizeChange 
}: CompanyFiltersPanelProps) {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="industries">
        <AccordionTrigger className="py-2">Industries</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {industryOptions.map(industry => (
              <div key={industry} className="flex items-center space-x-2">
                <Checkbox 
                  id={`industry-${industry}`} 
                  checked={filters.industries.includes(industry)}
                  onCheckedChange={() => onIndustryChange(industry)}
                />
                <label
                  htmlFor={`industry-${industry}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {industry}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="employeeSize">
        <AccordionTrigger className="py-2">Employee Size</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {employeeSizeOptions.map(size => (
              <div key={size} className="flex items-center space-x-2">
                <Checkbox 
                  id={`size-${size}`} 
                  checked={filters.employeeSizes.includes(size)}
                  onCheckedChange={() => onEmployeeSizeChange(size)}
                />
                <label
                  htmlFor={`size-${size}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {size}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}