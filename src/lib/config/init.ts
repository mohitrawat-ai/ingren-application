import { parameterStore } from '@/lib/config/parameterStore';

let initPromise: Promise<void> | null = null;

export async function initializeConfig() {
  if (process.env.NODE_ENV !== 'production') {
    return
  }
  initPromise ??= parameterStore.loadParameters();
  return initPromise;
}
