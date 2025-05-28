// src/components/profile/ProfilePagination.tsx
"use client";

import { ChevronLeft, ChevronRight, MoreHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PAGINATION_CONFIG } from '@/lib/config/pagination';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

interface ProfilePaginationProps {
  currentPage: number;
  totalPages: number;
  totalResults: number;
  pageSize?: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (pageSize: number) => void;
  showPageSizeSelector?: boolean;
}

export function ProfilePagination({
  currentPage,
  totalPages,
  totalResults,
  pageSize = PAGINATION_CONFIG.DEFAULT_PAGE_SIZE,
  onPageChange,
  onPageSizeChange,
  showPageSizeSelector = true,
}: Readonly<ProfilePaginationProps>) {
  // Calculate the range of results being shown
  const startResult = ((currentPage - 1) * pageSize) + 1;
  const endResult = Math.min(currentPage * pageSize, totalResults);

  // Generate page numbers to show
  const getVisiblePages = (): (number | 'ellipsis')[] => {
    const pages: (number | 'ellipsis')[] = [];
    const maxVisiblePages = 7;

    if (totalPages <= maxVisiblePages) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }

    const isNearStart = currentPage <= 4;
    const isNearEnd = currentPage >= totalPages - 3;

    const addRange = (start: number, end: number) => {
      for (let i = start; i <= end; i++) {
        pages.push(i);
      }
    };

    pages.push(1); // Always show first page

    if (!isNearStart) pages.push('ellipsis');

    const currentPageOffset = isNearEnd ? totalPages - 4 : currentPage - 2;
    const currentPageOffsetPlusTwo = isNearEnd ? totalPages - 1 : currentPage + 2;
    const start = isNearStart ? 2 : currentPageOffset;
    const end = isNearStart ? 5 : currentPageOffsetPlusTwo;

    addRange(start, end);

    if (!isNearEnd) pages.push('ellipsis');

    pages.push(totalPages); // Always show last page

    return pages;
  };


  const visiblePages = getVisiblePages();

  // Page size options
  const pageSizeOptions = PAGINATION_CONFIG.PAGE_SIZE_OPTIONS;

  const handlePrevious = () => {
    if (currentPage > 1) {
      onPageChange(currentPage - 1);
    }
  };

  const handleNext = () => {
    if (currentPage < totalPages) {
      onPageChange(currentPage + 1);
    }
  };

  const handlePageClick = (page: number) => {
    onPageChange(page);
  };

  const handlePageSizeChange = (newPageSize: string) => {
    const size = parseInt(newPageSize);
    if (onPageSizeChange) {
      onPageSizeChange(size);
    }
  };

  if (totalResults === 0) {
    return null;
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-2">
      {/* Results info and page size selector */}
      <div className="flex flex-col sm:flex-row items-center gap-4 text-sm text-muted-foreground">
        <div>
          Showing <span className="font-medium">{startResult.toLocaleString()}</span> to{" "}
          <span className="font-medium">{endResult.toLocaleString()}</span> of{" "}
          <span className="font-medium">{totalResults.toLocaleString()}</span> results
        </div>

        {showPageSizeSelector && onPageSizeChange && (
          <div className="flex items-center gap-2">
            <span>Show</span>
            <Select value={pageSize.toString()} onValueChange={handlePageSizeChange}>
              <SelectTrigger className="w-16 h-8">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {pageSizeOptions.map((size) => (
                  <SelectItem key={size} value={size.toString()}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span>per page</span>
          </div>
        )}
      </div>

      {/* Pagination controls */}
      <div className="flex items-center gap-1">
        {/* Previous button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handlePrevious}
          disabled={currentPage === 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
          <span className="sr-only">Previous page</span>
        </Button>

        {/* Page numbers */}
        <div className="flex items-center gap-1">
          {visiblePages.map((page) => (
            page === 'ellipsis' ? (
              <div key={`ellipsis-${page}`} className="flex h-8 w-8 items-center justify-center">
                <MoreHorizontal className="h-4 w-4" />
              </div>
            ) : (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                onClick={() => handlePageClick(page)}
                className="h-8 w-8 p-0"
              >
                {page}
              </Button>
            )
          ))}
        </div>

        {/* Next button */}
        <Button
          variant="outline"
          size="sm"
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
          <span className="sr-only">Next page</span>
        </Button>
      </div>

      {/* Jump to page input for large datasets */}
      {totalPages > 10 && (
        <div className="flex items-center gap-2 text-sm">
          <span>Go to page:</span>
          <input
            type="number"
            min={1}
            max={totalPages}
            defaultValue={currentPage}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                const target = e.target as HTMLInputElement;
                const page = parseInt(target.value);
                if (page >= 1 && page <= totalPages) {
                  onPageChange(page);
                }
              }
            }}
            className="w-16 h-8 px-2 border border-input rounded text-center focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      )}
    </div>
  );
}

// Simplified version for basic use cases
interface SimpleProfilePaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export function SimpleProfilePagination({
  currentPage,
  totalPages,
  onPageChange,
}: Readonly<SimpleProfilePaginationProps>) {
  return (
    <div className="flex items-center justify-center gap-2">
      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage === 1}
      >
        <ChevronLeft className="h-4 w-4 mr-1" />
        Previous
      </Button>

      <div className="flex items-center gap-1 px-2">
        <span className="text-sm text-muted-foreground">
          Page {currentPage} of {totalPages}
        </span>
      </div>

      <Button
        variant="outline"
        size="sm"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage === totalPages}
      >
        Next
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    </div>
  );
}