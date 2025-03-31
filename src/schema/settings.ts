import { z } from "zod";

export const teamSettingsSchema = z.object({
  exampleString: z.string().min(1),
  exampleSecret: z.string().min(1),
  exampleBoolean: z.boolean(),
  exampleNumber: z.number(),
});

export type TeamSettings = z.infer<typeof teamSettingsSchema>;

export const siteSettingsSchema = z.object({
  enabled: z.boolean(),
  collectAutomatedEvents: z.boolean(),
  customDomain: z.string().trim(),
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const advancedSettingsSchema = z.object({
  collectDoNotTrack: z.boolean(),
  collectPageViews: z.boolean(),
  ignoredPages: z.string().trim(),
  overwriteDomain: z.string().trim(),
  hashMode: z.boolean(),
});

export type AdvancedSettings = z.infer<typeof advancedSettingsSchema>;

export const eventSettingsSchema = z.object({
  collectAutomatedEvents: z.boolean(),
  collectDownloads: z.boolean(),
  downloadExtensions: z.string().trim(),
  useTitle: z.boolean(),
  fullUrls: z.boolean(),
});

export type EventSettings = z.infer<typeof eventSettingsSchema>;