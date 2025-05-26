import { getCurrentTenant } from "./tenant";

export async function withTenantContext<T>(
    operation: (context: { tenantId: string; userId: string }) => Promise<T>
): Promise<T> {
    const { tenantId, userId } = await getCurrentTenant();

    if (!tenantId) {
        throw new Error("No tenant context available");
    }

    if (!userId) {
        throw new Error("No user context available");
    }

    return operation({ tenantId, userId });
}