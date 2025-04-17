// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";

const extension = new NetlifyExtension();

extension.addEdgeFunctions("./src/edge-functions", {
  prefix: "sa_plugin",
  shouldInjectFunction: () => {
    return process.env["ENABLE_SIMPLE_ANALYTICS"] === "true";
  },
});

export { extension };

