import { TRPCError } from "@trpc/server";
import { procedure, router } from "./trpc.js";
import { siteSettingsSchema, teamSettingsSchema, advancedSettingsSchema } from "../schema/settings.js";

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
        const collectDoNotTrack = variables.find(v => v.key === "SIMPLE_ANALYTICS_COLLECT_DNT")?.values?.[0]?.value;
        const collectPageViews = variables.find(v => v.key === "SIMPLE_ANALYTICS_AUTO_COLLECT")?.values?.[0]?.value;
        const ignoredPages = variables.find(v => v.key === "SIMPLE_ANALYTICS_IGNORE_PAGES")?.values?.[0]?.value;
        const domain = variables.find(v => v.key === "SIMPLE_ANALYTICS_HOSTNAME")?.values?.[0]?.value;
        const mode = variables.find(v => v.key === "SIMPLE_ANALYTICS_MODE")?.values?.[0]?.value;
        
        return { 
          doNotTrack: collectDoNotTrack === "true",
          collectPageViews: collectPageViews === "false" ? false : true,
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
            if (!input.collectDoNotTrack) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_COLLECT_DNT",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_COLLECT_DNT",
                value: "true",
              });
            }

            if (input.collectPageViews) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_AUTO_COLLECT",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_AUTO_COLLECT",
                value: "false",
              });
            }

            if (input.ignoredPages === "") {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_IGNORE_PAGES",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_IGNORE_PAGES",
                value: input.ignoredPages,
              });
            }

            if (input.overwriteDomain === "") {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_HOSTNAME",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_HOSTNAME",
                value: input.overwriteDomain,
              });
            }

            if (!input.hashMode) {
              await client.deleteEnvironmentVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_MODE",
              });
            } else {
              await client.createOrUpdateVariable({
                accountId: teamId,
                siteId,
                key: "SIMPLE_ANALYTICS_MODE",
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
