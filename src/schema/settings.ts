import { z } from "zod";

export const generalSettingsSchema = z.object({
  enableAnalytics: z.boolean(),
  collectAutomatedEvents: z.boolean(),
});

export type GeneralSettings = z.infer<typeof generalSettingsSchema>;

export const advancedSettingsSchema = z.object({
  enableProxy: z.boolean(),
  collectDoNotTrack: z.boolean(),
  collectPageViews: z.boolean(),
  ignoredPages: z.string().trim(),
  overwriteDomain: z.string().trim(),
  hashMode: z.boolean(),
});

export type AdvancedSettings = z.infer<typeof advancedSettingsSchema>;

export const eventSettingsSchema = z.object({
  collectDownloads: z.boolean(),
  collectEmailClicks: z.boolean(),
  collectOutboundLinks: z.boolean(),
  downloadExtensions: z.string().trim(),
  useTitle: z.boolean(),
  fullUrls: z.boolean(),
});

export type EventSettings = z.infer<typeof eventSettingsSchema>;

export const siteSettingsSchema = z.object({
  general: generalSettingsSchema,
  advanced: advancedSettingsSchema,
  events: eventSettingsSchema,
});
  
export type SiteSettings = z.infer<typeof siteSettingsSchema>;