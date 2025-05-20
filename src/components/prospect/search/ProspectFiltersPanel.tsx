"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { ProspectFilters } from "../types";

interface ProspectFiltersPanelProps {
  filters: ProspectFilters;
  onTitleChange: (title: string) => void;
  onDepartmentChange: (department: string) => void;
  onSeniorityChange: (seniority: string) => void;
}

// Sample job title options
const titleOptions = [
  "CEO", "CTO", "CFO", "CIO", "VP of Sales", "VP of Marketing",
  "Director of Engineering", "Product Manager", "Marketing Manager"
];

// Sample department options
const departmentOptions = [
  "Engineering", "Sales", "Marketing", "Finance", 
  "Human Resources", "Operations", "Product", "Legal"
];

// Sample seniority options
const seniorityOptions = [
  "C-Level", "VP", "Director", "Manager", "Individual Contributor"
];

export function ProspectFiltersPanel({ 
  filters, 
  onTitleChange, 
  onDepartmentChange, 
  onSeniorityChange 
}: ProspectFiltersPanelProps) {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="titles">
        <AccordionTrigger className="py-2">Job Titles</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {titleOptions.map(title => (
              <div key={title} className="flex items-center space-x-2">
                <Checkbox 
                  id={`title-${title}`} 
                  checked={filters.titles.includes(title)}
                  onCheckedChange={() => onTitleChange(title)}
                />
                <label
                  htmlFor={`title-${title}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {title}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="departments">
        <AccordionTrigger className="py-2">Departments</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {departmentOptions.map(department => (
              <div key={department} className="flex items-center space-x-2">
                <Checkbox 
                  id={`department-${department}`} 
                  checked={filters.departments.includes(department)}
                  onCheckedChange={() => onDepartmentChange(department)}
                />
                <label
                  htmlFor={`department-${department}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {department}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
      
      <AccordionItem value="seniority">
        <AccordionTrigger className="py-2">Seniority</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {seniorityOptions.map(seniority => (
              <div key={seniority} className="flex items-center space-x-2">
                <Checkbox 
                  id={`seniority-${seniority}`} 
                  checked={filters.seniorities.includes(seniority)}
                  onCheckedChange={() => onSeniorityChange(seniority)}
                />
                <label
                  htmlFor={`seniority-${seniority}`}
                  className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {seniority}
                </label>
              </div>
            ))}
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}