// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";

const extension = new NetlifyExtension();

extension.addEdgeFunctions("./src/edge-functions", {
  prefix: "sa_plugin",
  shouldInjectFunction: () => {
    //
    // if (process.env["SIMPLE_ANALYTICS_PROXY_ENABLED"] === "false") {
    //   return false;
    // }

    // // If the edge function is not enabled, return early
    // if (!process.env["SIMPLE_ANALYTICS_ENABLED"]) {
    //   return false;
    // }

    return true;
  },
});

export { extension };

