"use client";

import { Building, Mail, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Card,
  CardContent,
} from "@/components/ui/card";

import { Prospect } from "@/types";

interface ProspectCardProps {
  prospect: Prospect;
  isSelected: boolean;
  onSelect: () => void;
}

export function ProspectCard({ prospect, isSelected, onSelect }: ProspectCardProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className={`${isSelected ? 'border-primary' : ''}`}>
      <CardContent className="p-4">
        <div className="flex items-start gap-4">
          <Avatar>
            <AvatarFallback>
              {getInitials(prospect.firstName + " " + prospect.lastName)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1">
            <div className="flex justify-between">
              <h3 className="font-semibold">{prospect.firstName} {prospect.lastName}</h3>
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
            
            <div className="flex items-center gap-2 mt-1">
              <Badge variant="secondary">{prospect.title}</Badge>
              {prospect.department && (
                <Badge variant="outline">{prospect.department}</Badge>
              )}
            </div>
            
            <div className="flex items-center mt-2">
              <Building className="h-4 w-4 mr-1 text-muted-foreground" />
              <span className="text-sm">{prospect.companyName}</span>
            </div>
            
            {prospect.email && (
              <div className="flex items-center mt-1">
                <Mail className="h-4 w-4 mr-1 text-muted-foreground" />
                <span className="text-sm">{prospect.email}</span>
              </div>
            )}
            
            {(prospect.country) && (
              <div className="text-sm text-muted-foreground mt-1">
                {prospect.country}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}