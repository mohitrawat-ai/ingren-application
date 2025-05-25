// src/components/campaign/targeting/ProfileListSelector.tsx
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

import { getProfileListsForCampaigns } from "@/lib/actions/profile";

interface ProfileListForCampaign {
  id: number;
  name: string;
  description: string | null;
  profileCount: number;
  createdAt: Date;
  usedInCampaigns: boolean;
  campaignCount: number;
}

interface ProfileListSelectorProps {
  selectedListId?: number;
  onSelect: (listId: number, listName: string, profileCount: number) => void;
}

export function ProfileListSelector({ 
  selectedListId, 
  onSelect 
}: ProfileListSelectorProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [profileLists, setProfileLists] = useState<ProfileListForCampaign[]>([]);

  useEffect(() => {
    loadProfileLists();
  }, []);

  const loadProfileLists = async () => {
    try {
      setLoading(true);
      const lists = await getProfileListsForCampaigns();
      setProfileLists(lists);
    } catch (error) {
      console.error("Failed to load profile lists:", error);
    } finally {
      setLoading(false);
    }
  };

  const selectedList = profileLists.find(list => list.id === selectedListId);

  const handleSelect = (list: ProfileListForCampaign) => {
    onSelect(list.id, list.name, list.profileCount);
    setOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Select Profile List</CardTitle>
        <CardDescription>
          Choose an existing profile list to target for this campaign
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
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
                  {selectedList ? selectedList.name : "Select profile list..."}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search profile lists..." />
                  <CommandList>
                    <CommandEmpty>No profile lists found.</CommandEmpty>
                    <CommandGroup>
                      {profileLists.map((list) => (
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
                                  {list.profileCount} profiles
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
                        {selectedList.profileCount} profiles
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

            {profileLists.length === 0 && (
              <div className="text-center py-8">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-medium mb-2">No Profile Lists Found</h3>
                <p className="text-muted-foreground mb-4">
                  Create profile lists by searching and saving profiles first.
                </p>
                <Button asChild>
                  <a href="/profiles/search" target="_blank" rel="noopener noreferrer">
                    Create Profile List
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}