// src/components/campaign/CampaignsList.tsx - Enhanced version
"use client";

import Link from "next/link";
import { 
  MailPlus, 
  Play, 
  Pause, 
  MoreHorizontal, 
  Eye, 
  Edit, 
  Trash2,
  Users,
  Calendar
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: number;
  name: string;
  description: string | null;
  status: string;
  createdAt: Date;
  totalContacts: number;
  sourceListNames: string[];
  isNewSystem: boolean;
  enrollmentCount: number;
}

interface CampaignsListProps {
  campaigns: Campaign[];
  loading: boolean;
  onStatusChange: (campaignId: number, newStatus: string) => void;
  onDelete: (campaignId: number) => void;
}

export function CampaignsList({ 
  campaigns, 
  loading, 
  onStatusChange, 
  onDelete 
}: CampaignsListProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'draft':
        return 'secondary';
      case 'scheduled':
        return 'outline';
      case 'running':
        return 'default';
      case 'paused':
        return 'destructive';
      case 'completed':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const canStart = (status: string) => {
    return ['draft', 'paused'].includes(status);
  };

  const canPause = (status: string) => {
    return status === 'running';
  };

  if (loading) {
    return (
      <div className="grid gap-4">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-32" />
            </CardHeader>
            <CardContent>
              <Skeleton className="h-20 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-4">
      {campaigns.map((campaign) => (
        <Card key={campaign.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Link 
                    href={`/campaigns/${campaign.id}`}
                    className="hover:underline"
                  >
                    {campaign.name}
                  </Link>
                  <Badge variant={getStatusColor(campaign.status)}>
                    {campaign.status}
                  </Badge>
                  {campaign.isNewSystem && (
                    <Badge variant="outline" className="text-xs">
                      New System
                    </Badge>
                  )}
                </CardTitle>
                {campaign.description && (
                  <CardDescription className="mt-1">
                    {campaign.description}
                  </CardDescription>
                )}
              </div>
              
              <div className="flex items-center gap-2">
                {canStart(campaign.status) && (
                  <Button
                    size="sm"
                    onClick={() => onStatusChange(campaign.id, 'running')}
                  >
                    <Play className="mr-1 h-3 w-3" />
                    Start
                  </Button>
                )}
                
                {canPause(campaign.status) && (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => onStatusChange(campaign.id, 'paused')}
                  >
                    <Pause className="mr-1 h-3 w-3" />
                    Pause
                  </Button>
                )}

                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/campaigns/${campaign.id}`}>
                        <Eye className="mr-2 h-4 w-4" />
                        View Details
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href={`/campaigns/${campaign.id}/edit`}>
                        <Edit className="mr-2 h-4 w-4" />
                        Edit Campaign
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-destructive focus:text-destructive"
                      onClick={() => onDelete(campaign.id)}
                      disabled={campaign.status === 'running'}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Campaign
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </CardHeader>
          
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div className="flex items-center gap-2">
                <Users className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">{campaign.totalContacts}</p>
                  <p className="text-muted-foreground">Contacts</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="font-medium">
                    {new Date(campaign.createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-muted-foreground">Created</p>
                </div>
              </div>
              
              {campaign.isNewSystem && (
                <div className="flex items-center gap-2">
                  <MailPlus className="h-4 w-4 text-muted-foreground" />
                  <div>
                    <p className="font-medium">{campaign.enrollmentCount}</p>
                    <p className="text-muted-foreground">Enrollments</p>
                  </div>
                </div>
              )}
              
              {campaign.sourceListNames.length > 0 && (
                <div className="col-span-2 md:col-span-1">
                  <p className="text-muted-foreground text-xs mb-1">Source Lists:</p>
                  <div className="flex flex-wrap gap-1">
                    {campaign.sourceListNames.slice(0, 2).map((listName, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {listName}
                      </Badge>
                    ))}
                    {campaign.sourceListNames.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{campaign.sourceListNames.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}