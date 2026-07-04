# Self Hosting

Your one-stop guide for self hosting Tungsten!

## Requirements
- Docker (recommended)
- A reverse proxy if you want to access Tungsten from outside
- A machine that is marginally better than a potato

## Setup

Tungsten is a Next.JS app using Drizzle ORM with a local sqlite3 database.

## Installation

### Enviornment

The image uses the following env variables:
- `AUTH_SECRET` (REQUIRED): The secret that hashes passwords. Use one of the following commands to get the secret. Just copy the value, not `BETTER_AUTH_SECRET`.
	- `npx auth secret`
	- `pnpm dlx auth secret`
	- `yarn dlx auth secret`
- `AUTH_URL`: The URL of your application, like `https://tungsten-demo.drewrat.dev`. Defaults to `http://localhost:3000`.
- `ALLOW_SIGNUPS`: If your application allows signups. Recommended to run with `true`, make your user, then restart with `false`. Defaults to `false`.


### Docker Compose

- Clone the repo
	- `git clone https://github.com/mrdiamonddog/tungsten`
- Copy `.env.example` to `.env` and fill out the values, described above
- Run Docker compose
	- `docker compose up -d`

### Standalone

```bash
docker run -d \
	--name tungsten \
	-p 3000:3000 \
	-e AUTH_SECRET="[secret]" \
	-e AUTH_URL="[url of application]" \
	-e ALLOW_SIGNUPS="true" \
	ghcr.io/mrdiamonddog/tungsten:master
```
Make sure to fill out the env vars in the \[brackets]

### Without Docker

- Clone the repo
	- `git clone https://github.com/mrdiamonddog/tungsten`
- Copy `.env.example` to `.env` and fill out the values, described above
- Install dependencies
	- `pnpm i`
- Init the database
	- `pnpm exec drizzle-kit push`
- Build the app
	- `pnpm build`
- Run it
	- `pnpm start`

> [!NOTE]
> Docker Compose is recommended as it makes updating and managing the Tungsten container easier.

Now Tungsten should be running on port 3000!

## Reverse Proxy

Route your reverse proxy to point at port 3000, and make sure you change the `AUTH_URL` variable to the URL that your reverse proxy is accepting.

## Updates

Updates happen regularly. Keep your eyes on the GitHub for commits on the master branch.

To update:

- Docker compose
	- `docker compose pull && docker compose up -d`
- Standalone
	- Re-run the command in the [Installation](#Installation) section with `--pull always`.
- Without Docker
	- `git fetch && git pull`
	- `pnpm start`

If the update includes a database migration, run this command and follow the prompts.
- `docker exec -it tungsten pnpm exec drizzle-kit push`
