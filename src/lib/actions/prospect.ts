"use server";

import { revalidatePath } from "next/cache";
import { db as dbClient } from "@/lib/db";
import { auth } from "@/lib/auth";
import { campaignAudiences, audienceContacts } from "@/lib/schema";
import { eq } from "drizzle-orm";
import { v4 as uuidv4 } from "uuid";

import {
  SaveProspectListParams
} from "@/types";

const db = await dbClient();

// Get all prospect lists
export async function getProspectLists() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Query for audiences that are not linked to campaigns (standalone prospect lists)
  // or get all audiences if needed
  // TODO : This should get only audiences created by the current user or the campaign owner
  const lists = await db.query.campaignAudiences.findMany({
    orderBy: [campaignAudiences.createdAt],
  });

  return lists;
}

// Get a prospect list by ID
export async function getProspectList(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  const list = await db.query.campaignAudiences.findFirst({
    where: eq(campaignAudiences.id, id),
    with: {
      contacts: true,
    },
  });

  if (!list) {
    throw new Error("Prospect list not found");
  }

  return list;
}

// Create a new prospect list
export async function saveProspectList(data: SaveProspectListParams) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // For simplicity, we'll create a standalone audience without a campaign for now
  // This can be expanded later to support both campaign-linked and standalone audiences
  const [audience] = await db
    .insert(campaignAudiences)
    .values({
      campaignId: 0, // Placeholder, would be a real campaign ID when used with a campaign
      name: data.name,
      totalResults: data.totalResults,
      createdAt: new Date(),
      // Add metadata if needed
    })
    .returning();

  // Insert contacts if available
  if (data.contacts && data.contacts.length > 0) {
    await db.insert(audienceContacts).values(
      data.contacts.map(contact => ({
        audienceId: audience.id,
        name: contact.firstName,
        title: contact.title,
        organizationName: contact.companyName,
        city: contact.city || null,
        state: contact.state || null,
        country: contact.country || null,
        email: contact.email || null,
        apolloId: contact.id || `temp-${Date.now()}`,
        
        // Additional fields
        firstName: contact.firstName || null,
        lastName: contact.lastName || null,
        department: contact.department || null,
      }))
    );
  }

  revalidatePath("/prospects");
  return audience;
}

// Delete a prospect list
export async function deleteProspectList(id: number) {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }

  // Delete contacts first (due to foreign key constraints)
  await db
    .delete(audienceContacts)
    .where(eq(audienceContacts.audienceId, id));

  // Then delete the audience itself
  await db
    .delete(campaignAudiences)
    .where(eq(campaignAudiences.id, id));

  revalidatePath("/prospects");
}

// // Search companies (mock implementation for now)
// export async function searchCompanies(query: string, filters?: CompanyFilters) {
//   const session = await auth();
//   if (!session?.user?.id) {
//     throw new Error("Unauthorized");
//   }

//   // This would call your API in a real implementation
//   // For now, we'll mock the results
//   await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

//   // Generate 10 mock companies
//   const companies: Company[] = [];
//   for (let i = 0; i < 10; i++) {
//     // Apply industry filter if present
//     const industry = faker.helpers.arrayElement([
//       "Technology", "Healthcare", "Finance", "Education", 
//       "Manufacturing", "Retail", "Media", "Government"
//     ]);
    
//     if (filters?.industries && filters.industries.length > 0 && 
//         !filters.industries.includes(industry)) {
//       continue;
//     }
    
//     // Apply employee size filter if present
//     const employeeCount = faker.helpers.arrayElement([
//       "1-10", "11-50", "51-200", "201-500", 
//       "501-1000", "1001-5000", "5001-10000", "10000+"
//     ]);
    
//     if (filters?.sizes && filters.sizes.length > 0 && 
//         !filters.sizes.includes(employeeCount)) {
//       continue;
//     }
    
//     // Apply name query if present
//     const name = faker.company.name();
//     if (query && !name.toLowerCase().includes(query.toLowerCase())) {
//       continue;
//     }
    
//     companies.push({
//       id: uuidv4(),
//       name,
//       industry,
//       size : employeeCount,
//       domain: faker.internet.url(),
//     });
    
//     // If we've reached 10 valid companies, stop
//     if (companies.length >= 10) {
//       break;
//     }
//   }

//   return companies;
// }

// TODO : Search prospects (mock implementation for now)
// export async function searchProspects(
//   query: string, 
//   filters?: ProspectFilters,
//   companyIds?: string[]
// ) {
//   const session = await auth();
//   if (!session?.user?.id) {
//     throw new Error("Unauthorized");
//   }

//   // This would call your API in a real implementation
//   // For now, we'll mock the results
//   await new Promise(resolve => setTimeout(resolve, 500)); // Simulate API delay

//   // Generate 15 mock prospects
//   const prospects: Prospect[] = [];
//   for (let i = 0; i < 15; i++) {
//     // Generate company if none specified
//     const organization = companyIds?.length 
//       ? { id: companyIds[Math.floor(Math.random() * companyIds.length)], name: faker.company.name() }
//       : { id: uuidv4(), name: faker.company.name() };
      
//     // Apply title filter if present
//     const title = faker.helpers.arrayElement([
//       "CEO", "CTO", "CFO", "CIO", "VP of Sales", "VP of Marketing",
//       "Director of Engineering", "Product Manager", "Marketing Manager"
//     ]);
    
//     if (filters?.titles && filters.titles.length > 0 && 
//         !filters.titles.includes(title)) {
//       continue;
//     }
    
//     // Apply department filter if present
//     const department = faker.helpers.arrayElement([
//       "Engineering", "Sales", "Marketing", "Finance", 
//       "Human Resources", "Operations", "Product", "Legal"
//     ]);
    
//     if (filters?.departments && filters.departments.length > 0 && 
//         !filters.departments.includes(department)) {
//       continue;
//     }
    
//     // Apply name query if present
//     const name = faker.person.fullName();
//     if (query && !name.toLowerCase().includes(query.toLowerCase())) {
//       continue;
//     }
    
//     prospects.push({
//       id: uuidv4(),
//       firstName: name,
//       title,
//       department,
//       email: faker.internet.email({
//         firstName: name.split(' ')[0], 
//         lastName: name.split(' ')[1], 
//         provider: 'company.com'
//       }),
//       city: faker.location.city(),
//       state: faker.location.state(),
//       country: faker.location.country(),
//       organization,
//     });
    
//     // If we've reached 15 valid prospects, stop
//     if (prospects.length >= 15) {
//       break;
//     }
//   }

//   return prospects;
// }

// Upload and process CSV file
export async function uploadCSV(file: File) {
  // In a real implementation, this would upload the file to a storage service
  // and return a file ID or path
  console.log(`Uploading file ${file.name}`);
  
  // For now, we'll just simulate the operation
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate upload delay

  // Generate a mock file name
  const fileName = `${uuidv4()}.csv`;
  
  return { fileName };
}

// Process uploaded CSV
export async function processCSV(fileName: string, listName: string) {
  // In a real implementation, this would process the uploaded CSV file,
  // validate its contents, and create a prospect list
  console.log(`Processing file ${fileName} for list ${listName}`);
  
  // For now, we'll just simulate the operation
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate processing delay
  
  // Return success response
  // In a real scenario, you might return validation issues if they exist
  return {
    listId: 1, // Mock ID - in real implementation, this would be the actual list ID
    validationIssues: [] // No issues
  };
}