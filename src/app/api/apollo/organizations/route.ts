// src/app/api/apollo/organizations/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { faker } from '@faker-js/faker';

// Mock Apollo organization search
export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { name, page = 1, per_page = 10 } = await request.json();
    
    // Generate mock organizations
    const organizations = [...Array(20)].map(() => ({
      id: faker.string.uuid(),
      name: faker.company.name(),
      website_url: faker.internet.url(),
      linkedin_url: `https://linkedin.com/company/${faker.company.buzzNoun()}`,
      industry: faker.company.buzzPhrase(),
      employee_count: faker.helpers.arrayElement([
        '1-10', '11-50', '51-200', '201-500', '501-1000', '1001-5000', '5001-10000', '10000+'
      ])
    }));
    
    // Filter by name if provided
    const filteredOrganizations = name 
      ? organizations.filter(org => 
          org.name.toLowerCase().includes(name.toLowerCase())
        )
      : organizations;
    
    // Paginate results
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedOrganizations = filteredOrganizations.slice(startIndex, endIndex);
    
    return NextResponse.json({
      organizations: paginatedOrganizations,
      pagination: {
        total_entries: filteredOrganizations.length,
        per_page,
        current_page: page,
        total_pages: Math.ceil(filteredOrganizations.length / per_page)
      }
    });
  } catch (error) {
    console.error('Error in organization search:', error);
    return NextResponse.json({ error: 'Failed to search organizations' }, { status: 500 });
  }
}