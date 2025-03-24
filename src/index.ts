// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";


const extension = new NetlifyExtension();

extension.addEdgeFunctions("./src/edge-functions", {
  prefix: "ef_prefix",
  shouldInjectFunction: () => {
    // If the edge function is not enabled, return early
    if (!process.env["SIMPLEANALYTICS_ENABLED"]) {
      return false;
    }
    return true;
  },
});

export { extension };

