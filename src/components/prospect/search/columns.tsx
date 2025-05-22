// First, run: npx shadcn@latest add table
// This will install the DataTable components and dependencies

// src/components/prospect/search/columns.tsx
"use client"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, ExternalLink, Building, Mail, MapPin } from "lucide-react"
import Link from "next/link"

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
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

import { Company, Prospect } from "@/types"

import { useProspectSearchStore } from "@/stores/prospectStore"
// Get the store instance directly
const store = useProspectSearchStore.getState()
// Company columns
export const companyColumns: ColumnDef<Company>[] = [
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
    cell: ({ row }) => {
  return (
    <Checkbox
      checked={store.selectedCompanies.some(c => c.id === row.original.id)}
      onCheckedChange={() => store.toggleCompanySelection(row.original)}
      aria-label="Select row"
    />
  )
},
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
    accessorKey: "industry",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Industry
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("industry") || "N/A"}
      </Badge>
    ),
  },
  {
    accessorKey: "size",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Size
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.getValue("size") || "N/A"} employees
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
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => (
      <div className="text-sm">
        {row.getValue("location") || "N/A"}
      </div>
    ),
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
]

// Prospect columns
export const prospectColumns: ColumnDef<Prospect>[] = [
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
    cell: ({ row }) => {
  return (
    <Checkbox
      checked={store.selectedProspects.some(p => p.id === row.original.id)}
      onCheckedChange={() => store.toggleProspectSelection(row.original)}
      aria-label="Select row"
    />
  )
},
    enableSorting: false,
    enableHiding: false,
  },
  {
    id: "avatar",
    header: "",
    cell: ({ row }) => {
      const firstName = row.original.firstName
      const lastName = row.original.lastName
      const initials = `${firstName?.[0] || ''}${lastName?.[0] || ''}`.toUpperCase()
      
      return (
        <Avatar className="h-8 w-8">
          <AvatarFallback className="text-xs">
            {initials}
          </AvatarFallback>
        </Avatar>
      )
    },
    enableSorting: false,
    enableHiding: false,
  },
  {
    accessorKey: "firstName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          First Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("firstName")}</div>,
  },
  {
    accessorKey: "lastName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Last Name
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => <div className="font-medium">{row.getValue("lastName")}</div>,
  },
  {
    accessorKey: "title",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Title
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <Badge variant="secondary">
        {row.getValue("title")}
      </Badge>
    ),
  },
  {
    accessorKey: "department",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Department
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => {
      const department = row.getValue("department") as string
      return department ? (
        <Badge variant="outline">{department}</Badge>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
  },
  {
    accessorKey: "companyName",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          Company
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      )
    },
    cell: ({ row }) => (
      <div className="flex items-center">
        <Building className="h-4 w-4 mr-2 text-muted-foreground" />
        <span className="font-medium">{row.getValue("companyName")}</span>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email = row.getValue("email") as string
      return email ? (
        <div className="flex items-center">
          <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{email}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
  },
  {
    accessorKey: "country",
    header: "Location",
    cell: ({ row }) => {
      const country = row.getValue("country") as string
      return country ? (
        <div className="flex items-center">
          <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm">{country}</span>
        </div>
      ) : (
        <span className="text-muted-foreground text-sm">N/A</span>
      )
    },
  },
  {
    id: "actions",
    enableHiding: false,
    cell: ({ row }) => {
      const prospect = row.original

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
              onClick={() => navigator.clipboard.writeText(`${prospect.firstName} ${prospect.lastName}`)}
            >
              Copy name
            </DropdownMenuItem>
            {prospect.email && (
              <DropdownMenuItem
                onClick={() => navigator.clipboard.writeText(prospect.email)}
              >
                Copy email
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem>
              View prospect details
            </DropdownMenuItem>
            <DropdownMenuItem>
              Add to sequence
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]
