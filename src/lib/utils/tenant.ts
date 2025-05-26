import { auth } from "@/lib/auth";

export async function getCurrentTenant() {
  const session = await auth();
  return {
    tenant: session?.user?.tenant,
    tenantId: session?.user?.tenantId,
    userId: session?.user?.id,
  };
}
