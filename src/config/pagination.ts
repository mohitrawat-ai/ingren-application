export const PAGINATION_CONFIG = {
  DEFAULT_PAGE_SIZE: 1,
  PAGE_SIZE_OPTIONS: [1, 3, 5, 10],
  MAX_PAGE_SIZE: 25,
  PREFETCH_ENABLED: false, // Easy credit control
  CACHE_TIME: {
    PROFILE_IDS: 1000 * 60 * 5,   // 5 minutes
    PROFILE_DATA: 1000 * 60 * 10,  // 10 minutes
  }
} as const;

// Helper function for environment overrides (optional)
export const getPaginationConfig = () => {
  return {
    ...PAGINATION_CONFIG,
    DEFAULT_PAGE_SIZE: parseInt(process.env.NEXT_PUBLIC_DEFAULT_PAGE_SIZE || PAGINATION_CONFIG.DEFAULT_PAGE_SIZE.toString()),
  };
};