// src/lib/utils/entity-filters.ts
import { getTableColumns } from "drizzle-orm";
import { createOwnershipFilter } from "./ownership-filters";
import { targetLists } from "@/lib/schema";
// Import other tables as needed

export const ownershipFilters = {
    
  // Add more as you need them
  targetLists: (userId: string, id?: number, type?: string) => 
    createOwnershipFilter(getTableColumns(targetLists), userId, { id, type }),
};