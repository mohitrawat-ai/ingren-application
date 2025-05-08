// src/lib/actions/audience.ts
"use server";

import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { 
  campaignAudiences,
  audienceContacts,
  targetOrganizations,
  targetJobTitles
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Contact, Organization, CSVContact } from "@/components/campaign/targeting-form/types";

interface CreateAudienceParams {
  campaignId: number;
  name: string;
  contacts: Contact[];
  organizations?: Organization[];
  jobTitles?: string[];
  totalResults: number;
  csvFileName?: string;
}

export async function createAudience({
  campaignId,
  name,
  contacts,
  organizations = [],
  jobTitles = [],
  totalResults,
  csvFileName
}: CreateAudienceParams) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Verify campaign ownership
  const campaign = await db.query.campaigns.findFirst({
    where: (campaigns, { eq, and }) => and(
      eq(campaigns.id, campaignId),
      eq(campaigns.userId, session.user.id)
    ),
  });

  if (!campaign) {
    throw new Error("Campaign not found");
  }

  try {
    return await db.transaction(async (tx) => {
      // Create audience
      const [audience] = await tx
        .insert(campaignAudiences)
        .values({
          campaignId,
          name: name || `Audience ${new Date().toLocaleDateString()}`,
          totalResults,
          csvFileName
        })
        .returning();

      // Insert audience contacts
      if (contacts.length > 0) {
        await tx.insert(audienceContacts).values(
          contacts.map(contact => ({
            audienceId: audience.id,
            name: contact.name,
            title: contact.title,
            organizationName: contact.organization.name,
            city: contact.city || null,
            state: contact.state || null,
            country: contact.country || null,
            email: contact.email || null,
            apolloId: contact.id?.startsWith('csv-') ? null : contact.id,
          }))
        );
      }

      // Insert target organizations
      if (organizations.length > 0) {
        await tx.insert(targetOrganizations).values(
          organizations.map(org => ({
            campaignId,
            organizationId: org.id,
            name: org.name,
            industry: org.industry,
            employeeCount: org.employeeCount,
          }))
        );
      }

      // Insert target job titles
      if (jobTitles.length > 0) {
        await tx.insert(targetJobTitles).values(
          jobTitles.map(title => ({
            campaignId,
            title,
          }))
        );
      }

      return audience;
    });
  } catch (error) {
    console.error("Error creating audience:", error);
    throw new Error("Failed to create audience");
  }
}

export async function getAudience(audienceId: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  console.log("AUDIENCE : " + audienceId)

  try {
    const audience = await db.query.campaignAudiences.findFirst({
      where: eq(campaignAudiences.id, audienceId),
      with: {
        contacts: true,
      },
    });

    if (!audience) {
      throw new Error("Audience not found");
    }

    // Verify the user has access to this audience via the campaign
    const campaign = await db.query.campaigns.findFirst({
      where: (campaigns, { eq, and }) => and(
        eq(campaigns.id, audience.campaignId),
        eq(campaigns.userId, session.user.id)
      ),
    });

    if (!campaign) {
      throw new Error("Unauthorized access to audience");
    }

    return audience;
  } catch (error) {
    console.error("Error fetching audience:", error);
    throw new Error("Failed to fetch audience");
  }
}

export async function convertCSVToContacts(csvData: CSVContact[]): Promise<Contact[]> {
  return csvData.map((contact, index) => ({
    id: `csv-${index}`,
    name: contact.name || "Unknown",
    title: contact.title || "Unknown",
    organization: {
      name: contact.company || "Unknown",
    },
    city: contact.city,
    state: contact.state,
    country: contact.country,
    email: contact.email,
  }));
}