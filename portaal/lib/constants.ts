// Shared constants for the Startklaar portal.

export const PACKAGE_OPTIONS = [
  "START",
  "STARTKLAAR",
  "ZICHTBAAR",
  "WEBSITE ONE-PAGE",
  "WEBSITE BASIS",
  "WEBSITE PLUS",
] as const;

export type FileCategory =
  | "logo"
  | "visitekaartjes"
  | "websitebestanden"
  | "social media"
  | "overige";

export const FILE_CATEGORIES: FileCategory[] = [
  "logo",
  "visitekaartjes",
  "websitebestanden",
  "social media",
  "overige",
];

export const FILE_CATEGORY_LABELS: Record<FileCategory, string> = {
  logo: "Logo",
  visitekaartjes: "Visitekaartjes",
  websitebestanden: "Websitebestanden",
  "social media": "Social media",
  overige: "Overige",
};

export const STORAGE_BUCKET = "project-files";

export const SUPPORT_EMAIL = "info@startklaar.be";

export function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
}
