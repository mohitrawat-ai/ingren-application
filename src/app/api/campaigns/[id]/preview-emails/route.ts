// src/app/api/campaigns/[id]/preview-emails/route.ts - Updated for profiles
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db as dbClient} from "@/lib/db";
import { campaigns, campaignEnrollments } from "@/lib/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { faker } from '@faker-js/faker';
import * as schema from '@/lib/schema';

type CampaignSelect = InferSelectModel<typeof schema.campaigns>;

const db = await dbClient();

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { id } = await params
  const campaignId = parseInt(id);
  if (isNaN(campaignId)) {
    return NextResponse.json({ error: 'Invalid campaign ID' }, { status: 400 });
  }

  try {
    // Get campaign details
    const campaign = await db.query.campaigns.findFirst({
      where: eq(campaigns.id, campaignId),
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Campaign not found' }, { status: 404 });
    }

    // Check if user owns this campaign
    if (campaign.userId !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Get enrollments with profiles for this campaign
    const enrollments = await db.query.campaignEnrollments.findMany({
      where: eq(campaignEnrollments.campaignId, campaignId),
      with: {
        enrolledProfiles: true, // Updated from enrolledContacts
      },
    });

    // Generate sample emails
    let previewEmails = [];
    
    // If we have real profiles from the enrollments, use them
    const allProfiles = enrollments.flatMap(enrollment => enrollment.enrolledProfiles);
    
    if (allProfiles && allProfiles.length >= 2) {
      const sampleProfiles = allProfiles.slice(0, 2);
      previewEmails = sampleProfiles.map(profile => generateEmailPreview(campaign, {
        name: profile.fullName,
        organizationName: profile.companyName,
        title: profile.jobTitle,
        city: profile.city,
        state: profile.state,
        country: profile.country,
        email: profile.email,
      }));
    } else {
      // Otherwise, generate mock profiles and emails
      previewEmails = [
        generateEmailPreview(campaign, generateMockProfile()),
        generateEmailPreview(campaign, generateMockProfile())
      ];
    }

    return NextResponse.json({ previewEmails });
  } catch (error) {
    console.error('Error generating preview emails:', error);
    return NextResponse.json({ error: 'Failed to generate preview emails' }, { status: 500 });
  }
}

// Generate a sample email based on campaign and profile data
function generateEmailPreview(campaign: CampaignSelect, profile: {
  name: string | null;
  organizationName: string | null;
  title: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  email: string | null;
}) {
  // Generate random send date in the next 2 days
  const sendDate = new Date();
  sendDate.setTime(sendDate.getTime() + (Math.random() * 2 * 24 * 60 * 60 * 1000));

  // Mock sender details
  const sender = {
    name: "John Smith",
    email: "john@ingren.ai",
    title: "Sales Development Representative",
  };

  // Generate subject line with personalization
  const subject = `${profile.name}, would you be interested in improving ${profile.organizationName}'s outreach?`;

  // Generate email body with personalization
  const greeting = `Hi ${profile.name?.split(' ')[0]},`;
  
  // Use different intros based on profile index for variety
  const intro = `I noticed that ${profile.organizationName} has been making some impressive moves in the industry recently.`;
  
  const valueProposition = `At Ingren, we've been helping companies like yours improve their sales outreach efficiency by 30% on average. Our AI-powered platform specifically addresses the challenges of personalization at scale that many ${profile.title}s face.`;
  
  const socialProof = `Companies similar to ${profile.organizationName} have seen a 2.5x increase in response rates within just 30 days of implementing our solution.`;
  
  const callToAction = `Would you be open to a quick 15-minute call next week to explore if there might be a fit? I'm available Tuesday or Thursday afternoon if that works for your schedule.`;
  
  const closing = "Looking forward to your response,";
  
  const signature = `
John Smith
Sales Development Representative
Ingren | AI-Powered Sales Outreach
john@ingren.ai | (555) 123-4567
Book a call: calendly.com/john-ingren
`;

  const emailBody = `${greeting}

${intro}

${valueProposition}

${socialProof}

${callToAction}

${closing}
${signature}`;

  return {
    id: faker.string.uuid(),
    recipient: {
      name: profile.name,
      email: profile.email || `${profile.name?.toLowerCase().replace(/\s+/g, '.')}@${profile.organizationName?.toLowerCase().replace(/\s+/g, '')}.com`,
      title: profile.title,
      company: profile.organizationName
    },
    sender,
    subject,
    body: emailBody,
    scheduledDate: sendDate.toISOString(),
    personalization: {
      recipientName: profile.name?.split(' ')[0],
      companyName: profile.organizationName,
      recipientTitle: profile.title,
      recipientLocation: [profile.city, profile.state, profile.country].filter(Boolean).join(', ')
    }
  };
}

// Generate mock profile data for preview (updated structure)
function generateMockProfile() {
  const name = faker.person.fullName();
  const title = faker.helpers.arrayElement([
    "Marketing Director",
    "Head of Sales",
    "Chief Revenue Officer",
    "VP of Business Development",
    "Chief Marketing Officer"
  ]);
  const organizationName = faker.company.name();
  
  return {
    id: faker.string.uuid(),
    name,
    title,
    organizationName,
    city: faker.location.city(),
    state: faker.location.state(),
    country: faker.location.country(),
    email: faker.internet.email({ firstName: name.split(' ')[0], lastName: name.split(' ')[1], provider: 'company.com' })
  };
}