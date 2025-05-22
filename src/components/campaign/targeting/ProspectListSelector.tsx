// src/components/campaign/targeting/ProspectListSelector.tsx
"use client";

import { useEffect, useState } from "react";
import { Users, Calendar, ChevronDown, Check } from "lucide-react";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

import { useProspectListStore } from "@/stores/prospectListStore";

interface ProspectListSelectorProps {
  selectedListId?: number;
  onSelect: (listId: number, listName: string, prospectCount: number) => void;
}

export function ProspectListSelector({ 
  selectedListId, 
  onSelect 
}: ProspectListSelectorProps) {
  const [open, setOpen] = useState(false);
  const { 
    campaignLists, 
    loadingCampaignLists, 
    fetchCampaignLists 
  } = useProspectListStore();

  useEffect(() => {
    fetchCampaignLists();
  }, [fetchCampaignLists]);

  const selectedList = campaignLists.find(list => list.id === selectedListId);

  const handleSelect = (list: typeof campaignLists[0]) => {
    onSelect(list.id, list.name, list.prospectCount);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Prospect List</CardTitle>
        <CardDescription>
          Choose an existing prospect list to target for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loadingCampaignLists ? (
          <div className="space-y-2">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        ) : (
          <div className="space-y-4">
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedList ? selectedList.name : "Select prospect list..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search prospect lists..." />
                  <CommandList>
                    <CommandEmpty>No prospect lists found.</CommandEmpty>
                    <CommandGroup>
                      {campaignLists.map((list) => (
                        <CommandItem
                          key={list.id}
                          value={list.name}
                          onSelect={() => handleSelect(list)}
                        >
                          <div className="flex items-center justify-between w-full">
                            <div className="flex items-center">
                              <Users className="mr-2 h-4 w-4" />
                              <div>
                                <div className="font-medium">{list.name}</div>
                                {list.description && (
                                  <div className="text-xs text-muted-foreground">
                                    {list.description}
                                  </div>
                                )}
                                <div className="text-xs text-muted-foreground">
                                  {list.prospectCount} prospects
                                </div>
                              </div>
                            </div>
                            <Check
                              className={`ml-auto h-4 w-4 ${
                                selectedListId === list.id ? "opacity-100" : "opacity-0"
                              }`}
                            />
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>

            {selectedList && (
              <div className="p-4 bg-muted rounded-lg">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-medium">{selectedList.name}</h4>
                    {selectedList.description && (
                      <p className="text-sm text-muted-foreground mt-1">
                        {selectedList.description}
                      </p>
                    )}
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline">
                        {selectedList.prospectCount} prospects
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        <Calendar className="mr-1 h-3 w-3" />
                        {new Date(selectedList.createdAt).toLocaleDateString()}
                      </Badge>
                      {selectedList.usedInCampaigns && (
                        <Badge variant="secondary">
                          Used in {selectedList.campaignCount} campaigns
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

