import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import {
  generalSettingsSchema,
  advancedSettingsSchema,
  eventSettingsSchema,
  type SiteSettings,
} from "../schema/settings.js";

export const appRouter = router({
  siteSettings: {
    general: {
      query: procedure.query(async ({ ctx: { teamId, siteId, client } }) => {
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId is required",
          });
        }
    
        if (!siteId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "siteId is required",
          });
        }

        const config = ((await client.getSiteConfiguration(teamId, siteId))?.config ?? {}) as Partial<SiteSettings>;

        return config.general;
      }),
      mutate: procedure
          .input(generalSettingsSchema)
          .mutation(async ({ ctx: { teamId, siteId, client }, input }) => {
            if (!teamId) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "teamId is required",
              });
            }
      
            if (!siteId) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "siteId is required",
              });
            }

            await client.upsertSiteConfiguration(teamId, siteId, {
              ...(await client.getSiteConfiguration(teamId, siteId))?.config ?? {},
              general: input
            });

      
            try {
              if (!input.enableAnalytics) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "ENABLE_SIMPLE_ANALYTICS",
                });
              }
              else {
                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "ENABLE_SIMPLE_ANALYTICS",
                  value: "true",
                });
              }

              if (input.collectAutomatedEvents) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS",
                });
              }
              else {
                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS",
                  value: "false",
                });
              }
            } catch (e) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to save site configuration",
                cause: e,
              });
            }
          }),
    },
    events: {
      query: procedure.query(async ({ ctx: { teamId, siteId, client } }) => {
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId is required",
          });
        }
    
        if (!siteId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "siteId is required",
          });
        }

        const config = ((await client.getSiteConfiguration(teamId, siteId))?.config ?? {}) as Partial<SiteSettings>;

        return {
          ...config.events,
          collectAutomatedEvents: config?.general?.collectAutomatedEvents,
        };
      }),
      mutate: procedure
        .input(eventSettingsSchema)
          .mutation(async ({ ctx: { teamId, siteId, client }, input }) => {
            if (!teamId) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "teamId is required",
              });
            }
      
            if (!siteId) {
              throw new TRPCError({
                code: "BAD_REQUEST",
                message: "siteId is required",
              });
            }

            const config = ((await client.getSiteConfiguration(teamId, siteId))?.config ?? {}) as Partial<SiteSettings>;

            const { collectAutomatedEvents, ...events } = input;

            await client.upsertSiteConfiguration(teamId, siteId, {
              general: {
                // Ensure we set the right defaults when the general settings aren't set
                ...config.general ?? {
                  enableAnalytics: false,
                },
                collectAutomatedEvents
              },
              events,
              advanced: config.advanced
            });
      
            try {
              if (input.collectAutomatedEvents) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS",
                });
              }
              else {
                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS",
                  value: "false",
                });
              }
      
              if (input.collectDownloads && input.collectEmailClicks && input.collectOutboundLinks) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_COLLECT",
                });
              }
              else {
                const options: string[] = [];

                if (input.collectDownloads) {
                  options.push("downloads");
                }

                if (input.collectEmailClicks) {
                  options.push("emails");
                }

                if (input.collectOutboundLinks) {
                  options.push("outbound");
                }

                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_COLLECT",
                  value: options.join(","),
                });
              }

              if (!input.downloadExtensions) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_EXTENSIONS",
                });
              }
              else {
                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_EXTENSIONS",
                  value: input.downloadExtensions,
                });
              }

              if (input.useTitle) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_USE_TITLE",
                });
              }
              else {
                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_USE_TITLE",
                  value: "false",
                });
              }

              if (!input.fullUrls) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_FULL_URLS",
                });
              }
              else {
                await client.createOrUpdateVariable({
                  accountId: teamId,
                  siteId,
                  key: "SIMPLE_ANALYTICS_EVENT_DATA_FULL_URLS",
                  value: "true",
                });
              }
            } catch (e) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to save site configuration",
                cause: e,
              });
            }
          }),
    },
    advanced: {
      query: procedure.query(async ({ ctx: { teamId, siteId, client } }) => {
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId is required",
          });
        }
    
        if (!siteId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "siteId is required",
          });
        }

        const config = ((await client.getSiteConfiguration(teamId, siteId))?.config ?? {}) as Partial<SiteSettings>;

        return config.advanced;
      }),
      mutate: procedure
        .input(advancedSettingsSchema)
        .mutation(async ({ ctx: { teamId, siteId, client }, input }) => {
          if (!teamId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "teamId is required",
            });
          }
  
          if (!siteId) {
            throw new TRPCError({
              code: "BAD_REQUEST",
              message: "siteId is required",
            });
          }

          await client.upsertSiteConfiguration(teamId, siteId, {
            ...(await client.getSiteConfiguration(teamId, siteId))?.config ?? {},
            advanced: input
          });
  
          try {
            if (input.enableProxy) {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_PROXY_ENABLED",
                value: "true",
              });
            } else {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_PROXY_ENABLED",
              });
            }
            
            if (!input.collectDoNotTrack) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_COLLECT_DNT",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_COLLECT_DNT",
                value: "true",
              });
            }

            if (input.collectPageViews) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_AUTO_COLLECT",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_AUTO_COLLECT",
                value: "false",
              });
            }

            if (input.ignoredPages === "") {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_IGNORE_PAGES",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_IGNORE_PAGES",
                value: input.ignoredPages,
              });
            }

            if (input.overwriteDomain === "") {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_HOSTNAME",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_HOSTNAME",
                value: input.overwriteDomain,
              });
            }

            if (!input.hashMode) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_MODE",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_MODE",
                value: "hash",
              });
            }
          } catch (e) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save advanced settings",
              cause: e,
            });
          }
        }),
    },
  },
});

export type AppRouter = typeof appRouter;
