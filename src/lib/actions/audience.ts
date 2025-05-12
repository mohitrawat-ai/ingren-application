// src/lib/actions/audience.ts
"use server";

import { auth } from "@/lib/auth";
import { db as dbClient } from "@/lib/db";
import { 
  campaignAudiences,
  audienceContacts,
  targetOrganizations,
  targetJobTitles
} from "@/lib/schema";
import { eq } from "drizzle-orm";
import { Contact, Organization, CSVContact } from "@/components/campaign/targeting-form/types";

const db = await dbClient();

interface CreateAudienceParams {
  campaignId: number;
  name: string;
  contacts: Contact[];
  organizations?: Organization[];
  jobTitles?: string[];
  totalResults: number;
  csvFileName?: string;
}
// Extract from src/lib/actions/audience.ts (createAudience function)

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
      eq(campaigns.userId, session.user?.id || "-1")
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

      // Insert audience contacts with all fields
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
            
            // Additional prospect fields
            firstName: contact.first_name || null,
            lastName: contact.last_name || null,
            department: contact.department || null,
            tenureMonths: contact.tenure_months || null,
            notableAchievement: contact.notable_achievement || null,
            
            // Additional company fields
            companyIndustry: contact.company_industry || null,
            companyEmployeeCount: contact.company_employee_count || null,
            companyAnnualRevenue: contact.company_annual_revenue || null,
            companyFundingStage: contact.company_funding_stage || null,
            companyGrowthSignals: contact.company_growth_signals || null,
            companyRecentNews: contact.company_recent_news || null,
            companyTechnography: contact.company_technography || null,
            companyDescription: contact.company_description || null,
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
        eq(campaigns.userId, session.user?.id || "-1")
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
// src/lib/actions/audience.ts (convertCSVToContacts function)

// Updated convertCSVToContacts function with debugging

export async function convertCSVToContacts(csvData: CSVContact[]): Promise<Contact[]> {

  if (!csvData || csvData.length === 0) {
    console.error("No CSV data to convert");
    return [];
  }

  return csvData.map((contact, index) => {
    // Handle the case where either name is provided directly or constructed from first/last name
    const fullName = contact.name || 
      (contact.first_name && contact.last_name ? 
        `${contact.first_name} ${contact.last_name}` : 
        contact.first_name || contact.last_name || "Unknown");
    
    // Use either specific job_title field or generic title
    const jobTitle = contact.job_title || contact.title || "Unknown";
    
    // Use either specific company_name field or generic company
    const companyName = contact.company_name || contact.company || "Unknown";

    const result: Contact = {
      id: `csv-${index}`,
      name: fullName,
      title: jobTitle,
      organization: {
        name: companyName,
      },
      // Basic contact fields
      city: contact.city,
      state: contact.state,
      country: contact.country,
      email: contact.email,
      
      // Prospect fields
      first_name: contact.first_name,
      last_name: contact.last_name,
      department: contact.department,
      tenure_months: contact.tenure_months,
      notable_achievement: contact.notable_achievement,
      
      // Company fields
      company_industry: contact.industry,
      company_employee_count: contact.employee_count,
      company_annual_revenue: contact.annual_revenue,
      company_funding_stage: contact.funding_stage,
      company_growth_signals: contact.growth_signals,
      company_recent_news: contact.recent_news,
      company_technography: contact.technography,
      company_description: contact.description,
    };

    return result;
  });
}