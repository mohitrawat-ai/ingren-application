// src/app/(dashboard)/profiles/page.tsx
"use client";

import Link from "next/link";
import { Search, Users, UserCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function ProfilesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Profiles</h1>
          <p className="text-muted-foreground">
            Enhanced profile search and management with comprehensive company context
          </p>
        </div>
        <div className="flex gap-2">
          <Button asChild variant="outline">
            <Link href="/profiles/search">
              <Search className="mr-2 h-4 w-4" />
              Search Profiles
            </Link>
          </Button>
          <Button asChild>
            <Link href="/profile-lists">
              <Users className="mr-2 h-4 w-4" />
              Manage Lists
            </Link>
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Search Profiles Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="h-5 w-5 text-green-500" />
              Search Profiles
            </CardTitle>
            <CardDescription>
              Find profiles using advanced filters and enhanced profile data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Search through comprehensive profile data including company context, role details, and decision maker status.
            </p>
            <Button asChild className="w-full">
              <Link href="/profiles/search">
                Start Searching
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Profile Lists Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-500" />
              Profile Lists
            </CardTitle>
            <CardDescription>
              Organize and manage your saved profile lists
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Create, edit, and manage lists of profiles for targeted campaigns and outreach.
            </p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/profile-lists">
                View Lists
              </Link>
            </Button>
          </CardContent>
        </Card>

        {/* Enhanced Data Card */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserCheck className="h-5 w-5 text-purple-500" />
              Enhanced Data
            </CardTitle>
            <CardDescription>
              Rich profile data with company insights
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Access detailed profile information including company context, role tenure, and decision maker identification.
            </p>
            <div className="space-y-2 text-xs text-muted-foreground">
              <div>• Company industry & size data</div>
              <div>• Role seniority & management levels</div>
              <div>• Decision maker identification</div>
              <div>• Geographic & department filters</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Key Features Section */}
      <Card>
        <CardHeader>
          <CardTitle>Why Use Enhanced Profiles?</CardTitle>
          <CardDescription>
            Advantages over traditional profile search
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="font-medium">Enhanced Filtering</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Advanced company size and industry filters</li>
                <li>• Management level and seniority targeting</li>
                <li>• Decision maker identification</li>
                <li>• Geographic and remote work filters</li>
                <li>• Role tenure and recent job change detection</li>
              </ul>
            </div>
            <div className="space-y-4">
              <h4 className="font-medium">Rich Company Context</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>• Company funding and growth signals</li>
                <li>• Technology stack information</li>
                <li>• Industry and sub-industry classification</li>
                <li>• Revenue and employee count ranges</li>
                <li>• B2B company identification</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}