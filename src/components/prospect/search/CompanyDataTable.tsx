// src/components/prospect/search/CompanyDataTable.tsx
"use client"
import { useMemo } from "react"
import { DataTable } from "@/components/ui/data-table"
import { useProspectSearchStore } from "@/stores/prospectStore"
import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

import { Company } from "@/types"

export function CompanyDataTable() {
  const { 
    companies, 
    loadingCompanies,
    selectedCompanies, 
    toggleCompanySelection,
    companyPagination,
    searchCompanies
  } = useProspectSearchStore()

  

  // Company columns
  const companyColumns: ColumnDef<Company>[] = useMemo(() => [
    {
      id: "select",
      header: ({ table }) => (
        <Checkbox
          checked={
            table.getIsAllPageRowsSelected() ||
            (table.getIsSomePageRowsSelected() && "indeterminate")
          }
          onCheckedChange={(value) => table.toggleAllPageRowsSelected(!!value)}
          aria-label="Select all"
        />
      ),
     cell: ({ row }) => (
        <Checkbox
          checked={selectedCompanies.some(c => c.id === row.original.id)}
          onCheckedChange={() => toggleCompanySelection(row.original)}
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      accessorKey: "name",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Company Name
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
    },
    {
      accessorKey: "founded",
      header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
            className="h-auto p-0 font-semibold"
          >
            Founded
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
      cell: ({ row }) => (
        <Badge variant="secondary">
          {row.getValue("founded") || "N/A"}
        </Badge>
      ),
    },
    {
      accessorKey: "domain",
      header: "Website",
      cell: ({ row }) => {
        const domain = row.getValue("domain") as string
        return domain ? (
          <Link 
            href={domain} 
            target="_blank" 
            className="text-blue-600 hover:underline inline-flex items-center"
          >
            {domain.replace(/^https?:\/\//, '')}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    {
      accessorKey: "socialProfiles.linkedin",
      header: "Linkedin",
        cell: ({ row }) => {
        const linkedinUrl = row.original.socialProfiles.linkedin
        return linkedinUrl ? (
          <Link 
            href={linkedinUrl} 
            target="_blank" 
            className="text-blue-200 hover:underline inline-flex items-center"
          >
            {linkedinUrl.replace(/^https?:\/\//, '')}
            <ExternalLink className="ml-1 h-3 w-3" />
          </Link>
        ) : (
          <span className="text-muted-foreground">N/A</span>
        )
      },
    },
    {
      id: "actions",
      enableHiding: false,
      cell: ({ row }) => {
        const company = row.original
  
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(company.name)}
              >
                Copy company name
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                View company details
              </DropdownMenuItem>
              {company.domain && (
                <DropdownMenuItem asChild>
                  <Link href={company.domain} target="_blank">
                    Visit website
                  </Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      },
    },
  ], [selectedCompanies, toggleCompanySelection])


  if (loadingCompanies) {
    return (
      <div className="space-y-4 p-4">
        <div className="animate-pulse">
          <div className="h-10 bg-muted rounded mb-4"></div>
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-muted rounded mb-2"></div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="w-full p-4">
      <DataTable
        columns={companyColumns}
        data={companies}
        searchKey="name"
        pagination={companyPagination ?? undefined}
        onPageChange={(page: number) => searchCompanies(page)}
      />
    </div>
  )
}