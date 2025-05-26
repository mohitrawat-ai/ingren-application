// src/types/next-auth.d.ts
import { DefaultSession } from "next-auth";
import { Tenant } from "@/lib/schema";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      tenantId?: string;
      tenant?: Tenant;
    } & DefaultSession["user"];
  }

  interface User {
    id: string;
    tenantId?: string;
    tenant?: Tenant;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    userId?: string;
    tenantId?: string;
    tenant?: Tenant;
  }
}