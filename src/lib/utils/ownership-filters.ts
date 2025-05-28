// src/lib/utils/ownership-filters.ts
import { and, eq, type SQL } from "drizzle-orm";
import { type PgColumn } from "drizzle-orm/pg-core";

// Generic type that ensures the table has userId and optional id/type columns
type OwnedTable = {
  userId: PgColumn;
  id?: PgColumn;
  type?: PgColumn;
  [key: string]: unknown; // Allow other columns
};

export function createOwnershipFilter<T extends OwnedTable>(
  table: T,
  userId: string,
  options: {
    id?: number | string;
    type?: string;
    additionalFilters?: SQL[];
  } = {}
): SQL {
  const filters: SQL[] = [eq(table.userId, userId)];
  
  if (options.id !== undefined && table.id) {
    filters.push(eq(table.id, options.id));
  }
  
  if (options.type !== undefined && table.type) {
    filters.push(eq(table.type, options.type));
  }
  
  if (options.additionalFilters?.length) {
    filters.push(...options.additionalFilters);
  }
  
  return and(...filters)!;
}