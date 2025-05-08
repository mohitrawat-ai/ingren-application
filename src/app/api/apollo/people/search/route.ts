// src/app/api/apollo/people/search/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@/lib/auth";
import { faker } from '@faker-js/faker';

// Mock Apollo people search
export async function POST(request: NextRequest) {
  // Check authentication
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { 
      organization_ids, 
      title, 
      page = 1, 
      per_page = 10 
    } = await request.json();
    
    // Generate mock contacts
    let contacts = [...Array(50)].map(() => {
      const organizationName = faker.company.name();
      
      return {
        id: faker.string.uuid(),
        name: faker.person.fullName(),
        title: faker.person.jobTitle(),
        city: faker.location.city(),
        state: faker.location.state(),
        country: faker.location.country(),
        organization: {
          name: organizationName,
          id: faker.string.uuid()
        },
        email: faker.helpers.maybe(() => faker.internet.email())
      };
    });
    
    // Apply filters
    if (organization_ids && organization_ids.length > 0) {
      // Since we're using mock data, we'll just simulate filtering
      contacts = contacts.slice(0, 30);
    }
    
    if (title) {
      const titleArray = Array.isArray(title) ? title : [title];
      const titleLower = titleArray.map(t => t.toLowerCase());
      
      contacts = contacts.filter(contact => 
        titleLower.some(t => contact.title.toLowerCase().includes(t))
      );
    }
    
    // Paginate results
    const startIndex = (page - 1) * per_page;
    const endIndex = startIndex + per_page;
    const paginatedContacts = contacts.slice(startIndex, endIndex);
    
    return NextResponse.json({
      contacts: paginatedContacts,
      pagination: {
        total_entries: contacts.length,
        per_page,
        current_page: page,
        total_pages: Math.ceil(contacts.length / per_page)
      }
    });
  } catch (error) {
    console.error('Error in people search:', error);
    return NextResponse.json({ error: 'Failed to search people' }, { status: 500 });
  }
}