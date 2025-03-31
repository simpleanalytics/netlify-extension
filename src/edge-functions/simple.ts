import type { Context, Config } from "@netlify/edge-functions";

export default async (request: Request, context: Context) => {
  const url = new URL(request.url);

  url.hostname = "queue.simpleanalyticscdn.com";
  url.pathname = url.pathname.substring(7);

  return fetch(new Request(url, request));
};

export const config: Config = {
  path: "/simple/*",
};