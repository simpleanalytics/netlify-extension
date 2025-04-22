// Documentation: https://sdk.netlify.com/docs
import { NetlifyExtension } from "@netlify/sdk";

const extension = new NetlifyExtension();

extension.addEdgeFunctions("./src/edge-functions", {
  prefix: "sa_plugin",
});

export { extension };

