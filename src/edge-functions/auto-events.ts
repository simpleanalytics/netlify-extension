import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const url = new URL("https://scripts.simpleanalyticscdn.com/auto-events.js");

  return fetch(new Request(url, request));
};

export const config: Config = {
  path: "/auto-events.js",
  cache: "manual",
};