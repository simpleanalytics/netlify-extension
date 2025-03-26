// Documentation: https://sdk.netlify.com/docs

import type { Config, Context } from "@netlify/edge-functions";
import { HTMLRewriter } from "https://ghuc.cc/worker-tools/html-rewriter/index.ts";

function createScript() {
  const config = {
    "data-auto-collect": Netlify.env.get("SIMPLE_ANALYTICS_AUTO_COLLECT"),
    "data-collect-dnt": Netlify.env.get("SIMPLE_ANALYTICS_COLLECT_DNT"),
    "data-hostname":Netlify.env.get("SIMPLE_ANALYTICS_HOSTNAME"),
    "data-mode": Netlify.env.get("SIMPLE_ANALYTICS_MODE"),
    "data-ignore-metrics": Netlify.env.get("SIMPLE_ANALYTICS_IGNORE_METRICS"),
    "data-ignore-pages": Netlify.env.get("SIMPLE_ANALYTICS_IGNORE_PAGES"),
    "data-allow-params": Netlify.env.get("SIMPLE_ANALYTICS_ALLOW_PARAMS"),
    "data-non-unique-params": Netlify.env.get("SIMPLE_ANALYTICS_NON_UNIQUE_PARAMS"),
    "data-strict-utm": Netlify.env.get("SIMPLE_ANALYTICS_STRICT_UTM"),
  };

  const configString = Object.entries(config).filter(([_, value]) => value !== "").map(([key, value]) => `${key}="${value}"`).join(" ");

  return `<script src="https://scripts.simpleanalyticscdn.com/latest.js" ${configString}></script>`;
}

export default async function handler(request: Request, context: Context) {
  const response = await context.next();

  const rewriter = new HTMLRewriter()
    .on("body", {
      element(element) {
        // Only insert the script tag if it's the closing body tag
        if (element.tagName === "body") {
          element.append(createScript(), { html: true });
        }
      }
    });

  return rewriter.transform(response);
}

export const config: Config = {
  path: "/*",
};