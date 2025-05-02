# ingren-application

Creating a Modern Next.js Application with Tailwind CSS and shadcn/ui
I'll create a detailed prompt broken down into multiple steps that you can use to generate a new application with improved UX and modularity while maintaining the same functionality as your current project.
Step 1: Project Setup and Configuration
Create a new Next.js application using the App Router, TypeScript, Tailwind CSS, and shadcn/ui components. Set up the project with the following:

Initialize a new Next.js project with TypeScript support
Configure Tailwind CSS with a custom theme
Set up shadcn/ui component library
Configure authentication with NextAuth.js
Set up the database with Drizzle ORM
Configure environment variables

Include the required dependencies:

Next.js 14+
TypeScript
Tailwind CSS
shadcn/ui
next-auth
drizzle-orm
date-fns
lucide-react (for icons)
zod (for validation)
react-hook-form
@tanstack/react-table (for data tables)
Elasticsearch client
SendGrid (for emails)
AWS SDK (for parameter store)

Step 2: Authentication and User Management
Implement a secure authentication system:

Set up NextAuth.js with Google provider
Create protected routes with middleware
Implement sign-in and sign-out functionality
Create user profiles and session management
Add role-based access control

Step 3: Database Schema and API Layer
Design a modular and efficient database schema:

Define the schema using Drizzle ORM
Create migrations
Implement server actions for database operations
Set up a robust API layer with route handlers
Implement proper error handling and response formatting

Key tables should include:

Users
Campaigns
Campaign Settings
Campaign Targeting
Campaign Pitch
Campaign Outreach
Campaign Workflows
Audiences and Contacts
Emails and Email Threads

Step 4: Core Layout and Navigation
Create a responsive and user-friendly layout:

Design a modern, accessible layout with shadcn/ui
Implement a responsive sidebar navigation
Create a dashboard layout with statistics cards
Add a breadcrumb navigation system
Implement dark/light mode toggle

Step 5: Dashboard and Analytics
Build an informative dashboard:

Create overview statistics cards
Implement campaign performance charts using Recharts
Add email engagement analytics
Create a recent activity feed
Implement filtering and date range selection

Step 6: Campaign Management Module
Develop a comprehensive campaign management system with a step-by-step wizard:

Create a campaign creation wizard with the following steps:

Targeting (audience selection)
Pitch (company info and value proposition)
Outreach (message tone and personalization)
Workflow (follow-up configuration)
Settings (email configuration and scheduling)


Implement campaign list view with:

Sorting and filtering
Status indicators
Quick actions (start, pause, delete)
Performance metrics


Add campaign detail view with:

Campaign overview
Performance metrics
Email templates
Audience details
Settings management



Step 7: Email Management Module
Build a robust email management system:

Create an email composition interface
Implement email template management
Add a mailbox interface for sent/received emails
Create an email thread view with conversation history
Implement email scheduling and follow-up automation

Step 8: Contact and Organization Management
Develop contact and organization management features:

Create interfaces for browsing and searching contacts
Implement organization profile pages
Add CSV import/export functionality
Create audience segmentation tools
Implement Apollo API integration for contact enrichment

Step 9: URL Management and Content Analysis
Build tools for URL management and content analysis:

Create a URL management interface
Implement URL processing and content extraction
Add content summarization functionality
Create a knowledge base from processed URLs
Implement URL-based personalization for campaigns

Step 10: Advanced Features and Optimizations
Add advanced features to enhance the application:

Implement real-time notifications
Add advanced search functionality
Create data export and reporting features
Implement email template A/B testing
Add automation rules for campaign management
Optimize for performance with React Server Components
Implement proper error boundaries and fallbacks
Add comprehensive logging and monitoring

Step 11: Testing and Deployment
Set up testing and deployment:

Implement unit tests with Jest and React Testing Library
Set up integration tests
Configure CI/CD pipeline
Set up staging and production environments
Implement error monitoring and analytics

Step 12: Documentation
Create comprehensive documentation:

Create user documentation
Write API documentation
Add inline code documentation
Create a development guide for the team
Document deployment and maintenance procedures

Additional Instructions
This application should prioritize:

Modularity: Each feature should be self-contained with clear interfaces
Type Safety: Leverage TypeScript throughout the application
Performance: Use React Server Components where appropriate
Accessibility: Ensure the application is fully accessible
Security: Implement proper authentication, authorization, and data validation
Mobile Responsiveness: Ensure the application works well on all device sizes
Error Handling: Comprehensive error handling and user feedback

For the UI, use a clean, modern design with shadcn/ui components styled with Tailwind CSS. The application should have a professional look and feel with:

A subdued color palette with primary brand color accents
Clear typography with good readability
Consistent spacing and layout
Helpful loading states and transitions
Meaningful error messages
Interactive elements with appropriate feedback
