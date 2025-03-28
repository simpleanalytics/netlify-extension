import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { doNotTrackSettingSchema, siteSettingsSchema, teamSettingsSchema, ignorePagesSettingSchema, overwriteDomainSettingSchema, hashModeSettingSchema, collectPageViewsSettingSchema } from "../schema/settings.js";

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
    
        const variable = variables.find(v => v.key === "ENABLE_SIMPLE_ANALYTICS");
        const value = variable?.values?.[0];
  
        return { enabled: value ? true : false };
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
              if (!input.enabled) {
                await client.deleteEnvironmentVariable({
                  accountId: teamId,
                  siteId,
                  key: "ENABLE_SIMPLE_ANALYTICS",
                });
                return;
              }
      
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "ENABLE_SIMPLE_ANALYTICS",
                value: "true",
              });
            } catch (e) {
              throw new TRPCError({
                code: "INTERNAL_SERVER_ERROR",
                message: "Failed to save site configuration",
                cause: e,
              });
            }
          }),
    },
    doNotTrack: {
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
    
        const doNotTrackSetting = variables.find(v => v.key === "SIMPLE_ANALYTICS_COLLECT_DNT");

        return { enabled: !!doNotTrackSetting };
      }),
      mutate: procedure
        .input(doNotTrackSettingSchema)
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
            if (!input.enabled) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_COLLECT_DNT",
              });
              return;
            }
    
            await client.createOrUpdateVariable({
              accountId: teamId,
              siteId,
              key: "SIMPLE_ANALYTICS_COLLECT_DNT",
              value: "1",
            });
          } catch (e) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save team configuration",
              cause: e,
            });
          }
        }),
    },
    ignorePages: {
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
    
        const ignorePagesVar = variables.find(v => v.key === "SIMPLE_ANALYTICS_IGNORE_PAGES");
        const value = ignorePagesVar?.values?.[0]?.value;
        
        return { pages: value ?? "" };
      }),
      mutate: procedure
        .input(ignorePagesSettingSchema)
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
            if (input.pages === "") {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_IGNORE_PAGES",
              });

              return;
            }
  
            await client.createOrUpdateVariable({
              accountId: teamId,
              siteId,
              key: "SIMPLE_ANALYTICS_IGNORE_PAGES",
              value: input.pages,
            });
          } catch (e) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save ignore pages configuration",
              cause: e,
            });
          }
        }),
    },
    overwriteDomain: {
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
    
        const variable = variables.find(v => v.key === "SIMPLE_ANALYTICS_HOSTNAME");
        const value = variable?.values?.[0]?.value;

        return { domain: value ?? "" };
      }),
      mutate: procedure
        .input(overwriteDomainSettingSchema)
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
            if (input.domain === "") {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_HOSTNAME",
              });

              return;
            }
  
            await client.createOrUpdateVariable({
              accountId: teamId,
              siteId,
              key: "SIMPLE_ANALYTICS_HOSTNAME",
              value: input.domain,
            });
          } catch (e) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save domain configuration",
              cause: e,
            });
          }
        }),
    },
    hashMode: {
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
    
        const variable = variables.find(v => v.key === "SIMPLE_ANALYTICS_MODE");
        const value = variable?.values?.[0]?.value;
        
        return { enabled: value === "hash" };
      }),
      mutate: procedure
        .input(hashModeSettingSchema)
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
            if (!input.enabled) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_MODE",
              });
              return;
            }
  
            await client.createOrUpdateVariable({
              accountId: teamId,
              siteId,
              key: "SIMPLE_ANALYTICS_MODE",
              value: "hash",
            });
          } catch (e) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save hash mode configuration",
              cause: e,
            });
          }
        }),
    },
    collectPageViews: {
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
    
        const variable = variables.find(v => v.key === "SIMPLE_ANALYTICS_AUTO_COLLECT");
        const value = variable?.values?.[0]?.value;

        return { enabled: value ? value === "true" : true };
      }),
      mutate: procedure
        .input(collectPageViewsSettingSchema)
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
            if (input.enabled) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_AUTO_COLLECT",
              });

              return;
            }
  
            await client.createOrUpdateVariable({
              accountId: teamId,
              siteId,
              key: "SIMPLE_ANALYTICS_AUTO_COLLECT",
              value: "false",
            });
          } catch (e) {
            throw new TRPCError({
              code: "INTERNAL_SERVER_ERROR",
              message: "Failed to save page views collection configuration",
              cause: e,
            });
          }
        }),
    },
  },
});

export type AppRouter = typeof appRouter;
