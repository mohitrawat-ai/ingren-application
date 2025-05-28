import { SearchableMultiSelect } from "@/components/ui/searchable-multi-select";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";

import { FilterOption } from "@/types";

type ProfileFilterOptionsProps = {
    getSelectedCount: (path: string) => number;
    handleMultiSelectFilter: (path: string, values: string[]) => void;
    clearFilter: (path: string) => void;
    filterOptions: FilterOption[];
    selectedValues: string[];
    filterPath: string,
    placeholder: string,
    name: string,
    searchPlaceholder: string
}

export function ProfileSearchableMultiSelect(props : Readonly<ProfileFilterOptionsProps>) {
    return (
        <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">{props.name}</Label>
                {props.getSelectedCount(props.filterPath) > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => props.clearFilter(props.filterPath)}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <SearchableMultiSelect
                options={props.filterOptions}
                selectedValues={props.selectedValues}
                onSelectionChange={(values) => props.handleMultiSelectFilter(props.filterPath, values)}
                placeholder={props.placeholder}
                searchPlaceholder={props.searchPlaceholder}
                maxDisplay={2}
              />
            </div>
    )
}