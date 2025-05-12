// src/lib/auth.ts
import NextAuth from "next-auth";
import { DrizzleAdapter } from "@auth/drizzle-adapter";
import GoogleProvider from "next-auth/providers/google";
import { initializeConfig } from "@/lib/config/init";
import { db } from "@/lib/db";
import type { Session, User } from "next-auth";

// Create an initialization promise
const initPromise = initializeConfig();

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

// Create auth handlers that ensure initialization
const initHandler = async () => {
  // Wait for initialization to complete
  await initPromise;
  return NextAuth(authConfig);
};

// Create the handlers
const handlers = initHandler();

// Re-export the auth client
export const { 
  handlers: { GET, POST },
  auth,
  signIn,
  signOut
} = await handlers;