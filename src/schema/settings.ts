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
});

export type SiteSettings = z.infer<typeof siteSettingsSchema>;

export const doNotTrackSettingSchema = z.object({
  enabled: z.boolean(),
});

export type DoNotTrackSetting = z.infer<typeof doNotTrackSettingSchema>;

export const ignorePagesSettingSchema = z.object({
  pages: z.string().trim(),
});

export type IgnorePagesSetting = z.infer<typeof ignorePagesSettingSchema>;

export const overwriteDomainSettingSchema = z.object({
  domain: z.string().trim(),
});

export type OverwriteDomainSetting = z.infer<typeof overwriteDomainSettingSchema>;

export const hashModeSettingSchema = z.object({
  enabled: z.boolean(),
});

export type HashModeSetting = z.infer<typeof hashModeSettingSchema>;


export const collectPageViewsSettingSchema = z.object({
  enabled: z.boolean(),
});

export type CollectPageViewsSetting = z.infer<typeof collectPageViewsSettingSchema>;
  

  