import * as auth from "./auth";
import * as campaigns from "./campaigns";
import * as profiles from "./profiles";
import * as enrollments from "./enrollments";
import * as resources from "./resources";


// Export everything from all modules
export * from "./auth";
export * from "./campaigns";
export * from "./profiles";
export * from "./enrollments";
export * from "./resources";

// Create the combined schema object for Drizzle
export const schema = {
  ...auth,
  ...campaigns,
  ...profiles,
  ...enrollments,
  ...resources,
};
