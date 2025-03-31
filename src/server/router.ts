import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { siteSettingsSchema, teamSettingsSchema, advancedSettingsSchema, eventSettingsSchema } from "../schema/settings.js";

export const appRouter = router({
  teamSettings: {
    query: procedure.query(async ({ ctx: { teamId, client } }) => {
      if (!teamId) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "teamId is required",
        });
      }
      const teamConfig = await client.getTeamConfiguration(teamId);
      if (!teamConfig) {
        return;
      }
      const result = teamSettingsSchema.safeParse(teamConfig.config);
      if (!result.success) {
        console.warn(
          "Failed to parse team settings",
          JSON.stringify(result.error, null, 2)
        );
      }
      return result.data;
    }),

    mutate: procedure
      .input(teamSettingsSchema)
      .mutation(async ({ ctx: { teamId, client }, input }) => {
        if (!teamId) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "teamId is required",
          });
        }

        try {
          const existingConfig = await client.getTeamConfiguration(teamId);
          if (!existingConfig) {
            await client.createTeamConfiguration(teamId, input);
          } else {
            await client.updateTeamConfiguration(teamId, {
              ...(existingConfig?.config || {}),
              ...input,
            });
          }
        } catch (e) {
          throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: "Failed to save team configuration",
            cause: e,
          });
        }
      }),
  },
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
    
        const variables = await client.getEnvironmentVariables({
          accountId: teamId,
          siteId,
        });
    
        const collectAutomatedEvents = variables.find(v => v.key === "SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS")?.values?.[0]?.value;
        const proxyEnabled = variables.find(v => v.key === "SIMPLE_ANALYTICS_PROXY_ENABLED")?.values?.[0]?.value;
  
        return {
          collectAutomatedEvents: collectAutomatedEvents !== "false",
          enableProxy: proxyEnabled === "true"
        };
      }),
      mutate: procedure
          .input(siteSettingsSchema)
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
    
        const variables = await client.getEnvironmentVariables({
          accountId: teamId,
          siteId,
        });
    
        const collectAutomatedEvents = variables.find(v => v.key === "SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS")?.values?.[0]?.value;
        const collectDownloads = variables.find(v => v.key === "SIMPLE_ANALYTICS_EVENT_DATA_COLLECT")?.values?.[0]?.value;
        const downloadExtensions = variables.find(v => v.key === "SIMPLE_ANALYTICS_EVENT_DATA_EXTENSIONS")?.values?.[0]?.value;
        const useTitle = variables.find(v => v.key === "SIMPLE_ANALYTICS_EVENT_DATA_USE_TITLE")?.values?.[0]?.value;
        const fullUrls = variables.find(v => v.key === "SIMPLE_ANALYTICS_EVENT_DATA_FULL_URLS")?.values?.[0]?.value;
  
        return { 
          collectAutomatedEvents: collectAutomatedEvents !== "false",
          collectDownloads: !!collectDownloads?.includes("downloads"),
          collectEmailClicks: !!collectDownloads?.includes("email"),
          collectOutboundLinks: !!collectDownloads?.includes("outbound"),
          downloadExtensions: downloadExtensions ? downloadExtensions : "",
          useTitle: useTitle !== "false",
          fullUrls: fullUrls !== "false"
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
    
        const variables = await client.getEnvironmentVariables({
          accountId: teamId,
          siteId,
        });
    
        // Get all relevant variables
        const customDomain = variables.find(v => v.key === "SIMPLE_ANALYTICS_DATA_CUSTOM_DOMAIN")?.values?.[0]?.value;
        const collectDoNotTrack = variables.find(v => v.key === "SIMPLE_ANALYTICS_DATA_COLLECT_DNT")?.values?.[0]?.value;
        const collectPageViews = variables.find(v => v.key === "SIMPLE_ANALYTICS_DATA_AUTO_COLLECT")?.values?.[0]?.value;
        const ignoredPages = variables.find(v => v.key === "SIMPLE_ANALYTICS_DATA_IGNORE_PAGES")?.values?.[0]?.value;
        const domain = variables.find(v => v.key === "SIMPLE_ANALYTICS_DATA_HOSTNAME")?.values?.[0]?.value;
        const mode = variables.find(v => v.key === "SIMPLE_ANALYTICS_DATA_MODE")?.values?.[0]?.value;
        
        return { 
          customDomain: customDomain ?? "",
          collectDoNotTrack: collectDoNotTrack === "true",
          collectPageViews: collectPageViews !== "false",
          ignoredPages: ignoredPages ?? "",
          overwriteDomain: domain ?? "",
          hashMode: mode === "hash"
        };
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
  
          try {
            if (!input.customDomain) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_CUSTOM_DOMAIN",
              });
            }
            else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_DATA_CUSTOM_DOMAIN",
                value: input.customDomain,
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
