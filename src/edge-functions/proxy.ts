import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const hostname = new URL(request.url).hostname;

  console.log(`Hostname: ${hostname}`);

  return new URL(`https://simpleanalyticsexternal.com/proxy.js?hostname=${hostname}&path=/simple`);
};

export const config: Config = {
  path: "/proxy.js",
};