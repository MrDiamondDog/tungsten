import { createPublicEnv } from "next-public-env";

export const { getPublicEnv, PublicEnv } = createPublicEnv({
	NODE_ENV: process.env.NODE_ENV,
	ALLOW_SIGNUPS: process.env.ALLOW_SIGNUPS ?? "false",
	IS_DEMO: process.env.IS_DEMO ?? "false",
	IMAGE_MAX_SIZE: process.env.IMAGE_MAX_SIZE ?? "10mb",
});
