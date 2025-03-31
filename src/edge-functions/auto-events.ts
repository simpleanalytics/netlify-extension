import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  return new URL("https://scripts.simpleanalyticscdn.com/auto-events.js");
};

export const config: Config = {
  path: "/auto-events.js",
};