import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const hostname = new URL(request.url).hostname;
  const url = new URL(`https://simpleanalyticsexternal.com/proxy.js?hostname=${hostname}&path=/simple`)

  return fetch(new Request(url, request));
};

export const config: Config = {
  path: "/proxy.js",
};