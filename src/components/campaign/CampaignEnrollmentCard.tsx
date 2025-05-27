// src/components/campaign/CampaignEnrollmentCard.tsx
"use client";

import { Users, Calendar, List, TrendingUp } from "lucide-react";
import Link from "next/link";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";

interface CampaignEnrollmentCardProps {
  enrollment: {
    id: number;
    sourceTargetListId: number;
    sourceTargetListName: string;
    enrollmentDate: Date;
    contactCount: number;
    status: string;
    snapshotData: Record<string, unknown>;
  };
  emailStats?: {
    sent: number;
    opened: number;
    clicked: number;
    replied: number;
  };
}

export function CampaignEnrollmentCard({ 
  enrollment, 
  emailStats 
}: CampaignEnrollmentCardProps) {
  const openRate = emailStats?.sent ? (emailStats.opened / emailStats.sent) * 100 : 0;
  const clickRate = emailStats?.sent ? (emailStats.clicked / emailStats.sent) * 100 : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{enrollment.sourceTargetListName}</CardTitle>
          <Badge 
            variant={enrollment.status === 'active' ? 'default' : 'secondary'}
          >
            {enrollment.status}
          </Badge>
        </div>
        <CardDescription>
          Enrolled on {new Date(enrollment.enrollmentDate).toLocaleDateString()}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">{enrollment.contactCount}</p>
              <p className="text-xs text-muted-foreground">Total Contacts</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">
                {new Date(enrollment.enrollmentDate).toLocaleDateString()}
              </p>
              <p className="text-xs text-muted-foreground">Enrolled</p>
            </div>
          </div>
        </div>

        {emailStats && (
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm">
              <span>Email Performance</span>
              <span className="text-muted-foreground">
                {emailStats.sent} sent
              </span>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span>Open Rate</span>
                <span>{openRate.toFixed(1)}%</span>
              </div>
              <Progress value={openRate} className="h-2" />
              
              <div className="flex items-center justify-between text-xs">
                <span>Click Rate</span>
                <span>{clickRate.toFixed(1)}%</span>
              </div>
              <Progress value={clickRate} className="h-2" />
            </div>

            <div className="grid grid-cols-3 gap-2 text-center text-xs">
              <div>
                <p className="font-medium">{emailStats.opened}</p>
                <p className="text-muted-foreground">Opened</p>
              </div>
              <div>
                <p className="font-medium">{emailStats.clicked}</p>
                <p className="text-muted-foreground">Clicked</p>
              </div>
              <div>
                <p className="font-medium">{emailStats.replied}</p>
                <p className="text-muted-foreground">Replied</p>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/profile-lists/${enrollment.sourceTargetListId}`}>
              <List className="mr-1 h-3 w-3" />
              View List
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="flex-1">
            <Link href={`/campaigns/${enrollment.id}/enrollment/${enrollment.id}`}>
              <TrendingUp className="mr-1 h-3 w-3" />
              Details
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

