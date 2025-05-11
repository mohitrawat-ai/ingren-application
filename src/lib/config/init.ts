import { parameterStore } from '@/lib/config/parameterStore';

let initPromise: Promise<void> | null = null;

export async function initializeConfig() {
  if (!initPromise) {
    initPromise = parameterStore.loadParameters();
  }
  return initPromise;
}
