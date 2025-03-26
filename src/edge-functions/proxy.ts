import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  url.hostname = "simpleanalyticscdn.com";

  return url;
};

export const config: Config = {
  path: "/proxy.js",
};