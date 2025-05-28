// src/lib/schema/resources/relations.ts
import { relations } from "drizzle-orm";
import { users, tenants } from "@/lib/schema/auth/tables";
import { resources } from "@/lib/schema/resources/tables";

export const resourceRelations = relations(resources, ({ one }) => ({
  user: one(users, {
    fields: [resources.userId],
    references: [users.id],
  }),
  tenant: one(tenants, {
    fields: [resources.tenantId],
    references: [tenants.id],
  }),
}));