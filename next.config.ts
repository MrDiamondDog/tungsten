import "dotenv/config";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		serverActions: {
			// absurd limit here as to not bake the env variable into the image, as you can't change this after it's built
			// real file size limit is enforced in server action
			bodySizeLimit: "10gb",
		},
		proxyClientMaxBodySize: "10gb",
	},
};

export default nextConfig;
