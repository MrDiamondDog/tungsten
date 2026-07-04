import "dotenv/config";
import type { NextConfig, SizeLimit } from "next";

const nextConfig: NextConfig = {
	output: "standalone",
	experimental: {
		serverActions: {
			bodySizeLimit: (process.env.IMAGE_MAX_SIZE ?? "10mb") as SizeLimit,
		},
		proxyClientMaxBodySize: (process.env.IMAGE_MAX_SIZE ?? "10mb") as SizeLimit,
	},
};

export default nextConfig;
