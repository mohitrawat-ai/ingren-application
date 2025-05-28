import { Profile } from "@/types/profile";

export const getInitials = (profile: Profile): string => {
  return `${profile.firstName?.[0] || ''}${profile.lastName?.[0] || ''}`.toUpperCase() || '?';
};