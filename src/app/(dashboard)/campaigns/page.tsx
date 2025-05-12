"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { 
  ChevronDown, 
  Plus, 
  Edit, 
  Play, 
  Pause, 
  Trash2} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { 
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
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

import { getCampaigns, updateCampaignStatus, deleteCampaign } from "@/lib/actions/campaign";

import { Campaign } from "@/lib/schema";

type CampaignExtra = Campaign & {
  statistics: {
    sentEmails: number;
    openRate: string;
    clickRate: string;
  }
}


export default function CampaignsPage() {
  const [campaigns, setCampaigns] = useState<CampaignExtra[]>([]);
  const [loading, setLoading] = useState(true);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [campaignToDelete, setCampaignToDelete] = useState<Campaign | null>(null);

  useEffect(() => {
    const loadCampaigns = async () => {
      try {
        setLoading(true);
        const data = await getCampaigns();
        setCampaigns(data);
      } catch (error) {
        toast.error("Failed to load campaigns");
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadCampaigns();
  }, []);

  const handleStatusUpdate = async (id: number, status: "draft" | "active" | "paused") => {
    try {
      await updateCampaignStatus(id, status);
      setCampaigns(
        campaigns.map((campaign) =>
          campaign.id === id ? { ...campaign, status } : campaign
        )
      );
      toast.success(`Campaign ${status === "active" ? "started" : "paused"} successfully`);
    } catch (error) {
      toast.error("Failed to update campaign status");
      console.error(error);
    }
  };

  const openDeleteDialog = (campaign: Campaign) => {
    setCampaignToDelete(campaign);
    setDeleteDialogOpen(true);
  };

  const handleDelete = async () => {
    if (!campaignToDelete) return;
    
    try {
      await deleteCampaign(campaignToDelete.id);
      setCampaigns(campaigns.filter(c => c.id !== campaignToDelete.id));
      toast.success("Campaign deleted successfully");
      setDeleteDialogOpen(false);
    } catch (error) {
      toast.error("Failed to delete campaign");
      console.error(error);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge variant="default">Active</Badge>;
      case "paused":
        return <Badge variant="outline">Paused</Badge>;
      case "draft":
        return <Badge variant="outline">Draft</Badge>;
      case "completed":
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Campaigns</h1>
        <Button asChild>
          <Link href="/campaigns/new">
            <Plus className="mr-2 h-4 w-4" /> Create Campaign
          </Link>
        </Button>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            Manage your outreach campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="flex items-center space-x-4">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : campaigns.length === 0 ? (
            <div className="text-center py-6">
              <h3 className="text-lg font-medium">No campaigns yet</h3>
              <p className="text-muted-foreground mt-2">
                Create your first campaign to start reaching out
              </p>
              <Button asChild className="mt-4">
                <Link href="/campaigns/new">
                  <Plus className="mr-2 h-4 w-4" /> Create Campaign
                </Link>
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Sent</TableHead>
                  <TableHead className="text-right">Open Rate</TableHead>
                  <TableHead className="text-right">Click Rate</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {campaigns.map((campaign) => (
                  <TableRow key={campaign.id}>
                    <TableCell className="font-medium">
                      <Link href={`/campaigns/${campaign.id}`} className="hover:underline">
                        {campaign.name}
                      </Link>
                    </TableCell>
                    <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                    <TableCell className="text-right">{campaign.statistics.sentEmails}</TableCell>
                    <TableCell className="text-right">{campaign.statistics.openRate}</TableCell>
                    <TableCell className="text-right">{campaign.statistics.clickRate}</TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <ChevronDown className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem asChild>
                            <Link href={`/campaigns/${campaign.id}`}>
                              <Edit className="mr-2 h-4 w-4" /> View
                            </Link>
                          </DropdownMenuItem>
                          {campaign.status === "active" ? (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(campaign.id, "paused")}>
                              <Pause className="mr-2 h-4 w-4" /> Pause
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => handleStatusUpdate(campaign.id, "active")}>
                              <Play className="mr-2 h-4 w-4" /> Start
                            </DropdownMenuItem>
                          )}
                          <DropdownMenuItem 
                            className="text-destructive focus:text-destructive"
                            onClick={() => openDeleteDialog(campaign)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
      
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the campaign &quot;{campaignToDelete?.name}&quot;. 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={handleDelete}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}