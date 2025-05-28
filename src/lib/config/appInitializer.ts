// src/lib/appInitializer.ts
import { initializeConfig } from '@/lib/config/init';

class AppInitializer {
  private static instance: AppInitializer;
  private initPromise: Promise<void> | null = null;

  private constructor() {}

  public static getInstance(): AppInitializer {
    if (!AppInitializer.instance) {
      AppInitializer.instance = new AppInitializer();
    }
    return AppInitializer.instance;
  }

  public async ensureInitialized(): Promise<void> {
    this.initPromise ??= initializeConfig().catch(err => {
        console.error('Failed to initialize app:', err);
        // Reset the promise so we can try again
        this.initPromise = null;
        throw err;
      });
    return this.initPromise;
  }
}

// Export a convenient function
export async function ensureAppInitialized(): Promise<void> {
  return AppInitializer.getInstance().ensureInitialized();
}