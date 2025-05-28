// src/lib/auth.ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import { ensureAppInitialized } from "@/lib/config/appInitializer";
import { db } from "@/lib/db";
import { tenants, users } from "@/lib/schema";
import { eq } from "drizzle-orm";
import type { Session, User } from "next-auth";
import type { JWT } from "next-auth/jwt";
import { Tenant } from "@/lib/schema/types";

const dbClient = await db();

// Helper function to extract domain and create tenant name
function extractTenantInfo(email: string) {
  const domain = email.split('@')[1];
  // Convert domain to tenant name (remove .com, .ai, etc. and capitalize)
  const tenantName = domain
    .split('.')[0]
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
  
  return { domain, tenantName };
}

// Helper function to create or get tenant
async function createOrGetTenant(email: string) {
  const { domain, tenantName } = extractTenantInfo(email);
  
  // Check if tenant already exists
  const existingTenant = await dbClient
    .select()
    .from(tenants)
    .where(eq(tenants.domain, domain))
    .limit(1);
  
  if (existingTenant.length > 0) {
    return existingTenant[0];
  }
  
  // Create new tenant
  const tenantId = crypto.randomUUID();
  const newTenant = await dbClient
    .insert(tenants)
    .values({
      id: tenantId,
      domain,
      name: tenantName,
    })
    .returning();
  
  return newTenant[0];
}

export const authConfig = {
  adapter: DrizzleAdapter(dbClient),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  // Enable JWT strategy
  session: {
    strategy: "jwt" as const,
  },
  callbacks: {
    async jwt({ token, user, account }: { token: JWT; user?: User; account?: unknown }) {
      // Only runs during initial sign-in
      if (account && user?.email) {
        try {
          // Create or get tenant (only during initial sign-in)
          const tenant = await createOrGetTenant(user.email);
          
          // Update user with tenant ID if not already set
          const existingUser = await dbClient
            .select()
            .from(users)
            .where(eq(users.email, user.email))
            .limit(1);
          
          if (existingUser.length > 0 && !existingUser[0].tenantId) {
            await dbClient
              .update(users)
              .set({ tenantId: tenant.id })
              .where(eq(users.email, user.email));
          }
          
          // Store tenant info in JWT token
          token.tenantId = tenant.id;
          token.tenant = tenant;
          token.userId = user.id;
        } catch (error) {
          console.error('Error handling tenant creation:', error);
        }
      }
      
      return token;
    },
    
    async session({ session, token }: { session: Session; token: JWT }) {
      // Add tenant info to session (from JWT, no DB query)
      if (session.user) {
        session.user.id = token.userId as string;
        session.user.tenantId = token.tenantId as string;
        if (token.tenant) {
          session.user.tenant = token.tenant as Tenant;
    }

      }
      return session;
    },
    
    async signIn({ user }: { user: User }) {
      if (!user.email) return false;
      
      // Only allow specific email domains
      if (user.email && user.email.endsWith('@ingren.ai')) {
        return true;
      }
      
      // Add your domain validation logic here
      // For now, allowing all domains for tenant creation
      return true;
      
      // return '/auth/error?error=domain';
    }
  },
  pages: {
    signIn: '/login',
    error: '/auth/error'
  },
  trustHost: true
};

// Create an async function for initialization
async function createAuthHandlers() {
  await ensureAppInitialized();
  return NextAuth(authConfig);
}

// Use IIFE (Immediately Invoked Function Expression) for top-level await
const { handlers, auth, signIn, signOut } = await (async () => {
  const handlers = await createAuthHandlers();
  return handlers;
})();

// Export the results
export { handlers, auth, signIn, signOut };
export const { GET, POST } = handlers;