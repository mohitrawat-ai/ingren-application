"use server";

import { auth } from "@/lib/auth";
import { db as dbClient} from "@/lib/db";
import { faker } from "@faker-js/faker";

// Interface for personalized email
interface PersonalizedEmail {
  id: string;
  recipientEmail: string;
  recipientName: string;
  subject: string;
  content: string;
  scheduledTime: Date;
  organization: string;
}

const db = await dbClient();


// Get email threads
export async function getEmailThreads() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real application, you would fetch these from your database
  // Here we're creating mock data
  const threads = [];
  for (let i = 0; i < 5; i++) {
    const threadId = faker.string.uuid();
    const subject = faker.helpers.arrayElement([
      "Following up on our conversation",
      "Quick question about your business needs",
      "Thought you might be interested in this",
      "Let's connect and discuss opportunities",
      "Introducing our solution for your industry"
    ]);
    
    const thread = [];
    const emailCount = faker.number.int({ min: 1, max: 3 });
    
    for (let j = 0; j < emailCount; j++) {
      const isInbound = j % 2 === 1; // Alternate between outbound and inbound
      
      thread.push({
        message_id: faker.string.uuid(),
        from: {
          email: isInbound ? faker.internet.email() : "you@example.com",
          name: isInbound ? faker.person.fullName() : "Your Name"
        },
        to: [{
          email: isInbound ? "you@example.com" : faker.internet.email(),
          name: isInbound ? "Your Name" : faker.person.fullName()
        }],
        subject: j === 0 ? subject : `Re: ${subject}`,
        content: {
          text: faker.lorem.paragraphs(2)
        },
        created_at: faker.date.recent({ days: 10 }).toISOString(),
        thread_id: threadId
      });
    }
    
    // Sort by date descending (most recent first)
    thread.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    threads.push(thread);
  }
  
  return threads;
}

// Delete an email
export async function deleteEmail(messageId?: string) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(messageId)
  // In a real application, you would delete the email from your database
  // Here we'll just return a success message
  return { success: true };
}

// Send a reply
export async function sendReply(p0?: { parentMessageId: string; content: string; subject: string; }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(p0)

  // In a real application, you would send the email and store it in your database
  // Here we'll just return a success message
  return { success: true };
}

// Get email previews for a campaign
export async function getEmailPreviews(campaignId: number): Promise<PersonalizedEmail[]> {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // In a real application, you would generate these based on campaign settings
  // and target audience; here we'll create mock data
  const emails: PersonalizedEmail[] = [];
  
  const campaign = await db.query.campaigns.findFirst({
    where: (campaigns, { eq }) => eq(campaigns.id, campaignId),
  });
  
  if (!campaign) {
    throw new Error("Campaign not found");
  }
  
  // Generate 10 personalized emails
  for (let i = 0; i < 10; i++) {
    const organization = faker.company.name();
    const recipientName = faker.person.fullName();
    
    emails.push({
      id: faker.string.uuid(),
      recipientEmail: faker.internet.email(),
      recipientName,
      subject: `${campaign.name}: Opportunity for ${organization}`,
      content: generateEmailContent(recipientName, organization),
      scheduledTime: faker.date.soon({ days: 5 }),
      organization
    });
  }
  
  return emails;
}

// Send a test email
export async function sendTestEmail(p0?: { to: string; subject: string; content: string; campaignId: number; }) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  console.log(p0)
  
  // In a real application, you would send this through your email provider
  // Here we're simulating success
  try {
    // You would call your email sending function here
    // For example:
    // await sendEmail({
    //   to: { email: data.to },
    //   from: { email: "campaigns@yourdomain.com", name: "Your Campaign Tool" },
    //   subject: data.subject,
    //   text: data.content,
    //   html: data.content.replace(/\n/g, '<br>'),
    // });
    
    return { success: true };
  } catch (error) {
    console.error("Error sending test email:", error);
    throw new Error("Failed to send test email");
  }
}

// Helper function to generate email content
function generateEmailContent(recipientName: string, organization: string): string {
  const intro = faker.helpers.arrayElement([
    `Hi ${recipientName},`,
    `Hello ${recipientName},`,
    `Dear ${recipientName},`
  ]);
  
  const body = `I noticed that ${organization} has been making waves in the industry, and I thought you might be interested in how our solution has helped similar companies improve their efficiency by 30% on average.

Our platform specifically addresses the challenges companies like yours face with [specific pain point], and I'd love to share a quick case study that might be relevant to your situation.

Would you be open to a brief conversation next week to explore if there might be a fit? I'm available Tuesday or Thursday afternoon if that works for your schedule.`;
  
  const closing = faker.helpers.arrayElement([
    "Best regards,",
    "Thanks,",
    "Looking forward to connecting,"
  ]);
  
  return `${intro}\n\n${body}\n\n${closing}\nYour Name`;
}