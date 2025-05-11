// src/app/api/campaigns/[id]/preview-emails/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { campaigns, campaignAudiences } from "@/lib/schema";
import { eq, InferSelectModel } from "drizzle-orm";
import { faker } from '@faker-js/faker';
import * as schema from '@/lib/schema';

type CampaignSelect = InferSelectModel<typeof schema.campaigns>;

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const campaignId = parseInt(params.id);
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

    // Get audience for this campaign
    const audience = await db.query.campaignAudiences.findFirst({
      where: eq(campaignAudiences.campaignId, campaignId),
      with: {
        contacts: true,
      },
    });

    // Generate sample emails
    let previewEmails = [];
    
    // If we have real contacts from the audience, use them
    if (audience && audience.contacts && audience.contacts.length >= 2) {
      const sampleContacts = audience.contacts.slice(0, 2);
      previewEmails = sampleContacts.map(contact => generateEmailPreview(campaign, contact));
    } else {
      // Otherwise, generate mock contacts and emails
      previewEmails = [
        generateEmailPreview(campaign, generateMockContact()),
        generateEmailPreview(campaign, generateMockContact())
      ];
    }

    return NextResponse.json({ previewEmails });
  } catch (error) {
    console.error('Error generating preview emails:', error);
    return NextResponse.json({ error: 'Failed to generate preview emails' }, { status: 500 });
  }
}

// Generate a sample email based on campaign and contact data
function generateEmailPreview(campaign: CampaignSelect, contact: {
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
  const subject = `${contact.name}, would you be interested in improving ${contact.organizationName}'s outreach?`;

  // Generate email body with personalization
  const greeting = `Hi ${contact.name?.split(' ')[0]},`;
  
  // Use different intros based on contact index for variety
  const intro = `I noticed that ${contact.organizationName} has been making some impressive moves in the industry recently.`;
  
  const valueProposition = `At Ingren, we've been helping companies like yours improve their sales outreach efficiency by 30% on average. Our AI-powered platform specifically addresses the challenges of personalization at scale that many ${contact.title}s face.`;
  
  const socialProof = `Companies similar to ${contact.organizationName} have seen a 2.5x increase in response rates within just 30 days of implementing our solution.`;
  
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
      name: contact.name,
      email: contact.email || `${contact.name?.toLowerCase().replace(/\s+/g, '.')}@${contact.organizationName?.toLowerCase().replace(/\s+/g, '')}.com`,
      title: contact.title,
      company: contact.organizationName
    },
    sender,
    subject,
    body: emailBody,
    scheduledDate: sendDate.toISOString(),
    personalization: {
      recipientName: contact.name?.split(' ')[0],
      companyName: contact.organizationName,
      recipientTitle: contact.title,
      recipientLocation: [contact.city, contact.state, contact.country].filter(Boolean).join(', ')
    }
  };
}

// Generate mock contact data for preview
function generateMockContact() {
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