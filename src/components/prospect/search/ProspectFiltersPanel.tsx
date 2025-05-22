"use client";

import { Checkbox } from "@/components/ui/checkbox";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import { useProspectSearchStore } from "@/stores/prospectStore";

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

export function ProspectFiltersPanel() {
  const { prospectFilters, updateProspectFilter } = useProspectSearchStore();

  const handleTitleChange = (title: string) => {
    updateProspectFilter('titles', title);
  };

  const handleDepartmentChange = (department: string) => {
    updateProspectFilter('departments', department);
  };

  const handleSeniorityChange = (seniority: string) => {
    updateProspectFilter('seniorities', seniority);
  };

  return (
    <Accordion type="multiple" className="w-full" defaultValue={["titles", "departments", "seniority"]}>
      <AccordionItem value="titles">
        <AccordionTrigger className="py-2">Job Titles</AccordionTrigger>
        <AccordionContent>
          <div className="space-y-2">
            {titleOptions.map(title => (
              <div key={title} className="flex items-center space-x-2">
                <Checkbox 
                  id={`title-${title}`} 
                  checked={prospectFilters.titles.includes(title)}
                  onCheckedChange={() => handleTitleChange(title)}
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
                  checked={prospectFilters.departments.includes(department)}
                  onCheckedChange={() => handleDepartmentChange(department)}
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
                  checked={prospectFilters.seniorities.includes(seniority)}
                  onCheckedChange={() => handleSeniorityChange(seniority)}
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