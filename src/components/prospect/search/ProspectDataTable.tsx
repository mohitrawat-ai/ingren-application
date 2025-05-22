// src/components/prospect/search/ProspectDataTable.tsx
"use client"
import { useMemo } from "react"

import { DataTable } from "@/components/ui/data-table"
import { useProspectSearchStore } from "@/stores/prospectStore"

import { ColumnDef } from "@tanstack/react-table"
import { ArrowUpDown, MoreHorizontal, Building, Mail, MapPin } from "lucide-react"

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

import { Prospect } from "@/types"

export function ProspectDataTable() {
    const {
        prospects,
        loadingProspects,
        searchMode,
        selectedProspects,
        toggleProspectSelection,
        selectedCompanies
    } = useProspectSearchStore()

    // Prospect columns
    const prospectColumns: ColumnDef<Prospect>[] = useMemo(() =>[
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
                    checked={selectedProspects.some(c => c.id === row.original.id)}
                    onCheckedChange={() => toggleProspectSelection(row.original)}
                />
            ),
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
    ], [selectedProspects, toggleProspectSelection])

    if (loadingProspects) {
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
        <div className="w-full">
            {/* Company Scope Banner */}
            {searchMode === "selection" && selectedCompanies.length > 0 && (
                <div className="px-4 py-3 bg-blue-50 border-b border-blue-200">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-blue-900">
                                Searching within {selectedCompanies.length} selected companies:
                            </span>
                            <div className="flex items-center gap-1">
                                {selectedCompanies.slice(0, 3).map(company => (
                                    <span key={company.id} className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                        {company.name}
                                    </span>
                                ))}
                                {selectedCompanies.length > 3 && (
                                    <span className="inline-flex items-center px-2 py-1 rounded-md text-xs font-medium bg-blue-100 text-blue-800">
                                        +{selectedCompanies.length - 3} more
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <div className="p-4">
                <DataTable
                    columns={prospectColumns}
                    data={prospects}
                    searchKey="firstName"
                />
            </div>
        </div>
    )
}