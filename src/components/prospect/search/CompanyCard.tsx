"use client";

import Link from "next/link";
import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Company } from "@/types";

interface CompanyCardProps {
  company: Company;
  isSelected: boolean;
  onSelect: () => void;
}

export function CompanyCard({ company, isSelected, onSelect }: CompanyCardProps) {
  return (
    <Card className={`${isSelected ? 'border-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-lg font-semibold">{company.name}</h3>
            <div className="flex items-center gap-2 mt-1">
              {company.industry && (
                <Badge variant="secondary">{company.industry}</Badge>
              )}
              {company.size && (
                <Badge variant="outline">{company.size} employees</Badge>
              )}
            </div>
            
            <div className="flex items-center gap-1 mt-2 text-sm">
              {company.domain && (
                <Link 
                  href={company.domain} 
                  target="_blank" 
                  className="text-blue-600 hover:underline"
                >
                  {company.domain}
                </Link>
              )}
            </div>
          </div>
          
          <Button
            variant={isSelected ? "default" : "outline"}
            size="sm"
            onClick={onSelect}
          >
            {isSelected ? (
              <>
                <Check className="mr-1 h-4 w-4" />
                Selected
              </>
            ) : "Select"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}