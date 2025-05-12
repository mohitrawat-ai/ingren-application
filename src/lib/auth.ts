// src/lib/auth.ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import { ensureAppInitialized } from "@/lib/config/appInitializer";
import { db } from "@/lib/db";
import type { Session, User } from "next-auth";

// Create the auth handlers with async initialization
export const authConfig = {
  adapter: DrizzleAdapter(db),
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!
    })
  ],
  callbacks: {
    session: ({ session, user } : { session: Session, user: User }) => {
      if (session.user) {
        session.user.id = user.id;
      }
      return session;
    },
    async signIn({ user }: { user: User }) {
      // Only allow specific email domains
      if (user.email && user.email.endsWith('@ingren.ai')) {
        return true;
      }
      return '/auth/error?error=domain';
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
  console.log("Auth initialization - GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID?.substring(0, 5) + "...");
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