"use client";

import { useState, useEffect } from "react";
import { ArrowUp, ArrowDown, Mail, Check } from "lucide-react";
import { format } from "date-fns";

import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle,
  CardDescription 
} from "@/components/ui/card";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from "recharts";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getDashboardStats } from "@/lib/actions/dashboard"

interface DashboardStats {
  campaignStats: {
    totalCampaigns: number;
    activeCampaigns: number;
    emailsSent: number;
    averageOpenRate: number;
    campaignPerformance: Array<{
      name: string;
      sent: number;
      opened: number;
      clicked: number;
    }>;
    dailyStats: Array<{
      date: string;
      opens: number;
      clicks: number;
    }>;
    campaignTypes: Array<{
      name: string;
      value: number;
    }>;
  };
  contactStats: {
    totalContacts: number;
    newContactsToday: number;
  };
  urlStats: {
    totalUrls: number;
    newUrlsToday: number;
  };
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("7d");

  useEffect(() => {
    const loadStats = async () => {
      try {
        setLoading(true);
        const data = await getDashboardStats(period);
        setStats(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    loadStats();
  }, [period]);

  // Calculate change percentages with fallbacks for initial load
  const openRateChange = stats ? Math.random() * 10 - 5 : 0; // Placeholder
  const clickRateChange = stats ? Math.random() * 8 - 4 : 0; // Placeholder

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Select
            value={period}
            onValueChange={(value) => setPeriod(value)}
          >
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Select period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="ytd">Year to date</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">Export</Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Campaigns</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.campaignStats.totalCampaigns}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "..." : stats?.campaignStats.activeCampaigns} active
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Open Rate</CardTitle>
            <div className={`text-xs font-medium ${openRateChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {openRateChange >= 0 ? (
                <ArrowUp className="h-4 w-4 inline mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 inline mr-1" />
              )}
              {Math.abs(openRateChange).toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : `${stats?.campaignStats.averageOpenRate.toFixed(1)}%`}
            </div>
            <p className="text-xs text-muted-foreground">vs. previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Click Rate</CardTitle>
            <div className={`text-xs font-medium ${clickRateChange >= 0 ? 'text-green-500' : 'text-red-500'}`}>
              {clickRateChange >= 0 ? (
                <ArrowUp className="h-4 w-4 inline mr-1" />
              ) : (
                <ArrowDown className="h-4 w-4 inline mr-1" />
              )}
              {Math.abs(clickRateChange).toFixed(1)}%
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : "12.3%"}
            </div>
            <p className="text-xs text-muted-foreground">vs. previous period</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Emails Sent</CardTitle>
            <Check className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : stats?.campaignStats.emailsSent.toLocaleString()}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "..." : `${Math.floor(stats?.campaignStats.emailsSent || 0 * 0.35)} opened`}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <Tabs defaultValue="performance">
        <TabsList>
          <TabsTrigger value="performance">Campaign Performance</TabsTrigger>
          <TabsTrigger value="engagement">Daily Engagement</TabsTrigger>
          <TabsTrigger value="types">Campaign Types</TabsTrigger>
        </TabsList>
        <TabsContent value="performance" className="space-y-4">
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-4">Campaign Performance</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={stats?.campaignStats.campaignPerformance}
                  margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="name" 
                    angle={-45} 
                    textAnchor="end" 
                    tick={{ fontSize: 12 }}
                    height={70}
                  />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="sent" fill="#8884d8" name="Sent" />
                  <Bar dataKey="opened" fill="#82ca9d" name="Opened" />
                  <Bar dataKey="clicked" fill="#ffc658" name="Clicked" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="engagement" className="space-y-4">
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-4">Daily Engagement</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={stats?.campaignStats.dailyStats}
                  margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), 'MMM d')}
                  />
                  <YAxis />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), 'MMMM d, yyyy')}
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="opens" 
                    stroke="#8884d8" 
                    activeDot={{ r: 8 }}
                    name="Opens"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="clicks" 
                    stroke="#82ca9d"
                    name="Clicks"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
        <TabsContent value="types" className="space-y-4">
          <div className="bg-background rounded-lg p-4 border">
            <h3 className="text-lg font-medium mb-4">Campaign Types</h3>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.campaignStats.campaignTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => 
                      `${name}: ${(percent * 100).toFixed(0)}%`
                    }
                    outerRadius={120}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {stats?.campaignStats.campaignTypes.map((_, index) => (
                      <Cell 
                        key={`cell-${index}`} 
                        fill={COLORS[index % COLORS.length]} 
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value) => [`${value}`, "Count"]}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </TabsContent>
      </Tabs>

      {/* Additional Stats */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Contacts</CardTitle>
            <CardDescription>
              Contact growth and statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Total Contacts
                </h4>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.contactStats.totalContacts.toLocaleString()}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  New Today
                </h4>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.contactStats.newContactsToday}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>URLs</CardTitle>
            <CardDescription>
              URL tracking statistics
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  Total URLs
                </h4>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.urlStats.totalUrls}
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-muted-foreground mb-1">
                  New Today
                </h4>
                <div className="text-2xl font-bold">
                  {loading ? "..." : stats?.urlStats.newUrlsToday}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}