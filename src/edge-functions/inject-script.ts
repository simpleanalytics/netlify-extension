// Documentation: https://sdk.netlify.com/docs

import type { Config, Context } from "@netlify/edge-functions";
import { HTMLRewriter } from "https://deno.land/x/htmlrewriter/src/index.ts";

function createScript() {
  const scriptConfig = Object.entries(Netlify.env.toObject())
    .filter(([key]) => key.startsWith("SIMPLE_ANALYTICS_DATA_"))
    .map(([key, value]) => [key.replace("SIMPLE_ANALYTICS_", "").replaceAll("_", "-").toLowerCase(), value])
    .map(([key, value]) => `${key}="${value}"`).join(" ");

  const eventsConfig = Object.entries(Netlify.env.toObject())
    .filter(([key]) => key.startsWith("SIMPLE_ANALYTICS_EVENT_DATA_"))
    .map(([key, value]) => [key.replace("SIMPLE_ANALYTICS_EVENT_", "").replaceAll("_", "-").toLowerCase(), value])
    .map(([key, value]) => `${key}="${value}"`).join(" ");

  const isAutomatedEventsEnabled = Netlify.env.get("SIMPLE_ANALYTICS_AUTO_COLLECT_EVENTS") !== "false";

  const scripts: string[] = [];

  if (Netlify.env.get("SIMPLE_ANALYTICS_PROXY_ENABLED") === "true") {
    scripts.push(`<script async src="/proxy.js" ${scriptConfig}></script>`);

    if (isAutomatedEventsEnabled) {
      scripts.push(`<script async src="/auto-events.js" ${eventsConfig}></script>`);
    }

    return scripts;
  }

  scripts.push(`<script async src="https://scripts.simpleanalyticscdn.com/latest.js" ${scriptConfig}></script>`);

  if (isAutomatedEventsEnabled) {
    scripts.push(`<script async src="https://scripts.simpleanalyticscdn.com/auto-events.js" ${eventsConfig}></script>`);
  }

  return scripts;
}

export default async function handler(_request: Request, context: Context) {
  const response = await context.next();

  if (!response.headers.get("Content-Type")?.includes("text/html")) {
    return response;
  }

  const rewriter = new HTMLRewriter()
    .on("body", {
      element(element) {
        // Only insert the script tag if it's the closing body tag
        if (element.tagName === "body") {
          const scripts = createScript();

          for (const script of scripts) {
            element.append(script, { html: true });
          }
        }
      }
    });

  return rewriter.transform(response);
}

export const config: Config = {
  path: "/*",
  cache: "manual",
  onError: "bypass"
};