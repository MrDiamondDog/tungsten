# Self Hosting

Your one-stop guide for self hosting Tungsten!

## Requirements
- Docker
- A reverse proxy if you want to access Tungsten from outside
- A machine that is marginally better than a potato

## Setup

Tungsten is a Next.JS app using Drizzle ORM with a local sqlite3 database. The database file (`tungsten.db`) is registered as a volume in Docker.

## Installation

The image uses the following env variables:
- `AUTH_SECRET` (REQUIRED): The secret that hashes passwords. Use one of the following commands to get the secret. Just copy the value, not `BETTER_AUTH_SECRET`.
	- `npx auth secret`
	- `pnpm dlx auth secret`
	- `yarn dlx auth secret`
- `AUTH_URL` (REQUIRED): The URL of your application, like `https://tungsten-demo.drewrat.dev`.
- `NEXT_PUBLIC_ALLOW_SIGNUPS`: If your application allows signups. Recommended to run with `true`, make your user, then restart with `false`. Defaults to `false`.

Now run the following Docker command to run the image in the background. Make sure to fill out the env vars in the \[brackets]!

```
docker run -d \
	--name tungsten \
	-p 3000:3000 \
	-e AUTH_SECRET="[secret]" \
	-e AUTH_URL="[url of application]" \
	-e NEXT_PUBLIC_ALLOW_SIGNUPS="true" \
	ghcr.io/mrdiamonddog/tungsten:master
```

Then you'll have to init the local database:

`docker exec tungsten pnpm dlx --allow-build=esbuild drizzle-kit push`

This will init the `tungsten.db` file with the schema.

> [!INFO]
> Use the same command to migrate the database with new changes whenever you update.
