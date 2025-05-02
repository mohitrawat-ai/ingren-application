"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { campaigns, urls } from "@/lib/schema";
import { eq, count } from "drizzle-orm";
import { format, subDays } from "date-fns";

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

export async function getDashboardStats(period: string = "7d"): Promise<DashboardStats> {
  // Authenticate user
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Determine date range based on period
  const today = new Date();
  let startDate: Date;
  
  switch (period) {
    case "30d":
      startDate = subDays(today, 30);
      break;
    case "90d":
      startDate = subDays(today, 90);
      break;
    case "ytd":
      startDate = new Date(today.getFullYear(), 0, 1); // January 1st of current year
      break;
    case "7d":
    default:
      startDate = subDays(today, 7);
      break;
  }

  console.log(startDate);

  // Get actual campaign count (we'll mock the rest of the data)
  const campaignCount = await db
    .select({ count: count() })
    .from(campaigns)
    .where(eq(campaigns.userId, session.user.id));

  const totalCampaigns = campaignCount[0]?.count || 0;
  
  // Get actual URL count
  const urlCount = await db
    .select({ count: count() })
    .from(urls);

  const totalUrls = urlCount[0]?.count || 0;

  // Create some realistic mock data
  const mockCampaignNames = [
    "Q2 Outreach",
    "Product Launch",
    "Follow-up Campaign",
    "Newsletter",
    "Event Promotion",
  ];

  // Generate campaign performance data
  const campaignPerformance = mockCampaignNames.slice(0, Math.max(totalCampaigns, 3)).map(name => {
    const sent = Math.floor(Math.random() * 1000) + 200;
    const openRate = Math.random() * 0.3 + 0.2; // 20-50% open rate
    const clickRate = Math.random() * 0.2 + 0.05; // 5-25% click rate
    
    return {
      name,
      sent,
      opened: Math.floor(sent * openRate),
      clicked: Math.floor(sent * clickRate),
    };
  });

  // Generate daily stats
  const dailyStats = [];
  for (let i = 0; i < 7; i++) {
    const date = subDays(today, i);
    dailyStats.push({
      date: format(date, 'yyyy-MM-dd'),
      opens: Math.floor(Math.random() * 100) + 50,
      clicks: Math.floor(Math.random() * 50) + 20,
    });
  }

  // Sort dailyStats by date ascending
  dailyStats.sort((a, b) => {
    return new Date(a.date).getTime() - new Date(b.date).getTime();
  });

  // Create the stats object
  const stats: DashboardStats = {
    campaignStats: {
      totalCampaigns,
      activeCampaigns: Math.floor(totalCampaigns * 0.6), // 60% are active
      emailsSent: campaignPerformance.reduce((sum, campaign) => sum + campaign.sent, 0),
      averageOpenRate: 35.2, // 35.2%
      campaignPerformance,
      dailyStats,
      campaignTypes: [
        { name: "Cold Outreach", value: 45 },
        { name: "Follow-up", value: 30 },
        { name: "Newsletter", value: 15 },
        { name: "Onboarding", value: 10 },
      ],
    },
    contactStats: {
      totalContacts: 2500,
      newContactsToday: 37,
    },
    urlStats: {
      totalUrls,
      newUrlsToday: Math.floor(Math.random() * 5),
    },
  };

  return stats;
}