import { initializeConfig } from "@/lib/config/init";

export async function register() {
    if (process.env.NODE_ENV !== 'production') {
        return
    }
    await initializeConfig()
}