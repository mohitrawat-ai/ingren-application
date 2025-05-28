import { auth } from "@/lib/auth";


export async function requireAuth() {
  const session = await auth();
  if (!session?.user?.id) {
    throw new Error("Unauthorized");
  }
  return {
    userId: session.user.id,
    tenantId: session.user.tenantId,
    user: session.user
  };
}